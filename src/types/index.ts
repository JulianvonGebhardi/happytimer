/**
 * Type definitions for HappyTimer extension
 */

// Timer types
export interface TimerSettings {
  timerRunning: boolean;
  startTime: number;
  timeLength: number; // in minutes
  currentTime?: number;
}

// Settings types
export interface ExtensionSettings {
  sidebarChecked: boolean;
  soundChecked: boolean;
  notificationChecked: boolean;
}

// Storage types
export interface StorageData {
  sidebarChecked?: boolean;
  soundChecked?: boolean;
  notificationChecked?: boolean;
  startTime?: number;
  timerRunning?: boolean;
  timeLength?: number;
}

// Message types
export type MessageEvent = 
  | 'toggleSidebar'
  | 'startTimer'
  | 'stopTimer'
  | 'alert'
  | 'finishTimer';

export interface ExtensionMessage {
  event: MessageEvent;
  data?: any;
}

// Position types for drag and drop
export interface Position {
  x: number;
  y: number;
}

// Component props types
export interface SideIconProps {
  isOpen: boolean;
  openMainPopup: (e: React.MouseEvent) => void;
  closeAll?: () => void;
  startPosition?: (e: React.MouseEvent) => void;
  getCurrentPosition?: (e: React.MouseEvent) => void;
  mouseUp?: (e: React.MouseEvent) => void;
}

// Popup props types
export interface PopupProps {
  closePopup: () => void;
}

export interface MainPopupProps extends PopupProps {
  setTimer: (time: string) => void;
}

export interface TimeRunningProps extends PopupProps {
  stopClose: () => void;
  setTimer: (time: string) => void;
}

export interface RunOutPopupProps extends PopupProps {
  addAnother: () => void;
}

// Timer display types
export interface TimerDisplayProps {
  time: string;
  op?: number;
}
