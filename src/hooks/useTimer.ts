/**
 * useTimer - Custom hook for timer functionality
 * Manages timer state, calculations, and updates
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import TimerService from '../services/TimerService';
import StorageService from '../services/StorageService';

interface TimerState {
  timerRunning: boolean;
  startTime: number;
  timeLength: number;
  currentTime: number;
}

interface TimerResult extends TimerState {
  startTimer: (durationMinutes: string | number) => Promise<void>;
  stopTimer: () => Promise<void>;
  isTimerActive: () => boolean;
  getFormattedTime: () => string;
  getMinutes: () => string;
  getSeconds: () => string;
  getOpacity: () => number;
  loadTimerSettings: () => Promise<void>;
  saveTimerSettings: () => Promise<void>;
}

/**
 * Custom hook for managing timer functionality
 * @returns Timer state and functions
 */
const useTimer = (): TimerResult => {
  const [state, setState] = useState<TimerState>({
    timerRunning: false,
    startTime: 0,
    timeLength: 0,
    currentTime: Date.now(),
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer settings from storage
  const loadTimerSettings = useCallback(async () => {
    try {
      const settings = await StorageService.getTimerSettings();
      setState({
        timerRunning: settings.timerRunning,
        startTime: settings.startTime,
        timeLength: settings.timeLength * 60, // Convert to seconds
        currentTime: Date.now(),
      });
    } catch (error) {
      console.error('Failed to load timer settings:', error);
    }
  }, []);

  // Save timer settings to storage
  const saveTimerSettings = useCallback(async () => {
    try {
      await StorageService.saveTimerSettings({
        timerRunning: state.timerRunning,
        startTime: state.startTime,
        timeLength: Math.round(state.timeLength / 60), // Convert to minutes
      });
    } catch (error) {
      console.error('Failed to save timer settings:', error);
    }
  }, [state.timerRunning, state.startTime, state.timeLength]);

  // Start the timer
  const startTimer = useCallback(async (durationMinutes: string | number) => {
    const durationSeconds = TimerService.roundTime(durationMinutes.toString()) * 60;
    const now = Date.now();
    
    setState({
      timerRunning: true,
      startTime: now,
      timeLength: durationSeconds,
      currentTime: now,
    });

    await StorageService.saveTimerSettings({
      timerRunning: true,
      startTime: now,
      timeLength: typeof durationMinutes === 'string' ? durationMinutes : durationMinutes.toString(),
    });
  }, []);

  // Stop the timer
  const stopTimer = useCallback(async () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setState({
      timerRunning: false,
      startTime: 0,
      timeLength: 0,
      currentTime: Date.now(),
    });

    await StorageService.clearTimer();
  }, []);

  // Check if timer is active
  const isTimerActive = useCallback(() => {
    return TimerService.isTimerActive(
      state.startTime,
      state.timeLength,
      state.timerRunning
    );
  }, [state.startTime, state.timeLength, state.timerRunning]);

  // Get formatted time
  const getFormattedTime = useCallback(() => {
    return TimerService.formatTime(
      TimerService.getRemainingTime(state.startTime, state.timeLength)
    );
  }, [state.startTime, state.timeLength]);

  // Get minutes
  const getMinutes = useCallback(() => {
    return TimerService.getMinutes(state.startTime, state.timeLength);
  }, [state.startTime, state.timeLength]);

  // Get seconds
  const getSeconds = useCallback(() => {
    return TimerService.getSeconds(state.startTime, state.timeLength);
  }, [state.startTime, state.timeLength]);

  // Get opacity for animation
  const getOpacity = useCallback(() => {
    return TimerService.getOpacity(state.startTime, state.timeLength);
  }, [state.startTime, state.timeLength]);

  // Timer update effect
  useEffect(() => {
    if (!state.timerRunning || state.timeLength <= 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Check if timer should be running
    const shouldRun = TimerService.isTimerActive(
      state.startTime,
      state.timeLength,
      state.timerRunning
    );

    if (!shouldRun) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Set up timer update
    timerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        currentTime: Date.now(),
      }));
    }, 1000);

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state.timerRunning, state.startTime, state.timeLength]);

  // Check timer status on mount
  useEffect(() => {
    loadTimerSettings();
  }, [loadTimerSettings]);

  return {
    ...state,
    startTimer,
    stopTimer,
    isTimerActive,
    getFormattedTime,
    getMinutes,
    getSeconds,
    getOpacity,
    loadTimerSettings,
    saveTimerSettings,
  };
};

export default useTimer;
