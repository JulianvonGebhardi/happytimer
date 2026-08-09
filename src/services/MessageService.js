/**
 * MessageService - Handles browser extension messaging
 * Provides a clean interface for sending and receiving messages
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';

class MessageService {
  constructor() {
    this.listeners = new Map();
    this.messageListener = this.handleMessage.bind(this);
  }

  /**
   * Initialize message listener
   */
  init() {
    browser.runtime.onMessage.addListener(this.messageListener);
  }

  /**
   * Cleanup message listener
   */
  destroy() {
    if (this.messageListener) {
      browser.runtime.onMessage.removeListener(this.messageListener);
    }
  }

  /**
   * Handle incoming messages
   * @param {Object} request - Message request
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response callback
   */
  handleMessage(request, sender, sendResponse) {
    const listener = this.listeners.get(request.event);
    if (listener) {
      return listener(request, sender, sendResponse);
    }
    return true;
  }

  /**
   * Add a message listener for a specific event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    this.listeners.set(event, callback);
  }

  /**
   * Remove a message listener
   * @param {string} event - Event name
   */
  off(event) {
    this.listeners.delete(event);
  }

  /**
   * Send a message to the background script
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} - Response from background script
   */
  static async sendMessage(message) {
    return new Promise((resolve, reject) => {
      browser.runtime.sendMessage(message, (response) => {
        if (browser.runtime.lastError) {
          reject(new Error(browser.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }

  /**
   * Send a message to a specific tab
   * @param {number} tabId - Tab ID
   * @param {Object} message - Message to send
   * @returns {Promise<Object>}
   */
  static async sendMessageToTab(tabId, message) {
    return new Promise((resolve, reject) => {
      browser.tabs.sendMessage(tabId, message, (response) => {
        if (browser.runtime.lastError) {
          reject(new Error(browser.runtime.lastError.message));
          return;
        }
        resolve(response);
      });
    });
  }
}

// Singleton instance
const messageService = new MessageService();

export default messageService;
export { MessageService };
