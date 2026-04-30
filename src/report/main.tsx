import { render } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import html2canvas from 'html2canvas';
import { calculateShameScore, getShameTitle, aggregateStats, DayData } from '../lib/scoring';
import { storage } from '../lib/storage';
import { getLast7Days } from '../lib/date-key';
import { ROAST_VOICES, getRandomRoast, formatRoast, getAllowedVoice, RoastVoice } from '../lib/roast-pools';
import { isPro } from '../lib/license';

const REPORT_VIEWS_KEY = 'report-views';
const UPGRADE_DAYS_KEY = 'upgrade-dismissed-until';
const UPGRADE_VIEW_THRESHOLD = 3;
const UPGRADE_DISMISSAL_DAYS = 30;

const NIGHT_TIMES = ['11:42pm', '1:15am', '2:33am', '12:58am', '3:07am', '1:47am', '2:14am', '12:23am'];

function getRandomNightTime(): string {
  return NIGHT_TIMES[Math.floor(Math.random() * NIGHT_TIMES.length)];
}

async function getReportViews(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(REPORT_VIEWS_KEY, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[REPORT_VIEWS_KEY] || 0);
      }
    });
  });
}

async function incrementReportViews(): Promise<number> {
  const current = await getReportViews();
  const newCount = current + 1;
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [REPORT_VIEWS_KEY]: newCount }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(newCount);
      }
    });
  });
}

async function isUpgradeDismissed(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(UPGRADE_DAYS_KEY, (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        const dismissedUntil = result[UPGRADE_DAYS_KEY];
        if (!dismissedUntil) {
          resolve(false);
          return;
        }
        const dismissedDate = new Date(dismissedUntil);
        if (isNaN(dismissedDate.getTime())) {
          resolve(false);
          return;
        }
        resolve(Date.now() < dismissedDate.getTime());
      }
    });
  });
}

async function shouldShowUpgrade(): Promise<boolean> {
  try {
    const views = await getReportViews();
    const dismissed = await isUpgradeDismissed();
    return views >= UPGRADE_VIEW_THRESHOLD && !dismissed;
  } catch (error) {
    console.error('[ScrollShame] Failed to check upgrade eligibility:', error);
    return false;
  }
}

function Report() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [currentRoastPool, setCurrentRoastPool] = useState(ROAST_VOICES.therapist);

  useEffect(() => {
    loadWeeklyStats();
  }, []);

  async function loadWeeklyStats() {
    try {
      const pro = await isPro();
      setIsProUser(pro);

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

      // License-aware roast voice selection
      const settings = await storage.getSettings();
      const voice = await getAllowedVoice(settings.roastVoice);
      setCurrentRoastPool(ROAST_VOICES[voice] || ROAST_VOICES.therapist);

      // Track report views for upgrade trigger (with error handling)
      try {
        await incrementReportViews();
        const upgradeNeeded = await shouldShowUpgrade();
        setShowUpgrade(upgradeNeeded);
      } catch (trackError) {
        console.error('[ScrollShame] Failed to track report views:', trackError);
      }
    } catch (error) {
      console.error('[ScrollShame] Failed to load weekly stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function copyToClipboard() {
    const card = document.getElementById('report-card');
    if (!card) return;

    try {
      const canvas = await html2canvas(card, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null
      });

      if (!isProUser) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.globalAlpha = 0.3;
          ctx.font = 'bold 24px monospace';
          ctx.fillStyle = '#ff0000';
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 6);
          ctx.textAlign = 'center';
          ctx.fillText('SCROLL SHAME FREE', 0, 0);
          ctx.restore();
        }
      }

      try {
        const blob = await new Promise<Blob | null>((resolve, reject) => {
          canvas.toBlob((b) => resolve(b), 'image/png');
        });

        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (blobError) {
        console.error('[ScrollShame] Failed to create blob:', blobError);
      }
    } catch (err) {
      console.error('[ScrollShame] Failed to copy:', err);
    }
  }

  async function dismissUpgrade(): Promise<void> {
    const dismissalDate = new Date();
    dismissalDate.setDate(dismissalDate.getDate() + UPGRADE_DISMISSAL_DAYS);
    return new Promise<void>((resolve, reject) => {
      chrome.storage.local.set({ [UPGRADE_DAYS_KEY]: dismissalDate.toISOString() }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          setShowUpgrade(false);
          resolve();
        }
      });
    });
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
              <p>{formatRoast(getRandomRoast(currentRoastPool.peakTabs), { peakTabs: stats?.peakTabs })}</p>
              {stats?.nightSessions > 0 && (
                <p>{formatRoast(getRandomRoast(currentRoastPool.nightSessions), { time: getRandomNightTime() })}</p>
              )}
              {stats?.quickClosures > 10 && (
                <p>{formatRoast(getRandomRoast(currentRoastPool.quickClosures), { quickClosures: stats?.quickClosures })}</p>
              )}
              {stats?.longSessions > 0 && (
                <p>{formatRoast(getRandomRoast(currentRoastPool.longSessions), { hours: Math.min(stats?.longSessions || 1, 12) })}</p>
              )}
              {stats?.spiralSessions > 0 && (
                <p>{formatRoast(getRandomRoast(currentRoastPool.spiralSessions), { velocity: Math.floor(400 + Math.random() * 800) })}</p>
              )}
            </div>

            <div class="shame-total">
              <p class="total-label">Total Shame</p>
              <span class="total-score">{shameScore}</span>
              <p class="score-title">{shameTitle}</p>
            </div>

            {showUpgrade && (
              <div class="upgrade-prompt">
                <p>🔓 Unlock all 5 roast voices + export without watermark</p>
                <button class="btn-upgrade" onClick={() => window.open('https://polar.sh/scrollshame', '_blank')}>
                  Upgrade to Pro - $1.99
                </button>
                <button class="btn-dismiss" onClick={dismissUpgrade}>Not now</button>
              </div>
            )}

            <footer class="card-footer">
              <span>scrollshame.com</span>
              <span class="tagline">Your browser knows what you did.</span>
              {!isProUser && <span class="free-badge">Free</span>}
            </footer>
          </div>
          <div class="receipt-bottom"></div>
        </div>

        <button class="btn-share" onClick={copyToClipboard}>
          {copied ? '✓ Copied!' : 'Copy Receipt'}
        </button>
        {!isProUser && (
          <p class="free-notice">Free tier - upgrade to remove watermark</p>
        )}
      </div>
    </div>
  );
}

const root = document.getElementById('app');
if (root) {
  render(<Report />, root);
}