import { render } from 'preact';
import { useState, useEffect, useCallback } from 'preact/hooks';
import html2canvas from 'html2canvas';
import { calculateShameScore, getShameTitle, aggregateStats, type DayData } from '../lib/scoring';
import { storage } from '../lib/storage';
import { getLast7Days } from '../lib/date-key';
import {
  ROAST_VOICES,
  VOICE_LABELS,
  getRandomRoast,
  formatRoast,
  getAllowedVoice,
  getAllowedVoices,
  type RoastVoice,
} from '../lib/roast-pools';
import { isPro, isProPlus } from '../lib/license';

import './styles.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const REPORT_VIEWS_KEY    = 'report-views';
const UPGRADE_DAYS_KEY    = 'upgrade-dismissed-until';
const UPGRADE_THRESHOLD   = 2;  // show upgrade after N report views
const UPGRADE_SNOOZE_DAYS = 30;

const NIGHT_TIMES = [
  '11:42pm', '1:15am', '2:33am', '12:58am',
  '3:07am',  '1:47am', '2:14am', '12:23am',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Persistence helpers ──────────────────────────────────────────────────────
function chromeGet<T>(key: string, fallback: T): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve((result[key] as T) ?? fallback);
    });
  });
}
function chromeSet(data: Record<string, unknown>): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(data, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve();
    });
  });
}

async function shouldShowUpgrade(isPaid: boolean): Promise<boolean> {
  if (isPaid) return false;
  try {
    const [views, dismissedUntil] = await Promise.all([
      chromeGet<number>(REPORT_VIEWS_KEY, 0),
      chromeGet<string | null>(UPGRADE_DAYS_KEY, null),
    ]);
    if (views < UPGRADE_THRESHOLD) return false;
    if (!dismissedUntil) return true;
    const date = new Date(dismissedUntil);
    return isNaN(date.getTime()) || Date.now() >= date.getTime();
  } catch {
    return false;
  }
}

