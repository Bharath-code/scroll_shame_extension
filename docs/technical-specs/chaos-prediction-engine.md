# Technical Spec: Chaos Prediction Engine

## Overview
Real-time trajectory prediction that calculates current pace and predicts final stats for the day/week. Shows live counters and "on pace to beat record" notifications.

## User Flow
1. User opens extension popup during the day
2. Sees live counter: "On pace for 47 tabs today"
3. If approaching record: "3 tabs away from your all-time record"
4. Weekly prediction: "On pace for shame score of 85"
5. Notification when record broken

## Technical Architecture

### Real-Time Tracking (background.js)
```javascript
// Track current day's progress
let currentDayStats = {
  tabsOpened: 0,
  tabsClosed: 0,
  spiralCount: 0,
  nightSessions: 0,
  startTime: Date.now()
};

// Update on tab events
chrome.tabs.onCreated.addListener(() => {
  currentDayStats.tabsOpened++;
  updatePrediction();
});

chrome.tabs.onRemoved.addListener(() => {
  currentDayStats.tabsClosed++;
  updatePrediction();
});

// Calculate prediction based on time elapsed
function calculatePrediction() {
  const now = Date.now();
  const elapsed = now - currentDayStats.startTime;
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date();
  dayEnd.setHours(23, 59, 59, 999);
  const totalDayMs = dayEnd.getTime() - dayStart.getTime();
  
  const ratio = elapsed / totalDayMs;
  
  return {
    tabsOpened: Math.round(currentDayStats.tabsOpened / ratio),
    tabsClosed: Math.round(currentDayStats.tabsClosed / ratio),
    spiralCount: Math.round(currentDayStats.spiralCount / ratio),
    nightSessions: currentDayStats.nightSessions // Can't predict
  };
}
```

### Record Tracking (lib/records.ts)
```typescript
export interface PersonalRecords {
  peakTabs: { value: number; date: string };
  quickClosures: { value: number; date: string };
  spiralSessions: { value: number; date: string };
  nightSessions: { value: number; date: string };
  shameScore: { value: number; date: string };
}

export async function getPersonalRecords(): Promise<PersonalRecords> {
  const history = await storage.getAllHistory();
  const records: PersonalRecords = {
    peakTabs: { value: 0, date: '' },
    quickClosures: { value: 0, date: '' },
    spiralSessions: { value: 0, date: '' },
    nightSessions: { value: 0, date: '' },
    shameScore: { value: 0, date: '' }
  };
  
  for (const day of history) {
    if (day.peakTabs > records.peakTabs.value) {
      records.peakTabs = { value: day.peakTabs, date: day.date };
    }
    if (day.quickClosures > records.quickClosures.value) {
      records.quickClosures = { value: day.quickClosures, date: day.date };
    }
    if (day.spiralSessions > records.spiralSessions.value) {
      records.spiralSessions = { value: day.spiralSessions, date: day.date };
    }
    if (day.nightSessions > records.nightSessions.value) {
      records.nightSessions = { value: day.nightSessions, date: day.date };
    }
    
    const score = calculateShameScore(day);
    if (score > records.shameScore.value) {
      records.shameScore = { value: score, date: day.date };
    }
  }
  
  return records;
}

export function getDistanceToRecord(
  current: number,
  record: number
): number {
  return Math.max(0, record - current);
}
```

### Prediction Display (popup.tsx)
```typescript
function PredictionDisplay() {
  const [prediction, setPrediction] = useState<any>(null);
  const [records, setRecords] = useState<PersonalRecords | null>(null);
  const [recordAlert, setRecordAlert] = useState<string | null>(null);
  
  useEffect(() => {
    loadPrediction();
    loadRecords();
    
    // Update every 30 seconds
    const interval = setInterval(loadPrediction, 30000);
    return () => clearInterval(interval);
  }, []);
  
  async function loadPrediction() {
    const pred = await getTodayPrediction();
    setPrediction(pred);
    
    const recs = await getPersonalRecords();
    setRecords(recs);
    
    // Check for record proximity
    const tabsToRecord = getDistanceToRecord(
      currentDayStats.tabsOpened,
      recs.peakTabs.value
    );
    
    if (tabsToRecord <= 5 && tabsToRecord > 0) {
      setRecordAlert(`${tabsToRecord} tabs away from your all-time record!`);
    }
  }
  
  return (
    <div class="prediction-display">
      <h3>Today's Trajectory</h3>
      
      <div class="prediction-item">
        <span>On pace for</span>
        <span class="prediction-value">{prediction?.tabsOpened || 0} tabs</span>
      </div>
      
      <div class="prediction-item">
        <span>Shame score projection</span>
        <span class="prediction-value">{prediction?.shameScore || 0}</span>
      </div>
      
      {recordAlert && (
        <div class="record-alert">
          🏆 {recordAlert}
        </div>
      )}
      
      <div class="records-summary">
        <h4>Your Records</h4>
        <div class="record-item">
          <span>Peak tabs</span>
          <span>{records?.peakTabs.value}</span>
        </div>
        <div class="record-item">
          <span>Worst shame score</span>
          <span>{records?.shameScore.value}</span>
        </div>
      </div>
    </div>
  );
}
```

### Record Break Notification (background.js)
```javascript
// Check for record breaks on each stat update
async function checkRecordBreak(statName: string, value: number) {
  const records = await getPersonalRecords();
  const record = records[statName];
  
  if (value > record.value) {
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.svg',
      title: '🏆 New Personal Record!',
      message: `You just broke your ${statName} record with ${value}!`
    });
    
    // Log the achievement
    const today = getTodayKey();
    const data = await getDailyData(today);
    data.recordsBroken = (data.recordsBroken || []);
    data.recordsBroken.push({
      stat: statName,
      value,
      timestamp: Date.now()
    });
    await saveDailyData(today, data);
  }
}
```

### Weekly Prediction (lib/weekly-prediction.ts)
```typescript
export function predictWeeklyScore(
  currentWeekData: DayData,
  daysElapsed: number
): number {
  const projected = { ...currentWeekData };
  
  // Scale current stats to 7 days
  const ratio = 7 / daysElapsed;
  
  projected.peakTabs = Math.round((currentWeekData.peakTabs || 0) * ratio);
  projected.quickClosures = Math.round((currentWeekData.quickClosures || 0) * ratio);
  projected.spiralSessions = Math.round((currentWeekData.spiralSessions || 0) * ratio);
  projected.nightSessions = Math.round((currentWeekData.nightSessions || 0) * ratio);
  projected.longSessions = Math.round((currentWeekData.longSessions || 0) * ratio);
  
  return calculateShameScore(projected);
}
```

## Edge Cases
- **Day just started:** Show "Not enough data yet" for predictions
- **Day almost over:** Predictions become more accurate
- **No previous records:** Show "First time tracking this stat"
- **Tie with record:** Show "Tied with your record"
- **Multiple records broken:** Show notification for each

## Performance Considerations
- Prediction calculation is lightweight (simple math)
- Record retrieval requires scanning all history - cache results
- Update frequency: every 30 seconds is sufficient
- Notifications use Chrome API (native, low overhead)

## Privacy
- All calculations done locally
- No data transmitted
- Records stored in chrome.storage.local
- User can clear records in settings

## Testing
- Test prediction accuracy at different times of day
- Test record break detection
- Test notification display
- Test with no history (first-time user)
- Test with tied records
- Test weekly prediction accuracy mid-week
