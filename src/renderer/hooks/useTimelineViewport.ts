import { useCallback } from 'react';
import { useTimelineContext } from './useTimelineContext';
import * as scale from '../utils/timelineScale';
import { logger } from '../utils/logger';

export interface ViewportDimensions {
  width: number;
  height: number;
  scrollLeft: number;
  scrollTop: number;
  contentWidth: number;
  contentHeight: number;
  visibleDuration: number;
}

export const useTimelineViewport = () => {
  const { state } = useTimelineContext();

  /**
   * Convert time to pixels
   */
  const timeToPixels = useCallback((time: number): number => {
    return scale.timeToPixels(time, state.zoom);
  }, [state.zoom]);

  /**
   * Convert pixels to time
   */
  const pixelsToTime = useCallback((pixels: number): number => {
    return scale.pixelsToTime(pixels, state.zoom);
  }, [state.zoom]);

  /**
   * Get current pixels per second
   */
  const getPixelsPerSecond = useCallback((): number => {
    return scale.getPixelsPerSecond(state.zoom);
  }, [state.zoom]);

  /**
   * Get current pixels per frame
   */
  const getPixelsPerFrame = useCallback((): number => {
    return scale.getPixelsPerFrame(state.zoom, state.fps);
  }, [state.zoom, state.fps]);

  /**
   * Calculate viewport dimensions
   */
  const getViewportDimensions = useCallback((containerWidth: number, containerHeight: number): ViewportDimensions => {
    const contentWidth = scale.getContentWidth(state.duration, state.zoom);
    const visibleDuration = scale.getVisibleDuration(containerWidth, state.zoom);

    logger.debug('Viewport dimensions:', {
      containerWidth,
      contentWidth,
      zoom: state.zoom,
      visibleDuration
    });

    return {
      width: containerWidth,
      height: containerHeight,
      scrollLeft: state.scrollX,
      scrollTop: state.scrollY,
      contentWidth,
      contentHeight: containerHeight, // Height is fixed by container
      visibleDuration
    };
  }, [state.duration, state.zoom, state.scrollX, state.scrollY]);

  /**
   * Calculate optimal zoom level to fit duration
   */
  const getOptimalZoom = useCallback((width: number, padding: number = 1.1): number => {
    return scale.getOptimalZoom(state.duration, width, padding);
  }, [state.duration]);

  /**
   * Calculate minimum zoom level to fit duration
   */
  const getMinZoomLevel = useCallback((width: number): number => {
    return scale.getMinZoomLevel(state.duration, width);
  }, [state.duration]);

  /**
   * Get visible time range
   */
  const getVisibleTimeRange = useCallback((containerWidth: number): [number, number] => {
    const startTime = pixelsToTime(state.scrollX);
    const visibleDuration = scale.getVisibleDuration(containerWidth, state.zoom);
    const endTime = startTime + visibleDuration;

    return [startTime, endTime];
  }, [state.scrollX, state.zoom, pixelsToTime]);

  /**
   * Check if time is visible in viewport
   */
  const isTimeVisible = useCallback((time: number, containerWidth: number): boolean => {
    const [startTime, endTime] = getVisibleTimeRange(containerWidth);
    return time >= startTime && time <= endTime;
  }, [getVisibleTimeRange]);

  return {
    timeToPixels,
    pixelsToTime,
    getPixelsPerSecond,
    getPixelsPerFrame,
    getViewportDimensions,
    getOptimalZoom,
    getMinZoomLevel,
    getVisibleTimeRange,
    isTimeVisible
  };
};
