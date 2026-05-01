# Technical Spec: Pattern Analysis

## Overview
Analyzes user behavior patterns to identify triggers, time-of-day trends, and topic clusters. Provides insights like "You spiral most on Tuesdays between 2-4am" and "Your chaos triggers: Monday meetings, Wednesday deploy days."

## User Flow
1. User opens insights view in options
2. Sees time-of-day heatmap showing when they're most chaotic
3. Sees day-of-week breakdown (e.g., "Tuesdays are your worst day")
4. Sees trigger detection (e.g., "After meetings, you open 15 tabs")
5. Sees topic clustering (work vs distraction patterns)

## Technical Architecture

### Time-of-Day Heatmap (lib/time-analysis.ts)
```typescript
export interface TimeBucket {
  hour: number;
  tabCount: number;
  spiralCount: number;
  nightSessions: number;
}

export function analyzeTimePatterns(history: DayData[]): TimeBucket[] {
  const buckets: TimeBucket[] = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    tabCount: 0,
    spiralCount: 0,
    nightSessions: 0
  }));
  
  // For each day, distribute stats across hours
  // This is an approximation - we don't have hour-level data in current schema
  // Future: store hourly breakdowns
  
  for (const day of history) {
    // Night sessions (11pm-4am) contribute to those hours
    if (day.nightSessions) {
      for (let h = 23; h < 24; h++) buckets[h].nightSessions += day.nightSessions / 5;
      for (let h = 0; h < 4; h++) buckets[h].nightSessions += day.nightSessions / 5;
    }
    
    // Distribute peak tabs across typical work hours (9am-6pm)
    if (day.peakTabs) {
      for (let h = 9; h < 18; h++) {
        buckets[h].tabCount += day.peakTabs / 9;
      }
    }
    
    // Spiral sessions distributed across evening (6pm-11pm)
    if (day.spiralSessions) {
      for (let h = 18; h < 23; h++) {
        buckets[h].spiralCount += day.spiralSessions / 5;
      }
    }
  }
  
  return buckets;
}

export function getPeakChaosHours(buckets: TimeBucket[]): number[] {
  const avgChaos = buckets.map(b => b.tabCount + b.spiralCount);
  const threshold = Math.max(...avgChaos) * 0.7;
  
  return buckets
    .filter(b => (b.tabCount + b.spiralCount) >= threshold)
    .map(b => b.hour);
}
```

### Day-of-Week Analysis (lib/day-analysis.ts)
```typescript
export interface DayStats {
  day: number; // 0 = Sunday, 6 = Saturday
  avgShameScore: number;
  avgPeakTabs: number;
  avgNightSessions: number;
  totalWeeks: number;
}

export function analyzeDayPatterns(history: DayData[]): DayStats[] {
  const dayMap = new Map<number, DayData[]>();
  
  // Group by day of week
  for (const day of history) {
    const date = parseKey(day.date);
    if (!date) continue;
    
    const dayOfWeek = date.getDay();
    if (!dayMap.has(dayOfWeek)) {
      dayMap.set(dayOfWeek, []);
    }
    dayMap.get(dayOfWeek)!.push(day);
  }
  
  // Calculate averages
  return Array.from(dayMap.entries()).map(([day, days]) => ({
    day,
    avgShameScore: days.reduce((sum, d) => sum + calculateShameScore(d), 0) / days.length,
    avgPeakTabs: days.reduce((sum, d) => sum + (d.peakTabs || 0), 0) / days.length,
    avgNightSessions: days.reduce((sum, d) => sum + (d.nightSessions || 0), 0) / days.length,
    totalWeeks: days.length
  }));
}

export function getWorstDay(stats: DayStats[]): { day: string; reason: string } {
  const worst = stats.reduce((max, s) => 
    s.avgShameScore > max.avgShameScore ? s : max
  );
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const reasons = [
    `Your shame score is ${Math.round(worst.avgShameScore)} on ${dayNames[worst.day]}`,
    `You average ${Math.round(worst.avgPeakTabs)} tabs on ${dayNames[worst.day]}`,
    `${Math.round(worst.avgNightSessions)} night sessions on ${dayNames[worst.day]}`
  ];
  
  return {
    day: dayNames[worst.day],
    reason: reasons.join('. ')
  };
}
```

