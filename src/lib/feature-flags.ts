import { isPro, isProPlus } from './license';

export type FeatureName =
  | 'allRoastVoices'
  | 'customTiming'
  | 'exportHighRes'
  | 'historicalData90Days'
  | 'shameScoreHistory'
  | 'allNineVoices'
  | 'interventionModals'
  | 'predictionEngine'
  | 'patternAnalysis'
  | 'shameStreak'
  | 'instantReplay';

export type FeatureTier = 'free' | 'pro' | 'pro-plus';

const FEATURE_TIER_MAP: Record<FeatureName, FeatureTier> = {
  // Pro Base features ($15 one-time)
  allRoastVoices:          'pro',
  customTiming:            'pro',
  exportHighRes:           'pro',
  historicalData90Days:    'pro',
  shameScoreHistory:       'pro',
  allNineVoices:           'pro-plus',

  // Pro+ subscription features ($4.99/mo)
  interventionModals:      'pro-plus',
  predictionEngine:        'pro-plus',
  patternAnalysis:         'pro-plus',
  shameStreak:             'pro-plus',
  instantReplay:           'pro-plus',
};

export async function canAccess(feature: FeatureName): Promise<boolean> {
  const tier = FEATURE_TIER_MAP[feature];

  if (tier === 'free') return true;
  if (tier === 'pro') return await isPro();       // pro or pro-plus both qualify
  if (tier === 'pro-plus') return await isProPlus();

  return false;
}

export async function getAccessibleFeatures(): Promise<FeatureName[]> {
  const [pro, proPlus] = await Promise.all([isPro(), isProPlus()]);

  return (Object.keys(FEATURE_TIER_MAP) as FeatureName[]).filter((feature) => {
    const tier = FEATURE_TIER_MAP[feature];
    if (tier === 'free') return true;
    if (tier === 'pro') return pro;
    if (tier === 'pro-plus') return proPlus;
    return false;
  });
}

export function getFeatureTier(feature: FeatureName): FeatureTier {
  return FEATURE_TIER_MAP[feature];
}