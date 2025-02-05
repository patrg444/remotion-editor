import { useCallback, RefObject } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { clampTime } from '../utils/timeValidation';
import { timeToPixels, pixelsToTime } from '../utils/timelineScale';
import { TimelineConstants } from '../utils/timelineConstants';
import { logger } from '../utils/logger';

interface Coordinates {
  x: number;
  y: number;
}

interface ContainerInfo {
  rect: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
  scroll: {
    left: number;
    top: number;
  };
}

export const useTimelineCoordinates = (containerRef: RefObject<HTMLElement>) => {
  const { state } = useTimelineContext();

  /**
   * Get container's position and scroll information
   */
  const getContainerInfo = useCallback((): ContainerInfo => {
    if (!containerRef.current) {
      return {
        rect: { left: 0, top: 0, width: 0, height: 0 },
        scroll: { left: 0, top: 0 }
      };
    }

    const domRect = containerRef.current.getBoundingClientRect();
    return {
      rect: {
        left: domRect.left,
        top: domRect.top,
        width: domRect.width,
        height: domRect.height
      },
      scroll: {
        left: containerRef.current.scrollLeft,
        top: containerRef.current.scrollTop
      }
    };
  }, []);

  /**
   * Convert client coordinates to timeline time
   */
  const clientToTime = useCallback((clientCoords: Coordinates): number => {
    const { rect, scroll } = getContainerInfo();
    
    // Calculate position relative to container, including scroll
    const relativeX = clientCoords.x - rect.left + scroll.left;
    const timeX = Math.max(0, relativeX - 160); // Subtract track label width after calculating relative position
    
    // Convert to time using scale utilities
    const time = pixelsToTime(timeX, state.zoom);

    // Clamp to valid range
    const clampedTime = clampTime(time, {
      minValue: 0,
      maxValue: state.duration,
      snapToFrames: true,
      fps: state.fps
    });


    logger.debug('Client to time conversion:', {
      clientX: clientCoords.x,
      containerLeft: rect.left,
      scrollLeft: scroll.left,
      relativeX,
      timeX,
      time,
      clampedTime,
      zoom: state.zoom,
      scale: TimelineConstants.Scale.getScale(state.zoom)
    });

    return clampedTime;
  }, [state.zoom, state.duration, state.fps]);

  /**
   * Convert timeline time to client coordinates
   */
  const timeToClient = useCallback((time: number): Coordinates => {
    const { rect, scroll } = getContainerInfo();
    
    // Convert time to container-relative position using scale utilities
    const relativeX = timeToPixels(time, state.zoom);
    
    // Convert to client coordinates
    const clientX = relativeX + rect.left - scroll.left + 160; // Add track label width after calculating position

    logger.debug('Time to client conversion:', {
      time,
      relativeX,
      containerLeft: rect.left,
      scrollLeft: scroll.left,
      clientX,
      zoom: state.zoom,
      scale: TimelineConstants.Scale.getScale(state.zoom)
    });

    return {
      x: clientX,
      y: rect.top
    };
  }, [state.zoom]);

  /**
   * Get relative coordinates within the container
   */
  const getRelativeCoordinates = useCallback((clientCoords: Coordinates): Coordinates => {
    const { rect, scroll } = getContainerInfo();
    
    return {
      x: clientCoords.x - rect.left + scroll.left,
      y: clientCoords.y - rect.top + scroll.top
    };
  }, []);

  /**
   * Check if coordinates are within the container
   */
  const isWithinContainer = useCallback((clientCoords: Coordinates): boolean => {
    const { rect } = getContainerInfo();
    
    return (
      clientCoords.x >= rect.left &&
      clientCoords.x <= rect.left + rect.width &&
      clientCoords.y >= rect.top &&
      clientCoords.y <= rect.top + rect.height
    );
  }, []);

  /**
   * Get container dimensions and position
   */
  const getContainerDimensions = useCallback(() => {
    const { rect, scroll } = getContainerInfo();
    
    return {
      width: rect.width,
      height: rect.height,
      left: rect.left,
      top: rect.top,
      scrollLeft: scroll.left,
      scrollTop: scroll.top
    };
  }, []);

  return {
    clientToTime,
    timeToClient,
    getRelativeCoordinates,
    isWithinContainer,
    getContainerDimensions
  };
};
