/**
 * TimeAnimation - Animated time display
 * Shows timer with opacity animation
 */

import React from 'react';

const TimeAnimation = ({ time, op }) => {
  return (
    <div 
      style={{ opacity: op }}
      className="timeAnimation"
      role="timer"
      aria-live="polite"
    >
      {time}
    </div>
  );
};

export default TimeAnimation;
