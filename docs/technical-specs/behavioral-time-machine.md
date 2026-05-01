# Technical Spec: Behavioral Time Machine

## Overview
Provides historical context by showing worst/best moments, "on this day" comparisons, and trend graphs. Requires unlimited history (no 12-week pruning).

## User Flow
1. User opens history view in options or report
2. Sees timeline of all recorded weeks
3. Can click on specific weeks to see detailed stats
4. "On this day" shows comparison to same week in previous years
5. Trend graphs show improvement/degradation over time

## Technical Architecture

### Storage Changes (background.js)
```javascript
// Remove 12-week pruning
function cleanupOldData() {
  // NO-OP for Pro users
  // For free users, keep 12 weeks
  const isPro = await checkProStatus();
  if (isPro) return;
  
  // Original pruning logic for free tier
  const twelveWeeksAgo = Date.now() - (84 * 24 * 60 * 60 * 1000);
  // ... existing pruning logic
}
```

### Data Retrieval (storage.ts)
```typescript
async function getAllHistory(): Promise<DayData[]> {
  const keys = await getAllDateKeys();
  return Promise.all(keys.map(key => this.getDaily(key)));
}

async function getAllDateKeys(): Promise<string[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (items) => {
      const keys = Object.keys(items)
        .filter(key => key.startsWith('day-'))
        .sort();
      resolve(keys);
    });
  });
}
```

### Historical Statistics (lib/history.ts)
```typescript
export interface HistoricalStats {
  worstWeek: { date: string; score: number; stats: DayData };
  bestWeek: { date: string; score: number; stats: DayData };
  averageScore: number;
  totalWeeks: number;
  trend: 'improving' | 'degrading' | 'stable';
}

export function calculateHistoricalStats(data: DayData[]): HistoricalStats {
  const weeks = data.map((day, index) => ({
    date: day.date,
    score: calculateShameScore(day),
    stats: day
  }));
  
  const sortedByScore = [...weeks].sort((a, b) => b.score - a.score);
  
  return {
    worstWeek: sortedByScore[0],
    bestWeek: sortedByScore[sortedByScore.length - 1],
    averageScore: weeks.reduce((sum, w) => sum + w.score, 0) / weeks.length,
    totalWeeks: weeks.length,
    trend: calculateTrend(weeks)
  };
}

function calculateTrend(weeks: Array<{ score: number }>): 'improving' | 'degrading' | 'stable' {
  if (weeks.length < 4) return 'stable';
  
  const recent = weeks.slice(-4).map(w => w.score);
  const earlier = weeks.slice(-8, -4).map(w => w.score);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  
  if (recentAvg < earlierAvg - 10) return 'improving';
  if (recentAvg > earlierAvg + 10) return 'degrading';
  return 'stable';
}
```

### "On This Day" Feature (lib/on-this-day.ts)
```typescript
export function getOnThisDayComparison(
  history: DayData[],
  targetDate: Date
): Array<{ year: number; score: number; stats: DayData }> {
  const month = targetDate.getMonth();
  const day = targetDate.getDate();
  
  return history
    .filter(d => {
      const date = parseKey(d.date);
      return date && date.getMonth() === month && date.getDate() === day;
    })
    .map(d => ({
      year: parseKey(d.date).getFullYear(),
      score: calculateShameScore(d),
      stats: d
    }));
}
```

### Trend Graph Component (components/TrendGraph.tsx)
```typescript
interface TrendGraphProps {
  history: DayData[];
}

export function TrendGraph({ history }: TrendGraphProps) {
  const data = history.map((day, index) => ({
    week: index + 1,
    score: calculateShameScore(day),
    date: day.date
  }));
  
  return (
    <div class="trend-graph">
      <svg viewBox="0 0 800 200">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(score => (
          <line
            x1="0"
            y1={200 - score * 2}
            x2="800"
            y2={200 - score * 2}
            stroke="#333"
            stroke-dasharray="4"
          />
        ))}
        
        {/* Trend line */}
        <polyline
          points={data.map((d, i) => 
            `${i * (800 / data.length)},${200 - d.score * 2}`
          ).join(' ')}
          fill="none"
          stroke="#ff6b6b"
          stroke-width="2"
        />
        
        {/* Data points */}
        {data.map((d, i) => (
          <circle
            cx={i * (800 / data.length)}
            cy={200 - d.score * 2}
            r="4"
            fill="#ff6b6b"
          />
        ))}
      </svg>
    </div>
  );
}
```

### History View UI (options/history.tsx)
```typescript
function HistoryView() {
  const [history, setHistory] = useState<DayData[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<DayData | null>(null);
  const [onThisDay, setOnThisDay] = useState<Array<any>>([]);
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  async function loadHistory() {
    const allData = await storage.getAllHistory();
    setHistory(allData);
    
    const today = new Date();
    setOnThisDay(getOnThisDayComparison(allData, today));
  }
  
  const stats = calculateHistoricalStats(history);
  
  return (
    <div class="history-view">
      <h2>Your Behavioral Timeline</h2>
      
      <div class="stats-summary">
        <div class="stat-card">
          <h3>Worst Week</h3>
          <p>{stats.worstWeek.date}</p>
          <p class="score">{stats.worstWeek.score}</p>
        </div>
        <div class="stat-card">
          <h3>Best Week</h3>
          <p>{stats.bestWeek.date}</p>
          <p class="score">{stats.bestWeek.score}</p>
        </div>
        <div class="stat-card">
          <h3>Total Weeks</h3>
          <p class="score">{stats.totalWeeks}</p>
        </div>
        <div class="stat-card">
          <h3>Trend</h3>
          <p class="trend-{stats.trend}">{stats.trend}</p>
        </div>
      </div>
      
      <TrendGraph history={history} />
      
      <div class="on-this-day">
        <h3>On This Day</h3>
        {onThisDay.map(entry => (
          <div class="year-entry">
            <span>{entry.year}:</span>
            <span>Score {entry.score}</span>
          </div>
        ))}
      </div>
      
      <div class="week-list">
        {history.map((week, index) => (
          <div 
            class="week-item"
            onClick={() => setSelectedWeek(week)}
          >
            <span>{week.date}</span>
            <span>{calculateShameScore(week)}</span>
          </div>
        ))}
      </div>
      
      {selectedWeek && (
        <WeekDetailModal week={selectedWeek} onClose={() => setSelectedWeek(null)} />
      )}
    </div>
  );
}
```

## Edge Cases
- **No history yet:** Show empty state with "Start tracking to see your timeline"
- **Single week:** Show basic stats, no trend graph
- **Data corruption:** Filter out invalid entries
- **Storage quota:** Monitor chrome.storage.local usage, warn if approaching limit

## Performance Considerations
- Loading all history could be slow for long-term users
- Implement pagination or lazy loading for 100+ weeks
- Cache historical stats calculation
- Use IndexedDB if chrome.storage.local quota exceeded

## Privacy
- All data stored locally
- No data transmitted
- User can delete history manually
- Export option for data portability

## Testing
- Test with 0 weeks (empty state)
- Test with 1 week (basic display)
- Test with 52 weeks (full year)
- Test with 100+ weeks (pagination)
- Test "on this day" with leap years
- Test trend calculation with various patterns
