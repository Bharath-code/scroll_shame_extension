# Technical Spec: Instant Replay Mode

## Overview
Records tab open/close events and plays them back as a timelapse visualization. Users can watch their descent into chaos in 30 seconds. High viral potential for sharing.

## User Flow
1. User opens history view and selects a week
2. Clicks "Watch Replay" on their worst week
3. Sees timelapse of tab events (5 tabs → 47 tabs in 8 minutes)
4. Can control playback (pause, speed up, slow down)
5. Can share replay as video or GIF

## Technical Architecture

### Event Recording (background.js)
```typescript
interface TabEvent {
  type: 'open' | 'close' | 'activate';
  tabId: number;
  timestamp: number;
  url?: string;
  title?: string;
}

let currentDayEvents: TabEvent[] = [];
let recordingEnabled = false;

// Start recording on install
chrome.runtime.onInstalled.addListener(() => {
  recordingEnabled = true;
  startNewDayRecording();
});

// Record tab events
chrome.tabs.onCreated.addListener((tab) => {
  if (!recordingEnabled) return;
  
  currentDayEvents.push({
    type: 'open',
    tabId: tab.id,
    timestamp: Date.now(),
    url: tab.url,
    title: tab.title
  });
  
  // Save periodically (every 5 minutes)
  throttleSaveEvents();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (!recordingEnabled) return;
  
  currentDayEvents.push({
    type: 'close',
    tabId,
    timestamp: Date.now()
  });
  
  throttleSaveEvents();
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!recordingEnabled) return;
  
  currentDayEvents.push({
    type: 'activate',
    tabId: activeInfo.tabId,
    timestamp: Date.now()
  });
  
  throttleSaveEvents();
});

// Throttled save to avoid excessive storage writes
let saveTimeout: NodeJS.Timeout | null = null;
function throttleSaveEvents() {
  if (saveTimeout) return;
  
  saveTimeout = setTimeout(() => {
    saveDayEvents();
    saveTimeout = null;
  }, 5000); // 5 second debounce
}

async function saveDayEvents() {
  const today = getTodayKey();
  const data = await getDailyData(today);
  data.tabEvents = currentDayEvents;
  await saveDailyData(today, data);
}

function startNewDayRecording() {
  currentDayEvents = [];
  const today = getTodayKey();
  chrome.storage.local.get(today, (result) => {
    if (result[today]?.tabEvents) {
      currentDayEvents = result[today].tabEvents;
    }
  });
}

// Reset at midnight
chrome.alarms.create('midnight-reset', {
  when: getNextMidnight()
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'midnight-reset') {
    startNewDayRecording();
    chrome.alarms.create('midnight-reset', {
      when: getNextMidnight()
    });
  }
});

function getNextMidnight(): number {
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}
```

### Replay Engine (lib/replay.ts)
```typescript
export interface ReplaySession {
  events: TabEvent[];
  duration: number;
  startTimestamp: number;
  endTimestamp: number;
  peakTabs: number;
}

export function createReplaySession(events: TabEvent[]): ReplaySession {
  if (events.length === 0) {
    return {
      events: [],
      duration: 0,
      startTimestamp: 0,
      endTimestamp: 0,
      peakTabs: 0
    };
  }
  
  const startTimestamp = events[0].timestamp;
  const endTimestamp = events[events.length - 1].timestamp;
  const duration = endTimestamp - startTimestamp;
  
  // Calculate peak tabs (max concurrent tabs)
  let peakTabs = 0;
  let currentTabs = 0;
  
  for (const event of events) {
    if (event.type === 'open') {
      currentTabs++;
      peakTabs = Math.max(peakTabs, currentTabs);
    } else if (event.type === 'close') {
      currentTabs--;
    }
  }
  
  return {
    events,
    duration,
    startTimestamp,
    endTimestamp,
    peakTabs
  };
}

export function normalizeEventsForPlayback(
  events: TabEvent[],
  targetDuration: number = 30000 // 30 seconds
): TabEvent[] {
  if (events.length === 0) return [];
  
  const session = createReplaySession(events);
  const timeScale = targetDuration / session.duration;
  
  return events.map(event => ({
    ...event,
    timestamp: event.timestamp - session.startTimestamp,
    scaledTimestamp: (event.timestamp - session.startTimestamp) * timeScale
  }));
}
```

