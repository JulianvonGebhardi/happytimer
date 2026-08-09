/**
 * SideArrow - Draggable arrow icon for opening/closing the timer
 * Handles drag and drop positioning with improved implementation
 */

import React from 'react';

interface SideArrowProps {
  isOpen: boolean;
  openMainPopup: (e: React.MouseEvent<SVGElement>) => void;
  closeAll: () => void;
  dragHandlers?: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  dragStyle?: {
    top: string;
    cursor: string;
    transition: string;
  };
}

const SideArrow: React.FC<SideArrowProps> = ({
  isOpen,
  openMainPopup,
  closeAll,
  dragHandlers = {},
  dragStyle = {},
}) => {
  const { onMouseDown, onMouseMove, onMouseUp, onTouchStart, onTouchMove, onTouchEnd } = dragHandlers;

  return (
    <div
      className="sideIcon arrowContainer"
      id="side-arrow-1"
      draggable={true}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={dragStyle}
      role="button"
      aria-label={isOpen ? 'Close timer' : 'Open timer'}
      aria-pressed={isOpen}
    >
      {!isOpen ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13.503"
          className="arrowIcon"
          height="23.619"
          viewBox="0 0 13.503 23.619"
          onClick={openMainPopup}
          role="img"
          aria-label="Open timer"
        >
          <path
            d="M15.321,18l8.937-8.93a1.688,1.688,0,0,0-2.391-2.384L11.742,16.8a1.685,1.685,0,0,0-.049,2.327L21.86,29.32a1.688,1.688,0,0,0,2.391-2.384Z"
            transform="translate(-11.251 -6.194)"
          />
        </svg>
      ) : null}

      {isOpen ? (
        <svg
          className="arrowBackIcon"
          xmlns="http://www.w3.org/2000/svg"
          width="13.503"
          height="23.619"
          viewBox="0 0 13.503 23.619"
          onClick={closeAll}
          role="img"
          aria-label="Close timer"
        >
          <g transform="translate(13.503 23.619) rotate(180)">
            <path
              className="a"
              d="M15.321,18l8.937-8.93a1.688,1.688,0,0,0-2.391-2.384L11.742,16.8a1.685,1.685,0,0,0-.049,2.327L21.86,29.32a1.688,1.688,0,0,0,2.391-2.384Z"
              transform="translate(-11.251 -6.194)"
            />
          </g>
        </svg>
      ) : null}
    </div>
  );
};

export default SideArrow;
