/**
 * StorageService - Handles all Chrome/Firefox storage operations
 * Provides a clean interface for sync and local storage
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';

class StorageService {
  /**
   * Get values from browser storage
   * @param {string|string[]} keys - Key or array of keys to retrieve
   * @returns {Promise<Object>} - Object with the retrieved values
   */
  static async get(keys) {
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
   * @param {Object} items - Object with key-value pairs to store
   * @returns {Promise<void>}
   */
  static async set(items) {
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
   * @param {string|string[]} keys - Key or array of keys to remove
   * @returns {Promise<void>}
   */
  static async remove(keys) {
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
   * @returns {Promise<Object>}
   */
  static async getTimerSettings() {
    const result = await this.get([
      'sidebarChecked',
      'soundChecked',
      'notificationChecked',
      'startTime',
      'timerRunning',
      'timeLength'
    ]);
    
    return {
      sidebarChecked: result.sidebarChecked || false,
      soundChecked: result.soundChecked || false,
      notificationChecked: result.notificationChecked || false,
      startTime: result.startTime || 0,
      timerRunning: result.timerRunning || false,
      timeLength: result.timeLength || 0
    };
  }

  /**
   * Save timer settings
   * @param {Object} settings - Timer settings to save
   * @returns {Promise<void>}
   */
  static async saveTimerSettings(settings) {
    await this.set({
      sidebarChecked: settings.sidebarChecked,
      soundChecked: settings.soundChecked,
      notificationChecked: settings.notificationChecked,
      startTime: settings.startTime,
      timerRunning: settings.timerRunning,
      timeLength: settings.timeLength
    });
  }

  /**
   * Clear timer
   * @returns {Promise<void>}
   */
  static async clearTimer() {
    await this.set({
      startTime: 0,
      timerRunning: false,
      timeLength: 0
    });
  }
}

export default StorageService;