### Replay Player Component (components/ReplayPlayer.tsx)
```typescript
interface ReplayPlayerProps {
  events: TabEvent[];
  onClose: () => void;
}

export function ReplayPlayer({ events, onClose }: ReplayPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [visibleTabs, setVisibleTabs] = useState<Map<number, TabEvent>>(new Map());
  
  const session = createReplaySession(events);
  const normalizedEvents = normalizeEventsForPlayback(events, 30000);
  
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  
  function play() {
    setIsPlaying(true);
    startTimeRef.current = Date.now() - currentTime;
    animationRef.current = requestAnimationFrame(animate);
  }
  
  function pause() {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }
  
  function animate() {
    if (!isPlaying) return;
    
    const elapsed = (Date.now() - (startTimeRef.current || 0)) * playbackSpeed;
    setCurrentTime(elapsed);
    
    // Update visible tabs based on current time
    const tabs = new Map<number, TabEvent>();
    
    for (const event of normalizedEvents) {
      if (event.scaledTimestamp <= elapsed) {
        if (event.type === 'open' || event.type === 'activate') {
          tabs.set(event.tabId, event);
        } else if (event.type === 'close') {
          tabs.delete(event.tabId);
        }
      }
    }
    
    setVisibleTabs(tabs);
    
    if (elapsed >= 30000) {
      pause();
      setCurrentTime(30000);
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  }
  
  function seek(time: number) {
    pause();
    setCurrentTime(time);
    
    // Update visible tabs immediately
    const tabs = new Map<number, TabEvent>();
    
    for (const event of normalizedEvents) {
      if (event.scaledTimestamp <= time) {
        if (event.type === 'open' || event.type === 'activate') {
          tabs.set(event.tabId, event);
        } else if (event.type === 'close') {
          tabs.delete(event.tabId);
        }
      }
    }
    
    setVisibleTabs(tabs);
  }
  
  function formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return (
    <div class="replay-player">
      <div class="replay-header">
        <h3>Tab Spiral Replay</h3>
        <button class="btn-close" onClick={onClose}>✕</button>
      </div>
      
      <div class="replay-stats">
        <span>Peak: {session.peakTabs} tabs</span>
        <span>Duration: {formatTime(session.duration)}</span>
        <span>Events: {events.length}</span>
      </div>
      
      <div class="replay-visualization">
        <div class="tab-counter">
          <span class="counter-label">Tabs</span>
          <span class="counter-value">{visibleTabs.size}</span>
        </div>
        
        <div class="tab-stream">
          {Array.from(visibleTabs.values()).map((tab, index) => (
            <div 
              key={tab.tabId}
              class="tab-card"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <div class="tab-icon">📄</div>
              <div class="tab-info">
                <div class="tab-title">{tab.title || 'New Tab'}</div>
                <div class="tab-url">{tab.url || 'about:blank'}</div>
              </div>
            </div>
          ))}
        </div>
        
        <div class="timeline">
          <div 
            class="timeline-progress"
            style={{ width: `${(currentTime / 30000) * 100}%` }}
          />
        </div>
      </div>
      
      <div class="replay-controls">
        <button 
          class="btn-control"
          onClick={() => isPlaying ? pause() : play()}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <button class="btn-control" onClick={() => seek(0)}>
          ⏮
        </button>
        
        <span class="time-display">
          {formatTime(currentTime)} / {formatTime(30000)}
        </span>
        
        <select 
          class="speed-select"
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
        
        <button class="btn-share" onClick={exportReplay}>
          📤 Share
        </button>
      </div>
    </div>
  );
}

async function exportReplay() {
  // Export as GIF or video
  // This would require canvas recording or external library
  // For MVP: share as static image of peak moment
  console.log('Export replay');
}
```

