import { storage } from './storage';

export type LicenseTier = 'free' | 'pro' | 'pro-plus';

export interface LicenseStatus {
  tier: LicenseTier;
  purchasedAt?: string;
  licenseKey?: string;
  /** ISO date string when Pro+ subscription renews */
  subscriptionRenewsAt?: string;
}

export async function getLicenseStatus(): Promise<LicenseStatus> {
  return storage.getLicenseStatus();
}

export async function setLicenseStatus(status: LicenseStatus): Promise<void> {
  return storage.setLicenseStatus(status);
}

/** True if user has Pro Base OR Pro+ */
export async function isPro(): Promise<boolean> {
  try {
    const status = await getLicenseStatus();
    return status.tier === 'pro' || status.tier === 'pro-plus';
  } catch (error) {
    console.error('[License] Failed to check license status:', error);
    return false;
  }
}

/** True only if user has Pro+ subscription */
export async function isProPlus(): Promise<boolean> {
  try {
    const status = await getLicenseStatus();
    return status.tier === 'pro-plus';
  } catch (error) {
    console.error('[License] Failed to check pro-plus status:', error);
    return false;
  }
}

export async function upgradeToPro(licenseKey: string): Promise<void> {
  const tier = getTierFromKey(licenseKey);
  if (tier === 'free') {
    throw new Error('Invalid license key');
  }

  const status: LicenseStatus = {
    tier,
    purchasedAt: new Date().toISOString(),
    licenseKey,
  };
  await setLicenseStatus(status);
}

export async function upgradeToProPlus(licenseKey: string): Promise<void> {
  const renewsAt = new Date();
  renewsAt.setMonth(renewsAt.getMonth() + 1);

  const status: LicenseStatus = {
    tier: 'pro-plus',
    purchasedAt: new Date().toISOString(),
    licenseKey,
    subscriptionRenewsAt: renewsAt.toISOString(),
  };
  await setLicenseStatus(status);
}

export async function downgradeToFree(): Promise<void> {
  await setLicenseStatus({ tier: 'free' });
}

/**
 * Derives the license tier from a key.
 * Format: XXXX-XXXX-XXXX-XXXX
 * Keys starting with 'PP' (after stripping hyphens) are Pro+.
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
  const actualChecksum = parseInt(cleanKey.slice(-1), 10);
  if (expectedChecksum !== actualChecksum) return 'free';

  // Pro+ keys start with 'PP'
  if (cleanKey.startsWith('PP')) return 'pro-plus';

  return 'pro';
}