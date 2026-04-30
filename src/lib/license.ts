import { storage } from './storage';

export type LicenseTier = 'free' | 'pro';

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

export async function isPro(): Promise<boolean> {
  try {
    const status = await getLicenseStatus();
    return status.tier === 'pro';
  } catch (error) {
    console.error('[License] Failed to check license status:', error);
    return false;
  }
}

export async function upgradeToPro(licenseKey: string): Promise<void> {
  // Validate the license key before upgrading
  if (getTierFromKey(licenseKey) !== 'pro') {
    throw new Error('Invalid license key');
  }
  
  const status: LicenseStatus = {
    tier: 'pro',
    purchasedAt: new Date().toISOString(),
    licenseKey
  };
  await setLicenseStatus(status);
}

export async function downgradeToFree(): Promise<void> {
  const status: LicenseStatus = {
    tier: 'free'
  };
  await setLicenseStatus(status);
}

export function getTierFromKey(key: string): LicenseTier {
  if (!key) return 'free';
  
  // Basic validation: key should be 16 characters alphanumeric with hyphens
  // Format: XXXX-XXXX-XXXX-XXXX
  const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!keyPattern.test(key)) return 'free';
  
  // Simple checksum validation (sum of character codes mod 10 should equal last digit)
  const cleanKey = key.replace(/-/g, '');
  const sum = cleanKey.slice(0, -1).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const expectedChecksum = sum % 10;
  const actualChecksum = parseInt(cleanKey.slice(-1), 10);
  
  if (expectedChecksum !== actualChecksum) return 'free';
  
  return 'pro';
}