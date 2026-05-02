// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayData {
  peakTabs?: number;
  nightSessions?: number;
  quickClosures?: number;
  longSessions?: number;
  spiralSessions?: number;
  totalScrollDistance?: number;
  /** Count of tabs untouched for > 7 days */
  ghostTabs?: number;
  /** Count of rapid-backspace rage events (> 5 backspaces in 2 seconds) */
  backspaceRage?: number;
  /** Total seconds spent switching between tabs */
  tabDecisionTime?: number;
  /** Peak scroll velocity in px/sec for the day */
  peakVelocity?: number;
}

export interface WeeklyStats extends DayData {}

// ─── Chaos Score ──────────────────────────────────────────────────────────────

export function calculateChaosScore(stats: DayData | null): number {
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

  // Keyboard crimes: 3 pts each, up to 15
  score += Math.min(Math.max(stats.backspaceRage || 0, 0) * 3, 15);

  return Math.min(Math.round(score), 100);
}

/** @deprecated Use calculateChaosScore — retained for backward compatibility */
export const calculateShameScore = calculateChaosScore;

// ─── Chaos Title ──────────────────────────────────────────────────────────────

/**
 * Returns a badge/rank title for the given chaos score.
 * Every tier is framed as a proud rank, never a pure judgment.
 */
export function getChaosTitle(score: number): string {
  if (score >= 90) return 'Grand Chaos Architect';
  if (score >= 80) return 'Certified Chaos Agent';
  if (score >= 65) return 'Tab Hoarder Supreme';
  if (score >= 50) return 'Chaos Enthusiast';
  if (score >= 35) return 'Chaotically Curious';
  if (score >= 20) return "Baby's First Chaos";
  if (score >= 10) return 'Suspiciously Calm';
  return 'We\'re Watching You';
}

/** @deprecated Use getChaosTitle */
export const getShameTitle = getChaosTitle;

// ─── Clean Week ───────────────────────────────────────────────────────────────

/** True when the user had a suspiciously reasonable week (score < 20) */
export function isCleanWeek(score: number): boolean {
  return score < 20;
}

// ─── Score Delta ──────────────────────────────────────────────────────────────

export interface ScoreDelta {
  /** Positive = worse this week, negative = better */
  delta: number;
  label: string;
  direction: 'up' | 'down' | 'flat';
}

/**
 * Compares this week's score to last week's and returns a structured delta
 * with human-readable copy ready to display.
 */
export function calculateScoreDelta(current: number, previous: number | null): ScoreDelta | null {
  if (previous === null) return null;

  const delta = current - previous;

  if (Math.abs(delta) < 2) {
    return {
      delta: 0,
      label: 'flat line. consistent chaos.',
      direction: 'flat',
    };
  }

  if (delta > 0) {
    return {
      delta,
      label: `▲ ${delta} pts — getting worse. impressive.`,
      direction: 'up',
    };
  }

  return {
    delta,
    label: `▼ ${Math.abs(delta)} pts — suspiciously reasonable this week`,
    direction: 'down',
  };
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

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
      peakTabs:            Math.max(acc.peakTabs || 0, data.peakTabs || 0),
      nightSessions:       (acc.nightSessions || 0) + (data.nightSessions || 0),
      quickClosures:       (acc.quickClosures || 0) + (data.quickClosures || 0),
      longSessions:        (acc.longSessions || 0) + (data.longSessions || 0),
      spiralSessions:      (acc.spiralSessions || 0) + (data.spiralSessions || 0),
      totalScrollDistance: (acc.totalScrollDistance || 0) + (data.totalScrollDistance || 0),
      ghostTabs:           Math.max(acc.ghostTabs || 0, data.ghostTabs || 0),
      backspaceRage:       (acc.backspaceRage || 0) + (data.backspaceRage || 0),
      tabDecisionTime:     (acc.tabDecisionTime || 0) + (data.tabDecisionTime || 0),
      peakVelocity:        Math.max(acc.peakVelocity || 0, data.peakVelocity || 0),
    }),
    {} as WeeklyStats,
  );
}