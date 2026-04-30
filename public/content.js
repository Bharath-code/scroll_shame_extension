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

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();