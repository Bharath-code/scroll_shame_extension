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
  it('returns "Certified Chaos Agent" for score >= 80', () => {
    expect(getShameTitle(80)).toBe('Certified Chaos Agent');
    expect(getShameTitle(99)).toBe('Certified Chaos Agent');
  });

  it('returns "Tab Hoarder" for score >= 60 and < 80', () => {
    expect(getShameTitle(60)).toBe('Tab Hoarder');
    expect(getShameTitle(79)).toBe('Tab Hoarder');
  });

  it('returns "Mild Chaos Agent" for score >= 40 and < 60', () => {
    expect(getShameTitle(40)).toBe('Mild Chaos Agent');
    expect(getShameTitle(59)).toBe('Mild Chaos Agent');
  });

  it('returns "Scroll Apprentice" for score >= 20 and < 40', () => {
    expect(getShameTitle(20)).toBe('Scroll Apprentice');
    expect(getShameTitle(39)).toBe('Scroll Apprentice');
  });

  it('returns "Innocent Browser User" for score < 20', () => {
    expect(getShameTitle(0)).toBe('Innocent Browser User');
    expect(getShameTitle(19)).toBe('Innocent Browser User');
  });
});

describe('aggregateStats', () => {
  it('returns empty object for empty array', () => {
    expect(aggregateStats([])).toEqual({});
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