import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { calculateShameScore } from '../lib/scoring';
import { storage } from '../lib/storage';
import { todayKey } from '../lib/date-key';

function Popup() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
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
        <h1>ScrollShame</h1>
        <p class="tagline">Your browser knows what you did.</p>
      </header>

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