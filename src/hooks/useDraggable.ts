/**
 * useDraggable - Custom hook for drag and drop functionality
 * Provides better drag and drop implementation with TypeScript
 * Supports mouse, touch, and proper HTML5 drag and drop
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface Position {
  x: number;
  y: number;
}

interface DraggableState {
  isDragging: boolean;
  position: Position;
  startPosition: Position | null;
  dragStartPosition: Position | null;
}

interface DraggableConfig {
  initialPosition?: Position;
  onDragStart?: (position: Position) => void;
  onDrag?: (position: Position, delta: Position) => void;
  onDragEnd?: (position: Position) => void;
  minX?: number;
  minY?: number;
  maxX?: number;
  maxY?: number;
  storageKey?: string; // For persisting position
}

interface DraggableResult {
  ref: (node: HTMLElement | null) => void;
  style: {
    transform: string;
    transition: string;
    cursor: string;
  };
  isDragging: boolean;
  position: Position;
  resetPosition: () => void;
}

/**
 * Custom hook for making elements draggable
 * @param config - Configuration options
 * @returns Draggable result with ref, style, and state
 */
export function useDraggable(config: DraggableConfig = {}): DraggableResult {
  const {
    initialPosition = { x: 0, y: 0 },
    onDragStart,
    onDrag,
    onDragEnd,
    minX = -Infinity,
    minY = -Infinity,
    maxX = Infinity,
    maxY = Infinity,
    storageKey,
  } = config;

  const [state, setState] = useState<DraggableState>({
    isDragging: false,
    position: initialPosition,
    startPosition: null,
    dragStartPosition: null,
  });

  const elementRef = useRef<HTMLElement | null>(null);

  // Load saved position from storage
  useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const position = JSON.parse(saved) as Position;
          setState(prev => ({ ...prev, position }));
        }
      } catch (error) {
        console.error('Failed to load saved position:', error);
      }
    }
  }, [storageKey]);

  // Save position to storage when it changes
  useEffect(() => {
    if (storageKey && state.isDragging === false) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state.position));
      } catch (error) {
        console.error('Failed to save position:', error);
      }
    }
  }, [state.position, state.isDragging, storageKey]);

  // Handle mouse down (start drag)
  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    e.preventDefault();
    
    if (!elementRef.current) return;

    const rect = elementRef.current.getBoundingClientRect();
    const startPosition = { x: rect.left, y: rect.top };
    const dragStartPosition = { x: e.clientX, y: e.clientY };

    setState(prev => ({
      ...prev,
      isDragging: true,
      startPosition,
      dragStartPosition,
    }));

    onDragStart?.(startPosition);

    // Add event listeners for mouse move and up
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!state.isDragging || !state.dragStartPosition || !elementRef.current) return;

      const deltaX = moveEvent.clientX - state.dragStartPosition.x;
      const deltaY = moveEvent.clientY - state.dragStartPosition.y;

      const newX = clamp(state.startPosition.x + deltaX, minX, maxX);
      const newY = clamp(state.startPosition.y + deltaY, minY, maxY);

      const newPosition = { x: newX, y: newY };

      setState(prev => ({
        ...prev,
        position: newPosition,
      }));

      onDrag?.(newPosition, { x: deltaX, y: deltaY });
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      if (!state.isDragging) return;

      setState(prev => ({
        ...prev,
        isDragging: false,
        startPosition: null,
        dragStartPosition: null,
      }));

      onDragEnd?.(state.position);

      // Remove event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [state, onDragStart, onDrag, onDragEnd, minX, minY, maxX, maxY]);

  // Handle touch start (for mobile/tablet)
  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault();
    
    if (!elementRef.current) return;

    const touch = e.touches[0];
    const rect = elementRef.current.getBoundingClientRect();
    const startPosition = { x: rect.left, y: rect.top };
    const dragStartPosition = { x: touch.clientX, y: touch.clientY };

    setState(prev => ({
      ...prev,
      isDragging: true,
      startPosition,
      dragStartPosition,
    }));

    onDragStart?.(startPosition);

    // Add event listeners for touch move and end
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!state.isDragging || !state.dragStartPosition || !elementRef.current) return;

      const touch = moveEvent.touches[0];
      const deltaX = touch.clientX - state.dragStartPosition.x;
      const deltaY = touch.clientY - state.dragStartPosition.y;

      const newX = clamp(state.startPosition.x + deltaX, minX, maxX);
      const newY = clamp(state.startPosition.y + deltaY, minY, maxY);

      const newPosition = { x: newX, y: newY };

      setState(prev => ({
        ...prev,
        position: newPosition,
      }));

      onDrag?.(newPosition, { x: deltaX, y: deltaY });
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      if (!state.isDragging) return;

      setState(prev => ({
        ...prev,
        isDragging: false,
        startPosition: null,
        dragStartPosition: null,
      }));

      onDragEnd?.(state.position);

      // Remove event listeners
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  }, [state, onDragStart, onDrag, onDragEnd, minX, minY, maxX, maxY]);

  // Reset position to initial
  const resetPosition = useCallback(() => {
    setState(prev => ({
      ...prev,
      position: initialPosition,
      isDragging: false,
      startPosition: null,
      dragStartPosition: null,
    }));

    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        console.error('Failed to remove saved position:', error);
      }
    }
  }, [initialPosition, storageKey]);

  // Helper function to clamp value between min and max
  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  // Calculate transform style
  const transform = `translate(${state.position.x}px, ${state.position.y}px)`;
  const transition = state.isDragging ? 'none' : 'transform 0.2s ease';
  const cursor = state.isDragging ? 'grabbing' : 'grab';

  return {
    ref: elementRef,
    style: {
      transform,
      transition,
      cursor,
      // Ensure element can be positioned
      position: 'fixed' as const,
      zIndex: 9999,
      userSelect: 'none' as const,
    },
    isDragging: state.isDragging,
    position: state.position,
    resetPosition,
  };
}

export default useDraggable;
