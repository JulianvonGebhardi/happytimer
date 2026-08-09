/**
 * TimerService - Handles all timer-related logic
 * Provides timer calculations, formatting, and management
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';

class TimerService {
  /**
   * Calculate remaining time in seconds
   * @param {number} startTime - Timer start timestamp
   * @param {number} timeLength - Timer duration in seconds
   * @returns {number} - Remaining time in seconds
   */
  static getRemainingTime(startTime, timeLength) {
    const elapsed = (Date.now() - startTime) / 1000;
    return Math.max(0, timeLength - elapsed);
  }

  /**
   * Check if timer is expired
   * @param {number} startTime - Timer start timestamp
   * @param {number} timeLength - Timer duration in seconds
   * @returns {boolean}
   */
  static isTimerExpired(startTime, timeLength) {
    return this.getRemainingTime(startTime, timeLength) <= 0;
  }

  /**
   * Check if timer is running and not expired
   * @param {number} startTime - Timer start timestamp
   * @param {number} timeLength - Timer duration in seconds
   * @param {boolean} timerRunning - Whether timer is running
   * @returns {boolean}
   */
  static isTimerActive(startTime, timeLength, timerRunning) {
    if (!timerRunning) return false;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    return elapsedMinutes < timeLength;
  }

  /**
   * Format seconds as MM:SS
   * @param {number} totalSeconds - Total seconds to format
   * @returns {string} - Formatted time string
   */
  static formatTime(totalSeconds) {
    const minutes = Math.trunc(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  /**
   * Get minutes from remaining time
   * @param {number} startTime - Timer start timestamp
   * @param {number} timeLength - Timer duration in seconds
   * @returns {string} - Formatted minutes
   */
  static getMinutes(startTime, timeLength) {
    const remaining = this.getRemainingTime(startTime, timeLength);
    const minutes = Math.trunc(remaining / 60);
    return this.padZero(minutes);
  }

  /**
   * Get seconds from remaining time
   * @param {number} startTime - Timer start timestamp
   * @param {number} timeLength - Timer duration in seconds
   * @returns {string} - Formatted seconds
   */
  static getSeconds(startTime, timeLength) {
    const remaining = this.getRemainingTime(startTime, timeLength);
    const seconds = Math.floor(remaining % 60);
    return this.padZero(seconds);
  }

  /**
   * Calculate opacity for time animation (0-1)
   * @param {number} startTime - Timer start timestamp
   * @param {number} timeLength - Timer duration in seconds
   * @returns {number} - Opacity value (0-1)
   */
  static getOpacity(startTime, timeLength) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const progress = 3 * Math.round(elapsedSeconds);
    return (9 - Math.min(progress, 9)) / 10;
  }

  /**
   * Round time input (convert comma to dot, ensure minimum 1)
   * @param {string} time - Time string to round
   * @returns {number} - Rounded time
   */
  static roundTime(time) {
    const numericTime = Number(time.replace(',', '.'));
    return numericTime <= 1 ? 1 : Math.round(numericTime);
  }

  /**
   * Pad number with leading zero
   * @param {number} num - Number to pad
   * @returns {string} - Padded string
   */
  static padZero(num) {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Play alert sound
   * @returns {Promise<void>}
   */
  static async playAlert() {
    try {
      const audio = new Audio(browser.runtime.getURL('/static/media/alert.wav'));
      await audio.play();
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  /**
   * Show desktop notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @returns {Promise<void>}
   */
  static async showNotification(title, message) {
    try {
      // Check permission
      const permission = await browser.notifications.getPermissionLevel();
      
      if (permission !== 'granted') {
        await browser.notifications.requestPermission();
      }
      
      if (permission === 'granted' || (await browser.notifications.getPermissionLevel()) === 'granted') {
        await browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('/static/media/happy-timer-icon.svg'),
          title,
          message
        });
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }
}

export default TimerService;