### Week Selection UI (options/replay.tsx)
```typescript
function ReplayView() {
  const [history, setHistory] = useState<DayData[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<DayData | null>(null);
  const [showReplay, setShowReplay] = useState(false);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  async function loadHistory() {
    const allHistory = await storage.getAllHistory();
    setHistory(allHistory);
  }
  
  function handleWeekClick(week: DayData) {
    setSelectedWeek(week);
    setShowReplay(true);
  }
  
  // Sort by shame score to show worst weeks first
  const sortedHistory = [...history].sort((a, b) => 
    calculateShameScore(b) - calculateShameScore(a)
  );
  
  return (
    <div class="replay-view">
      <h2>Instant Replay</h2>
      <p>Watch your descent into chaos</p>
      
      <div class="week-list">
        {sortedHistory.map((week, index) => {
          const session = createReplaySession(week.tabEvents || []);
          const score = calculateShameScore(week);
          
          return (
            <div 
              key={week.date}
              class="week-item"
              onClick={() => handleWeekClick(week)}
            >
              <div class="week-info">
                <span class="week-date">{week.date}</span>
                <span class="week-score">Score: {score}</span>
              </div>
              <div class="week-stats">
                <span>📊 {session.peakTabs} peak tabs</span>
                <span>⏱️ {formatTime(session.duration)}</span>
                <span>🎬 {session.events.length} events</span>
              </div>
              <button class="btn-replay">▶ Watch</button>
            </div>
          );
        })}
      </div>
      
      {showReplay && selectedWeek && (
        <ReplayPlayer 
          events={selectedWeek.tabEvents || []}
          onClose={() => setShowReplay(false)}
        />
      )}
    </div>
  );
}
```

### Styling (components/ReplayPlayer.css)
```css
.replay-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #1a1a1a;
  z-index: 999999;
  display: flex;
  flex-direction: column;
}

.replay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #333;
}

.replay-header h3 {
  color: #fff;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
}

.replay-stats {
  display: flex;
  gap: 20px;
  padding: 15px 20px;
  color: #888;
  font-size: 14px;
}

.replay-visualization {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.tab-counter {
  text-align: center;
  margin-bottom: 30px;
}

.counter-label {
  color: #888;
  font-size: 14px;
  text-transform: uppercase;
}

.counter-value {
  color: #ff6b6b;
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
}

.tab-stream {
  width: 100%;
  max-width: 600px;
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tab-card {
  background: #2d2d2d;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  gap: 12px;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.tab-icon {
  font-size: 24px;
}

.tab-info {
  flex: 1;
  overflow: hidden;
}

.tab-title {
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-url {
  color: #666;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.timeline {
  width: 100%;
  max-width: 600px;
  height: 4px;
  background: #333;
  border-radius: 2px;
  margin-top: 20px;
  overflow: hidden;
}

.timeline-progress {
  height: 100%;
  background: #ff6b6b;
  transition: width 0.1s linear;
}

.replay-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  border-top: 1px solid #333;
}

.btn-control {
  background: #333;
  border: none;
  color: #fff;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
}

.btn-control:hover {
  background: #444;
}

.time-display {
  color: #fff;
  font-family: monospace;
  font-size: 14px;
  min-width: 100px;
}

.speed-select {
  background: #333;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.btn-share {
  background: #ff6b6b;
  border: none;
  color: #fff;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}

.btn-share:hover {
  background: #ff5252;
}
```

## Edge Cases
- **No events recorded:** Show "No replay data for this week"
- **Too many events (>1000):** Sample events to keep replay smooth
- **Very long duration (>4 hours):** Compress timeline for playback
- **Missing URL/title:** Show "Unknown Tab" placeholder
- **Recording disabled:** Respect user privacy setting

## Performance Considerations
- Event recording: minimal overhead (simple array push)
- Storage: ~1KB per 100 events, ~10KB per day typical
- Playback: requestAnimationFrame for smooth animation
- Tab rendering: limit visible tabs to prevent DOM bloat
- Memory: clear events after replay or keep in cache

## Privacy
- Events stored locally in chrome.storage.local
- URLs/titles recorded (user can opt out)
- User can delete replay data
- Export feature requires user consent
- No data transmitted (local only)

## Storage Quota Management
- Monitor chrome.storage.local usage
- Auto-delete events older than 1 year for free tier
- Keep all events for Pro tier
- Warn if approaching quota limit
- Compress old events if needed

## Testing
- Test recording accuracy (compare to actual tab events)
- Test playback at different speeds
- Test with 0 events (empty state)
- Test with 1000+ events (performance)
- Test seek functionality
- Test with very long sessions (4+ hours)
- Test export functionality
