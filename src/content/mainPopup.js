/**
 * MainPopup - Popup for setting timer duration
 * Allows users to select preset durations or enter custom time
 */

import React, { useState, useCallback } from 'react';

const MainPopup = ({ closeMainPopup, setTimer }) => {
  const [time, setTime] = useState('');

  // Handle preset time selection
  const handlePresetTime = useCallback((minutes) => {
    setTimer(minutes.toString());
  }, [setTimer]);

  // Handle custom time submission
  const handleCustomTime = useCallback((e) => {
    e.preventDefault();
    if (time.trim()) {
      setTimer(time);
    }
  }, [time, setTimer]);

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setTime(e.target.value);
  }, []);

  // Close on escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closeMainPopup();
    }
  }, [closeMainPopup]);

  return (
    <div
      tabIndex="0"
      className="mainPopupWrapper"
      onClick={closeMainPopup}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Set timer duration"
    >
      <div 
        className="popupContainer" 
        onClick={(e) => { e.stopPropagation(); }}
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
          tabIndex="0"
          onKeyPress={(e) => { if (e.key === 'Enter') handlePresetTime(15); }}
        >
          15 min
        </div>
        
        <div 
          className="timeSelection" 
          onClick={() => handlePresetTime(30)}
          role="button"
          tabIndex="0"
          onKeyPress={(e) => { if (e.key === 'Enter') handlePresetTime(30); }}
        >
          30 min
        </div>
        
        <div 
          className="timeSelection" 
          onClick={() => handlePresetTime(45)}
          role="button"
          tabIndex="0"
          onKeyPress={(e) => { if (e.key === 'Enter') handlePresetTime(45); }}
        >
          45 min
        </div>
        
        <form onSubmit={handleCustomTime}>
          <div className="timeInputLabel">Enter your time</div>
          <input
            className="timeInput"
            value={time}
            onChange={handleInputChange}
            type="text"
            placeholder="e.g., 25"
            aria-label="Custom time in minutes"
          />
          <button 
            className="timerStart"
            onClick={() => time.trim() && setTimer(time)}
            type="submit"
          >
            START
          </button>
        </form>
      </div>
    </div>
  );
};

export default MainPopup;