### Trigger Detection (lib/triggers.ts)
```typescript
export interface Trigger {
  type: 'meeting' | 'deploy' | 'deadline' | 'evening' | 'weekend';
  confidence: number;
  description: string;
}

export function detectTriggers(history: DayData[]): Trigger[] {
  const triggers: Trigger[] = [];
  
  // Check for Monday meeting pattern (high tabs on Mondays)
  const mondayStats = history.filter(d => {
    const date = parseKey(d.date);
    return date && date.getDay() === 1;
  });
  
  if (mondayStats.length >= 4) {
    const avgMondayTabs = mondayStats.reduce((sum, d) => sum + (d.peakTabs || 0), 0) / mondayStats.length;
    const overallAvg = history.reduce((sum, d) => sum + (d.peakTabs || 0), 0) / history.length;
    
    if (avgMondayTabs > overallAvg * 1.3) {
      triggers.push({
        type: 'meeting',
        confidence: 0.8,
        description: 'Monday meetings trigger tab spirals'
      });
    }
  }
  
  // Check for Wednesday deploy pattern (high spirals mid-week)
  const wednesdayStats = history.filter(d => {
    const date = parseKey(d.date);
    return date && date.getDay() === 3;
  });
  
  if (wednesdayStats.length >= 4) {
    const avgWednesdaySpirals = wednesdayStats.reduce((sum, d) => sum + (d.spiralSessions || 0), 0) / wednesdayStats.length;
    const overallAvg = history.reduce((sum, d) => sum + (d.spiralSessions || 0), 0) / history.length;
    
    if (avgWednesdaySpirals > overallAvg * 1.5) {
      triggers.push({
        type: 'deploy',
        confidence: 0.7,
        description: 'Wednesday deploy days increase scroll spirals'
      });
    }
  }
  
  // Check for evening pattern (night sessions)
  const nightSessionRate = history.reduce((sum, d) => sum + (d.nightSessions || 0), 0) / history.length;
  if (nightSessionRate > 2) {
    triggers.push({
      type: 'evening',
      confidence: 0.9,
      description: 'Late-night sessions are a recurring pattern'
    });
  }
  
  // Check for weekend pattern (low activity vs high)
  const weekendStats = history.filter(d => {
    const date = parseKey(d.date);
    return date && (date.getDay() === 0 || date.getDay() === 6);
  });
  
  if (weekendStats.length >= 4) {
    const avgWeekendScore = weekendStats.reduce((sum, d) => sum + calculateShameScore(d), 0) / weekendStats.length;
    const overallAvg = history.reduce((sum, d) => sum + calculateShameScore(d), 0) / history.length;
    
    if (avgWeekendScore < overallAvg * 0.7) {
      triggers.push({
        type: 'weekend',
        confidence: 0.6,
        description: 'Weekends are your recovery time'
      });
    } else if (avgWeekendScore > overallAvg * 1.2) {
      triggers.push({
        type: 'weekend',
        confidence: 0.6,
        description: 'Weekends are actually your worst time'
      });
    }
  }
  
  return triggers.sort((a, b) => b.confidence - a.confidence);
}
```

### Topic Clustering (lib/topics.ts)
```typescript
// Note: This requires URL/domain tracking which isn't in current schema
// Future enhancement: track domains for each tab

export interface TopicCluster {
  category: 'work' | 'social' | 'entertainment' | 'news' | 'shopping' | 'other';
  percentage: number;
  exampleDomains: string[];
}

export function categorizeDomain(domain: string): string {
  const workDomains = ['github.com', 'gitlab.com', 'stackoverflow.com', 'docs.google.com', 'notion.so'];
  const socialDomains = ['twitter.com', 'linkedin.com', 'reddit.com', 'facebook.com'];
  const entertainmentDomains = ['youtube.com', 'netflix.com', 'twitch.tv', 'spotify.com'];
  const newsDomains = ['news.ycombinator.com', 'theverge.com', 'techcrunch.com', 'bbc.com'];
  const shoppingDomains = ['amazon.com', 'ebay.com', 'etsy.com'];
  
  if (workDomains.some(d => domain.includes(d))) return 'work';
  if (socialDomains.some(d => domain.includes(d))) return 'social';
  if (entertainmentDomains.some(d => domain.includes(d))) return 'entertainment';
  if (newsDomains.some(d => domain.includes(d))) return 'news';
  if (shoppingDomains.some(d => domain.includes(d))) return 'shopping';
  
  return 'other';
}

// This would be called when we have domain tracking
export function analyzeTopicClusters(domains: string[]): TopicCluster[] {
  const categories = domains.map(d => categorizeDomain(d));
  const total = categories.length;
  
  const counts = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts).map(([category, count]) => ({
    category: category as any,
    percentage: (count / total) * 100,
    exampleDomains: [...new Set(domains.filter(d => categorizeDomain(d) === category))].slice(0, 3)
  })).sort((a, b) => b.percentage - a.percentage);
}
```

