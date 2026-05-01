# Technical Spec: Shame Streak System

## Overview
Gamification feature that tracks consecutive weekly reports and awards milestone badges. Creates retention hook through "don't break the streak" psychology.

## User Flow
1. User submits first weekly report → streak = 1
2. User submits second week → streak = 2, flame animation
3. At 4 weeks → "1 month" badge
4. At 12 weeks → "3 months" badge
5. At 52 weeks → "1 year" badge
6. Miss a week → streak resets to 0
7. See streak in popup, report, and options

## Technical Architecture

### Streak Tracking (lib/streak.ts)
```typescript
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReportDate: string;
  milestones: Milestone[];
  missedWeeks: string[];
}

export interface Milestone {
  weeks: number;
  name: string;
  achieved: boolean;
  achievedDate?: string;
}

const MILESTONES: Milestone[] = [
  { weeks: 4, name: '1 Month', achieved: false },
  { weeks: 8, name: '2 Months', achieved: false },
  { weeks: 12, name: '3 Months', achieved: false },
  { weeks: 26, name: '6 Months', achieved: false },
  { weeks: 52, name: '1 Year', achieved: false },
  { weeks: 104, name: '2 Years', achieved: false }
];

export async function getStreakData(): Promise<StreakData> {
  const result = await new Promise<StreakData>((resolve) => {
    chrome.storage.local.get('streak-data', (data) => {
      resolve(data['streak-data'] || {
        currentStreak: 0,
        longestStreak: 0,
        lastReportDate: '',
        milestones: MILESTONES.map(m => ({ ...m })),
        missedWeeks: []
      });
    });
  });
  return result;
}

export async function updateStreak(weekKey: string): Promise<StreakData> {
  const streak = await getStreakData();
  const lastWeek = getPreviousWeekKey(weekKey);
  
  // Check if streak should continue
  if (streak.lastReportDate === lastWeek) {
    // Consecutive week
    streak.currentStreak++;
  } else if (streak.lastReportDate === weekKey) {
    // Same week already reported, no change
    return streak;
  } else {
    // Gap detected, reset streak
    if (streak.currentStreak > 0) {
      streak.missedWeeks.push(streak.lastReportDate);
    }
    streak.currentStreak = 1;
  }
  
  // Update longest streak
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak;
  }
  
  // Check milestones
  for (const milestone of streak.milestones) {
    if (!milestone.achieved && streak.currentStreak >= milestone.weeks) {
      milestone.achieved = true;
      milestone.achievedDate = weekKey;
      showMilestoneNotification(milestone);
    }
  }
  
  streak.lastReportDate = weekKey;
  
  await new Promise<void>((resolve) => {
    chrome.storage.local.set({ 'streak-data': streak }, () => resolve());
  });
  
  return streak;
}

function getPreviousWeekKey(currentWeek: string): string {
  const [year, week] = currentWeek.split('-W').map(Number);
  const date = getDateFromWeek(year, week);
  date.setDate(date.getDate() - 7);
  return getWeekKey(date);
}

function showMilestoneNotification(milestone: Milestone) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.svg',
    title: '🔥 Streak Milestone!',
    message: `You've reached ${milestone.name} of self-awareness!`
  });
}
```

### Streak Display Component (components/StreakDisplay.tsx)
```typescript
interface StreakDisplayProps {
  streak: StreakData;
  showMilestones?: boolean;
}

