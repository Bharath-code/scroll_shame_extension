import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { calculateShameScore } from '../lib/scoring';
import { storage } from '../lib/storage';
import { todayKey } from '../lib/date-key';
import { isPro } from '../lib/license';

function Popup() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProUser, setIsProUser] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const pro = await isPro();
    setIsProUser(pro);

    const today = todayKey(new Date());
    const data = await storage.getDaily(today);
    setStats(data);
    setLoading(false);
  }

  if (loading) {
    return <div class="popup-container loading">Loading...</div>;
  }

  const shameScore = calculateShameScore(stats);

  return (
    <div class="popup-container">
      <header class="popup-header">
        <h1>ScrollShame {!isProUser && <span class="free-badge">Free</span>}{isProUser && <span class="pro-badge">Pro</span>}</h1>
        <p class="tagline">Your browser knows what you did.</p>
      </header>

      {!isProUser && (
        <div class="upgrade-banner">
          <p>🔓 Unlock all 5 roast voices</p>
          <button class="btn-upgrade-small" onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}>
            Upgrade $1.99
          </button>
        </div>
      )}

      <div class="stats-preview">
        <div class="stat-item">
          <span class="stat-value">{stats?.peakTabs || 0}</span>
          <span class="stat-label">Peak Tabs</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{stats?.nightSessions || 0}</span>
          <span class="stat-label">Late Night</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{shameScore}</span>
          <span class="stat-label">Shame Score</span>
        </div>
      </div>

      <div class="actions">
        <button class="btn-primary" onClick={() => window.open('report.html', '_blank')}>
          View Report
        </button>
        <button class="btn-secondary" onClick={() => chrome.runtime.openOptionsPage()}>
          Settings
        </button>
      </div>

      <footer class="popup-footer">
        <p>Weekly report every Monday</p>
      </footer>
    </div>
  );
}

const root = document.getElementById('app');
if (root) {
  render(<Popup />, root);
}