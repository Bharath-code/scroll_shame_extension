import { storage } from './storage';

// TASK-06: 'chaos-pass' replaces 'pro-plus'. 'pro-plus' is kept as an alias
// so existing saved license keys continue working on upgrade.
export type LicenseTier = 'free' | 'pro' | 'chaos-pass' | 'pro-plus';

export interface LicenseStatus {
  tier: LicenseTier;
  purchasedAt?: string;
  licenseKey?: string;
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  return storage.getLicenseStatus();
}

export async function setLicenseStatus(status: LicenseStatus): Promise<void> {
  return storage.setLicenseStatus(status);
}

/** True if user has Pro Base OR Chaos Pass (or legacy pro-plus) */
export async function isPro(): Promise<boolean> {
  try {
    const { tier } = await getLicenseStatus();
    return tier === 'pro' || tier === 'chaos-pass' || tier === 'pro-plus';
  } catch (error) {
    console.error('[License] Failed to check pro status:', error);
    return false;
  }
}

/** True only if user has Chaos Pass (or legacy pro-plus) */
export async function isProPlus(): Promise<boolean> {
  try {
    const { tier } = await getLicenseStatus();
    return tier === 'chaos-pass' || tier === 'pro-plus';
  } catch (error) {
    console.error('[License] Failed to check chaos-pass status:', error);
    return false;
  }
}

/** @deprecated alias — use isProPlus */
export const isChaosPass = isProPlus;

export async function upgradeToPro(licenseKey: string): Promise<void> {
  const tier = getTierFromKey(licenseKey);
  if (tier === 'free') throw new Error('Invalid license key');
  await setLicenseStatus({
    tier,
    purchasedAt: new Date().toISOString(),
    licenseKey,
  });
}

export async function upgradeToProPlus(licenseKey: string): Promise<void> {
  await setLicenseStatus({
    tier: 'chaos-pass',
    purchasedAt: new Date().toISOString(),
    licenseKey,
  });
}

/** Alias with new naming convention */
export const upgradeToChaosPass = upgradeToProPlus;

export async function downgradeToFree(): Promise<void> {
  await setLicenseStatus({ tier: 'free' });
}

/**
 * Derives the license tier from a key format: XXXX-XXXX-XXXX-XXXX
 * - Keys starting with 'CP' (after stripping hyphens) → Chaos Pass
 * - Keys starting with 'PP' (legacy) → Chaos Pass (backward compat)
 * - All other valid keys → Pro Base
 */
export function getTierFromKey(key: string): LicenseTier {
  if (!key) return 'free';

  const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(key)) return 'free';

  const cleanKey = key.replace(/-/g, '');

  // Checksum: sum of char codes (excluding last char) mod 10 === last digit
  const sum = cleanKey
    .slice(0, -1)
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const expectedChecksum = sum % 10;
  const actualChecksum   = parseInt(cleanKey.slice(-1), 10);
  if (expectedChecksum !== actualChecksum) return 'free';

  // Chaos Pass keys: CP prefix (new) or PP prefix (legacy)
  if (cleanKey.startsWith('CP') || cleanKey.startsWith('PP')) return 'chaos-pass';

  return 'pro';
}