### Insights UI (options/insights.tsx)
```typescript
function InsightsView() {
  const [history, setHistory] = useState<DayData[]>([]);
  const [timeBuckets, setTimeBuckets] = useState<TimeBucket[]>([]);
  const [dayStats, setDayStats] = useState<DayStats[]>([]);
  const [triggers, setTriggers] = useState<Trigger[]>([]);
  
  useEffect(() => {
    loadInsights();
  }, []);
  
  async function loadInsights() {
    const allHistory = await storage.getAllHistory();
    setHistory(allHistory);
    
    setTimeBuckets(analyzeTimePatterns(allHistory));
    setDayStats(analyzeDayPatterns(allHistory));
    setTriggers(detectTriggers(allHistory));
  }
  
  const worstDay = getWorstDay(dayStats);
  const peakHours = getPeakChaosHours(timeBuckets);
  
  return (
    <div class="insights-view">
      <h2>Behavioral Insights</h2>
      
      <div class="insight-card">
        <h3>📅 Your Worst Day</h3>
        <p class="highlight">{worstDay.day}</p>
        <p>{worstDay.reason}</p>
      </div>
      
      <div class="insight-card">
        <h3>⏰ Peak Chaos Hours</h3>
        <p class="highlight">
          {peakHours.map(h => `${h}:00`).join(' - ')}
        </p>
        <p>You're most chaotic during these hours</p>
      </div>
      
      <div class="insight-card">
        <h3>🎯 Your Triggers</h3>
        {triggers.length === 0 ? (
          <p>No clear patterns detected yet</p>
        ) : (
          <ul>
            {triggers.map(trigger => (
              <li key={trigger.type}>
                <strong>{trigger.description}</strong>
                <span class="confidence">{Math.round(trigger.confidence * 100)}% confidence</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div class="insight-card">
        <h3>🌡️ Time-of-Day Heatmap</h3>
        <div class="heatmap">
          {timeBuckets.map(bucket => (
            <div
              class="heatmap-cell"
              style={{
                backgroundColor: `rgba(255, 107, 107, ${(bucket.tabCount + bucket.spiralCount) / 50})`
              }}
              title={`${bucket.hour}:00 - ${bucket.tabCount} tabs, ${bucket.spiralCount} spirals`}
            >
              {bucket.hour}
            </div>
          ))}
        </div>
      </div>
      
      <div class="insight-card">
        <h3>📊 Day-by-Day Breakdown</h3>
        <div class="day-chart">
          {dayStats.map(stat => (
            <div class="day-bar">
              <span class="day-label">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][stat.day]}</span>
              <div 
                class="bar-fill"
                style={{ height: `${stat.avgShameScore}%` }}
              />
              <span class="day-score">{Math.round(stat.avgShameScore)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Edge Cases
- **Insufficient data:** Show "Need at least 4 weeks of data for insights"
- **No clear patterns:** Show "No strong patterns detected yet"
- **Conflicting patterns:** Show multiple possibilities with confidence scores
- **Seasonal variations:** Account for holiday weeks, etc.

## Performance Considerations
- Pattern analysis requires scanning all history
- Cache results for 1 hour
- For 100+ weeks, consider sampling or aggregation
- Heatmap rendering is lightweight (24 cells)

## Privacy
- All analysis done locally
- No data transmitted
- User can delete history
- Topic clustering requires domain tracking (future feature)

## Testing
- Test with 0 weeks (empty state)
- Test with 4 weeks (minimum for patterns)
- Test with 52 weeks (full year)
- Test with various patterns (consistent, random, seasonal)
- Test trigger detection accuracy
