/**
 * MessageService - Handles browser extension messaging
 * Provides a clean interface for sending and receiving messages
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';
import { ExtensionMessage, MessageEvent } from '../types';

class MessageService {
  private listeners: Map<MessageEvent, (request: any, sender: any, sendResponse: (response?: any) => void) => void>;
  private messageListener: (request: any, sender: any, sendResponse: (response?: any) => void) => boolean | Promise<boolean>;

  constructor() {
    this.listeners = new Map();
    this.messageListener = this.handleMessage.bind(this);
  }

  /**
   * Initialize message listener
   */
  init(): void {
    browser.runtime.onMessage.addListener(this.messageListener);
  }

  /**
   * Cleanup message listener
   */
  destroy(): void {
    if (this.messageListener) {
      browser.runtime.onMessage.removeListener(this.messageListener);
    }
  }

  /**
   * Handle incoming messages
   * @param request - Message request
   * @param sender - Message sender
   * @param sendResponse - Response callback
   * @returns True to indicate async response
   */
  private handleMessage(
    request: ExtensionMessage,
    sender: any,
    sendResponse: (response?: any) => void
  ): boolean {
    const listener = this.listeners.get(request.event);
    if (listener) {
      return listener(request, sender, sendResponse) as boolean;
    }
    return true;
  }

  /**
   * Add a message listener for a specific event
   * @param event - Event name
   * @param callback - Callback function
   */
  on(event: MessageEvent, callback: (request: any, sender: any, sendResponse: (response?: any) => void) => void): void {
    this.listeners.set(event, callback);
  }

  /**
   * Remove a message listener
   * @param event - Event name
   */
  off(event: MessageEvent): void {
    this.listeners.delete(event);
  }

  /**
   * Send a message to the background script
   * @param message - Message to send
   * @returns Promise with the response from background script
   */
  static async sendMessage<T = any>(message: ExtensionMessage): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      browser.runtime.sendMessage(message, (response: T) => {
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
   * @param tabId - Tab ID
   * @param message - Message to send
   * @returns Promise with the response from the tab
   */
  static async sendMessageToTab<T = any>(tabId: number, message: ExtensionMessage): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      browser.tabs.sendMessage(tabId, message, (response: T) => {
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
