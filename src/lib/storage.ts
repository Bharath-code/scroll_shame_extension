import type { DayData } from './scoring';
import type { LicenseStatus } from './license';
import type { RoastVoice } from './roast-pools';

export interface StorageAdapter {
  getDaily(dateKey: string): Promise<DayData>;
  setDaily(dateKey: string, data: DayData): Promise<void>;
  getRange(startDate: string, endDate: string): Promise<DayData[]>;
  getSettings(): Promise<ExtensionSettings>;
  setSettings(settings: ExtensionSettings): Promise<void>;
  getLicenseStatus(): Promise<LicenseStatus>;
  setLicenseStatus(status: LicenseStatus): Promise<void>;
}

const DEFAULT_LICENSE: LicenseStatus = {
  tier: 'free'
};

export interface ExtensionSettings {
  notificationTime: string;
  trackTabCount: boolean;
  trackScrollVelocity: boolean;
  trackLateNight: boolean;
  trackTabChurn: boolean;
  trackSessionLength: boolean;
  roastVoice: RoastVoice;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  notificationTime: 'monday-9am',
  trackTabCount: true,
  trackScrollVelocity: true,
  trackLateNight: true,
  trackTabChurn: true,
  trackSessionLength: true,
  roastVoice: 'therapist'
};

export class ChromeStorageAdapter implements StorageAdapter {
  async getDaily(dateKey: string): Promise<DayData> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(dateKey, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[dateKey] || {});
        }
      });
    });
  }

  async setDaily(dateKey: string, data: DayData): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [dateKey]: data }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async getRange(startDate: string, endDate: string): Promise<DayData[]> {
    const days = this.getDateKeysInRange(startDate, endDate);
    return Promise.all(days.map(day => this.getDaily(day)));
  }

  async getSettings(): Promise<ExtensionSettings> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('settings', (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result.settings || DEFAULT_SETTINGS);
        }
      });
    });
  }

  async setSettings(settings: ExtensionSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ settings }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  async getLicenseStatus(): Promise<LicenseStatus> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('license-status', (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result['license-status'] || DEFAULT_LICENSE);
        }
      });
    });
  }

  async setLicenseStatus(status: LicenseStatus): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ 'license-status': status }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  private getDateKeysInRange(start: string, end: string): string[] {
    const keys: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    for (let d = new Date(startDate); d <= endDate; d = new Date(d.getTime() + 86400000)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      keys.push(`day-${year}-${month}-${day}`);
    }

    return keys;
  }
}

export const storage = new ChromeStorageAdapter();