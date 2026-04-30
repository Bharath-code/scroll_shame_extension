import { describe, it, expect } from 'vitest';
import { todayKey, keyForDate, parseKey, getLast7Days, getDateRangeKeys } from '../date-key';

describe('todayKey', () => {
  it('returns key in correct format for given date', () => {
    const date = new Date(2026, 3, 30); // April 30, 2026
    expect(todayKey(date)).toBe('day-2026-04-30');
  });

  it('pads single digit months and days with zeros', () => {
    const date = new Date(2026, 0, 5); // January 5, 2026
    expect(todayKey(date)).toBe('day-2026-01-05');
  });
});

describe('keyForDate', () => {
  it('produces correct key format', () => {
    const date = new Date(2026, 3, 15);
    expect(keyForDate(date)).toBe('day-2026-04-15');
  });

  it('handles December', () => {
    const date = new Date(2026, 11, 25); // December 25
    expect(keyForDate(date)).toBe('day-2026-12-25');
  });

  it('handles January', () => {
    const date = new Date(2026, 0, 1); // January 1
    expect(keyForDate(date)).toBe('day-2026-01-01');
  });
});

describe('parseKey', () => {
  it('parses valid key to Date', () => {
    const result = parseKey('day-2026-04-30');
    expect(result?.getFullYear()).toBe(2026);
    expect(result?.getMonth()).toBe(3); // 0-indexed, so April = 3
    expect(result?.getDate()).toBe(30);
  });

  it('returns null for key without prefix', () => {
    expect(parseKey('2026-04-30')).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseKey('day-invalid')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseKey('')).toBeNull();
  });

  it('parses edge dates correctly', () => {
    const result = parseKey('day-2026-01-01');
    expect(result?.getMonth()).toBe(0); // January
    expect(result?.getDate()).toBe(1);
  });
});

describe('getLast7Days', () => {
  it('returns array of 7 keys', () => {
    const result = getLast7Days();
    expect(result).toHaveLength(7);
  });

  it('returns keys in chronological order', () => {
    const result = getLast7Days();
    // Each key should be greater than previous
    for (let i = 1; i < result.length; i++) {
      expect(result[i] > result[i - 1]).toBe(true);
    }
  });

  it('includes today', () => {
    const result = getLast7Days();
    const today = todayKey(new Date());
    expect(result).toContain(today);
  });

  it('returns keys in day-YYYY-MM-DD format', () => {
    const result = getLast7Days();
    result.forEach(key => {
      expect(key).toMatch(/^day-\d{4}-\d{2}-\d{2}$/);
    });
  });
});

describe('getDateRangeKeys', () => {
  it('returns correct keys for single day range', () => {
    const start = new Date(2026, 3, 1);
    const end = new Date(2026, 3, 1);
    const result = getDateRangeKeys(start, end);
    expect(result).toEqual(['day-2026-04-01']);
  });

  it('returns correct keys for multi-day range', () => {
    const start = new Date(2026, 3, 1);
    const end = new Date(2026, 3, 3);
    const result = getDateRangeKeys(start, end);
    expect(result).toEqual([
      'day-2026-04-01',
      'day-2026-04-02',
      'day-2026-04-03'
    ]);
  });

  it('returns empty array when start > end', () => {
    const start = new Date(2026, 3, 5);
    const end = new Date(2026, 3, 1);
    const result = getDateRangeKeys(start, end);
    expect(result).toEqual([]);
  });

  it('returns empty array when startDate is not a Date object', () => {
    const result = getDateRangeKeys('2026-04-01' as any, new Date(2026, 3, 3));
    expect(result).toEqual([]);
  });

  it('returns empty array when endDate is not a Date object', () => {
    const result = getDateRangeKeys(new Date(2026, 3, 1), '2026-04-03' as any);
    expect(result).toEqual([]);
  });

  it('returns empty array when startDate is invalid', () => {
    const result = getDateRangeKeys(new Date('invalid'), new Date(2026, 3, 3));
    expect(result).toEqual([]);
  });

  it('returns empty array when endDate is invalid', () => {
    const result = getDateRangeKeys(new Date(2026, 3, 1), new Date('invalid'));
    expect(result).toEqual([]);
  });
});