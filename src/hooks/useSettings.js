/**
 * useSettings - Custom hook for managing extension settings
 * Handles sidebar, sound, and notification settings
 * Uses webextension-polyfill for cross-browser compatibility
 */

import { useState, useEffect, useCallback } from 'react';
import StorageService from '../services/StorageService';
import MessageService from '../services/MessageService';

const useSettings = () => {
  const [settings, setSettings] = useState({
    sidebarChecked: false,
    soundChecked: false,
    notificationChecked: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load settings from storage
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await StorageService.get([
        'sidebarChecked',
        'soundChecked',
        'notificationChecked',
      ]);
      
      setSettings({
        sidebarChecked: result.sidebarChecked || false,
        soundChecked: result.soundChecked || false,
        notificationChecked: result.notificationChecked || false,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to storage
  const saveSettings = useCallback(async (newSettings) => {
    try {
      await StorageService.set(newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
    } catch (err) {
      setError(err.message);
      console.error('Failed to save settings:', err);
      throw err;
    }
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(async () => {
    const newValue = !settings.sidebarChecked;
    await saveSettings({ sidebarChecked: newValue });
    
    // Send message to toggle sidebar
    try {
      await MessageService.sendMessage({ event: 'toggleSidebar' });
    } catch (err) {
      console.error('Failed to send toggleSidebar message:', err);
    }
  }, [settings.sidebarChecked, saveSettings]);

  // Toggle sound
  const toggleSound = useCallback(async () => {
    await saveSettings({ soundChecked: !settings.soundChecked });
  }, [settings.soundChecked, saveSettings]);

  // Toggle notification
  const toggleNotification = useCallback(async () => {
    await saveSettings({ notificationChecked: !settings.notificationChecked });
  }, [settings.notificationChecked, saveSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    error,
    toggleSidebar,
    toggleSound,
    toggleNotification,
    saveSettings,
    loadSettings,
  };
};

export default useSettings;
