# Technical Spec: Real-Time Tab Intervention

## Overview
Detects rapid tab opening spirals and displays in-page modal with roast to interrupt chaotic behavior.

## User Flow
1. User opens tabs rapidly (>10 tabs in 2 minutes)
2. Content script detects spiral pattern
3. In-page modal appears with roast
4. User dismisses with "I know, I know" button
5. Event logged for weekly report

## Technical Architecture

### Detection Logic (content.js)
```javascript
// Track tab open events with timestamps
let tabOpenEvents = [];
const SPIRAL_THRESHOLD = 10; // tabs
const SPIRAL_WINDOW = 120000; // 2 minutes in ms

// On tab creation (detected via chrome.tabs API in background)
chrome.tabs.onCreated.addListener((tab) => {
  const timestamp = Date.now();
  tabOpenEvents.push({ timestamp, tabId: tab.id });
  
  // Prune old events
  tabOpenEvents = tabOpenEvents.filter(e => timestamp - e.timestamp < SPIRAL_WINDOW);
  
  // Check threshold
  if (tabOpenEvents.length >= SPIRAL_THRESHOLD) {
    triggerIntervention();
  }
});
```

### Modal Injection (content.js)
```javascript
function triggerIntervention() {
  // Check if modal already visible
  if (document.querySelector('.scrollshame-intervention')) return;
  
  // Get random roast from current voice
  const roast = getRandomRoast(['intervention']);
  
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'scrollshame-intervention';
  modal.innerHTML = `
    <div class="intervention-modal">
      <div class="intervention-content">
        <p class="intervention-roast">${roast}</p>
        <button class="intervention-dismiss">I know, I know</button>
      </div>
    </div>
  `;
  
  // Inject with shadow DOM to avoid conflicts
  document.body.appendChild(modal);
  
  // Handle dismiss
  modal.querySelector('.intervention-dismiss').addEventListener('click', () => {
    modal.remove();
    logIntervention();
  });
  
  // Auto-dismiss after 10 seconds
  setTimeout(() => modal.remove(), 10000);
}
```

### Styling (injected CSS)
```css
.scrollshame-intervention {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.intervention-modal {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 24px;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  border: 1px solid #333;
}

.intervention-roast {
  color: #fff;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 16px;
}

.intervention-dismiss {
  background: #ff6b6b;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}

.intervention-dismiss:hover {
  background: #ff5252;
}
```

### Roast Templates (roast-pools.ts)
```typescript
intervention: [
  "You've opened {count} tabs in 2 minutes. This isn't research, it's panic. Take a breath.",
  "Stop. {count} tabs in rapid succession. You're spiraling. Close a few, then come back.",
  "Your mouse is moving faster than your brain. {count} tabs in 2 minutes. Slow down.",
  "This is what anxiety looks like in tab form. {count} tabs. Breathe.",
  "You're not being productive. You're being chaotic. {count} tabs in 2 minutes. Stop."
]
```

### Data Storage (background.js)
```javascript
async function logIntervention() {
  const today = getTodayKey();
  const data = await getDailyData(today);
  data.interventions = (data.interventions || 0) + 1;
  await saveDailyData(today, data);
}
```

### Settings (options.html)
```typescript
// Add to ExtensionSettings interface
interventionEnabled: boolean;
interventionThreshold: number; // default 10
interventionCooldown: number; // default 5 minutes between interventions
```

## Edge Cases
- **Modal already visible:** Check before injecting
- **User in meeting:** Add "meeting mode" setting to disable
- **Legitimate research:** Add "research mode" temporary disable (30 min)
- **Multiple windows:** Track per-window or global? Global for now
- **Dismiss frequency:** Add cooldown to prevent spam

## Performance Considerations
- Tab open events are low-frequency, minimal performance impact
- Modal injection is one-time per intervention
- Shadow DOM prevents style conflicts
- Cooldown prevents excessive DOM manipulation

## Privacy
- All detection happens locally
- No data transmitted
- User can disable in settings
- Intervention count stored locally only

## Testing
- Test rapid tab opening (manual + automated)
- Test modal dismissal
- Test cooldown behavior
- Test with different page types (SPA, static, etc.)
- Test with existing modals on page
