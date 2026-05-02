import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import html2canvas from 'html2canvas';
import {
  calculateChaosScore,
  getChaosTitle,
  calculateScoreDelta,
  isCleanWeek,
  aggregateStats,
  type DayData,
  type ScoreDelta,
} from '../lib/scoring';
import { storage } from '../lib/storage';
import { getLast7Days } from '../lib/date-key';
import {
  ROAST_VOICES,
  VOICE_LABELS,
  VOICE_TEASERS,
  CLEAN_WEEK_LINES,
  formatRoast,
  getAllowedVoice,
  getAllowedVoices,
  type RoastVoice,
} from '../lib/roast-pools';
import { isPro, isProPlus } from '../lib/license';

import './styles.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const UPGRADE_THRESHOLD   = 2;
const UPGRADE_SNOOZE_DAYS = 30;
const UPGRADE_KEY         = 'upgrade-dismissed-until';
const VIEWS_KEY           = 'report-views';
const LAST_SHARE_KEY      = 'last-shared-at';

const NIGHT_TIMES = [
  '11:42pm', '1:15am', '2:33am', '12:58am',
  '3:07am',  '1:47am', '2:14am', '12:23am',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chromeGet<T>(key: string, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (r) =>
      resolve((r[key] as T) ?? fallback)
    );
  });
}

function chromeSet(data: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) =>
    chrome.storage.local.set(data, resolve)
  );
}

/** Returns milestone streak copy, or null if no milestone */
function getStreakMilestone(streak: number): string | null {
  if (streak === 4)  return 'One month of chaos. Therapy would be cheaper.';
  if (streak === 8)  return 'Two months of this. Your browser is keeping a file.';
  if (streak === 12) return 'Quarterly chaos review. We should talk.';
  if (streak === 26) return 'Half a year. You\'re a founding member of your own problem.';
  if (streak === 52) return 'One full year. Your browser is writing a memoir.';
  return null;
}

/** Returns the most extreme stat for dynamic tweet copy */
function getMostExtremeStat(stats: DayData | null): { label: string; value: number } | null {
  if (!stats) return null;
  const candidates = [
    { label: 'tabs',           value: stats.peakTabs          || 0 },
    { label: 'late incidents', value: stats.nightSessions      || 0 },
    { label: 'full sends',     value: stats.spiralSessions     || 0 },
    { label: 'tabs ghosted',   value: stats.quickClosures      || 0 },
  ];
  return candidates.reduce((a, b) => b.value > a.value ? b : a, candidates[0]);
}

/** Context-aware upgrade copy */
function getUpgradeCopy(score: number, recentlyShared: boolean): { headline: string; cta: string } {
  if (recentlyShared) return {
    headline: "Someone's about to see your Free report. Give them the real one.",
    cta: 'Upgrade before they see it — $12',
  };
  if (score >= 80) return {
    headline: 'A chaos score this high deserves a better narrator.',
    cta: 'Let them roast you properly — $12',
  };
  if (score < 20) return {
    headline: "Even when you behave, 4 voices have something to say about it.",
    cta: 'Unlock their reaction — $12',
  };
  return {
    headline: "4 people are waiting to roast you. You've only heard from one.",
    cta: 'Meet the other 4 — $12',
  };
}

async function shouldShowUpgrade(isPaid: boolean): Promise<boolean> {
  if (isPaid) return false;
  const [views, dismissedUntil] = await Promise.all([
    chromeGet<number>(VIEWS_KEY, 0),
    chromeGet<string | null>(UPGRADE_KEY, null),
  ]);
  if (views < UPGRADE_THRESHOLD) return false;
  if (!dismissedUntil) return true;
  const date = new Date(dismissedUntil);
  return isNaN(date.getTime()) || Date.now() >= date.getTime();
}

