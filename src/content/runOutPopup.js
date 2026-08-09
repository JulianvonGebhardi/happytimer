/**
 * RunOutPopup - Popup shown when timer expires
 * Provides options to start another timer or stop
 */

import React, { useCallback } from 'react';

const RunOutPopup = ({ closeRunOutPopup, addAnother }) => {
  // Close on escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      closeRunOutPopup();
    }
  }, [closeRunOutPopup]);

  return (
    <div
      className="runOutPopupWrapper"
      onClick={closeRunOutPopup}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label="Timer expired"
    >
      <div 
        className="popupContainer" 
        onClick={(e) => { e.stopPropagation(); }}
        role="document"
      >
        <div className="closePopup">
          <button 
            onClick={closeRunOutPopup}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        <div className="header">Your time has run out</div>
        <div className="content">
          <div>Great work!</div>
          <div>Your focus session is over.</div>
        </div>
        <div className="actionContainer">
          <div>
            <div className="text">I am in a flow</div>
            <button 
              onClick={addAnother}
              aria-label="Start another timer"
            >
              Another Round
            </button>
          </div>
          <div>
            <div className="text">Time for a break</div>
            <button 
              onClick={closeRunOutPopup}
              aria-label="Stop and close"
            >
              Stop & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunOutPopup;
