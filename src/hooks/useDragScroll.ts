import React, { useRef, useState, useCallback, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent, WheelEvent as ReactWheelEvent } from 'react';

interface DragScrollOptions {
  dragSpeed?: number;
  enableWheelScroll?: boolean;
}

export function useDragScroll<T extends HTMLElement = HTMLDivElement>(options: DragScrollOptions = {}) {
  const { dragSpeed = 1.3, enableWheelScroll = true } = options;
  const containerRef = useRef<T | null>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to update left/right boundaries for indicators/buttons
  const checkScrollBoundaries = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    checkScrollBoundaries();

    const handleScroll = () => {
      checkScrollBoundaries();
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollBoundaries);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollBoundaries);
    };
  }, [checkScrollBoundaries]);

  const onMouseDown = useCallback((e: ReactMouseEvent<T>) => {
    const el = containerRef.current;
    if (!el) return;

    // Only initiate on primary (left) mouse button
    if (e.button !== 0) return;

    isDown.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  }, []);

  const onMouseMove = useCallback((e: ReactMouseEvent<T>) => {
    const el = containerRef.current;
    if (!isDown.current || !el) return;

    const x = e.pageX - el.offsetLeft;
    const distance = x - startX.current;

    // If moved more than 4px, treat as intentional drag
    if (Math.abs(distance) > 4) {
      if (!hasDragged.current) {
        hasDragged.current = true;
        setIsDragging(true);
      }
      e.preventDefault();
      // Moving cursor left (negative distance) -> increases scrollLeft (scrolls rightwards/reveals left content)
      // Moving cursor right (positive distance) -> decreases scrollLeft (scrolls leftwards/reveals previous content)
      el.scrollLeft = scrollLeftStart.current - (distance * dragSpeed);
    }
  }, [dragSpeed]);

  const endDrag = useCallback(() => {
    if (isDown.current) {
      isDown.current = false;
      // Delay resetting dragging state slightly so click handlers don't fire on release
      setTimeout(() => {
        setIsDragging(false);
        hasDragged.current = false;
      }, 50);
    }
  }, []);

  const onClickCapture = useCallback((e: ReactMouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onWheel = useCallback((e: ReactWheelEvent<T>) => {
    if (!enableWheelScroll) return;
    const el = containerRef.current;
    if (!el) return;

    // If user is vertically scrolling over the horizontal container without Shift key
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && Math.abs(e.deltaY) > 5) {
      el.scrollLeft += e.deltaY;
    }
  }, [enableWheelScroll]);

  // Programmatic scroll helper (for left/right scroll buttons if needed)
  const scrollByAmount = useCallback((offset: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: offset, behavior: 'smooth' });
  }, []);

  return {
    containerRef,
    isDragging,
    canScrollLeft,
    canScrollRight,
    scrollByAmount,
    dragProps: {
      ref: containerRef,
      onMouseDown,
      onMouseMove,
      onMouseUp: endDrag,
      onMouseLeave: endDrag,
      onClickCapture,
      onWheel
    }
  };
}
