// Content script for ScrollShame
// Tracks scroll velocity on all pages

(function() {
  'use strict';

  let lastScrollTime = 0;
  let lastScrollPosition = 0;
  let scrollTimestamps = [];
  let lastScrollVelocitySent = 0;

  const VELOCITY_THRESHOLD = 800; // px/sec for "spiraling"
  const SAMPLE_INTERVAL = 100; // ms between samples

  function init() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    console.log('[ScrollShame] Content script initialized');
  }

  function handleScroll() {
    const now = Date.now();
    const currentPosition = window.scrollY;

    // Calculate velocity
    const timeDelta = now - lastScrollTime;
    if (timeDelta > 0 && lastScrollTime > 0) {
      const distanceDelta = Math.abs(currentPosition - lastScrollPosition);
      const velocity = (distanceDelta / timeDelta) * 1000; // px/sec

      // Only track meaningful scrolls (not tiny adjustments)
      if (distanceDelta > 10) {
        scrollTimestamps.push({ velocity, timestamp: now });

        // Keep only last 30 seconds of data
        const thirtySecondsAgo = now - 30000;
        scrollTimestamps = scrollTimestamps.filter(s => s.timestamp > thirtySecondsAgo);

        // If we have high velocity, send to background
        if (velocity > VELOCITY_THRESHOLD) {
          sendScrollVelocity(velocity);
        }
      }
    }

    lastScrollTime = now;
    lastScrollPosition = currentPosition;
    
    // Reset the continuous scroll timer if we stop scrolling for 5 seconds
    if (scrollResetTimeout) clearTimeout(scrollResetTimeout);
    scrollResetTimeout = setTimeout(resetScrollTimer, 5000);
    
    checkTouchGrass();
  }

  function sendScrollVelocity(velocity) {
    // Debounce - don't send too frequently
    const now = Date.now();
    if (lastScrollVelocitySent && (now - lastScrollVelocitySent) < 5000) {
      return;
    }
    lastScrollVelocitySent = now;

    chrome.runtime.sendMessage({
      type: 'scroll-velocity',
      data: {
        velocity,
        url: window.location.href,
        timestamp: now
      }
    }).catch((error) => {
      // Log errors for debugging
      console.error('[ScrollShame] Failed to send scroll velocity:', error);
    });
  }

  // --- Tab Title Hijacking ---
  let originalTitle = '';
  let hijackTimeout = null;

  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      hijackTimeout = setTimeout(async () => {
        const settings = await getSettings();
        if (settings.tabHijackingEnabled && await isProPlus()) {
          originalTitle = document.title;
          const messages = [
            "I'm eating ~120MB of your RAM", 
            "Close me, I'm starving your CPU", 
            "Your system is gasping for air", 
            "Why am I still open?",
            "You forgot about me",
            "Are you hoarding tabs again?"
          ];
          document.title = messages[Math.floor(Math.random() * messages.length)];
        }
      }, 20 * 60 * 1000); // 20 minutes for inactive tabs
    } else {
      if (hijackTimeout) {
        clearTimeout(hijackTimeout);
        hijackTimeout = null;
      }
      if (originalTitle) {
        document.title = originalTitle;
        originalTitle = '';
      }
    }
  }

  // --- Touch Grass Modal ---
  let continuousScrollStartTime = 0;
  let touchGrassTriggered = false;
  let scrollResetTimeout = null;

  function resetScrollTimer() {
    continuousScrollStartTime = 0;
  }

  async function checkTouchGrass() {
    if (touchGrassTriggered) return;
    
    if (continuousScrollStartTime === 0) {
      continuousScrollStartTime = Date.now();
    } else if (Date.now() - continuousScrollStartTime > 5 * 60 * 1000) { // 5 minutes continuous scrolling
      const settings = await getSettings();
      if (settings.touchGrassEnabled && await isProPlus()) {
        triggerTouchGrassModal();
      }
    }
  }

  function triggerTouchGrassModal() {
    touchGrassTriggered = true;
    const modal = document.createElement('div');
    modal.id = 'scroll-shame-touch-grass';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.zIndex = '999999';
    modal.style.backgroundColor = 'black';
    modal.style.color = 'white';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.backgroundImage = 'url("https://images.unsplash.com/photo-1533460004989-cef01064af7e?q=80&w=1000&auto=format&fit=crop")';
    modal.style.backgroundSize = 'cover';
    modal.style.backgroundPosition = 'center';
    
    const text = document.createElement('div');
    text.style.backgroundColor = 'rgba(0,0,0,0.7)';
    text.style.padding = '2rem';
    text.style.borderRadius = '1rem';
    text.style.fontSize = '2rem';
    text.style.fontWeight = 'bold';
    text.style.textAlign = 'center';
    text.innerText = "Look at this. Remember what it feels like?\nYou have 10 seconds to contemplate your life choices.";
    
    modal.appendChild(text);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      document.body.style.overflow = '';
      touchGrassTriggered = false;
      continuousScrollStartTime = Date.now();
    }, 10000);
  }

  // --- Helpers ---
  async function getSettings() {
    return new Promise(resolve => {
      chrome.storage.local.get('settings', result => {
        resolve(result.settings || {});
      });
    });
  }

  async function isProPlus() {
    return new Promise(resolve => {
      chrome.storage.local.get('license-status', result => {
        const status = result['license-status'] || {};
        resolve(status.tier === 'pro-plus' || status.tier === 'chaos-pass');
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();