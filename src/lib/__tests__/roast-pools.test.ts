import { describe, it, expect } from 'vitest';
import { ROAST_VOICES, getRandomRoast, formatRoast, RoastVoice, RoastPool } from '../roast-pools';

describe('ROAST_VOICES', () => {
  it('contains all 5 voice types', () => {
    expect(ROAST_VOICES.therapist).toBeDefined();
    expect(ROAST_VOICES['drill-sergeant']).toBeDefined();
    expect(ROAST_VOICES['your-mom']).toBeDefined();
    expect(ROAST_VOICES['tech-bro']).toBeDefined();
    expect(ROAST_VOICES.accountant).toBeDefined();
  });

  it('each voice has all 5 roast categories', () => {
    (Object.keys(ROAST_VOICES) as RoastVoice[]).forEach(voice => {
      const pool = ROAST_VOICES[voice];
      expect(pool.peakTabs).toBeDefined();
      expect(pool.nightSessions).toBeDefined();
      expect(pool.quickClosures).toBeDefined();
      expect(pool.longSessions).toBeDefined();
      expect(pool.spiralSessions).toBeDefined();
    });
  });

  it('each category has at least one roast line', () => {
    const pool = ROAST_VOICES.therapist;
    expect(pool.peakTabs.length).toBeGreaterThan(0);
    expect(pool.nightSessions.length).toBeGreaterThan(0);
    expect(pool.quickClosures.length).toBeGreaterThan(0);
    expect(pool.longSessions.length).toBeGreaterThan(0);
    expect(pool.spiralSessions.length).toBeGreaterThan(0);
  });

  it('therapist has the expected roasts', () => {
    const pool = ROAST_VOICES.therapist;
    expect(pool.peakTabs).toContain("You opened {count} tabs. That's not research, that's a digital hoarding disorder.");
  });
});

describe('getRandomRoast', () => {
  it('returns a string from the provided pool', () => {
    const pool = ['roast1', 'roast2', 'roast3'];
    const result = getRandomRoast(pool);
    expect(pool).toContain(result);
  });

  it('can return any item in the pool (multiple runs)', () => {
    const pool = ['a', 'b', 'c'];
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(getRandomRoast(pool));
    }
    // With 50 iterations, we should see multiple values
    expect(results.size).toBeGreaterThan(1);
  });

  it('handles single-item pool', () => {
    const result = getRandomRoast(['only-one']);
    expect(result).toBe('only-one');
  });

  it('handles empty pool', () => {
    const result = getRandomRoast([]);
    expect(result).toBe('');
  });
});

describe('formatRoast', () => {
  it('replaces {count} with peakTabs value', () => {
    const result = formatRoast("You opened {count} tabs.", { peakTabs: 42 });
    expect(result).toBe("You opened 42 tabs.");
  });

  it('replaces {count} with quickClosures when no peakTabs', () => {
    const result = formatRoast("You opened {count} tabs.", { quickClosures: 15 });
    expect(result).toBe("You opened 15 tabs.");
  });

  it('replaces {count} with 0 when no data', () => {
    const result = formatRoast("You opened {count} tabs.", {});
    expect(result).toBe("You opened 0 tabs.");
  });

  it('replaces {time} placeholder with provided value', () => {
    const result = formatRoast("You were scrolling at {time}.", { time: '2:30am' });
    expect(result).toBe("You were scrolling at 2:30am.");
  });

  it('uses default time when not provided', () => {
    const result = formatRoast("You were scrolling at {time}.", {});
    expect(result).toBe("You were scrolling at 1:47am.");
  });

  it('replaces {hours} placeholder with provided value', () => {
    const result = formatRoast("You spent {hours} hours.", { hours: 8 });
    expect(result).toBe("You spent 8 hours.");
  });

  it('uses default hours when not provided', () => {
    const result = formatRoast("You spent {hours} hours.", {});
    expect(result).toBe("You spent 6 hours.");
  });

  it('replaces {velocity} placeholder with provided value', () => {
    const result = formatRoast("Speed: {velocity} px/sec.", { velocity: 2500 });
    expect(result).toBe("Speed: 2500 px/sec.");
  });

  it('uses default velocity when not provided', () => {
    const result = formatRoast("Speed: {velocity} px/sec.", {});
    expect(result).toBe("Speed: 1200 px/sec.");
  });

  it('handles multiple placeholders with custom values', () => {
    const template = "{count} tabs at {time} = {velocity} px/sec for {hours} hours";
    const result = formatRoast(template, { 
      peakTabs: 20, 
      time: '3:45am', 
      velocity: 1800, 
      hours: 5 
    });
    expect(result).toBe("20 tabs at 3:45am = 1800 px/sec for 5 hours");
  });
});