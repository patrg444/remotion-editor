import { useCallback } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { ActionTypes, ClipWithLayer, Track } from '../types/timeline';
import { logger } from '../utils/logger';

export const useTimeline = () => {
  const { state, dispatch } = useTimelineContext();

  const updateClip = useCallback((trackId: string, clipId: string, updates: Partial<ClipWithLayer>) => {
    dispatch({
      type: ActionTypes.UPDATE_CLIP,
      payload: {
        trackId,
        clipId,
        clip: updates
      }
    });
  }, [dispatch]);

  const trimClip = useCallback((
    clipId: string, 
    startTime?: number, 
    endTime?: number, 
    speed = 1.0,
    options?: {
      handles?: {
        startPosition: number;
        endPosition: number;
      };
      ripple?: boolean;
    }
  ) => {
    try {
      // Find clip in tracks
      let foundClip: ClipWithLayer | undefined;
      let foundTrack: Track | undefined;

      for (const track of state.tracks) {
        const clip = track.clips.find((c: ClipWithLayer) => c.id === clipId);
        if (clip) {
          foundClip = clip;
          foundTrack = track;
          break;
        }
      }

      if (!foundClip || !foundTrack) {
        throw new Error(`Clip not found: ${clipId}`);
      }

      // Validate trim operation
      if (startTime !== undefined && endTime !== undefined && startTime >= endTime) {
        throw new Error('Invalid trim: start time must be less than end time');
      }

      // Dispatch trim action
      dispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          clipId,
          startTime,
          endTime,
          speed,
          handles: options?.handles,
          ripple: options?.ripple
        }
      });

      logger.debug('Trim clip:', {
        clipId,
        startTime,
        endTime,
        speed,
        handles: options?.handles,
        ripple: options?.ripple
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const customError = new Error(errorMessage);
      (customError as any).clipId = clipId;
      throw customError;
    }
  }, [state.tracks, dispatch]);

  const moveClip = useCallback((
    clipId: string,
    sourceTrackId: string,
    targetTrackId: string,
    newTime: number
  ) => {
    dispatch({
      type: ActionTypes.MOVE_CLIP,
      payload: {
        clipId,
        sourceTrackId,
        targetTrackId,
        newTime
      }
    });
  }, [dispatch]);

  const splitClip = useCallback((trackId: string, clipId: string, time: number) => {
    dispatch({
      type: ActionTypes.SPLIT_CLIP,
      payload: {
        trackId,
        clipId,
        time
      }
    });
  }, [dispatch]);

  const addTrack = useCallback((track: Track) => {
    dispatch({
      type: ActionTypes.ADD_TRACK,
      payload: {
        track
      }
    });
  }, [dispatch]);

  const removeTrack = useCallback((trackId: string) => {
    dispatch({
      type: ActionTypes.REMOVE_TRACK,
      payload: {
        trackId
      }
    });
  }, [dispatch]);

  const updateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    dispatch({
      type: ActionTypes.UPDATE_TRACK,
      payload: {
        trackId,
        track: updates
      }
    });
  }, [dispatch]);

  const addClip = useCallback((trackId: string, clip: ClipWithLayer) => {
    dispatch({
      type: ActionTypes.ADD_CLIP,
      payload: {
        trackId,
        clip
      }
    });
  }, [dispatch]);

  const removeClip = useCallback((trackId: string, clipId: string) => {
    dispatch({
      type: ActionTypes.REMOVE_CLIP,
      payload: {
        trackId,
        clipId
      }
    });
  }, [dispatch]);

  const setDuration = useCallback((duration: number) => {
    dispatch({
      type: ActionTypes.SET_DURATION,
      payload: duration
    });
  }, [dispatch]);

  const setCurrentTime = useCallback((time: number) => {
    dispatch({
      type: ActionTypes.SET_CURRENT_TIME,
      payload: {
        time
      }
    });
  }, [dispatch]);

  const setPlaying = useCallback((isPlaying: boolean) => {
    dispatch({
      type: ActionTypes.SET_PLAYING,
      payload: isPlaying
    });
  }, [dispatch]);

  const setZoom = useCallback((zoom: number) => {
    dispatch({
      type: ActionTypes.SET_ZOOM,
      payload: zoom
    });
  }, [dispatch]);

  const setFps = useCallback((fps: number) => {
    dispatch({
      type: ActionTypes.SET_FPS,
      payload: fps
    });
  }, [dispatch]);

  const setScrollX = useCallback((scrollX: number) => {
    dispatch({
      type: ActionTypes.SET_SCROLL_X,
      payload: scrollX
    });
  }, [dispatch]);

  const setScrollY = useCallback((scrollY: number) => {
    dispatch({
      type: ActionTypes.SET_SCROLL_Y,
      payload: scrollY
    });
  }, [dispatch]);

  const setDragging = useCallback((isDragging: boolean, dragStartX: number, dragStartY: number) => {
    dispatch({
      type: ActionTypes.SET_DRAGGING,
      payload: {
        isDragging,
        dragStartX,
        dragStartY
      }
    });
  }, [dispatch]);

  const setError = useCallback((error: Error | null) => {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: error
    });
  }, [dispatch]);

  return {
    updateClip,
    trimClip,
    moveClip,
    splitClip,
    addTrack,
    removeTrack,
    updateTrack,
    addClip,
    removeClip,
    setDuration,
    setCurrentTime,
    setPlaying,
    setZoom,
    setFps,
    setScrollX,
    setScrollY,
    setDragging,
    setError,
    duration: state.duration,
    currentTime: state.currentTime,
    isPlaying: state.isPlaying,
    zoom: state.zoom,
    fps: state.fps,
    scrollX: state.scrollX,
    scrollY: state.scrollY,
    isDragging: state.isDragging,
    dragStartX: state.dragStartX,
    dragStartY: state.dragStartY,
    error: state.error
  };
};
