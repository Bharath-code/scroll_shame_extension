import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canAccess, getAccessibleFeatures, getFeatureTier } from '../feature-flags';
import * as license from '../license';

vi.mock('../license', () => ({
  isPro: vi.fn(),
  isProPlus: vi.fn(),
}));

describe('feature-flags', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canAccess', () => {
    it('allows access to pro features when isPro is true', async () => {
      vi.mocked(license.isPro).mockResolvedValue(true);
      expect(await canAccess('allRoastVoices')).toBe(true);
    });

    it('denies access to pro features when isPro is false', async () => {
      vi.mocked(license.isPro).mockResolvedValue(false);
      expect(await canAccess('allRoastVoices')).toBe(false);
    });

    it('allows access to pro-plus features when isProPlus is true', async () => {
      vi.mocked(license.isProPlus).mockResolvedValue(true);
      expect(await canAccess('interventionModals')).toBe(true);
    });

    it('denies access to pro-plus features when isProPlus is false', async () => {
      vi.mocked(license.isProPlus).mockResolvedValue(false);
      expect(await canAccess('interventionModals')).toBe(false);
    });

    it('returns false for unknown features', async () => {
      expect(await canAccess('unknownFeature' as any)).toBe(false);
    });
  });

  describe('getAccessibleFeatures', () => {
    it('returns no features when not pro and no free features exist', async () => {
      vi.mocked(license.isPro).mockResolvedValue(false);
      vi.mocked(license.isProPlus).mockResolvedValue(false);
      const features = await getAccessibleFeatures();
      expect(features).toEqual([]);
    });

    it('returns pro features when isPro is true', async () => {
      vi.mocked(license.isPro).mockResolvedValue(true);
      vi.mocked(license.isProPlus).mockResolvedValue(false);
      const features = await getAccessibleFeatures();
      expect(features).toContain('allRoastVoices');
      expect(features).toContain('customTiming');
      expect(features).not.toContain('interventionModals');
    });

    it('returns all features when isProPlus is true', async () => {
      // In reality, if isProPlus is true, isPro is also true
      vi.mocked(license.isPro).mockResolvedValue(true);
      vi.mocked(license.isProPlus).mockResolvedValue(true);
      const features = await getAccessibleFeatures();
      expect(features).toContain('allRoastVoices');
      expect(features).toContain('interventionModals');
      expect(features).toContain('osLevelHarassment');
    });
  });

  describe('getFeatureTier', () => {
    it('returns correct tier for a given feature', () => {
      expect(getFeatureTier('allRoastVoices')).toBe('pro');
      expect(getFeatureTier('shameStreak')).toBe('pro-plus');
      expect(getFeatureTier('osLevelHarassment')).toBe('pro-plus');
    });
  });
});
