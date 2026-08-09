/**
 * useSettings - Custom hook for managing extension settings
 * Handles sidebar, sound, and notification settings
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';
import MessageService from '../services/MessageService';
import { ExtensionSettings } from '../types';

interface SettingsState {
  settings: ExtensionSettings;
  isLoading: boolean;
  error: string | null;
}

interface SettingsResult extends SettingsState {
  toggleSidebar: () => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleNotification: () => Promise<void>;
  saveSettings: (newSettings: Partial<ExtensionSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

/**
 * Custom hook for managing extension settings
 * @returns Settings state and functions
 */
const useSettings = (): SettingsResult => {
  const [state, setState] = useState<SettingsState>({
    settings: {
      sidebarChecked: false,
      soundChecked: false,
      notificationChecked: false,
    },
    isLoading: true,
    error: null,
  });

  // Load settings from storage
  const loadSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const result = await StorageService.getExtensionSettings();
      
      setState({
        settings: result,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        settings: {
          sidebarChecked: false,
          soundChecked: false,
          notificationChecked: false,
        },
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load settings',
      });
      console.error('Failed to load settings:', err);
    }
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(async (newSettings: Partial<ExtensionSettings>) => {
    try {
      const updatedSettings = { ...state.settings, ...newSettings };
      await StorageService.saveExtensionSettings(updatedSettings);
      setState(prev => ({ ...prev, settings: updatedSettings }));
    } catch (err) {
      setState(prev => ({ ...prev, error: err instanceof Error ? err.message : 'Failed to save settings' }));
      console.error('Failed to save settings:', err);
      throw err;
    }
  }, [state.settings]);

  // Toggle sidebar
  const toggleSidebar = useCallback(async () => {
    const newValue = !state.settings.sidebarChecked;
    await saveSettings({ sidebarChecked: newValue });
    
    // Send message to toggle sidebar
    try {
      await MessageService.sendMessage({ event: 'toggleSidebar' });
    } catch (err) {
      console.error('Failed to send toggleSidebar message:', err);
    }
  }, [state.settings.sidebarChecked, saveSettings]);

  // Toggle sound
  const toggleSound = useCallback(async () => {
    await saveSettings({ soundChecked: !state.settings.soundChecked });
  }, [state.settings.soundChecked, saveSettings]);

  // Toggle notification
  const toggleNotification = useCallback(async () => {
    await saveSettings({ notificationChecked: !state.settings.notificationChecked });
  }, [state.settings.notificationChecked, saveSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    ...state,
    toggleSidebar,
    toggleSound,
    toggleNotification,
    saveSettings,
    loadSettings,
  };
};

export default useSettings;
