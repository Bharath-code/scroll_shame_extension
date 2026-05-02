export interface DayData {
  peakTabs?: number;
  nightSessions?: number;
  quickClosures?: number;
  longSessions?: number;
  spiralSessions?: number;
  totalScrollDistance?: number;
  /** Count of tabs that remained untouched for > 7 days */
  ghostTabs?: number;
  /** Count of rapid-backspace rage events (> 5 backspaces in 2 seconds) */
  backspaceRage?: number;
  /** Total seconds spent deciding between tabs (tab switching time) */
  tabDecisionTime?: number;
  /** Peak scroll velocity in px/sec for the day */
  peakVelocity?: number;
}

export interface WeeklyStats extends DayData {}

export function calculateShameScore(stats: DayData | null): number {
  if (!stats) return 0;

  let score = 0;

  // Peak tabs: up to 50 points (1.5 pts per tab)
  score += Math.min(Math.max(stats.peakTabs || 0, 0) * 1.5, 50);

  // Night sessions: 10 points each
  score += Math.max(stats.nightSessions || 0, 0) * 10;

  // Quick closures: 0.5 pts each, up to 20
  score += Math.min(Math.max(stats.quickClosures || 0, 0) * 0.5, 20);

  // Spiral scroll events: 5 pts each
  score += Math.max(stats.spiralSessions || 0, 0) * 5;

  // Total scroll distance: 1 pt per 10k px, up to 15
  score += Math.min(Math.max(stats.totalScrollDistance || 0, 0) / 10_000, 15);

  // Long sessions: 3 pts each, up to 15
  score += Math.min(Math.max(stats.longSessions || 0, 0) * 3, 15);

  // Ghost tabs: 2 pts each, up to 10
  score += Math.min(Math.max(stats.ghostTabs || 0, 0) * 2, 10);

  // Backspace rage: 3 pts each, up to 15
  score += Math.min(Math.max(stats.backspaceRage || 0, 0) * 3, 15);

  return Math.min(Math.round(score), 100);
}

/** Shame score → badge title */
export function getShameTitle(score: number): string {
  if (score >= 90) return 'Certified Internet Cryptid';
  if (score >= 80) return 'Certified Chaos Agent';
  if (score >= 65) return 'Tab Hoarder Supreme';
  if (score >= 50) return 'Casual Chaos Agent';
  if (score >= 35) return 'Mild Chaos Agent';
  if (score >= 20) return 'Scroll Apprentice';
  if (score >= 10) return 'Mostly Innocent';
  return 'Innocent Browser User';
}

/** Aggregates a list of daily records into a weekly summary */
export function aggregateStats(dataList: DayData[]): WeeklyStats {
  if (dataList.length === 0) {
    return {
      peakTabs: 0,
      nightSessions: 0,
      quickClosures: 0,
      longSessions: 0,
      spiralSessions: 0,
      totalScrollDistance: 0,
      ghostTabs: 0,
      backspaceRage: 0,
      tabDecisionTime: 0,
      peakVelocity: 0,
    };
  }

  return dataList.reduce<WeeklyStats>(
    (acc, data) => ({
      peakTabs:          Math.max(acc.peakTabs || 0, data.peakTabs || 0),
      nightSessions:     (acc.nightSessions || 0) + (data.nightSessions || 0),
      quickClosures:     (acc.quickClosures || 0) + (data.quickClosures || 0),
      longSessions:      (acc.longSessions || 0) + (data.longSessions || 0),
      spiralSessions:    (acc.spiralSessions || 0) + (data.spiralSessions || 0),
      totalScrollDistance: (acc.totalScrollDistance || 0) + (data.totalScrollDistance || 0),
      ghostTabs:         Math.max(acc.ghostTabs || 0, data.ghostTabs || 0),
      backspaceRage:     (acc.backspaceRage || 0) + (data.backspaceRage || 0),
      tabDecisionTime:   (acc.tabDecisionTime || 0) + (data.tabDecisionTime || 0),
      peakVelocity:      Math.max(acc.peakVelocity || 0, data.peakVelocity || 0),
    }),
    {} as WeeklyStats,
  );
}