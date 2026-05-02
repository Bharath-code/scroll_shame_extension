import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { calculateChaosScore, getChaosTitle } from '../lib/scoring';
import { storage } from '../lib/storage';
import { todayKey } from '../lib/date-key';
import { isPro, isProPlus } from '../lib/license';

import './styles.css';

function Popup() {
  const [stats,   setStats  ] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tier,    setTier   ] = useState<'free' | 'pro' | 'pro-plus'>('free');

  useEffect(() => { loadStats(); }, []);

  async function loadStats() {
    try {
      const [pro, proPlus] = await Promise.all([isPro(), isProPlus()]);
      setTier(proPlus ? 'pro-plus' : pro ? 'pro' : 'free');

      const today = todayKey(new Date());
      const data  = await storage.getDaily(today);
      setStats(data);
    } catch (err) {
      console.error('[ScrollShame] Popup failed to load:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div class="popup-container loading">
        loading...
      </div>
    );
  }

  const chaosScore = calculateChaosScore(stats);
  const chaosTitle  = getChaosTitle(chaosScore);

  const TierBadge = () => {
    if (tier === 'pro-plus') return <span class="plus-badge">Pro+</span>;
    if (tier === 'pro')      return <span class="pro-badge">Pro</span>;
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

      {/* ── Upgrade banner (free only) ─────────────── */}
      {tier === 'free' && (
        <div class="upgrade-banner">
          <p>🔓 Unlock all 5 roast voices</p>
          <button
            class="btn-upgrade-small"
            onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}
          >
            $15
          </button>
        </div>
      )}

      {/* ── Stats grid ─────────────────────────────── */}
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
      </div>

      {/* ── Shame title ────────────────────────────── */}
      <p class="shame-title-row">
        <strong>{chaosTitle}</strong>
      </p>

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