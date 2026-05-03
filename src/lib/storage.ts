import type { DayData } from './scoring';
import type { LicenseStatus } from './license';
import type { RoastVoice } from './roast-pools';
import { keyForDate } from './date-key';

export interface StorageAdapter {
  getDaily(dateKey: string): Promise<DayData>;
  setDaily(dateKey: string, data: DayData): Promise<void>;
  getRange(startDate: string, endDate: string): Promise<DayData[]>;
  getSettings(): Promise<ExtensionSettings>;
  setSettings(settings: ExtensionSettings): Promise<void>;
  getLicenseStatus(): Promise<LicenseStatus>;
  setLicenseStatus(status: LicenseStatus): Promise<void>;
  /** Returns the chaos score saved for the previous ISO week, or null if none. */
  getLastWeekScore(): Promise<number | null>;
  /** Persists the chaos score for the current ISO week. */
  saveWeekScore(score: number): Promise<void>;
  /** Returns current chaos streak (consecutive weeks with a report opened). */
  getChaosStreak(): Promise<number>;
  /** Increments streak if first open this week, resets if a week was missed. Returns new streak. */
  updateStreak(): Promise<number>;
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
  osHarassmentEnabled: boolean;
  tabHijackingEnabled: boolean;
  touchGrassEnabled: boolean;
}

const DEFAULT_SETTINGS: ExtensionSettings = {
  notificationTime: 'monday-9am',
  trackTabCount: true,
  trackScrollVelocity: true,
  trackLateNight: true,
  trackTabChurn: true,
  trackSessionLength: true,
  roastVoice: 'therapist',
  osHarassmentEnabled: false,
  tabHijackingEnabled: false,
  touchGrassEnabled: false
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

  // ─── Week Score Persistence ───────────────────────────────────────────────

  /**
   * Returns the ISO week key for a given date, e.g. "2024-W18".
   * This is separate from daily keys so week scores don't collide with day data.
   */
  private isoWeekKey(date: Date): string {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    // Shift to Thursday to correctly determine the ISO week year
    d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
    const yearStart = new Date(d.getFullYear(), 0, 4);
    const week = 1 + Math.round(
      ((d.getTime() - yearStart.getTime()) / 86_400_000 - 3 + ((yearStart.getDay() + 6) % 7)) / 7,
    );
    return `${d.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  async getLastWeekScore(): Promise<number | null> {
    const now  = new Date();
    const prev = new Date(now);
    prev.setDate(prev.getDate() - 7);
    const key = `week-score-${this.isoWeekKey(prev)}`;
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        const val = result[key];
        resolve(typeof val === 'number' ? val : null);
      });
    });
  }

  async saveWeekScore(score: number): Promise<void> {
    const key = `week-score-${this.isoWeekKey(new Date())}`;
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: score }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  // ─── Streak (TASK-11) ──────────────────────────────────────────────────

  private STREAK_KEY         = 'chaos-streak-count';
  private STREAK_LAST_WEEK   = 'chaos-streak-last-week';

  async getChaosStreak(): Promise<number> {
    return new Promise(resolve => {
      chrome.storage.local.get(this.STREAK_KEY, r =>
        resolve(typeof r[this.STREAK_KEY] === 'number' ? r[this.STREAK_KEY] : 0)
      );
    });
  }

  async updateStreak(): Promise<number> {
    const currentWeek = this.isoWeekKey(new Date());

    return new Promise(resolve => {
      chrome.storage.local.get([this.STREAK_KEY, this.STREAK_LAST_WEEK], result => {
        const lastWeek    = result[this.STREAK_LAST_WEEK] as string | undefined;
        const streak      = (result[this.STREAK_KEY] as number) || 0;

        // Already counted this week — don't double-increment
        if (lastWeek === currentWeek) {
          resolve(streak);
          return;
        }

        // Check if last opened week was the immediately previous ISO week
        const prevWeek = this.isoWeekKey(new Date(Date.now() - 7 * 86_400_000));
        const newStreak = lastWeek === prevWeek ? streak + 1 : 1;

        chrome.storage.local.set({
          [this.STREAK_KEY]:       newStreak,
          [this.STREAK_LAST_WEEK]: currentWeek,
        }, () => resolve(newStreak));
      });
    });
  }

  private getDateKeysInRange(start: string, end: string): string[] {
    const keys: string[] = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return keys;
    }

    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    const last = new Date(endDate);
    last.setHours(0, 0, 0, 0);

    while (current <= last) {
      keys.push(keyForDate(new Date(current)));
      current.setDate(current.getDate() + 1);
    }

    return keys;
  }
}

export const storage = new ChromeStorageAdapter();