export function StreakDisplay({ streak, showMilestones = false }: StreakDisplayProps) {
  return (
    <div class="streak-display">
      <div class="streak-counter">
        <div class="flame-icon">🔥</div>
        <div class="streak-number">{streak.currentStreak}</div>
        <div class="streak-label">week streak</div>
      </div>
      
      {streak.currentStreak > 0 && (
        <p class="streak-message">
          {streak.currentStreak === 1 && "Just started your journey!"}
          {streak.currentStreak === 2 && "Building momentum!"}
          {streak.currentStreak >= 3 && streak.currentStreak < 8 && "You're consistent!"}
          {streak.currentStreak >= 8 && streak.currentStreak < 12 && "Impressive dedication!"}
          {streak.currentStreak >= 12 && "You're committed to self-awareness!"}
        </p>
      )}
      
      {streak.currentStreak === 0 && streak.longestStreak > 0 && (
        <p class="streak-reset">
          Streak reset. Your best was {streak.longestStreak} weeks.
        </p>
      )}
      
      {showMilestones && (
        <div class="milestones">
          <h4>Milestones</h4>
          {streak.milestones.map(milestone => (
            <div 
              key={milestone.weeks}
              class={`milestone ${milestone.achieved ? 'achieved' : 'pending'}`}
            >
              <span class="milestone-icon">
                {milestone.achieved ? '✓' : '○'}
              </span>
              <span class="milestone-name">{milestone.name}</span>
              {milestone.achieved && milestone.achievedDate && (
                <span class="milestone-date">{milestone.achievedDate}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Popup Integration (popup.tsx)
```typescript
function Popup() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  
  useEffect(() => {
    loadStreak();
  }, []);
  
  async function loadStreak() {
    const streakData = await getStreakData();
    setStreak(streakData);
  }
  
  return (
    <div class="popup">
      {/* ... existing popup content ... */}
      
      {streak && (
        <div class="streak-section">
          <StreakDisplay streak={streak} />
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
  
  // Update streak
  const weekKey = getWeekKey(new Date());
  const streak = await updateStreak(weekKey);
  setStreakData(streak);
}

// Display in report
{streakData && (
  <div class="streak-banner">
    <StreakDisplay streak={streakData} showMilestones={true} />
  </div>
)}
```

### Streak Protection (options/streak-settings.tsx)
```typescript
function StreakSettings() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  
  useEffect(() => {
    loadStreak();
  }, []);
  
  async function loadStreak() {
    const streakData = await getStreakData();
    setStreak(streakData);
    
    const settings = await storage.getSettings();
    setReminderEnabled(settings.streakReminder || true);
  }
  
  async function toggleReminder(enabled: boolean) {
    await storage.setSettings({
      ...(await storage.getSettings()),
      streakReminder: enabled
    });
    setReminderEnabled(enabled);
    
    if (enabled) {
      setupStreakReminder();
    } else {
      clearStreakReminder();
    }
  }
  
  return (
    <div class="streak-settings">
      <h3>Streak Protection</h3>
      
      {streak && streak.currentStreak > 0 && (
        <div class="streak-status">
          <p>Current streak: <strong>{streak.currentStreak} weeks</strong></p>
          <p>Longest streak: <strong>{streak.longestStreak} weeks</strong></p>
        </div>
      )}
      
      <div class="setting-item">
        <label>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => toggleReminder(e.target.checked)}
          />
          Remind me to submit weekly report (don't break the streak!)
        </label>
      </div>
      
      <div class="streak-history">
        <h4>Missed Weeks</h4>
        {streak && streak.missedWeeks.length > 0 ? (
          <ul>
            {streak.missedWeeks.map(week => (
              <li key={week}>{week}</li>
            ))}
          </ul>
        ) : (
          <p>No missed weeks! Perfect streak.</p>
        )}
      </div>
    </div>
  );
}

// Reminder notification (background.js)
async function setupStreakReminder() {
  // Check every Monday if report submitted
  chrome.alarms.create('streak-reminder', {
    periodInMinutes: 1440 // Daily
  });
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'streak-reminder') {
      const today = new Date();
      if (today.getDay() === 1) { // Monday
        const weekKey = getWeekKey(today);
        const streak = await getStreakData();
        
        if (streak.lastReportDate !== weekKey && streak.currentStreak > 0) {
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.svg',
            title: '🔥 Don\'t Break Your Streak!',
            message: `Submit your weekly report to keep your ${streak.currentStreak}-week streak alive!`
          });
        }
      }
    }
  });
}
```

### Styling (components/StreakDisplay.css)
```css
.streak-display {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #333;
}

.streak-counter {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.flame-icon {
  font-size: 32px;
  animation: flicker 0.5s infinite alternate;
}

@keyframes flicker {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(1.1); opacity: 0.8; }
}

.streak-number {
  font-size: 48px;
  font-weight: 700;
  color: #ff6b6b;
  line-height: 1;
}

.streak-label {
  font-size: 14px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.streak-message {
  color: #fff;
  font-size: 14px;
  margin: 0;
}

.streak-reset {
  color: #ff6b6b;
  font-size: 14px;
  margin: 0;
}

.milestones {
  margin-top: 16px;
  text-align: left;
}

.milestones h4 {
  color: #888;
  font-size: 12px;
  text-transform: uppercase;
  margin: 0 0 8px 0;
}

.milestone {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #333;
}

.milestone:last-child {
  border-bottom: none;
}

.milestone.achieved {
  color: #4ade80;
}

.milestone.pending {
  color: #666;
}

.milestone-icon {
  font-size: 16px;
}

.milestone-name {
  flex: 1;
  font-size: 14px;
}

.milestone-date {
  font-size: 12px;
  color: #666;
}
```

## Edge Cases
- **First week ever:** streak = 1, no previous comparison
- **Same week reported twice:** Don't increment streak
- **Multiple missed weeks:** Track all missed weeks in array
- **Time zone issues:** Use week keys (not dates) for consistency
- **Data corruption:** Validate streak data, reset if invalid

## Performance Considerations
- Streak data is minimal (few KB)
- Storage operations are fast
- Notifications use Chrome API (native)
- Reminder alarm runs once daily (negligible overhead)

## Privacy
- All data stored locally
- No data transmitted
- User can reset streak manually
- Missed weeks tracked locally only

## Testing
- Test first week (streak = 1)
- Test consecutive weeks (streak increments)
- Test missed week (streak resets)
- Test milestone achievements
- Test reminder notification
- Test streak reset and recovery
- Test with existing streak data
