/**
 * App - Main popup component for the HappyTimer extension
 * Handles settings and timer display in the extension popup
 * Uses webextension-polyfill for cross-browser compatibility
 */

import React, { useEffect, useState, useCallback } from 'react';
import browser from 'webextension-polyfill';
import Switch from 'react-switch';
import logo from './happy-timer-logo.svg';
import iconsettings from './Icon-settings.svg';
import ErrorBoundary from './components/ErrorBoundary';
import useSettings from './hooks/useSettings';
import useTimer from './hooks/useTimer';
import TimerService from './services/TimerService';

import './App.css';

const App = () => {
  const { settings, isLoading, error, toggleSidebar, toggleSound, toggleNotification } = useSettings();
  const { 
    timerRunning, 
    startTime, 
    timeLength, 
    getMinutes, 
    getSeconds 
  } = useTimer();

  const [version] = useState('2.0.0');

  // Handle timer expiration check
  useEffect(() => {
    const checkTimerExpiration = async () => {
      if (timerRunning && TimerService.isTimerExpired(startTime, timeLength)) {
        // Timer has expired, trigger notification if enabled
        if (settings.notificationChecked) {
          await TimerService.showNotification(
            'HappyTimer',
            'Your timer has expired!'
          );
        }
        if (settings.soundChecked) {
          await TimerService.playAlert();
        }
      }
    };

    checkTimerExpiration();
  }, [timerRunning, startTime, timeLength, settings.notificationChecked, settings.soundChecked]);

  const handleChangeSidebar = useCallback(async () => {
    await toggleSidebar();
  }, [toggleSidebar]);

  const handleChangeSound = useCallback(async () => {
    await toggleSound();
  }, [toggleSound]);

  const handleChangeNotification = useCallback(async () => {
    await toggleNotification();
  }, [toggleNotification]);

  // Show timer display if timer is running and not expired
  const showTimerDisplay = timerRunning && 
    TimerService.getRemainingTime(startTime, timeLength) > 0;

  if (isLoading) {
    return (
      <div className="popup_container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popup_container">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="popup_container">
        <div 
          className="extensionLogo" 
          style={{ backgroundImage: `url(${browser.runtime.getURL(logo)})` }}
        />
        <div className="extensionVersion">Version {version}</div>
        
        <div className="extContent">
          <div className="row">
            <p className="text">Timer Sidebar Icon</p>
            <Switch 
              className="switch"
              height={17.5} 
              width={39.22} 
              offColor="#FDF1C3" 
              onColor='#FAD961'
              checkedIcon={false} 
              uncheckedIcon={false}
              onChange={handleChangeSidebar} 
              checked={settings.sidebarChecked}
            />
          </div>
          
          <div className="row">
            <p className="text">Sound when the timer hits zero</p>
            <Switch 
              className="switch"
              height={17.5} 
              width={39.22} 
              offColor="#FDF1C3" 
              onColor='#FAD961'
              checkedIcon={false} 
              uncheckedIcon={false}
              onChange={handleChangeSound} 
              checked={settings.soundChecked}
            />
          </div>
          
          <div className="row">
            <p className="text">Desktop notification when timer hits zero</p>
            <Switch 
              className="switch"
              height={17.5} 
              width={39.22} 
              offColor="#FDF1C3" 
              onColor='#FAD961'
              checkedIcon={false} 
              uncheckedIcon={false}
              onChange={handleChangeNotification} 
              checked={settings.notificationChecked}
            />
          </div>
        </div>

        <div className="middleContent">
          {!showTimerDisplay ? (
            <p className="text">
              &ldquo;The only permanent form of happiness lies in the consciousness of productivity.&rdquo;
            </p>
          ) : (
            <p className="timeRuned">
              Timer:&nbsp;
              {getMinutes()}: 
              {getSeconds()}
            </p>
          )}
          <p className="author">- Carl Zuckmayer</p>
        </div>

        <div className="feedbackContainer">
          <a 
            className="feedbackLink" 
            href="https://airtable.com/shrpzD6EmFLs6R2sK"
            onClick={(e) => {
              e.preventDefault();
              // Use browser.tabs for cross-browser compatibility
              browser.tabs.create({ 
                url: 'https://airtable.com/shrpzD6EmFLs6R2sK' 
              });
            }}
          >
            Send Feedback
          </a>
          <div 
            className="settings" 
            style={{ backgroundImage: `url(${browser.runtime.getURL(iconsettings)})` }}
            onClick={() => {
              // Use browser.runtime for cross-browser compatibility
              const optionsUrl = process.env.IS_FIREFOX 
                ? 'about:addons' 
                : 'chrome://extensions/?options=' + browser.runtime.id;
              browser.tabs.create({ url: optionsUrl });
            }}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