// ─── Report Component ─────────────────────────────────────────────────────────
function Report() {
  const [stats,        setStats       ] = useState<DayData | null>(null);
  const [loading,      setLoading     ] = useState(true);
  const [copied,       setCopied      ] = useState(false);
  const [shareState,   setShareState  ] = useState<'idle' | 'copying' | 'done'>('idle');
  const [showUpgrade,  setShowUpgrade ] = useState(false);
  const [isPaid,       setIsPaid      ] = useState(false);
  const [isPlus,       setIsPlus      ] = useState(false);
  const [activeVoice,  setActiveVoice ] = useState<RoastVoice>('therapist');
  const [allowedVoices,setAllowedVoices] = useState<RoastVoice[]>(['therapist']);
  const [roastLines,   setRoastLines  ] = useState<string[]>([]);

  // ─── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => { loadWeeklyStats(); }, []);

  async function loadWeeklyStats() {
    try {
      const [pro, proPlus] = await Promise.all([isPro(), isProPlus()]);
      setIsPaid(pro);
      setIsPlus(proPlus);

      const days = getLast7Days();
      const allData: DayData[] = [];
      for (const dayKey of days) {
        const data = await storage.getDaily(dayKey);
        if (data && Object.keys(data).length > 0) allData.push(data);
      }

      const aggregated = aggregateStats(allData);
      setStats(aggregated);

      // Voice selection
      const settings  = await storage.getSettings();
      const [voice, voices] = await Promise.all([
        getAllowedVoice(settings.roastVoice),
        getAllowedVoices(),
      ]);
      setActiveVoice(voice);
      setAllowedVoices(voices);
      setRoastLines(buildRoastLines(voice, aggregated));

      // Increment views + check upgrade gate
      const current = await chromeGet<number>(REPORT_VIEWS_KEY, 0);
      await chromeSet({ [REPORT_VIEWS_KEY]: current + 1 });
      setShowUpgrade(await shouldShowUpgrade(pro));
    } catch (err) {
      console.error('[ScrollShame] Failed to load weekly stats:', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Roast line builder ────────────────────────────────────────────────────
  function buildRoastLines(voice: RoastVoice, s: DayData | null): string[] {
    if (!s) return [];
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

  // ─── Voice switch ──────────────────────────────────────────────────────────
  function switchVoice(voice: RoastVoice) {
    if (!allowedVoices.includes(voice)) return;
    setActiveVoice(voice);
    setRoastLines(buildRoastLines(voice, stats));
    // Persist selection
    storage.getSettings().then(s => storage.setSettings({ ...s, roastVoice: voice }));
  }

  // ─── Copy to clipboard ─────────────────────────────────────────────────────
  const copyToClipboard = useCallback(async () => {
    const card = document.getElementById('report-card');
    if (!card || shareState === 'copying') return;

    setShareState('copying');
    try {
      const canvas = await html2canvas(card, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#141414',
        scale: 2,        // 2x for retina-quality sharing
      });

      // Free-tier watermark
      if (!isPaid) {
        const ctx = canvas.getContext('2d')!;
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.font = `bold ${Math.floor(canvas.width * 0.06)}px monospace`;
        ctx.fillStyle = '#ff2d2d';
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.textAlign = 'center';
        ctx.fillText('SCROLLSHAME FREE', 0, 0);
        ctx.restore();
      }

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setShareState('done');
        setTimeout(() => setShareState('idle'), 2500);
      }
    } catch (err) {
      console.error('[ScrollShame] Copy failed:', err);
      setShareState('idle');
    }
  }, [isPaid, shareState]);

  // ─── Share to X ───────────────────────────────────────────────────────────
  const shareToX = useCallback(() => {
    if (!stats) return;
    const score = calculateShameScore(stats);
    const title = getShameTitle(score);
    const text = `My weekly shame score: ${score}/100 — "${title}"\n\nMy browser knows what I did. Does yours?\n`;
    const url = 'https://scrollshame.com';
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ScrollShame`;
    window.open(intent, '_blank', 'width=600,height=400');
  }, [stats]);

  // ─── Dismiss upgrade ───────────────────────────────────────────────────────
  async function dismissUpgrade() {
    const until = new Date();
    until.setDate(until.getDate() + UPGRADE_SNOOZE_DAYS);
    await chromeSet({ [UPGRADE_DAYS_KEY]: until.toISOString() });
    setShowUpgrade(false);
  }

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div class="report-page">
        <div class="report-container loading">Calculating your shame...</div>
      </div>
    );
  }

  const shameScore = calculateShameScore(stats);
  const shameTitle = getShameTitle(shameScore);

  // Build all voices for the selector UI (9 total, gated)
  const ALL_VOICES: RoastVoice[] = [
    'therapist','drill-sergeant','your-mom','tech-bro','accountant',
    'reddit-commenter','conspiracy-theorist','your-ex','gpt-4',
  ];

  // Share button label
  const copyLabel =
    shareState === 'copying' ? '...' :
    shareState === 'done'    ? '✓ Copied!' :
    'Copy Receipt';

  return (
    <div class="report-page">
      {/* ── The Card ──────────────────────────────────────────────── */}
      <div id="report-card" class="report-card">
        <div class="receipt-top" />
        <div class="card-content">

          {/* Header */}
          <header class="card-header">
            <div>
              <h1 class="brand-name">Scroll<span>Shame</span></h1>
              <p class="week-label">Weekly Receipt — {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>
            {!isPaid && <span class="free-badge">Free</span>}
          </header>

          <div class="card-divider" />

          {/* Stats receipt */}
          <div class="receipt-items">
            <div class="receipt-item">
              <span class="item-label">Peak Tabs</span>
              <span class="item-value highlight">{stats?.peakTabs ?? 0}</span>
            </div>
            <div class="receipt-item">
              <span class="item-label">Night Sessions</span>
              <span class="item-value small">{stats?.nightSessions ?? 0}</span>
            </div>
            <div class="receipt-item">
              <span class="item-label">Quick Closures</span>
              <span class="item-value small">{stats?.quickClosures ?? 0}</span>
            </div>
            <div class="receipt-item">
              <span class="item-label">Spiral Events</span>
              <span class="item-value small">{stats?.spiralSessions ?? 0}</span>
            </div>
            {(stats?.ghostTabs ?? 0) > 0 && (
              <div class="receipt-item">
                <span class="item-label">Ghost Tabs</span>
                <span class="item-value small">{stats?.ghostTabs}</span>
              </div>
            )}
            {(stats?.backspaceRage ?? 0) > 0 && (
              <div class="receipt-item">
                <span class="item-label">Backspace Rage</span>
                <span class="item-value small">{stats?.backspaceRage}</span>
              </div>
            )}
          </div>

          <div class="card-divider" />

          {/* Roast lines */}
          <div class="roast-lines">
            {roastLines.map((line, i) => <p key={i}>{line}</p>)}
            {roastLines.length === 0 && (
              <p>Come back after a week of browsing. We'll have things to say.</p>
            )}
          </div>

          {/* Shame score */}
          <div class="shame-total">
            <p class="total-label">Shame Score</p>
            <span class="total-score">{shameScore}</span>
            <p class="score-title">{shameTitle}</p>
          </div>

          {/* Upgrade prompt */}
          {showUpgrade && !isPaid && (
            <div class="upgrade-prompt">
              <p>🔓 Unlock all 5 roast voices + export without watermark</p>
              <button
                class="btn-upgrade"
                onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}
              >
                Upgrade to Pro — $15
              </button>
              <button class="btn-dismiss" onClick={dismissUpgrade}>Not now</button>
            </div>
          )}

          {/* Footer */}
          <footer class="card-footer">
            <span>scrollshame.com</span>
            <span>Your browser knows what you did.</span>
          </footer>
        </div>
        <div class="receipt-bottom" />
      </div>

      {/* ── Voice Selector ────────────────────────────────────────── */}
      <div class="report-card" style="max-width: 400px; width: 100%; padding: 1rem 1.5rem;">
        <span class="voice-label">Roast Voice</span>
        <div class="voice-grid">
          {ALL_VOICES.map(voice => {
            const isLocked  = !allowedVoices.includes(voice);
            const isActive  = voice === activeVoice;
            return (
              <button
                key={voice}
                class={`voice-chip${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}`}
                onClick={() => isLocked
                  ? window.open('https://polar.sh/scrollshame', '_blank')
                  : switchVoice(voice)
                }
                title={isLocked ? (voice === 'reddit-commenter' || voice === 'conspiracy-theorist' || voice === 'your-ex' || voice === 'gpt-4'
                  ? 'Pro+ only — $4.99/mo'
                  : 'Pro only — $15') : VOICE_LABELS[voice]}
              >
                {isLocked ? '🔒 ' : ''}{VOICE_LABELS[voice]}
              </button>
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

      {!isPaid && (
        <p class="free-notice">Free tier — upgrade to export without watermark</p>
      )}
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────────
const root = document.getElementById('app');
if (root) render(<Report />, root);