// ─── Report Component ─────────────────────────────────────────────────────────
function Report() {
  const [stats,         setStats        ] = useState<DayData | null>(null);
  const [loading,       setLoading      ] = useState(true);
  const [shareState,    setShareState   ] = useState<'idle' | 'copying' | 'done'>('idle');
  const [showUpgrade,   setShowUpgrade  ] = useState(false);
  const [isPaid,        setIsPaid       ] = useState(false);
  const [isPlus,        setIsPlus       ] = useState(false);
  const [activeVoice,   setActiveVoice  ] = useState<RoastVoice>('therapist');
  const [allowedVoices, setAllowedVoices] = useState<RoastVoice[]>(['therapist']);
  const [roastLines,    setRoastLines   ] = useState<string[]>([]);
  const [delta,         setDelta        ] = useState<ScoreDelta | null>(null);
  const [hoveredVoice,  setHoveredVoice ] = useState<RoastVoice | null>(null);
  const [recentShare,   setRecentShare  ] = useState(false);
  const [streak,        setStreak       ] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [pro, proPlus] = await Promise.all([isPro(), isProPlus()]);
      setIsPaid(pro);
      setIsPlus(proPlus);

      // Load weekly stats
      const days = getLast7Days();
      const allData: DayData[] = [];
      for (const dayKey of days) {
        const data = await storage.getDaily(dayKey);
        if (data && Object.keys(data).length > 0) allData.push(data);
      }
      const aggregated = aggregateStats(allData);
      setStats(aggregated);

      const chaosScore   = calculateChaosScore(aggregated);
      const prevScore    = await storage.getLastWeekScore();
      setDelta(calculateScoreDelta(chaosScore, prevScore));
      await storage.saveWeekScore(chaosScore);

      // TASK-11: Streak
      const newStreak = await storage.updateStreak();
      setStreak(newStreak);

      // Voice
      const settings = await storage.getSettings();
      const [voice, voices] = await Promise.all([
        getAllowedVoice(settings.roastVoice),
        getAllowedVoices(),
      ]);
      setActiveVoice(voice);
      setAllowedVoices(voices);
      setRoastLines(buildLines(voice, aggregated, chaosScore));

      // Views + upgrade gate
      const views = await chromeGet<number>(VIEWS_KEY, 0);
      await chromeSet({ [VIEWS_KEY]: views + 1 });
      setShowUpgrade(await shouldShowUpgrade(pro));

      // Recent share detection (within last 5 min)
      const lastShare = await chromeGet<number>(LAST_SHARE_KEY, 0);
      setRecentShare(Date.now() - lastShare < 5 * 60 * 1000);
    } catch (err) {
      console.error('[ScrollShame] load failed:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Line builder — TASK-04 clean week aware ────────────────────────────────
  function buildLines(voice: RoastVoice, s: DayData | null, score: number): string[] {
    if (!s) return [];

    // TASK-04: Clean week path
    if (isCleanWeek(score)) {
      const cleanPool = CLEAN_WEEK_LINES[voice] || CLEAN_WEEK_LINES.therapist;
      return [pickRandom(cleanPool)];
    }

    const pool = ROAST_VOICES[voice] || ROAST_VOICES.therapist;
    const lines: string[] = [];

    lines.push(formatRoast(pickRandom(pool.peakTabs), { peakTabs: s.peakTabs || 0 }));
    if ((s.nightSessions || 0) > 0) {
      lines.push(formatRoast(pickRandom(pool.nightSessions), { time: pickRandom(NIGHT_TIMES) }));
    }
    if ((s.quickClosures || 0) > 10) {
      lines.push(formatRoast(pickRandom(pool.quickClosures), { quickClosures: s.quickClosures }));
    }
    if ((s.longSessions || 0) > 0) {
      const hours = Math.min(s.longSessions || 1, 12);
      lines.push(formatRoast(pickRandom(pool.longSessions), { hours, excessHours: Math.max(0, hours - 4) }));
    }
    if ((s.spiralSessions || 0) > 0) {
      lines.push(formatRoast(pickRandom(pool.spiralSessions), { velocity: Math.floor(400 + Math.random() * 1200) }));
    }
    return lines;
  }

  function switchVoice(voice: RoastVoice) {
    if (!allowedVoices.includes(voice)) return;
    setActiveVoice(voice);
    const score = calculateChaosScore(stats);
    setRoastLines(buildLines(voice, stats, score));
    storage.getSettings().then(s => storage.setSettings({ ...s, roastVoice: voice }));
  }

  // ─── Copy to clipboard ──────────────────────────────────────────────────────
  const copyToClipboard = useCallback(async () => {
    const card = document.getElementById('report-card');
    if (!card || shareState === 'copying') return;
    setShareState('copying');
    try {
      const canvas = await html2canvas(card, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#141414',
        scale: 2,
      });

      // TASK-08: Marketing footer strip instead of punitive diagonal watermark
      if (!isPaid) {
        const ctx  = canvas.getContext('2d')!;
        const strip = 40;
        ctx.save();
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, canvas.height - strip, canvas.width, strip);
        ctx.font       = `bold ${Math.floor(canvas.width * 0.028)}px monospace`;
        ctx.fillStyle  = '#555555';
        ctx.textAlign  = 'center';
        ctx.fillText('scrollshame.com · get your weekly receipt', canvas.width / 2, canvas.height - 13);
        ctx.restore();
      }

      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        await chromeSet({ [LAST_SHARE_KEY]: Date.now() });
        setRecentShare(true);
        setShareState('done');
        setTimeout(() => setShareState('idle'), 2500);
      }
    } catch (err) {
      console.error('[ScrollShame] Copy failed:', err);
      setShareState('idle');
    }
  }, [isPaid, shareState]);

  // ─── Share to X — TASK-09 dynamic copy ─────────────────────────────────────
  const shareToX = useCallback(async () => {
    if (!stats) return;
    const score   = calculateChaosScore(stats);
    const title   = getChaosTitle(score);
    const extreme = getMostExtremeStat(stats);
    let text: string;

    if (score >= 90) {
      text = `Grand Chaos Architect. ${extreme ? `${extreme.value} ${extreme.label}, ` : ''}Chaos Score: ${score}/100. My browser filed a formal complaint.\n`;
    } else if (score < 20) {
      text = `My browser had nothing to say this week. Suspiciously clean. Chaos Score: ${score}/100.\n`;
    } else {
      text = `Chaos Score: ${score}/100 — ${title}. ${extreme ? `${extreme.value} ${extreme.label} this week.` : ''} My browser knows what I did.\n`;
    }

    const url    = 'https://scrollshame.com';
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ScrollShame`;
    window.open(intent, '_blank', 'width=600,height=400');
    await chromeSet({ [LAST_SHARE_KEY]: Date.now() });
    setRecentShare(true);
  }, [stats]);

  // ─── Chaos Certificate — TASK-10 ─────────────────────────────────────────
  const downloadCertificate = useCallback(() => {
    if (!stats) return;
    const score   = calculateChaosScore(stats);
    const title   = getChaosTitle(score);
    const gold    = isPlus;  // Chaos Pass → gold accent; Pro → red accent
    const accent  = gold ? '#f5a623' : '#ff2d2d';
    const dimAccent = gold ? '#b37a18' : '#aa1f1f';

    const W = 1200, H = 850;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = '#0e0e0e';
    ctx.fillRect(0, 0, W, H);

    // Border frame
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 6;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.strokeStyle = dimAccent;
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    // Corner accents
    const cornerSize = 32;
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 4;
    [[48, 48], [W - 48, 48], [48, H - 48], [W - 48, H - 48]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.moveTo(x, y - cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y);
      ctx.stroke();
    });

    // Top label
    ctx.font      = 'bold 18px monospace';
    ctx.fillStyle = dimAccent;
    ctx.textAlign = 'center';
    ctx.letterSpacing = '0.2em';
    ctx.fillText('SCROLL SHAME · OFFICIAL RECORD', W / 2, 90);

    // Title
    ctx.font      = `bold 64px monospace`;
    ctx.fillStyle = accent;
    ctx.fillText('CERTIFICATE', W / 2, 200);
    ctx.font      = `bold 48px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText('OF CHAOS', W / 2, 265);

    // Divider
    ctx.beginPath();
    ctx.strokeStyle = accent;
    ctx.lineWidth   = 1;
    ctx.setLineDash([8, 6]);
    ctx.moveTo(120, 300); ctx.lineTo(W - 120, 300);
    ctx.stroke();
    ctx.setLineDash([]);

    // Body copy
    ctx.font      = '22px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('This is to certify that the holder has achieved a', W / 2, 360);

    // Score
    ctx.font      = `bold 120px monospace`;
    ctx.fillStyle = accent;
    ctx.fillText(`${score}`, W / 2, 500);
    ctx.font      = 'bold 26px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('/ 100', W / 2 + 80, 480);

    // Rank title
    ctx.font      = `bold 38px monospace`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title.toUpperCase(), W / 2, 575);

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    ctx.font      = '18px monospace';
    ctx.fillStyle = '#555555';
    ctx.fillText(`Week ending ${dateStr}`, W / 2, 635);

    // Footer
    ctx.beginPath();
    ctx.strokeStyle = dimAccent;
    ctx.lineWidth   = 1;
    ctx.setLineDash([6, 5]);
    ctx.moveTo(120, 680); ctx.lineTo(W - 120, 680);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font      = '16px monospace';
    ctx.fillStyle = '#444444';
    ctx.fillText('Awarded by ScrollShame · scrollshame.com', W / 2, 720);

    if (gold) {
      ctx.font      = 'bold 14px monospace';
      ctx.fillStyle = '#f5a623';
      ctx.fillText('✦ CHAOS PASS EDITION ✦', W / 2, 760);
    }

    // Download
    const link  = document.createElement('a');
    link.href   = canvas.toDataURL('image/png');
    link.download = `chaos-certificate-${score}.png`;
    link.click();
  }, [stats, isPlus]);

  async function dismissUpgrade() {
    const until = new Date();
    until.setDate(until.getDate() + UPGRADE_SNOOZE_DAYS);
    await chromeSet({ [UPGRADE_KEY]: until.toISOString() });
    setShowUpgrade(false);
  }

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div class="report-page">
        <div class="report-container loading">Calculating your chaos...</div>
      </div>
    );
  }

  const chaosScore    = calculateChaosScore(stats);
  const chaosTitle    = getChaosTitle(chaosScore);
  const cleanWeek     = isCleanWeek(chaosScore);
  const upgradeCopy   = getUpgradeCopy(chaosScore, recentShare);
  const streakMilestone = getStreakMilestone(streak);

  const ALL_VOICES: RoastVoice[] = [
    'therapist', 'drill-sergeant', 'your-mom', 'tech-bro', 'accountant',
    'reddit-commenter', 'conspiracy-theorist', 'your-ex', 'gpt-4',
  ];

  const copyLabel =
    shareState === 'copying' ? '...' :
    shareState === 'done'    ? '✓ Copied!' :
    'Copy Receipt';

  return (
    <div class="report-page">

      {/* ── The Card ─────────────────────────────────────────────── */}
      <div id="report-card" class="report-card">
        <div class="receipt-top" />
        <div class="card-content">

          {/* Header */}
          <header class="card-header">
            <div>
              <h1 class="brand-name">Scroll<span>Shame</span></h1>
              <p class="week-label">
                Weekly Receipt — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
              {/* TASK-11: Streak display (hide on week 1) */}
              {streak > 1 && (
                <p class="streak-badge">🔥 Week {streak} of Chaos</p>
              )}
            </div>
            {!isPaid && <span class="free-badge">Free</span>}
          </header>

          <div class="card-divider" />

          {/* TASK-02: Renamed stat labels */}
          <div class="receipt-items">
            <div class="receipt-item">
              <span class="item-label">Max Simultaneous Crimes</span>
              <span class="item-value highlight">{stats?.peakTabs ?? 0}</span>
            </div>
            <div class="receipt-item">
              <span class="item-label">Late Night Incidents</span>
              <span class="item-value small">{stats?.nightSessions ?? 0}</span>
            </div>
            <div class="receipt-item">
              <span class="item-label">Tabs You Ghosted</span>
              <span class="item-value small">{stats?.quickClosures ?? 0}</span>
            </div>
            <div class="receipt-item">
              <span class="item-label">Full Sends</span>
              <span class="item-value small">{stats?.spiralSessions ?? 0}</span>
            </div>
            {(stats?.ghostTabs ?? 0) > 0 && (
              <div class="receipt-item">
                <span class="item-label">Haunted Tabs</span>
                <span class="item-value small">{stats?.ghostTabs}</span>
              </div>
            )}
            {(stats?.backspaceRage ?? 0) > 0 && (
              <div class="receipt-item">
                <span class="item-label">Keyboard Crimes</span>
                <span class="item-value small">{stats?.backspaceRage}</span>
              </div>
            )}
          </div>

          <div class="card-divider" />

          {/* Roast / Clean week lines — TASK-04 */}
          <div class="roast-lines">
            {roastLines.map((line, i) => <p key={i}>{line}</p>)}
            {roastLines.length === 0 && (
              <p>Come back after a week of browsing. We'll have things to say.</p>
            )}
          </div>

          {/* TASK-01: Chaos Score — TASK-03: Delta badge — TASK-04: Clean week accent */}
          <div class={`chaos-total${cleanWeek ? ' clean' : ''}`}>
            <p class="total-label">Chaos Score</p>
            <span class="total-score">{chaosScore}</span>
            <p class="score-title">
              {cleanWeek ? '😶 Suspiciously Clean Week' : chaosTitle}
            </p>

            {/* TASK-03: Score delta */}
            {delta && (
              <p class={`score-delta direction-${delta.direction}`}>
                {delta.label}
              </p>
            )}

            {/* TASK-11: Milestone streak copy */}
            {streakMilestone && (
              <p class="streak-milestone">{streakMilestone}</p>
            )}
          </div>

          {/* TASK-07: Context-aware upgrade prompt */}
          {showUpgrade && !isPaid && (
            <div class="upgrade-prompt">
              <p>{upgradeCopy.headline}</p>
              <button
                class="btn-upgrade"
                onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}
              >
                {upgradeCopy.cta}
              </button>
              <button class="btn-dismiss" onClick={dismissUpgrade}>Not now</button>
            </div>
          )}

          <footer class="card-footer">
            <span>scrollshame.com</span>
            <span>Your browser knows what you did.</span>
          </footer>
        </div>
        <div class="receipt-bottom" />
      </div>

      {/* ── Voice Selector — TASK-05 teasers ─────────────────────── */}
      <div class="report-card voice-panel">
        <span class="voice-label">Roast Voice</span>
        <div class="voice-grid">
          {ALL_VOICES.map(voice => {
            const isLocked  = !allowedVoices.includes(voice);
            const isActive  = voice === activeVoice;
            const isHovered = hoveredVoice === voice;
            const teaser    = VOICE_TEASERS[voice];
            return (
              <div key={voice} class="voice-chip-wrapper">
                <button
                  class={`voice-chip${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}`}
                  onClick={() => isLocked
                    ? window.open('https://polar.sh/scrollshame', '_blank')
                    : switchVoice(voice)
                  }
                  onMouseEnter={() => isLocked && teaser ? setHoveredVoice(voice) : null}
                  onMouseLeave={() => setHoveredVoice(null)}
                >
                  {isLocked ? '🔒 ' : ''}{VOICE_LABELS[voice]}
                </button>

                {/* TASK-05: Teaser popover on hover */}
                {isHovered && teaser && (
                  <div class="voice-teaser-popover">
                    <p class="teaser-line">"{teaser}"</p>
                    <button
                      class="teaser-cta"
                      onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}
                    >
                      Unlock — $12 ↗
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Share Actions ─────────────────────────────────────────── */}
      <div class="share-row">
        <button
          class={`btn-share${shareState === 'done' ? ' copied' : ''}`}
          onClick={copyToClipboard}
          disabled={shareState === 'copying'}
        >
          {copyLabel}
        </button>
        <button class="btn-share primary" onClick={shareToX}>
          Post to X ↗
        </button>
      </div>

      {/* TASK-10: Chaos Certificate — shown at score >= 80 */}
      {chaosScore >= 80 && (
        <div class="certificate-row">
          <button class="btn-certificate" onClick={downloadCertificate}>
            🏆 Download Chaos Certificate
          </button>
          {isPlus && <span class="cert-gold-label">✦ Gold Edition</span>}
        </div>
      )}

      {!isPaid && (
        <p class="free-notice">Free — upgrade to export without footer</p>
      )}
    </div>
  );
}

const root = document.getElementById('app');
if (root) render(<Report />, root);