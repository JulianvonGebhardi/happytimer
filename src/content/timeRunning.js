/**
 * TimeRunning - Popup shown when timer is running
 * Allows users to see remaining time and modify it
 */

/* global chrome */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TimerService from '../services/TimerService';
import StorageService from '../services/StorageService';

const TimeRunning = ({ closeTimeRunningPopup, stopClose, setTimer }) => {
  const [state, setState] = useState({
    timerRunning: false,
    startTime: 0,
    timeLength: 0,
    currentTime: Date.now(),
    timeValue: '',
  });

  const timerRef = useRef(null);

  // Load timer state from storage
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const result = await StorageService.get([
          'sidebarChecked',
          'soundChecked',
          'notificationChecked',
          'startTime',
          'timerRunning',
          'timeLength'
        ]);

        setState({
          timerRunning: result.timerRunning || false,
          startTime: result.startTime || 0,
          timeLength: (result.timeLength || 0) * 60,
          currentTime: Date.now(),
          timeValue: '',
        });

        // Start timer if it should be running
        if (result.timerRunning && 
            TimerService.isTimerActive(result.startTime, result.timeLength * 60, result.timerRunning)) {
          startTimerInternal();
        }
      } catch (error) {
        console.error('Failed to load timer state:', error);
      }
    };

    loadTimerState();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Start timer interval
  const startTimerInternal = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setState(prev => {
        const remaining = TimerService.getRemainingTime(prev.startTime, prev.timeLength);
        if (remaining <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return prev;
        }
        return { ...prev, currentTime: Date.now() };
      });
    }, 1000);
  }, []);

  // Get seconds for display
  const getSeconds = useCallback(() => {
    const remaining = TimerService.getRemainingTime(state.startTime, state.timeLength);
    const seconds = Math.floor(remaining % 60);
    return TimerService.padZero(seconds);
  }, [state.startTime, state.timeLength]);

  // Get minutes for display
  const getMinute = useCallback(() => {
    const remaining = TimerService.getRemainingTime(state.startTime, state.timeLength);
    const minutes = Math.trunc(remaining / 60);
    return TimerService.padZero(minutes);
  }, [state.startTime, state.timeLength]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setState(prev => ({ ...prev, timeValue: e.target.value }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (state.timeValue.trim()) {
      setTimer(state.timeValue);
      closeTimeRunningPopup();
    }
  }, [state.timeValue, setTimer, closeTimeRunningPopup]);

  // Handle start with new time
  const handleStartNew = useCallback(() => {
    if (state.timeValue.trim()) {
      setTimer(state.timeValue);
      closeTimeRunningPopup();
    }
  }, [state.timeValue, setTimer, closeTimeRunningPopup]);

  // Close on escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closeTimeRunningPopup();
    }
  }, [closeTimeRunningPopup]);

  return (
    <div
      className="timeRunningPopupWrapper"
      onClick={closeTimeRunningPopup}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Timer running"
    >
      <div 
        className="popupContainer" 
        onClick={(e) => { e.stopPropagation(); }}
        role="document"
      >
        <div className="closePopup">
          <button 
            onClick={closeTimeRunningPopup}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="header">Time is running</div>
        
        <div className="timer">
          <p className="timeRuned">
            Timer:&nbsp;
            {getMinute()}:
            {getSeconds()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="timeform">
            <div className="timeInputLabel">Enter your time</div>
            <input
              className="timeInput"
              value={state.timeValue}
              onChange={handleInputChange}
              type="text"
              placeholder="e.g., 25"
              aria-label="New time in minutes"
            />
          </div>
          <div className="timebuttons">
            <button 
              type="button"
              onClick={handleStartNew}
            >
              Start
            </button>
            <button 
              type="button"
              onClick={stopClose}
            >
              Stop & Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeRunning;
