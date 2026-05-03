import { describe, it, expect } from 'vitest';
import { calculateShameScore, getShameTitle, aggregateStats, DayData } from '../scoring';

describe('calculateShameScore', () => {
  it('returns 0 when given null', () => {
    expect(calculateShameScore(null)).toBe(0);
  });

  it('returns 0 when given empty object', () => {
    expect(calculateShameScore({})).toBe(0);
  });

  it('calculates shame score from peak tabs', () => {
    const result = calculateShameScore({ peakTabs: 30 });
    expect(result).toBe(45); // 30 * 1.5 = 45
  });

  it('caps peak tabs contribution at 50', () => {
    const result = calculateShameScore({ peakTabs: 50 });
    expect(result).toBe(50);
  });

  it('adds 10 points per night session', () => {
    const result = calculateShameScore({ nightSessions: 3 });
    expect(result).toBe(30); // 3 * 10 = 30
  });

  it('adds points for quick closures', () => {
    const result = calculateShameScore({ quickClosures: 20 });
    expect(result).toBe(10); // min(20 * 0.5, 20) = 10
  });

  it('caps quick closures at 20', () => {
    const result = calculateShameScore({ quickClosures: 50 });
    expect(result).toBe(20);
  });

  it('adds 5 points per spiral session', () => {
    const result = calculateShameScore({ spiralSessions: 4 });
    expect(result).toBe(20); // 4 * 5 = 20
  });

  it('calculates total from multiple signals', () => {
    const result = calculateShameScore({
      peakTabs: 20,
      nightSessions: 2,
      quickClosures: 10,
      spiralSessions: 3
    });
    // peakTabs: min(20*1.5, 50) = 30
    // nightSessions: 2*10 = 20
    // quickClosures: min(10*0.5, 20) = 5
    // spiralSessions: 3*5 = 15
    // Total: 30 + 20 + 5 + 15 = 70
    expect(result).toBe(70);
  });

  it('caps total score at 100', () => {
    const result = calculateShameScore({
      peakTabs: 100,
      nightSessions: 20,
      quickClosures: 100,
      spiralSessions: 50
    });
    expect(result).toBe(100);
  });

  it('adds points for total scroll distance', () => {
    const result = calculateShameScore({ totalScrollDistance: 50000 });
    expect(result).toBe(5); // 50000 / 10000 = 5
  });

  it('caps scroll distance contribution at 15', () => {
    const result = calculateShameScore({ totalScrollDistance: 500000 });
    expect(result).toBe(15); // min(500000 / 10000, 15) = 15
  });

  it('adds points for long sessions', () => {
    const result = calculateShameScore({ longSessions: 3 });
    expect(result).toBe(9); // 3 * 3 = 9
  });

  it('caps long sessions contribution at 15', () => {
    const result = calculateShameScore({ longSessions: 10 });
    expect(result).toBe(15); // min(10 * 3, 15) = 15
  });

  it('handles negative values correctly', () => {
    const result = calculateShameScore({
      peakTabs: -10,
      nightSessions: -5,
      quickClosures: -20,
      spiralSessions: -3,
      totalScrollDistance: -1000,
      longSessions: -2
    });
    expect(result).toBe(0); // All negative values should be treated as 0
  });
});

