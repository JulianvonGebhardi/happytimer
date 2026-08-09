/**
 * TimeAnimation - Animated time display
 * Shows timer with opacity animation
 */

import React from 'react';

interface TimeAnimationProps {
  time: string;
  op: number;
}

const TimeAnimation: React.FC<TimeAnimationProps> = ({ time, op }) => {
  return (
    <div 
      style={{ opacity: op }}
      className="timeAnimation"
      role="timer"
      aria-live="polite"
      aria-label={`Timer: ${time}`}
    >
      {time}
    </div>
  );
};

export default TimeAnimation;
