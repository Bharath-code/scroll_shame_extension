// Background service worker for ScrollShame
// Handles tab tracking, session management, and daily aggregation

// Storage keys
const STORAGE_KEYS = {
  DAILY_PREFIX: 'day-',        // Daily aggregates: "day-2026-04-30"
  SETTINGS: 'settings'
};

// Track current window session
let currentSessionStart = null;
let activeTabs = new Map(); // tabId -> timestamp

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[ScrollShame] Extension installed');
  initializeStorage();
});

// Restore session start time on startup
chrome.runtime.onStartup.addListener(async () => {
  try {
    const result = await new Promise((resolve, reject) => {
      chrome.storage.local.get('session-start', (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
    if (result['session-start']) {
      currentSessionStart = result['session-start'];
    }
  } catch (error) {
    console.error('[ScrollShame] Failed to restore session start:', error);
  }
  cleanupOldData();
});

chrome.tabs.onCreated.addListener((tab) => {
  if (tab.id) {
    activeTabs.set(tab.id, Date.now());
  }
  updatePeakTabs();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  const openedAt = activeTabs.get(tabId);
  if (openedAt) {
    const duration = Date.now() - openedAt;
    // Track tab churn - closed within 60 seconds
    if (duration < 60000) {
      incrementStat('quickClosures');
    }
    activeTabs.delete(tabId);
  }
  updatePeakTabs();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (activeInfo.tabId) {
    // Only update timestamp if tab is not already tracked
    if (!activeTabs.has(activeInfo.tabId)) {
      activeTabs.set(activeInfo.tabId, Date.now());
    }
  }
  updatePeakTabs();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Update timestamp when tab is reloaded or navigated
  if (changeInfo.status === 'complete' && tabId) {
    activeTabs.set(tabId, Date.now());
  }
});

// Track window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window lost focus - end session
    if (currentSessionStart) {
      const duration = Date.now() - currentSessionStart;
      if (duration > 4 * 60 * 60 * 1000) { // 4+ hours
        incrementStat('longSessions');
      }
      currentSessionStart = null;
      // Clear persisted session start time
      chrome.storage.local.remove('session-start');
    }
  } else {
    // Window gained focus - start new session
    currentSessionStart = Date.now();
    // Persist session start time to survive crashes
    chrome.storage.local.set({ 'session-start': currentSessionStart });
  }
});

// OS-Level Harassment tracking
let lastHarassmentTime = 0;

async function checkOSHarassment(currentCount) {
  if (currentCount < 30) return;
  
  // 1-hour cooldown
  const now = Date.now();
  if (now - lastHarassmentTime < 60 * 60 * 1000) return;
  
  // Check settings
  const settingsResult = await new Promise(resolve => chrome.storage.local.get(STORAGE_KEYS.SETTINGS, resolve));
  const settings = settingsResult[STORAGE_KEYS.SETTINGS] || {};
  if (!settings.osHarassmentEnabled) return;
  
  // Check license
  const licenseResult = await new Promise(resolve => chrome.storage.local.get('license-status', resolve));
  const licenseStatus = licenseResult['license-status'] || {};
  if (licenseStatus.tier !== 'chaos-pass' && licenseStatus.tier !== 'pro-plus') return;
  
  // Fire notification
  lastHarassmentTime = now;
  
  const roasts = [
    `30 tabs open. What are you even looking for anymore?`,
    `Your browser is crying. Close some tabs.`,
    `Do you honestly think you'll read any of these?`,
    `RAM isn't free, you know. Close the tabs.`,
    `This isn't productive. It's just digital hoarding.`
  ];
  const roast = roasts[Math.floor(Math.random() * roasts.length)];
  
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.svg',
    title: 'ScrollShame Intervention',
    message: roast,
    priority: 2
  });
}

// Update peak tab count
async function updatePeakTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const currentCount = tabs.length;

  const today = getTodayKey();
  const data = await getDailyData(today);

  if (currentCount > (data.peakTabs || 0)) {
    data.peakTabs = currentCount;
  }

  // Track late-night usage
  const hour = new Date().getHours();
  if (hour >= 23 || hour < 4) {
    data.nightSessions = (data.nightSessions || 0) + 1;
  }

  await saveDailyData(today, data);
  
  // Check for OS-Level Harassment
  checkOSHarassment(currentCount);
}

// Increment a stat in today's data
async function incrementStat(statName) {
  const today = getTodayKey();
  const data = await getDailyData(today);
  data[statName] = (data[statName] || 0) + 1;
  await saveDailyData(today, data);
}

// Helper: get today's storage key
function getTodayKey() {
  const today = new Date();
  return `${STORAGE_KEYS.DAILY_PREFIX}${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Helper: get daily data
async function getDailyData(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (result) => {
      if (chrome.runtime.lastError) {
        console.error('[ScrollShame] Failed to get daily data:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve(result[key] || {});
      }
    });
  });
}

// Helper: save daily data
async function saveDailyData(key, data) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) {
        console.error('[ScrollShame] Failed to save daily data:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        resolve();
      }
    });
  });
}

// Initialize storage with default values
function initializeStorage() {
  chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: {
      notificationTime: 'monday-9am',
      trackTabCount: true,
      trackScrollVelocity: true,
      trackLateNight: true,
      trackTabChurn: true,
      trackSessionLength: true,
      roastVoice: 'therapist'
    }
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'scroll-velocity') {
    handleScrollVelocity(message.data);
  }
});

async function handleScrollVelocity(data) {
  const today = getTodayKey();
  const dailyData = await getDailyData(today);

  // Classify scroll velocity
  if (data.velocity > 800) {
    dailyData.spiralSessions = (dailyData.spiralSessions || 0) + 1;
  } else if (data.velocity > 400) {
    dailyData.anxiousSessions = (dailyData.anxiousSessions || 0) + 1;
  } else {
    dailyData.calmSessions = (dailyData.calmSessions || 0) + 1;
  }

  // Track peak velocity
  if (!dailyData.peakVelocity || data.velocity > dailyData.peakVelocity) {
    dailyData.peakVelocity = data.velocity;
  }

  await saveDailyData(today, dailyData);
}


function cleanupOldData() {
  const twelveWeeksAgo = Date.now() - (84 * 24 * 60 * 60 * 1000);
  chrome.storage.local.get(null, (items) => {
    const updates = {};
    for (const key of Object.keys(items)) {
      if (key.startsWith(STORAGE_KEYS.DAILY_PREFIX)) {
        try {
          // Keep data from last 12 weeks
          const dateStr = key.replace(STORAGE_KEYS.DAILY_PREFIX, '');
          const parts = dateStr.split('-').map(Number);
          if (parts.length !== 3) continue;
          const [year, month, day] = parts;
          if (isNaN(year) || isNaN(month) || isNaN(day)) continue;
          const dateMs = new Date(year, month - 1, day).getTime();
          if (dateMs < twelveWeeksAgo) {
            updates[key] = null; // Delete
          }
        } catch (error) {
          console.error('[ScrollShame] Error parsing date key:', key, error);
        }
      }
    }
    chrome.storage.local.remove(Object.keys(updates).filter(k => updates[k] === null));
  });
}

console.log('[ScrollShame] Background service worker initialized');