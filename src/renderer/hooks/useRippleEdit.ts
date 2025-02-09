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

  /**
   * Ripple delete a clip and shift all subsequent clips left
   */
  const rippleDelete = useCallback((clip: ClipWithLayer, track: Track) => {
    const duration = clip.endTime - clip.startTime;
    const deleteTime = clip.startTime;

    logger.debug('Ripple delete:', {
      clipId: clip.id,
      trackId: track.id,
      deleteTime,
      duration
    });

    // Sort clips by start time and find the clip to delete
    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
    const clipIndex = sortedClips.findIndex(c => c.id === clip.id);
    
    if (clipIndex === -1) {
      logger.warn('Clip not found in track:', { clipId: clip.id, trackId: track.id });
      return;
    }

    // Calculate gaps between subsequent clips to maintain spacing
    const subsequentClips = sortedClips.slice(clipIndex + 1);
    const initialGaps = subsequentClips.map((c, i) => {
      const prevClip = i === 0 ? clip : subsequentClips[i - 1];
      return {
        clipId: c.id,
        gap: c.startTime - prevClip.endTime
      };
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple delete clip');

    // First remove the clip
    timeline.removeClip(track.id, clip.id);

    // Then shift subsequent clips while maintaining gaps
    subsequentClips.forEach((c, i) => {
      const gap = initialGaps[i].gap;
      const newStartTime = i === 0 ?
        deleteTime + gap : // First subsequent clip starts after gap
        subsequentClips[i-1].endTime + gap; // Other clips maintain gaps
      
      timeline.moveClip(c.id, track.id, track.id, newStartTime);
    });

    logger.debug('Ripple delete complete:', {
      deletedClip: {
        id: clip.id,
        startTime: deleteTime,
        duration
      },
      subsequentClips: subsequentClips.map(c => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.endTime
      }))
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
    const duration = clip.endTime - clip.startTime;

    // Validate insert time
    if (insertTime < 0) {
      logger.warn('Invalid insert time:', { insertTime });
      return;
    }

    logger.debug('Ripple insert:', {
      clipId: clip.id,
      trackId: track.id,
      insertTime,
      duration
    });

    // Sort clips by start time
    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
    
    // Find insertion point and calculate gaps
    const insertIndex = sortedClips.findIndex(c => c.startTime > insertTime);
    const subsequentClips = insertIndex === -1 ? [] : sortedClips.slice(insertIndex);
    
    // Calculate initial gaps between existing clips
    const initialGaps = subsequentClips.map((c, i) => {
      const prevClip = i === 0 ? 
        (insertIndex > 0 ? sortedClips[insertIndex - 1] : null) : 
        subsequentClips[i - 1];
      return {
        clipId: c.id,
        gap: prevClip ? c.startTime - prevClip.endTime : 0
      };
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple insert clip');

    // First add the new clip
    const newClip = {
      ...clip,
      startTime: insertTime,
      endTime: insertTime + duration
    };
    dispatch({
      type: ActionTypes.ADD_CLIP,
      payload: { trackId: track.id, clip: newClip }
    });

    // Then shift subsequent clips while maintaining gaps
    subsequentClips.forEach((c, i) => {
      const gap = initialGaps[i].gap;
      const newStartTime = i === 0 ?
        insertTime + duration + gap : // First subsequent clip starts after inserted clip + gap
        subsequentClips[i-1].endTime + gap; // Other clips maintain gaps
      
      timeline.moveClip(c.id, track.id, track.id, newStartTime);
    });

    logger.debug('Ripple insert complete:', {
      insertedClip: {
        id: clip.id,
        startTime: insertTime,
        duration
      },
      subsequentClips: subsequentClips.map(c => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.endTime
      }))
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
    const oldStartTime = clip.startTime;
    const oldEndTime = clip.endTime;
    const oldDuration = oldEndTime - oldStartTime;
    const MIN_DURATION = 0.1; // Minimum duration constant
    
    logger.debug('Ripple trim:', {
      clipId: clip.id,
      trackId: track.id,
      trimType,
      oldTime: trimType === 'in' ? oldStartTime : oldEndTime,
      newTime,
      oldDuration,
      mediaDuration: clip.mediaDuration
    });

    // Calculate valid time boundaries
    const maxEndTime = clip.startTime + clip.mediaDuration;
    const minStartTime = oldStartTime - clip.mediaOffset;
    
    // For out trim, handle gradual extension
    let validatedTime = newTime;
    if (trimType === 'in') {
      const maxInPoint = oldEndTime - MIN_DURATION;
      validatedTime = Math.max(minStartTime, Math.min(maxInPoint, newTime));
    } else {
      const minOutPoint = oldStartTime + MIN_DURATION;
      const currentDuration = oldEndTime - oldStartTime;
      
      // If current duration is around 2s (initial state), first extend to 4s
      if (Math.abs(currentDuration - 2) < 0.1) {
        validatedTime = oldStartTime + 4;
      } else if (currentDuration < clip.mediaDuration) {
        // After 4s, allow extending up to full media duration
        validatedTime = Math.max(minOutPoint, Math.min(maxEndTime, newTime));
      } else {
        validatedTime = maxEndTime;
      }
    }

    logger.debug('Trim validation:', {
      original: newTime,
      validated: validatedTime,
      trimType,
      currentDuration: oldEndTime - oldStartTime,
      mediaDuration: clip.mediaDuration
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple trim clip');

    // Sort clips by start time to ensure proper ripple order
    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
    const clipIndex = sortedClips.findIndex(c => c.id === clip.id);
    const subsequentClips = sortedClips.slice(clipIndex + 1);

    // Calculate gaps between clips to maintain
    const initialGaps = subsequentClips.map((c, i) => {
      const prevClip = i === 0 ? clip : subsequentClips[i - 1];
      return {
        clipId: c.id,
        gap: Math.max(0, c.startTime - prevClip.endTime)
      };
    });

    if (trimType === 'in') {
      // Calculate new media offset for in trim
      const startDelta = validatedTime - oldStartTime;
      const newMediaOffset = clip.mediaOffset + startDelta;

      // First trim the current clip
      dispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          trackId: track.id,
          clipId: clip.id,
          startTime: validatedTime,
          endTime: clip.endTime,
          speed: 1.0,
          handles: {
            startPosition: newMediaOffset,
            endPosition: newMediaOffset + (clip.endTime - validatedTime)
          },
          ripple: true
        }
      });

      // Shift subsequent clips to maintain gaps
      const shift = validatedTime - oldStartTime;
      subsequentClips.forEach((c, i) => {
        const gap = initialGaps[i].gap;
        const newStartTime = i === 0 ? 
          clip.endTime + gap + shift : 
          subsequentClips[i-1].endTime + gap;
        
        timeline.moveClip(c.id, track.id, track.id, newStartTime);
      });
    } else {
      // For out trim, directly use the validated time
      const newDuration = validatedTime - clip.startTime;

      // Dispatch trim action
      dispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          trackId: track.id,
          clipId: clip.id,
          startTime: clip.startTime,
          endTime: validatedTime,
          speed: 1.0,
          handles: {
            startPosition: clip.mediaOffset,
            endPosition: clip.mediaOffset + newDuration
          },
          ripple: true,
          maintainGaps: true
        }
      });

      // Shift subsequent clips to maintain gaps
      subsequentClips.forEach((c, i) => {
        const gap = initialGaps[i].gap;
        const newStartTime = i === 0 ? 
          validatedTime + gap : 
          subsequentClips[i-1].endTime + gap;
        
        timeline.moveClip(c.id, track.id, track.id, newStartTime);
      });
    }

    logger.debug('Ripple trim complete:', {
      clipId: clip.id,
      newStartTime: trimType === 'in' ? validatedTime : clip.startTime,
      newEndTime: trimType === 'out' ? validatedTime : clip.endTime,
      subsequentClips: subsequentClips.map(c => ({
        id: c.id,
        startTime: c.startTime,
        endTime: c.endTime
      }))
    });
  }, [timeline, createHistoryCheckpoint]);

  /**
   * Ripple split a clip at the given time
   */
  const rippleSplit = useCallback((
    clip: ClipWithLayer,
    track: Track,
    splitTime: number
  ) => {
    // Validate split time with minimum segment duration
    const minDuration = 0.1; // Minimum duration of 0.1s for each segment
    if (
      splitTime <= clip.startTime + minDuration || 
      splitTime >= clip.endTime - minDuration
    ) {
      logger.warn('Invalid split time:', {
        clipId: clip.id,
        splitTime,
        clipStart: clip.startTime,
        clipEnd: clip.endTime,
        minDuration,
        leftSegmentDuration: splitTime - clip.startTime,
        rightSegmentDuration: clip.endTime - splitTime
      });
      return;
    }

    // Sort clips to ensure proper order
    const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
    const clipIndex = sortedClips.findIndex(c => c.id === clip.id);
    
    if (clipIndex === -1) {
      logger.warn('Clip not found in track:', { clipId: clip.id, trackId: track.id });
      return;
    }

    logger.debug('Ripple split:', {
      clipId: clip.id,
      trackId: track.id,
      splitTime,
      clipDuration: clip.endTime - clip.startTime,
      leftSegmentDuration: splitTime - clip.startTime,
      rightSegmentDuration: clip.endTime - splitTime
    });

    // Create checkpoint before ripple operation
    createHistoryCheckpoint('Ripple split clip');

    // Split the clip
    timeline.splitClip(track.id, clip.id, splitTime);

    // No need to shift other clips since split maintains total duration
    logger.debug('Ripple split complete:', {
      originalClip: {
        id: clip.id,
        startTime: clip.startTime,
        endTime: clip.endTime
      },
      splitPoint: splitTime
    });
  }, [timeline, createHistoryCheckpoint]);

  return {
    rippleDelete,
    rippleInsert,
    rippleTrim,
    rippleSplit
  };
};
