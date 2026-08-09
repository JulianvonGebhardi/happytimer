/**
 * useSideIconDrag - Custom hook for side icon drag and drop functionality
 * Provides improved drag and drop with proper React patterns and TypeScript
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface SideIconDragState {
  isDragging: boolean;
  isPressed: boolean;
  startY: number | null;
  currentY: number | null;
  diffY: number;
  lastHeight: number | null;
}

interface SideIconDragConfig {
  onDragStart?: () => void;
  onDrag?: (diffY: number) => void;
  onDragEnd?: (finalDiff: number) => void;
  storageKey?: string;
  minY?: number;
  maxY?: number;
}

interface SideIconDragResult {
  handlers: {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
  };
  style: {
    top: string;
    cursor: string;
    transition: string;
  };
  isDragging: boolean;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  resetPosition: () => void;
}

/**
 * Custom hook for handling side icon drag and drop
 * @param config - Configuration options
 * @returns Drag and drop handlers and state
 */
export function useSideIconDrag(config: SideIconDragConfig = {}): SideIconDragResult {
  const {
    onDragStart,
    onDrag,
    onDragEnd,
    storageKey,
    minY = -1000,
    maxY = 1000,
  } = config;

  const [state, setState] = useState<SideIconDragState>({
    isDragging: false,
    isPressed: false,
    startY: null,
    currentY: null,
    diffY: 0,
    lastHeight: null,
  });

  const [isOpen, setIsOpen] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  // Load saved position from storage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const lastHeight = parseFloat(saved);
          if (!isNaN(lastHeight)) {
            setState(prev => ({ ...prev, lastHeight }));
          }
        }
      } catch (error) {
        console.error('Failed to load side icon position:', error);
      }
    }
  }, [storageKey]);

  // Save position to storage when dragging ends
  useEffect(() => {
    if (storageKey && state.isDragging === false && state.lastHeight !== null) {
      try {
        localStorage.setItem(storageKey, state.lastHeight.toString());
      } catch (error) {
        console.error('Failed to save side icon position:', error);
      }
    }
  }, [state.isDragging, state.lastHeight, storageKey]);

  // Calculate the current top position
  const calculateTop = useCallback(() => {
    const baseTop = '50%';
    const offset = state.lastHeight !== null ? state.lastHeight : 0;
    const currentDiff = state.isDragging ? state.diffY : 0;
    const totalOffset = offset + currentDiff;
    
    // Clamp the offset to prevent dragging too far
    const clampedOffset = Math.max(minY, Math.min(maxY, totalOffset));
    
    return `calc(${baseTop} - 30px - ${clampedOffset}px)`;
  }, [state.isDragging, state.diffY, state.lastHeight, minY, maxY]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (state.isDragging) return;

    setState(prev => ({
      ...prev,
      isDragging: false,
      isPressed: true,
      startY: e.pageY,
      currentY: e.pageY,
      diffY: 0,
    }));

    onDragStart?.();

    // Start a timer to add the 'drag' class after a delay
    const timer = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.classList.add('drag');
      }
    }, 150);

    // Store timer for cleanup
    const cleanup = () => clearTimeout(timer);
    
    // Add event listeners for mouse move and up
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!state.isPressed) return;

      const newCurrentY = moveEvent.pageY;
      const start = state.startY || moveEvent.pageY;
      const newDiffY = (start - newCurrentY) * 1.001;

      setState(prev => ({
        ...prev,
        currentY: newCurrentY,
        diffY: newDiffY,
      }));

      onDrag?.(newDiffY);
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      cleanup();
      
      if (elementRef.current) {
        elementRef.current.classList.remove('drag');
      }

      if (state.isPressed) {
        const finalDiff = state.diffY;
        const newLastHeight = (state.lastHeight || 0) + finalDiff;

        setState(prev => ({
          ...prev,
          isDragging: false,
          isPressed: false,
          startY: null,
          currentY: null,
          diffY: 0,
          lastHeight: newLastHeight,
        }));

        onDragEnd?.(finalDiff);
      }

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Cleanup function
    return () => {
      cleanup();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state, onDragStart, onDrag, onDragEnd]);

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (state.isDragging) return;

    const touch = e.touches[0];
    
    setState(prev => ({
      ...prev,
      isDragging: false,
      isPressed: true,
      startY: touch.pageY,
      currentY: touch.pageY,
      diffY: 0,
    }));

    onDragStart?.();

    // Start a timer to add the 'drag' class after a delay
    const timer = setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.classList.add('drag');
      }
    }, 150);

    // Store timer for cleanup
    const cleanup = () => clearTimeout(timer);

    // Add event listeners for touch move and end
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!state.isPressed) return;

      const touch = moveEvent.touches[0];
      const newCurrentY = touch.pageY;
      const start = state.startY || touch.pageY;
      const newDiffY = (start - newCurrentY) * 1.001;

      setState(prev => ({
        ...prev,
        currentY: newCurrentY,
        diffY: newDiffY,
      }));

      onDrag?.(newDiffY);
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      cleanup();
      
      if (elementRef.current) {
        elementRef.current.classList.remove('drag');
      }

      if (state.isPressed) {
        const finalDiff = state.diffY;
        const newLastHeight = (state.lastHeight || 0) + finalDiff;

        setState(prev => ({
          ...prev,
          isDragging: false,
          isPressed: false,
          startY: null,
          currentY: null,
          diffY: 0,
          lastHeight: newLastHeight,
        }));

        onDragEnd?.(finalDiff);
      }

      // Remove event listeners
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup function
    return () => {
      cleanup();
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [state, onDragStart, onDrag, onDragEnd]);

  // Reset position
  const resetPosition = useCallback(() => {
    setState(prev => ({
      ...prev,
      lastHeight: 0,
      diffY: 0,
      startY: null,
      currentY: null,
    }));

    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Failed to reset side icon position:', error);
      }
    }
  }, [storageKey]);

  // Calculate style
  const top = calculateTop();
  const cursor = state.isDragging || state.isPressed ? 'grabbing' : 'grab';
  const transition = state.isDragging || state.isPressed ? 'none' : 'top 0.2s ease';

  return {
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: () => {}, // Handled by document listeners
      onMouseUp: () => {}, // Handled by document listeners
      onTouchStart: handleTouchStart,
      onTouchMove: () => {}, // Handled by document listeners
      onTouchEnd: () => {}, // Handled by document listeners
    },
    style: {
      top,
      cursor,
      transition,
    },
    isDragging: state.isDragging,
    isOpen,
    setIsOpen,
    resetPosition,
  };
}

export default useSideIconDrag;
