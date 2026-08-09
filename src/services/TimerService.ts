/**
 * TimerService - Handles all timer-related logic
 * Provides timer calculations, formatting, and management
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';

class TimerService {
  /**
   * Calculate remaining time in seconds
   * @param startTime - Timer start timestamp
   * @param timeLength - Timer duration in seconds
   * @returns Remaining time in seconds
   */
  static getRemainingTime(startTime: number, timeLength: number): number {
    const elapsed = (Date.now() - startTime) / 1000;
    return Math.max(0, timeLength - elapsed);
  }

  /**
   * Check if timer is expired
   * @param startTime - Timer start timestamp
   * @param timeLength - Timer duration in seconds
   * @returns True if timer is expired
   */
  static isTimerExpired(startTime: number, timeLength: number): boolean {
    return this.getRemainingTime(startTime, timeLength) <= 0;
  }

  /**
   * Check if timer is running and not expired
   * @param startTime - Timer start timestamp
   * @param timeLength - Timer duration in seconds
   * @param timerRunning - Whether timer is running
   * @returns True if timer is active
   */
  static isTimerActive(
    startTime: number,
    timeLength: number,
    timerRunning: boolean
  ): boolean {
    if (!timerRunning) return false;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    return elapsedMinutes < timeLength;
  }

  /**
   * Format seconds as MM:SS
   * @param totalSeconds - Total seconds to format
   * @returns Formatted time string (MM:SS)
   */
  static formatTime(totalSeconds: number): string {
    const minutes = Math.trunc(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${this.padZero(minutes)}:${this.padZero(seconds)}`;
  }

  /**
   * Get minutes from remaining time
   * @param startTime - Timer start timestamp
   * @param timeLength - Timer duration in seconds
   * @returns Formatted minutes string
   */
  static getMinutes(startTime: number, timeLength: number): string {
    const remaining = this.getRemainingTime(startTime, timeLength);
    const minutes = Math.trunc(remaining / 60);
    return this.padZero(minutes);
  }

  /**
   * Get seconds from remaining time
   * @param startTime - Timer start timestamp
   * @param timeLength - Timer duration in seconds
   * @returns Formatted seconds string
   */
  static getSeconds(startTime: number, timeLength: number): string {
    const remaining = this.getRemainingTime(startTime, timeLength);
    const seconds = Math.floor(remaining % 60);
    return this.padZero(seconds);
  }

  /**
   * Calculate opacity for time animation (0-1)
   * @param startTime - Timer start timestamp
   * @param timeLength - Timer duration in seconds
   * @returns Opacity value (0-1)
   */
  static getOpacity(startTime: number, timeLength: number): number {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const progress = 3 * Math.round(elapsedSeconds);
    return (9 - Math.min(progress, 9)) / 10;
  }

  /**
   * Round time input (convert comma to dot, ensure minimum 1)
   * @param time - Time string to round
   * @returns Rounded time as number
   */
  static roundTime(time: string): number {
    const numericTime = Number(time.replace(',', '.'));
    return numericTime <= 1 ? 1 : Math.round(numericTime);
  }

  /**
   * Pad number with leading zero
   * @param num - Number to pad
   * @returns Padded string
   */
  static padZero(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  /**
   * Play alert sound
   * @returns Promise that resolves when sound finishes playing
   */
  static async playAlert(): Promise<void> {
    try {
      const audio = new Audio(browser.runtime.getURL('/static/media/alert.wav'));
      await audio.play();
    } catch (error) {
      console.error('Failed to play alert sound:', error);
    }
  }

  /**
   * Show desktop notification
   * @param title - Notification title
   * @param message - Notification message
   * @returns Promise that resolves when notification is shown
   */
  static async showNotification(title: string, message: string): Promise<void> {
    try {
      // Check permission
      const permission = await browser.notifications.getPermissionLevel();
      
      if (permission !== 'granted') {
        await browser.notifications.requestPermission();
      }
      
      const currentPermission = await browser.notifications.getPermissionLevel();
      if (currentPermission === 'granted') {
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