describe('getShameTitle', () => {
  it('returns "Certified Chaos Agent" for score >= 80 and < 90', () => {
    expect(getShameTitle(80)).toBe('Certified Chaos Agent');
    expect(getShameTitle(89)).toBe('Certified Chaos Agent');
  });

  it('returns "Tab Hoarder Supreme" for score >= 65 and < 80', () => {
    expect(getShameTitle(65)).toBe('Tab Hoarder Supreme');
    expect(getShameTitle(79)).toBe('Tab Hoarder Supreme');
  });

  it('returns "Chaos Enthusiast" for score >= 50 and < 65', () => {
    expect(getShameTitle(50)).toBe('Chaos Enthusiast');
    expect(getShameTitle(64)).toBe('Chaos Enthusiast');
  });

  it('returns "Chaotically Curious" for score >= 35 and < 50', () => {
    expect(getShameTitle(35)).toBe('Chaotically Curious');
    expect(getShameTitle(49)).toBe('Chaotically Curious');
  });

  it('returns "Baby\'s First Chaos" for score >= 20 and < 35', () => {
    expect(getShameTitle(20)).toBe("Baby's First Chaos");
    expect(getShameTitle(34)).toBe("Baby's First Chaos");
  });

  it('returns "Suspiciously Calm" for score >= 10 and < 20', () => {
    expect(getShameTitle(10)).toBe("Suspiciously Calm");
    expect(getShameTitle(19)).toBe("Suspiciously Calm");
  });

  it('returns "We\'re Watching You" for score < 10', () => {
    expect(getShameTitle(0)).toBe("We're Watching You");
    expect(getShameTitle(9)).toBe("We're Watching You");
  });
});

describe('aggregateStats', () => {
  it('returns default empty object with 0 values for empty array', () => {
    expect(aggregateStats([])).toEqual({
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
    });
  });


  it('returns max peakTabs from all days', () => {
    const result = aggregateStats([
      { peakTabs: 10 },
      { peakTabs: 30 },
      { peakTabs: 20 }
    ]);
    expect(result.peakTabs).toBe(30);
  });

  it('sums nightSessions across days', () => {
    const result = aggregateStats([
      { nightSessions: 2 },
      { nightSessions: 3 },
      { nightSessions: 1 }
    ]);
    expect(result.nightSessions).toBe(6);
  });

  it('sums quickClosures across days', () => {
    const result = aggregateStats([
      { quickClosures: 5 },
      { quickClosures: 10 }
    ]);
    expect(result.quickClosures).toBe(15);
  });

  it('sums longSessions across days', () => {
    const result = aggregateStats([
      { longSessions: 1 },
      { longSessions: 2 }
    ]);
    expect(result.longSessions).toBe(3);
  });

  it('sums spiralSessions across days', () => {
    const result = aggregateStats([
      { spiralSessions: 4 },
      { spiralSessions: 6 }
    ]);
    expect(result.spiralSessions).toBe(10);
  });

  it('handles partial data in days', () => {
    const result = aggregateStats([
      { peakTabs: 10, nightSessions: 2 },
      { peakTabs: 20 },
      { nightSessions: 3 }
    ]);
    expect(result.peakTabs).toBe(20);
    expect(result.nightSessions).toBe(5);
  });
});

import { isCleanWeek, calculateScoreDelta } from '../scoring';

describe('isCleanWeek', () => {
  it('returns true for score < 20', () => {
    expect(isCleanWeek(0)).toBe(true);
    expect(isCleanWeek(19)).toBe(true);
  });

  it('returns false for score >= 20', () => {
    expect(isCleanWeek(20)).toBe(false);
    expect(isCleanWeek(50)).toBe(false);
  });
});

describe('calculateScoreDelta', () => {
  it('returns null if previous is null', () => {
    expect(calculateScoreDelta(50, null)).toBeNull();
  });

  it('returns flat for tiny changes', () => {
    const result = calculateScoreDelta(50, 49);
    expect(result).toEqual({
      delta: 0,
      label: 'flat line. consistent chaos.',
      direction: 'flat'
    });
  });

  it('returns up when score gets worse', () => {
    const result = calculateScoreDelta(70, 50);
    expect(result).toEqual({
      delta: 20,
      label: '▲ 20 pts — getting worse. impressive.',
      direction: 'up'
    });
  });

  it('returns down when score gets better', () => {
    const result = calculateScoreDelta(30, 50);
    expect(result).toEqual({
      delta: -20,
      label: '▼ 20 pts — suspiciously reasonable this week',
      direction: 'down'
    });
  });
});