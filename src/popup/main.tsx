import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { calculateChaosScore, getChaosTitle } from '../lib/scoring';
import { storage } from '../lib/storage';
import { todayKey } from '../lib/date-key';
import { isPro, isProPlus } from '../lib/license';
import { getRamInfo, RamInfo } from '../lib/memory';

import './styles.css';

// TASK-06: tier type updated
type DisplayTier = 'free' | 'pro' | 'chaos-pass';

function Popup() {
  const [stats,   setStats  ] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tier,    setTier   ] = useState<DisplayTier>('free');
  const [streak,  setStreak ] = useState(0);
  const [ramInfo, setRamInfo] = useState<RamInfo | null>(null);

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [pro, proPlus] = await Promise.all([isPro(), isProPlus()]);
      setTier(proPlus ? 'chaos-pass' : pro ? 'pro' : 'free');

      const today = todayKey(new Date());
      const data  = await storage.getDaily(today);
      setStats(data);

      // TASK-11: Load streak for popup display
      const s = await storage.getChaosStreak();
      setStreak(s);

      const ram = await getRamInfo();
      setRamInfo(ram);
    } catch (err) {
      console.error('[ScrollShame] Popup failed to load:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div class="popup-container loading">loading...</div>;
  }

  const chaosScore = calculateChaosScore(stats);
  const chaosTitle = getChaosTitle(chaosScore);

  // TASK-06: Chaos Pass badge replaces Pro+
  const TierBadge = () => {
    if (tier === 'chaos-pass') return <span class="plus-badge">Chaos Pass</span>;
    if (tier === 'pro')        return <span class="pro-badge">Pro</span>;
    return <span class="free-badge">Free</span>;
  };

  return (
    <div class="popup-container">
      {/* ── Header ─────────────────────────────────── */}
      <header class="popup-header">
        <h1>
          Scroll<span class="shame-word">Shame</span>
        </h1>
        <TierBadge />
      </header>

      {/* ── Upgrade banner — TASK-07 new copy (free only) ── */}
      {tier === 'free' && (
        <div class="upgrade-banner">
          <p>4 roasters. 1 unlocked. You're only hearing the polite one.</p>
          <button
            class="btn-upgrade-small"
            onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}
          >
            $12
          </button>
        </div>
      )}

      {/* ── Stats grid — TASK-11 streak as 4th stat ─────── */}
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-value">{stats?.peakTabs ?? 0}</span>
          <span class="stat-label">Peak Tabs</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{stats?.nightSessions ?? 0}</span>
          <span class="stat-label">Late Night</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{chaosScore}</span>
          <span class="stat-label">Chaos</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{streak > 0 ? `${streak}🔥` : '—'}</span>
          <span class="stat-label">Streak</span>
        </div>
      </div>

      {/* ── Chaos title ─────────────────────────────── */}
      <p class="shame-title-row">
        <strong>{chaosTitle}</strong>
      </p>

      {/* ── RAM Eaten Banner ────────────────────────── */}
      {ramInfo && (
        <div class="ram-banner">
          <p>
            <strong>{ramInfo.isPressureHigh ? '🔥 SYSTEM CHOKING' : 'RAM Eaten:'}</strong>
            <br />
            {ramInfo.message}
          </p>
        </div>
      )}

      {/* ── Actions ────────────────────────────────── */}
      <div class="actions">
        <button
          class="btn-primary"
          onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('report.html') })}
        >
          View Report
        </button>
        <button
          class="btn-secondary"
          onClick={() => chrome.runtime.openOptionsPage()}
        >
          Settings
        </button>
      </div>

      {/* ── Footer ─────────────────────────────────── */}
      <footer class="popup-footer">
        <p>Weekly report every Monday · Your data stays local</p>
      </footer>
    </div>
  );
}

const root = document.getElementById('app');
if (root) render(<Popup />, root);