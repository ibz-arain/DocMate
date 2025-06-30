import { useCallback, useEffect, useRef } from 'react';

interface DragCallbacks {
  onDragStart?: () => void;
  onDragMove?: (delta: { x: number; y: number }) => void;
  onDragEnd?: () => void;
}

export function useDraggable({
  onDragStart,
  onDragMove,
  onDragEnd,
}: DragCallbacks) {
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging.current) return;

      const delta = {
        x: event.clientX - lastPosition.current.x,
        y: event.clientY - lastPosition.current.y,
      };

      lastPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      onDragMove?.(delta);
    },
    [onDragMove]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;
    onDragEnd?.();

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove, onDragEnd]);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      // Only handle left mouse button
      if (event.button !== 0) return;

      event.preventDefault();
      isDragging.current = true;
      
      lastPosition.current = {
        x: event.clientX,
        y: event.clientY,
      };

      onDragStart?.();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [handleMouseMove, handleMouseUp, onDragStart]
  );

  // Cleanup event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return { onMouseDown };
} 