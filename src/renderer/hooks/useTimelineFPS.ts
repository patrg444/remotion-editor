import { useCallback } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { ActionTypes } from '../types/timeline';
import { logger } from '../utils/logger';

export interface FPSConfig {
  fps: number;
  frameDuration: number;
  defaultFPS: number;
  minFPS: number;
  maxFPS: number;
  commonFPS: number[];
}

/**
 * Hook to manage timeline FPS configuration
 */
export const useTimelineFPS = () => {
  const { state, dispatch } = useTimelineContext();

  // Common FPS values
  const commonFPS = [23.976, 24, 25, 29.97, 30, 50, 59.94, 60];

  // FPS configuration
  const config: FPSConfig = {
    fps: state.fps,
    frameDuration: 1 / state.fps,
    defaultFPS: 30,
    minFPS: 1,
    maxFPS: 240,
    commonFPS
  };

  /**
   * Set timeline FPS
   */
  const setFPS = useCallback((fps: number) => {
    const clampedFPS = Math.min(Math.max(fps, config.minFPS), config.maxFPS);
    
    dispatch({
      type: ActionTypes.SET_FPS,
      payload: clampedFPS
    });

    logger.debug('Timeline FPS updated:', {
      fps: clampedFPS,
      frameDuration: 1 / clampedFPS
    });
  }, [dispatch, config.minFPS, config.maxFPS]);

  /**
   * Get nearest standard FPS value
   */
  const getNearestStandardFPS = useCallback((fps: number): number => {
    return commonFPS.reduce((prev, curr) => {
      return Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev;
    });
  }, [commonFPS]);

  /**
   * Check if FPS value is a standard rate
   */
  const isStandardFPS = useCallback((fps: number): boolean => {
    return commonFPS.includes(fps);
  }, [commonFPS]);

  /**
   * Convert frame number to time
   */
  const frameToTime = useCallback((frame: number): number => {
    return frame / state.fps;
  }, [state.fps]);

  /**
   * Convert time to frame number
   */
  const timeToFrame = useCallback((time: number): number => {
    return Math.round(time * state.fps);
  }, [state.fps]);

  /**
   * Get frame duration in seconds
   */
  const getFrameDuration = useCallback((): number => {
    return 1 / state.fps;
  }, [state.fps]);

  /**
   * Check if time aligns with frame boundary
   */
  const isFrameAligned = useCallback((time: number): boolean => {
    const frame = time * state.fps;
    return Math.abs(frame - Math.round(frame)) < Number.EPSILON;
  }, [state.fps]);

  /**
   * Snap time to nearest frame boundary
   */
  const snapToFrame = useCallback((time: number): number => {
    return Math.round(time * state.fps) / state.fps;
  }, [state.fps]);

  return {
    ...config,
    setFPS,
    getNearestStandardFPS,
    isStandardFPS,
    frameToTime,
    timeToFrame,
    getFrameDuration,
    isFrameAligned,
    snapToFrame
  };
};
