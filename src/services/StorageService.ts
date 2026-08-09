/**
 * StorageService - Handles all browser storage operations
 * Provides a clean interface for sync and local storage
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';
import { StorageData, TimerSettings, ExtensionSettings } from '../types';

class StorageService {
  /**
   * Get values from browser storage
   * @param keys - Key or array of keys to retrieve
   * @returns Promise with the retrieved values
   */
  static async get<T extends keyof StorageData>(keys: T[]): Promise<Pick<StorageData, T>>;
  static async get(keys: string | string[]): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
      browser.storage.sync.get(keys, (result) => {
        if (browser.runtime.lastError) {
          reject(new Error(browser.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  /**
   * Set values in browser storage
   * @param items - Object with key-value pairs to store
   * @returns Promise that resolves when complete
   */
  static async set(items: Partial<StorageData>): Promise<void> {
    return new Promise((resolve, reject) => {
      browser.storage.sync.set(items, () => {
        if (browser.runtime.lastError) {
          reject(new Error(browser.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Remove keys from browser storage
   * @param keys - Key or array of keys to remove
   * @returns Promise that resolves when complete
   */
  static async remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      browser.storage.sync.remove(keys, () => {
        if (browser.runtime.lastError) {
          reject(new Error(browser.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  /**
   * Get timer-related settings
   * @returns Promise with timer settings
   */
  static async getTimerSettings(): Promise<TimerSettings> {
    const result = await this.get([
      'sidebarChecked',
      'soundChecked',
      'notificationChecked',
      'startTime',
      'timerRunning',
      'timeLength'
    ]);
    
    return {
      timerRunning: result.timerRunning || false,
      startTime: result.startTime || 0,
      timeLength: result.timeLength || 0,
    };
  }

  /**
   * Get extension settings
   * @returns Promise with extension settings
   */
  static async getExtensionSettings(): Promise<ExtensionSettings> {
    const result = await this.get([
      'sidebarChecked',
      'soundChecked',
      'notificationChecked',
    ]);
    
    return {
      sidebarChecked: result.sidebarChecked || false,
      soundChecked: result.soundChecked || false,
      notificationChecked: result.notificationChecked || false,
    };
  }

  /**
   * Save timer settings
   * @param settings - Timer settings to save
   * @returns Promise that resolves when complete
   */
  static async saveTimerSettings(settings: Partial<TimerSettings>): Promise<void> {
    await this.set({
      timerRunning: settings.timerRunning,
      startTime: settings.startTime,
      timeLength: settings.timeLength,
    });
  }

  /**
   * Save extension settings
   * @param settings - Extension settings to save
   * @returns Promise that resolves when complete
   */
  static async saveExtensionSettings(settings: Partial<ExtensionSettings>): Promise<void> {
    await this.set({
      sidebarChecked: settings.sidebarChecked,
      soundChecked: settings.soundChecked,
      notificationChecked: settings.notificationChecked,
    });
  }

  /**
   * Clear timer
   * @returns Promise that resolves when complete
   */
  static async clearTimer(): Promise<void> {
    await this.set({
      startTime: 0,
      timerRunning: false,
      timeLength: 0
    });
  }

  /**
   * Clear all settings
   * @returns Promise that resolves when complete
   */
  static async clearAll(): Promise<void> {
    await this.remove([
      'sidebarChecked',
      'soundChecked',
      'notificationChecked',
      'startTime',
      'timerRunning',
      'timeLength'
    ]);
  }
}

export default StorageService;
