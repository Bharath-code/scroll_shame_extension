# Technical Spec: Global Percentile Rankings

## Overview
Anonymous score submission to calculate percentile rankings. Shows users where they rank globally (e.g., "You're more chaotic than 94% of users"). Requires backend for aggregation.

## User Flow
1. User opts in to anonymous score submission
2. Weekly shame score submitted to backend
3. Backend calculates percentile based on all submissions
4. User sees ranking in report: "You're in the 94th percentile for chaos"
5. Can view distribution graph

## Technical Architecture

### Backend: Cloudflare Worker + D1

**Schema (D1 database):**
```sql
CREATE TABLE weekly_scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anonymous_id TEXT NOT NULL,
  week_key TEXT NOT NULL, -- e.g., "2026-W17"
  shame_score INTEGER NOT NULL,
  peak_tabs INTEGER,
  night_sessions INTEGER,
  quick_closures INTEGER,
  spiral_sessions INTEGER,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(anonymous_id, week_key)
);

CREATE INDEX idx_week ON weekly_scores(week_key);
CREATE INDEX idx_score ON weekly_scores(shame_score);
```

**Worker endpoint (submit score):**
```typescript
// POST /api/submit-score
export async function onRequestPost(context) {
  const { anonymousId, weekKey, score, stats } = await context.request.json();
  
  // Validate input
  if (!anonymousId || !weekKey || score === undefined) {
    return new Response('Missing required fields', { status: 400 });
  }
  
  // Insert or update score
  const result = await context.env.DB.prepare(`
    INSERT INTO weekly_scores (anonymous_id, week_key, shame_score, peak_tabs, night_sessions, quick_closures, spiral_sessions)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(anonymous_id, week_key) DO UPDATE SET
      shame_score = excluded.shame_score,
      peak_tabs = excluded.peak_tabs,
      night_sessions = excluded.night_sessions,
      quick_closures = excluded.quick_closures,
      spiral_sessions = excluded.spiral_sessions,
      submitted_at = CURRENT_TIMESTAMP
  `).bind(anonymousId, weekKey, score, stats.peakTabs, stats.nightSessions, stats.quickClosures, stats.spiralSessions).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

**Worker endpoint (get percentile):**
```typescript
// GET /api/percentile?weekKey=2026-W17&score=74
export async function onRequestGet(context) {
  const { weekKey, score } = context.request.query();
  
  // Get all scores for this week
  const scores = await context.env.DB.prepare(`
    SELECT shame_score FROM weekly_scores WHERE week_key = ?
  `).bind(weekKey).all();
  
  if (scores.results.length === 0) {
    return new Response(JSON.stringify({ percentile: null, total: 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Calculate percentile
  const sortedScores = scores.results.map(r => r.shame_score).sort((a, b) => a - b);
  const rank = sortedScores.filter(s => s < score).length;
  const percentile = Math.round((rank / sortedScores.length) * 100);
  
  return new Response(JSON.stringify({
    percentile,
    total: sortedScores.length,
    distribution: calculateDistribution(sortedScores)
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function calculateDistribution(scores: number[]): Array<{ range: string; count: number }> {
  const buckets = [0, 20, 40, 60, 80, 100];
  return buckets.map((min, i) => {
    const max = buckets[i + 1] || 100;
    const count = scores.filter(s => s >= min && s < max).length;
    return { range: `${min}-${max}`, count };
  });
}
```

### Client: Anonymous ID Generation (lib/anonymous-id.ts)
```typescript
// Generate persistent anonymous ID on first opt-in
export async function getOrCreateAnonymousId(): Promise<string> {
  const result = await new Promise<string>((resolve) => {
    chrome.storage.local.get('anonymous-id', (data) => {
      if (data['anonymous-id']) {
        resolve(data['anonymous-id']);
      } else {
        const id = generateAnonymousId();
        chrome.storage.local.set({ 'anonymous-id': id });
        resolve(id);
      }
    });
  });
  return result;
}

function generateAnonymousId(): string {
  // Generate random 16-char hex string
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

### Client: Score Submission (lib/rankings.ts)
```typescript
const API_BASE = 'https://api.scrollshame.com';

export async function submitWeeklyScore(
  weekKey: string,
  score: number,
  stats: DayData
): Promise<boolean> {
  const anonymousId = await getOrCreateAnonymousId();
  
  try {
    const response = await fetch(`${API_BASE}/api/submit-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anonymousId,
        weekKey,
        score,
        stats: {
          peakTabs: stats.peakTabs,
          nightSessions: stats.nightSessions,
          quickClosures: stats.quickClosures,
          spiralSessions: stats.spiralSessions
        }
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Failed to submit score:', error);
    return false;
  }
}

export async function getPercentile(
  weekKey: string,
  score: number
): Promise<{ percentile: number | null; total: number; distribution: any[] }> {
  try {
    const response = await fetch(
      `${API_BASE}/api/percentile?weekKey=${encodeURIComponent(weekKey)}&score=${score}`
    );
    return await response.json();
  } catch (error) {
    console.error('Failed to get percentile:', error);
    return { percentile: null, total: 0, distribution: [] };
  }
}
```

### Opt-In UI (options/rankings.tsx)
```typescript
function RankingsOptIn() {
  const [optedIn, setOptedIn] = useState(false);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  
  useEffect(() => {
    checkOptInStatus();
  }, []);
  
  async function checkOptInStatus() {
    const id = await getOrCreateAnonymousId();
    setAnonymousId(id);
    
    const settings = await storage.getSettings();
    setOptedIn(settings.rankingsOptIn || false);
  }
  
  async function handleOptIn(consent: boolean) {
    await storage.setSettings({
      ...(await storage.getSettings()),
      rankingsOptIn: consent
    });
    setOptedIn(consent);
  }
  
  return (
    <div class="rankings-opt-in">
      <h3>Global Rankings</h3>
      
      {optedIn ? (
        <div class="opted-in">
          <p>✓ You're opted in to anonymous rankings</p>
          <p class="anonymous-id">Your ID: {anonymousId?.slice(0, 8)}...</p>
          <button onClick={() => handleOptIn(false)}>Opt out</button>
        </div>
      ) : (
        <div class="opt-in-prompt">
          <p>See how you compare to other users worldwide. Completely anonymous.</p>
          <ul>
            <li>Only your shame score is submitted</li>
            <li>No URLs, no domains, no identifying data</li>
            <li>Random ID generated for you</li>
            <li>Opt out anytime</li>
          </ul>
          <button class="btn-primary" onClick={() => handleOptIn(true)}>
            Enable Rankings
          </button>
        </div>
      )}
    </div>
  );
}
```

### Report Integration (report/main.tsx)
```typescript
// In weekly report generation
async function loadWeeklyStats() {
  // ... existing code ...
  
  const aggregated = aggregateStats(allData);
  const shameScore = calculateShameScore(aggregated);
  
  // Get percentile if opted in
  const settings = await storage.getSettings();
  if (settings.rankingsOptIn) {
    const weekKey = getWeekKey(new Date());
    const { percentile, total, distribution } = await getPercentile(weekKey, shameScore);
    
    setPercentileData({ percentile, total, distribution });
    
    // Submit score automatically
    await submitWeeklyScore(weekKey, shameScore, aggregated);
  }
}

// Display in report
{percentileData && percentileData.percentile !== null && (
  <div class="percentile-display">
    <p>You're more chaotic than <strong>{percentileData.percentile}%</strong> of users</p>
    <p class="total-users">Based on {percentileData.total} submissions this week</p>
    
    <div class="distribution-graph">
      {percentileData.distribution.map(bucket => (
        <div class="bucket-bar">
          <span class="bucket-label">{bucket.range}</span>
          <div 
            class="bucket-fill"
            style={{ width: `${(bucket.count / percentileData.total) * 100}%` }}
          />
          <span class="bucket-count">{bucket.count}</span>
        </div>
      ))}
    </div>
  </div>
)}
```

### Week Key Generation (lib/week-key.ts)
```typescript
export function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
```

## Edge Cases
- **No submissions yet:** Show "Be the first to submit this week"
- **Few submissions (<10):** Show "Not enough data for accurate ranking"
- **Network failure:** Gracefully degrade, don't block report
- **Opt-out after submission:** Delete scores from backend (GDPR compliance)
- **Same score as many others:** Handle ties in percentile calculation

## Privacy Considerations
- Anonymous ID is random and persistent
- No URLs, domains, or identifying data submitted
- Only shame score and basic stats
- User can opt out anytime
- GDPR: Provide data deletion endpoint
- Weekly aggregation prevents individual identification

## Performance
- Submit score: Single INSERT query, <50ms
- Get percentile: Single SELECT + sort, <100ms for 10k records
- Cache percentile results for 5 minutes
- Batch submissions if multiple weeks need updating

## Security
- Rate limit submissions (1 per week per user)
- Validate score range (0-100)
- Sanitize all inputs
- Use HTTPS only
- No authentication needed (anonymous)

## Testing
- Test submission with valid data
- Test submission with invalid data
- Test percentile calculation with various distributions
- Test opt-in/opt-out flow
- Test network failure handling
- Test with 0, 10, 100, 1000 submissions
