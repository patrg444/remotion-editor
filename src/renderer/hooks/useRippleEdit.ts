import { useCallback } from 'react';
import { useTimeline } from './useTimeline';
import { useTimelineContext } from './useTimelineContext';
import { Track, Clip, ClipWithLayer, ActionTypes } from '../types/timeline';
import { logger } from '../utils/logger';

export const useRippleEdit = () => {
  const timeline = useTimeline();
  const { dispatch } = useTimelineContext();

  const createHistoryCheckpoint = useCallback((description: string) => {
    dispatch({
      type: ActionTypes.PUSH_HISTORY,
      payload: {
        description,
        isCheckpoint: true
      }
    });
  }, [dispatch]);

  // Helper: Check if a track is locked
  const isTrackLocked = (track: Track) => {
    if (track.isLocked) {
      logger.warn('Track is locked; ripple operation aborted.', { trackId: track.id });
      return true;
    }
    return false;
  };

  /**
   * Ripple delete a clip and shift all subsequent clips left
   */
  const rippleDelete = useCallback((clip: ClipWithLayer, track: Track) => {
    if (isTrackLocked(track)) return;

    const duration = clip.endTime - clip.startTime;
    const deleteTime = clip.startTime;

    logger.debug('Ripple delete:', {
      clipId: clip.id,
      trackId: track.id,
      deleteTime,
      duration
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple delete clip');

    // Remove the clip first
    timeline.removeClip(track.id, clip.id);

    // Get a sorted list of clips after the deleted clip
    const subsequentClips = [...track.clips]
      .filter(c => c.startTime > deleteTime)
      .sort((a, b) => a.startTime - b.startTime);

    // Shift each subsequent clip by the duration removed
    subsequentClips.forEach(c => {
      timeline.moveClip(c.id, track.id, track.id, c.startTime - duration);
    });
  }, [timeline, createHistoryCheckpoint]);

  /**
   * Ripple insert a clip and shift all subsequent clips right
   */
  const rippleInsert = useCallback((
    clip: Clip,
    track: Track,
    insertTime: number
  ) => {
    if (isTrackLocked(track)) return;

    const duration = clip.endTime - clip.startTime;

    logger.debug('Ripple insert:', {
      clipId: clip.id,
      trackId: track.id,
      insertTime,
      duration
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple insert clip');

    // Get a sorted list of clips starting at or after the insert point
    const subsequentClips = [...track.clips]
      .filter(c => c.startTime >= insertTime)
      .sort((a, b) => a.startTime - b.startTime);

    // First shift all subsequent clips to the right
    subsequentClips.forEach(c => {
      timeline.moveClip(c.id, track.id, track.id, c.startTime + duration);
    });

    // Then add the new clip at the insert time
    const newClip = {
      ...clip,
      startTime: insertTime,
      endTime: insertTime + duration
    };
    dispatch({
      type: ActionTypes.ADD_CLIP,
      payload: { trackId: track.id, clip: newClip }
    });
  }, [timeline, createHistoryCheckpoint]);

  /**
   * Ripple trim a clip and shift all subsequent clips
   */
  const rippleTrim = useCallback((
    clip: ClipWithLayer,
    track: Track,
    trimType: 'in' | 'out',
    newTime: number
  ) => {
    if (isTrackLocked(track)) return;

    logger.debug('Ripple trim:', {
      clipId: clip.id,
      trackId: track.id,
      trimType,
      oldTime: trimType === 'in' ? clip.startTime : clip.endTime,
      newTime,
      mediaDuration: clip.mediaDuration
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple trim clip');

    // Calculate new media offset and handle positions if trimming the start
    let newMediaOffset = clip.mediaOffset;
    let newStartPosition = clip.handles?.startPosition || 0;
    let newEndPosition = clip.handles?.endPosition || clip.mediaDuration;

    if (trimType === 'in') {
      // When trimming in, media offset moves with the trim
      const startDelta = newTime - clip.startTime;
      newMediaOffset = clip.mediaOffset + startDelta;
      newStartPosition = newMediaOffset;
      newEndPosition = newMediaOffset + (clip.endTime - newTime);
    } else {
      // When trimming out, only end handle moves
      newEndPosition = newMediaOffset + (newTime - clip.startTime);
    }

    // Get all clips in order, so that we only affect those after the trimmed clip
    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
    const clipIndex = sortedClips.findIndex(c => c.id === clip.id);

    // Calculate duration changes
    const oldDuration = clip.endTime - clip.startTime;
    const newStartTime = trimType === 'in' ? newTime : clip.startTime;
    const newEndTime = trimType === 'in' ? clip.endTime : newTime;
    const newDuration = newEndTime - newStartTime;
    const durationDelta = newDuration - oldDuration;

    logger.debug('Ripple trim positions:', {
      oldOffset: clip.mediaOffset,
      newOffset: newMediaOffset,
      oldHandles: clip.handles,
      newHandles: {
        startPosition: newStartPosition,
        endPosition: newEndPosition
      },
      oldDuration,
      newDuration,
      durationDelta
    });

    // Update the trimmed clip with new positions
    dispatch({
      type: ActionTypes.TRIM_CLIP,
      payload: {
        trackId: track.id,
        clipId: clip.id,
        startTime: newStartTime,
        endTime: newEndTime,
        speed: 1.0,
        handles: {
          startPosition: newStartPosition,
          endPosition: newEndPosition
        },
        ripple: true
      }
    });

    // Shift all subsequent clips by the duration delta
    if (durationDelta !== 0) {
      const subsequentClips = sortedClips.slice(clipIndex + 1);
      subsequentClips.forEach(c => {
        timeline.moveClip(c.id, track.id, track.id, c.startTime + durationDelta);
      });
    }
  }, [timeline, createHistoryCheckpoint]);

  /**
   * Ripple split a clip at the given time
   */
  const rippleSplit = useCallback((
    clip: ClipWithLayer,
    track: Track,
    splitTime: number
  ) => {
    if (isTrackLocked(track)) return;

    if (splitTime <= clip.startTime || splitTime >= clip.endTime) {
      logger.warn('Invalid split time:', {
        clipId: clip.id,
        splitTime,
        clipStart: clip.startTime,
        clipEnd: clip.endTime
      });
      return;
    }

    logger.debug('Ripple split:', {
      clipId: clip.id,
      trackId: track.id,
      splitTime
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple split clip');

    // Split the clip
    timeline.splitClip(track.id, clip.id, splitTime);

    // No need to shift other clips since split maintains total duration
  }, [timeline, createHistoryCheckpoint]);

  return {
    rippleDelete,
    rippleInsert,
    rippleTrim,
    rippleSplit
  };
};
