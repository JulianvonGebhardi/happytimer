/**
 * background.js - Service worker for Manifest V3
 * Handles background tasks, notifications, and message passing
 * Uses webextension-polyfill for cross-browser compatibility
 */

import browser from 'webextension-polyfill';

// Timer check interval (1 second)
const TIMER_CHECK_INTERVAL = 1000;

// Store the timer interval ID
let timerInterval = null;

// Initialize the background service worker
function init() {
  setupMessageListeners();
  setupTimerCheck();
  setupNotificationListeners();
}

/**
 * Set up message listeners
 */
function setupMessageListeners() {
  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.event) {
      case 'toggleSidebar':
        handleToggleSidebar();
        break;
      case 'startTimer':
        handleStartTimer(request);
        break;
      case 'stopTimer':
        handleStopTimer();
        break;
      default:
        break;
    }
    return true;
  });
}

/**
 * Handle toggle sidebar message
 */
function handleToggleSidebar() {
  browser.tabs.query({ currentWindow: true, active: true }).then((tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      browser.tabs.sendMessage(activeTab.id, { event: 'toggleSidebar' })
        .catch(() => {
          // Tab might not have the content script loaded yet
          console.log('Tab not ready for message');
        });
    }
  }).catch(error => {
    console.error('Error in handleToggleSidebar:', error);
  });
}

/**
 * Handle start timer message
 */
function handleStartTimer(request) {
  // Timer is managed in the content script, just acknowledge
  console.log('Timer started:', request);
}

/**
 * Handle stop timer message
 */
function handleStopTimer() {
  // Timer is managed in the content script, just acknowledge
  console.log('Timer stopped');
}

/**
 * Set up timer check interval
 */
function setupTimerCheck() {
  // Clear any existing interval
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    checkTimerStatus();
  }, TIMER_CHECK_INTERVAL);
}

/**
 * Check timer status and trigger notifications
 */
async function checkTimerStatus() {
  try {
    const result = await browser.storage.sync.get([
      'soundChecked',
      'notificationChecked',
      'startTime',
      'timerRunning',
      'timeLength'
    ]);

    if (!result.timerRunning) {
      return;
    }

    const elapsedSeconds = (Date.now() - result.startTime) / 1000;
    const remainingSeconds = result.timeLength * 60 - elapsedSeconds;

    if (remainingSeconds <= 0) {
      // Timer has expired
      if (result.notificationChecked) {
        await showNotification();
      }

      if (result.soundChecked) {
        await triggerAlert();
      } else {
        await finishTimer();
      }
    }
  } catch (error) {
    console.error('Error checking timer status:', error);
  }
}

/**
 * Show desktop notification
 */
async function showNotification() {
  try {
    // Check if we have permission
    const permission = await browser.notifications.getPermissionLevel();
    
    if (permission !== 'granted') {
      // Request permission
      await browser.notifications.requestPermission();
    }

    if (permission === 'granted' || (await browser.notifications.getPermissionLevel()) === 'granted') {
      await browser.notifications.create('happytimer-expired', {
        type: 'basic',
        iconUrl: browser.runtime.getURL('happy-timer-icon.svg'),
        title: 'Your time has run out',
        message: 'Great work!\nYour focus session is over.'
      });
    }
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Trigger alert in active tab
 */
async function triggerAlert() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const activeTab = tabs[0];
    
    if (activeTab && activeTab.id && activeTab.url) {
      const urlParts = activeTab.url.split('://');
      if (urlParts[0] === 'http' || urlParts[0] === 'https') {
        await browser.storage.sync.set({
          startTime: 0,
          timerRunning: false,
          timeLength: 0
        });
        
        await browser.tabs.sendMessage(activeTab.id, { event: 'alert' });
      }
    }
  } catch (error) {
    console.error('Error triggering alert:', error);
  }
}

/**
 * Finish timer without sound
 */
async function finishTimer() {
  try {
    const tabs = await browser.tabs.query({ currentWindow: true, active: true });
    const activeTab = tabs[0];
    
    if (activeTab && activeTab.id && activeTab.url) {
      const urlParts = activeTab.url.split('://');
      if (urlParts[0] === 'http' || urlParts[0] === 'https') {
        await browser.storage.sync.set({
          startTime: 0,
          timerRunning: false,
          timeLength: 0
        });
        
        await browser.tabs.sendMessage(activeTab.id, { event: 'finishTimer' });
      }
    }
  } catch (error) {
    console.error('Error finishing timer:', error);
  }
}

/**
 * Set up notification listeners
 */
function setupNotificationListeners() {
  browser.notifications.onClosed.addListener(() => {
    // Clear timer when notification is closed
    browser.storage.sync.set({
      startTime: 0,
      timerRunning: false,
      timeLength: 0
    }).catch(error => {
      console.error('Error clearing timer:', error);
    });
  });
}

// Initialize when the service worker starts
init();

// Handle service worker installation
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('HappyTimer installed');
    // Set default settings on first install
    browser.storage.sync.get(['sidebarChecked']).then((result) => {
      if (result.sidebarChecked === undefined) {
        browser.storage.sync.set({ sidebarChecked: true });
      }
    }).catch(error => {
      console.error('Error setting default settings:', error);
    });
  } else if (details.reason === 'update') {
    console.log('HappyTimer updated to version', browser.runtime.getManifest().version);
  }
});

// Cleanup on service worker shutdown
browser.runtime.onSuspend.addListener(() => {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
});
