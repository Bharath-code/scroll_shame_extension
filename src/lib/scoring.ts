export interface DayData {
  peakTabs?: number;
  nightSessions?: number;
  quickClosures?: number;
  longSessions?: number;
  spiralSessions?: number;
  totalScrollDistance?: number;
}

export interface WeeklyStats extends DayData {}

export function calculateShameScore(stats: DayData | null): number {
  if (!stats) return 0;

  let score = 0;
  score += Math.min(Math.max(stats.peakTabs || 0, 0) * 1.5, 50);
  score += Math.max(stats.nightSessions || 0, 0) * 10;
  score += Math.min(Math.max(stats.quickClosures || 0, 0) * 0.5, 20);
  score += Math.max(stats.spiralSessions || 0, 0) * 5;
  // Add scoring for total scroll distance (1 point per 10,000 pixels, max 15 points)
  score += Math.min(Math.max(stats.totalScrollDistance || 0, 0) / 10000, 15);
  // Add scoring for long sessions (3 points per long session, max 15 points)
  score += Math.min(Math.max(stats.longSessions || 0, 0) * 3, 15);

  return Math.min(Math.round(score), 100);
}

export function getShameTitle(score: number): string {
  if (score >= 80) return "Certified Chaos Agent";
  if (score >= 60) return "Tab Hoarder";
  if (score >= 40) return "Mild Chaos Agent";
  if (score >= 20) return "Scroll Apprentice";
  return "Innocent Browser User";
}

export function aggregateStats(dataList: DayData[]): WeeklyStats {
  return dataList.reduce((acc, data) => ({
    peakTabs: Math.max(acc.peakTabs || 0, data.peakTabs || 0),
    nightSessions: (acc.nightSessions || 0) + (data.nightSessions || 0),
    quickClosures: (acc.quickClosures || 0) + (data.quickClosures || 0),
    longSessions: (acc.longSessions || 0) + (data.longSessions || 0),
    spiralSessions: (acc.spiralSessions || 0) + (data.spiralSessions || 0),
    totalScrollDistance: (acc.totalScrollDistance || 0) + (data.totalScrollDistance || 0)
  }), {});
}