import { isPro } from './license';

export type FeatureName =
  | 'allRoastVoices'
  | 'customTiming'
  | 'exportHighRes'
  | 'historicalData90Days'
  | 'shameScoreHistory';

const FEATURE_TIER_MAP: Record<FeatureName, 'free' | 'pro'> = {
  allRoastVoices: 'pro',
  customTiming: 'pro',
  exportHighRes: 'pro',
  historicalData90Days: 'pro',
  shameScoreHistory: 'pro'
};

export async function canAccess(feature: FeatureName): Promise<boolean> {
  const pro = await isPro();
  if (pro) return true;

  const requiredTier = FEATURE_TIER_MAP[feature];
  return requiredTier === 'free';
}

export async function getAccessibleFeatures(): Promise<FeatureName[]> {
  const pro = await isPro();

  const allFeatures: FeatureName[] = [
    'allRoastVoices',
    'customTiming',
    'exportHighRes',
    'historicalData90Days',
    'shameScoreHistory'
  ];

  if (pro) return allFeatures;

  return allFeatures.filter(f => FEATURE_TIER_MAP[f] === 'free');
}

export function getFeatureTier(feature: FeatureName): 'free' | 'pro' {
  return FEATURE_TIER_MAP[feature];
}