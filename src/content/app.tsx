/**
 * App - Main component for the injected timer UI
 * Handles sidebar timer, popups, and user interactions
 * Uses improved drag and drop with useSideIconDrag hook
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import browser from 'webextension-polyfill';
import ErrorBoundary from '../components/ErrorBoundary';
import SideTimer from './sideTimer';
import MainPopup from './mainPopup';
import RunOutPopup from './runOutPopup';
import TimeRunning from './timeRunning';
import TimeAnimation from './timeAnimation';
import SideArrow from './sideArrow';
import alertWav from '../alert.wav';
import StorageService from '../services/StorageService';
import TimerService from '../services/TimerService';
import MessageService from '../services/MessageService';
import { useSideIconDrag } from '../hooks/useSideIconDrag';

interface AppState {
  sidebarTimer: boolean;
  mainPopup: boolean;
  timeRunning: boolean;
  runOut: boolean;
  timerRunning: boolean;
  startTime: number;
  timeLength: number;
  currentTime: number;
  isOpen: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    sidebarTimer: false,
    mainPopup: false,
    timeRunning: false,
    runOut: false,
    timerRunning: false,
    startTime: 0,
    timeLength: 0,
    currentTime: Date.now(),
    isOpen: false,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const messageListenerRef = useRef<((request: any, sender: any, sendResponse: (response?: any) => void) => boolean | Promise<boolean>) | null>(null);

  // Use improved drag and drop for side icons
  const sideArrowDrag = useSideIconDrag({
    storageKey: 'sideArrowPosition',
    minY: -200,
    maxY: 200,
  });

  const sideTimerDrag = useSideIconDrag({
    storageKey: 'sideTimerPosition',
    minY: -200,
    maxY: 200,
  });

  // Initialize message listener
  useEffect(() => {
    const handleMessage = (request: { event: string }, sender: any, sendResponse: (response?: any) => void): boolean => {
      switch (request.event) {
        case 'toggleSidebar':
          checkSidebarStatus();
          break;
        case 'alert':
          handleAlert();
          break;
        case 'finishTimer':
          handleFinishTimer();
          break;
        default:
          break;
      }
      return true;
    };

    // Add message listener
    browser.runtime.onMessage.addListener(handleMessage);
    messageListenerRef.current = handleMessage;

    // Initial checks
    checkSidebarStatus();
    checkTimer();

    // Cleanup on unmount
    return () => {
      if (messageListenerRef.current) {
        browser.runtime.onMessage.removeListener(messageListenerRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Check sidebar status from storage
  const checkSidebarStatus = useCallback(async () => {
    try {
      const result = await StorageService.get(['sidebarChecked']);
      setState(prev => ({
        ...prev,
        sidebarTimer: result.sidebarChecked || false,
      }));
    } catch (error) {
      console.error('Failed to check sidebar status:', error);
    }
  }, []);

  // Check timer status from storage
  const checkTimer = useCallback(async () => {
    try {
      const result = await StorageService.get([
        'startTime',
        'timerRunning',
        'timeLength'
      ]);

      const timerRunning = result.timerRunning || false;
      const startTime = result.startTime || 0;
      const timeLength = (result.timeLength || 0) * 60;

      setState(prev => ({
        ...prev,
        timerRunning,
        startTime,
        timeLength,
        currentTime: Date.now(),
      }));

      // Start timer if it should be running
      if (timerRunning && TimerService.isTimerActive(startTime, timeLength, timerRunning)) {
        startTimerInternal();
      }
    } catch (error) {
      console.error('Failed to check timer:', error);
    }
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
          // Timer expired
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

  // Handle alert message
  const handleAlert = useCallback(async () => {
    closeMainPopup();
    closeTimeRunningPopup();
    openRunOut();
    await alarmAlert();
    
    try {
      await StorageService.set({ timerRunning: false });
      setState(prev => ({ ...prev, timerRunning: false }));
    } catch (error) {
      console.error('Failed to update timer status:', error);
    }
  }, []);

  // Handle finish timer message
  const handleFinishTimer = useCallback(() => {
    closeMainPopup();
    closeTimeRunningPopup();
    openRunOut();
    setState(prev => ({ ...prev, timerRunning: false }));
  }, []);

  // Open main popup
  const openMainPopup = useCallback((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (state.isOpen) return;

    StorageService.get(['timerRunning']).then((result) => {
      if (result.timerRunning) {
        closeMainPopup();
        openTimeRunning();
      } else {
        setState(prev => ({ ...prev, mainPopup: true, isOpen: true }));
      }
    }).catch(error => {
      console.error('Failed to check timer running status:', error);
    });
  }, [state.isOpen]);

  // Open time running popup
  const openTimeRunning = useCallback(() => {
    setState(prev => ({ ...prev, timeRunning: true, isOpen: true }));
  }, []);

  // Open run out popup
  const openRunOut = useCallback(() => {
    setState(prev => ({ ...prev, runOut: true, isOpen: true }));
  }, []);

  // Close main popup
  const closeMainPopup = useCallback(() => {
    setState(prev => ({ ...prev, mainPopup: false, isOpen: false }));
  }, []);

  // Close run out popup
  const closeRunOutPopup = useCallback(() => {
    setState(prev => ({ ...prev, runOut: false, isOpen: false }));
  }, []);

  // Close time running popup
  const closeTimeRunningPopup = useCallback(() => {
    setState(prev => ({ ...prev, timeRunning: false, isOpen: false }));
  }, []);

  // Close all popups
  const closeAll = useCallback(() => {
    setState(prev => ({
      ...prev,
      timeRunning: false,
      runOut: false,
      mainPopup: false,
      isOpen: false,
    }));
  }, []);

  // Set timer
  const setTimer = useCallback(async (time: string) => {
    const currentTime = Date.now();
    const roundedTime = TimerService.roundTime(time);

    try {
      await StorageService.set({
        startTime: currentTime,
        timerRunning: true,
        timeLength: roundedTime,
      });

      setState(prev => ({
        ...prev,
        startTime: currentTime,
        timerRunning: true,
        timeLength: roundedTime * 60,
      }));

      closeMainPopup();
      checkTimer();
    } catch (error) {
      console.error('Failed to set timer:', error);
    }
  }, [checkTimer, closeMainPopup]);

  // Add another timer
  const addAnother = useCallback(() => {
    closeRunOutPopup();
    openMainPopup();
  }, [closeRunOutPopup, openMainPopup]);

  // Play alarm sound
  const alarmAlert = useCallback(async () => {
    try {
      const audio = new Audio(browser.runtime.getURL(alertWav));
      await audio.play();
    } catch (error) {
      console.error('Failed to play alarm:', error);
    }
  }, []);

  // Stop and close time running
  const stopCloseTimeRunning = useCallback(async () => {
    closeTimeRunningPopup();
    try {
      await StorageService.set({
        startTime: 0,
        timerRunning: false,
        timeLength: 0,
      });
      setState(prev => ({
        ...prev,
        startTime: 0,
        timerRunning: false,
        timeLength: 0,
      }));
    } catch (error) {
      console.error('Failed to stop timer:', error);
    }
  }, [closeTimeRunningPopup]);

  // Get seconds for display
  const getSeconds = useCallback(() => {
    const remaining = TimerService.getRemainingTime(state.startTime, state.timeLength);
    const seconds = Math.floor(remaining % 60);
    return TimerService.padZero(seconds - 1);
  }, [state.startTime, state.timeLength]);

  // Get minutes for display
  const getMinute = useCallback(() => {
    const remaining = TimerService.getRemainingTime(state.startTime, state.timeLength);
    const minutes = Math.trunc(remaining / 60);
    return TimerService.padZero(minutes);
  }, [state.startTime, state.timeLength]);

  // Get opacity for animation
  const getOP = useCallback(() => {
    const elapsedSeconds = (state.currentTime - state.startTime) / 1000;
    const progress = 3 * Math.round(elapsedSeconds);
    return (9 - Math.min(progress, 9)) / 10;
  }, [state.currentTime, state.startTime]);

  // Check if timer should be running
  const shouldShowTimerAnimation: boolean = state.timerRunning && getOP() > 0;

  // Sync isOpen state with side icon drag hooks
  useEffect(() => {
    sideArrowDrag.setIsOpen(state.isOpen);
    sideTimerDrag.setIsOpen(state.isOpen);
  }, [state.isOpen, sideArrowDrag, sideTimerDrag]);

  return (
    <ErrorBoundary>
      <div>
        {state.sidebarTimer && (
          <SideTimer
            openMainPopup={openMainPopup}
            isOpen={state.isOpen}
            dragHandlers={sideTimerDrag.handlers}
            dragStyle={sideTimerDrag.style}
          />
        )}

        {state.mainPopup && (
          <MainPopup
            closeMainPopup={closeMainPopup}
            setTimer={setTimer}
          />
        )}

        {state.timeRunning && (
          <TimeRunning
            stopClose={stopCloseTimeRunning}
            closeTimeRunningPopup={closeTimeRunningPopup}
            setTimer={setTimer}
          />
        )}

        {state.runOut && (
          <RunOutPopup
            closeRunOutPopup={closeRunOutPopup}
            addAnother={addAnother}
          />
        )}

        {!state.sidebarTimer && (
          <SideArrow
            isOpen={state.isOpen}
            openMainPopup={openMainPopup}
            closeAll={closeAll}
            dragHandlers={sideArrowDrag.handlers}
            dragStyle={sideArrowDrag.style}
          />
        )}

        {shouldShowTimerAnimation && (
          <TimeAnimation
            time={`${getMinute()}:${getSeconds()}`}
            op={getOP()}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default App;
