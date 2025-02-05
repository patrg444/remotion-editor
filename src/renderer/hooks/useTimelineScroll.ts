import { useCallback, useRef, useState, useEffect } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { ActionTypes } from '../types/timeline';
import { throttle, THROTTLE } from '../utils/throttle';
import { logger } from '../utils/logger';

interface ScrollState {
  scrollLeft: number;
  scrollTop: number;
  isScrolling: boolean;
}

export const useTimelineScroll = (containerRef: React.RefObject<HTMLElement>) => {
  const { state, dispatch } = useTimelineContext();
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollLeft: state.scrollX,
    scrollTop: state.scrollY,
    isScrolling: false
  });

  // Refs for tracking scroll state between renders
  const scrollingTimeoutRef = useRef<NodeJS.Timeout>();
  const lastScrollLeftRef = useRef(state.scrollX);
  const lastScrollTopRef = useRef(state.scrollY);

  // Update local state when timeline state changes
  useEffect(() => {
    setScrollState(prev => ({
      ...prev,
      scrollLeft: state.scrollX,
      scrollTop: state.scrollY
    }));
    lastScrollLeftRef.current = state.scrollX;
    lastScrollTopRef.current = state.scrollY;
  }, [state.scrollX, state.scrollY]);

  // Throttled scroll handler
  const handleScroll = useCallback(
    throttle((e: Event) => {
      if (!containerRef.current) return;

      const target = e.target as HTMLElement;
      const newScrollLeft = target.scrollLeft;
      const newScrollTop = target.scrollTop;

      // Only update if scroll position has changed significantly
      const hasScrollChanged = 
        Math.abs(newScrollLeft - lastScrollLeftRef.current) > 1 ||
        Math.abs(newScrollTop - lastScrollTopRef.current) > 1;

      if (hasScrollChanged) {
        // Update refs immediately for smooth scrolling
        lastScrollLeftRef.current = newScrollLeft;
        lastScrollTopRef.current = newScrollTop;

        // Update local state for UI
        setScrollState({
          scrollLeft: newScrollLeft,
          scrollTop: newScrollTop,
          isScrolling: true
        });

        // Dispatch to global state
        dispatch({
          type: ActionTypes.SET_SCROLL_X,
          payload: newScrollLeft
        });
        dispatch({
          type: ActionTypes.SET_SCROLL_Y,
          payload: newScrollTop
        });

        logger.debug('Timeline scroll', { 
          scrollLeft: newScrollLeft, 
          scrollTop: newScrollTop 
        });

        // Reset scrolling flag after delay
        if (scrollingTimeoutRef.current) {
          clearTimeout(scrollingTimeoutRef.current);
        }
        scrollingTimeoutRef.current = setTimeout(() => {
          setScrollState(prev => ({ ...prev, isScrolling: false }));
        }, THROTTLE.SCROLL * 2);
      }
    }, THROTTLE.SCROLL),
    [containerRef, dispatch]
  );

  // Scroll to specific position
  const scrollTo = useCallback(({ left, top }: { left?: number; top?: number }) => {
    if (!containerRef.current) return;

    if (typeof left === 'number') {
      containerRef.current.scrollLeft = left;
      lastScrollLeftRef.current = left;
      dispatch({
        type: ActionTypes.SET_SCROLL_X,
        payload: left
      });
    }

    if (typeof top === 'number') {
      containerRef.current.scrollTop = top;
      lastScrollTopRef.current = top;
      dispatch({
        type: ActionTypes.SET_SCROLL_Y,
        payload: top
      });
    }
  }, [containerRef, dispatch]);

  // Attach scroll listener
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    return () => {
      element.removeEventListener('scroll', handleScroll);
      if (scrollingTimeoutRef.current) {
        clearTimeout(scrollingTimeoutRef.current);
      }
    };
  }, [containerRef, handleScroll]);

  return {
    scrollTo,
    scrollState,
    isScrolling: scrollState.isScrolling
  };
};
