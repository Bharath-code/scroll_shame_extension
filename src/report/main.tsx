import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import html2canvas from 'html2canvas';
import { calculateShameScore, getShameTitle, aggregateStats, DayData } from '../lib/scoring';
import { storage } from '../lib/storage';
import { getLast7Days } from '../lib/date-key';
import { ROAST_VOICES, getRandomRoast, formatRoast, RoastVoice } from '../lib/roast-pools';

function Report() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [currentRoastPool, setCurrentRoastPool] = useState(ROAST_VOICES.therapist);

  useEffect(() => {
    loadWeeklyStats();
  }, []);

  async function loadWeeklyStats() {
    const days = getLast7Days();
    const allData: DayData[] = [];

    for (const dayKey of days) {
      const data = await storage.getDaily(dayKey);
      if (data && Object.keys(data).length > 0) {
        allData.push(data);
      }
    }

    const aggregated = aggregateStats(allData);
    setStats(aggregated);

    // Load user's roast voice preference
    const settings = await storage.getSettings();
    const voice = settings.roastVoice as RoastVoice;
    setCurrentRoastPool(ROAST_VOICES[voice] || ROAST_VOICES.therapist);

    setLoading(false);
  }

  async function copyToClipboard() {
    const card = document.getElementById('report-card');
    if (!card) return;

    try {
      const canvas = await html2canvas(card);
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  if (loading) {
    return <div class="report-container loading">Loading your shame...</div>;
  }

  const shameScore = calculateShameScore(stats);
  const shameTitle = getShameTitle(shameScore);

  return (
    <div class="report-page">
      <div class="report-container">
        <div id="report-card" class="report-card">
          <div class="receipt-top"></div>
          <div class="card-content">
            <header class="card-header">
              <h1 class="brand-name">Scroll<span>Shame</span></h1>
              <p class="week-label">Weekly Receipt</p>
            </header>

            <div class="receipt-items">
              <div class="receipt-item">
                <span class="item-label">Peak Tabs</span>
                <span class="item-value highlight">{stats?.peakTabs || 0}</span>
              </div>
              <div class="receipt-item">
                <span class="item-label">Night Sessions</span>
                <span class="item-value small">{stats?.nightSessions || 0}</span>
              </div>
              <div class="receipt-item">
                <span class="item-label">Quick Closures</span>
                <span class="item-value small">{stats?.quickClosures || 0}</span>
              </div>
              <div class="receipt-item">
                <span class="item-label">Spiral Events</span>
                <span class="item-value small">{stats?.spiralSessions || 0}</span>
              </div>
            </div>

            <div class="roast-lines">
              <p>{formatRoast(getRandomRoast(currentRoastPool.peakTabs), stats)}</p>
              {stats.nightSessions > 0 && (
                <p>{formatRoast(getRandomRoast(currentRoastPool.nightSessions), stats)}</p>
              )}
              {stats.quickClosures > 10 && (
                <p>{formatRoast(getRandomRoast(currentRoastPool.quickClosures), stats)}</p>
              )}
            </div>

            <div class="shame-total">
              <p class="total-label">Total Shame</p>
              <span class="total-score">{shameScore}</span>
              <p class="score-title">{shameTitle}</p>
            </div>

            <footer class="card-footer">
              <span>scrollshame.com</span>
              <span class="tagline">Your browser knows what you did.</span>
            </footer>
          </div>
          <div class="receipt-bottom"></div>
        </div>

        <button class="btn-share" onClick={copyToClipboard}>
          {copied ? '✓ Copied!' : 'Copy Receipt'}
        </button>
      </div>
    </div>
  );
}

const root = document.getElementById('app');
if (root) {
  render(<Report />, root);
}