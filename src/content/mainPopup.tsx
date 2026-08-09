/**
 * MainPopup - Popup for setting timer duration
 * Allows users to select preset durations or enter custom time
 */

import React, { useState, useCallback, KeyboardEvent, MouseEvent } from 'react';

interface MainPopupProps {
  closeMainPopup: () => void;
  setTimer: (time: string) => void;
}

const MainPopup: React.FC<MainPopupProps> = ({ closeMainPopup, setTimer }) => {
  const [time, setTime] = useState<string>('');

  // Handle preset time selection
  const handlePresetTime = useCallback((minutes: number) => {
    setTimer(minutes.toString());
  }, [setTimer]);

  // Handle custom time submission
  const handleCustomTime = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (time.trim()) {
      setTimer(time);
    }
  }, [time, setTimer]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  }, []);

  // Handle key down for accessibility
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && time.trim()) {
      setTimer(time);
    } else if (e.key === 'Escape') {
      closeMainPopup();
    }
  }, [time, setTimer, closeMainPopup]);

  // Close on escape key
  const handlePopupKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      closeMainPopup();
    }
  }, [closeMainPopup]);

  return (
    <div
      tabIndex={0}
      className="mainPopupWrapper"
      onClick={closeMainPopup}
      onKeyDown={handlePopupKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Set timer duration"
    >
      <div 
        className="popupContainer" 
        onClick={(e: MouseEvent<HTMLDivElement>) => { e.stopPropagation(); }}
        role="document"
      >
        <div className="closePopup">
          <button 
            onClick={closeMainPopup}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="header">Let's get focused</div>
        
        <div 
          className="timeSelection" 
          onClick={() => handlePresetTime(15)}
          role="button"
          tabIndex={0}
          onKeyPress={(e: KeyboardEvent<HTMLDivElement>) => { 
            if (e.key === 'Enter') handlePresetTime(15); 
          }}
        >
          15 min
        </div>
        
        <div 
          className="timeSelection" 
          onClick={() => handlePresetTime(30)}
          role="button"
          tabIndex={0}
          onKeyPress={(e: KeyboardEvent<HTMLDivElement>) => { 
            if (e.key === 'Enter') handlePresetTime(30); 
          }}
        >
          30 min
        </div>
        
        <div 
          className="timeSelection" 
          onClick={() => handlePresetTime(45)}
          role="button"
          tabIndex={0}
          onKeyPress={(e: KeyboardEvent<HTMLDivElement>) => { 
            if (e.key === 'Enter') handlePresetTime(45); 
          }}
        >
          45 min
        </div>
        
        <form onSubmit={(e: MouseEvent<HTMLFormElement>) => { e.preventDefault(); }}>
          <div className="timeInputLabel">Enter your time</div>
          <input
            className="timeInput"
            value={time}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="e.g., 25"
            aria-label="Custom time in minutes"
          />
          <button 
            className="timerStart"
            onClick={handleCustomTime}
            type="button"
          >
            START
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainPopup;
