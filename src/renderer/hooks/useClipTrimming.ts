import { useCallback } from 'react';
import { useTimeline } from './useTimeline';
import { Track, ClipWithLayer } from '../types/timeline';
import { TimelineConstants } from '../utils/timelineConstants';
import { validateClipTrim, roundToFrame } from '../utils/timeValidation';
import { logger } from '../utils/logger';

export const useClipTrimming = () => {
  const timeline = useTimeline();

  const handleClipDrag = useCallback((
    clip: ClipWithLayer,
    track: Track,
    newStartTime: number,
    targetTrackId: string
  ) => {
    // Calculate allowable movement based on source media bounds
    const currentDuration = clip.endTime - clip.startTime;
    const maxStartTime = Math.max(0, timeline.duration - currentDuration);
    const offsetFromStart = clip.startTime - clip.mediaOffset;
    const newMediaOffset = clip.mediaOffset + (newStartTime - clip.startTime);
    const constrainedStartTime = Math.max(0, newStartTime);

    // Validate against source media bounds
    const sourceValidation = validateClipTrim(
      newMediaOffset,
      currentDuration,
      clip.mediaDuration,
      timeline.fps
    );

    if (!sourceValidation.isValid) {
      logger.warn('[useClipTrimming] Invalid drag:', sourceValidation.errors);
      return;
    }

    // Validate move operation
    const moveValidation = validateClipTrim(
      newMediaOffset,
      currentDuration,
      clip.mediaDuration,
      timeline.fps
    );

    if (!moveValidation.isValid) {
      logger.warn('[useClipTrimming] Invalid move:', moveValidation.errors);
      return;
    }

    if (constrainedStartTime !== clip.startTime || targetTrackId !== track.id) {
      logger.debug('[useClipTrimming] Moving clip =>', {
        clipId: clip.id,
        from: clip.startTime,
        to: constrainedStartTime,
        duration: currentDuration,
        sourceTrack: track.id,
        targetTrack: targetTrackId,
        oldMediaOffset: clip.mediaOffset,
        newMediaOffset
      });

      // Update clip with new position and media offset
      timeline.updateClip(track.id, clip.id, {
        startTime: constrainedStartTime,
        endTime: constrainedStartTime + currentDuration,
        mediaOffset: newMediaOffset
      });
    }
  }, [timeline]);

  const handleTrimStart = useCallback((clip: ClipWithLayer, track: Track, newStartTime: number) => {
    // Calculate valid range for start position relative to source media
    const sourceMediaStart = clip.mediaOffset;
    const sourceMediaEnd = clip.mediaOffset + clip.mediaDuration;
    const minStartTime = sourceMediaStart; // Can't move left before source media start
    const maxStartTime = clip.endTime - TimelineConstants.MIN_DURATION; // Can't move right past end minus minimum duration
    const constrainedStartTime = Math.max(minStartTime, Math.min(maxStartTime, newStartTime));

    // Calculate new media offset
    const newMediaOffset = clip.mediaOffset + (constrainedStartTime - clip.startTime);

    // Validate trim operation
    const validation = validateClipTrim(
      newMediaOffset,
      clip.endTime - constrainedStartTime,
      clip.mediaDuration,
      timeline.fps
    );

    if (!validation.isValid) {
      logger.warn('[useClipTrimming] Invalid trim:', validation.errors);
      return;
    }

    if (Math.abs(constrainedStartTime - clip.startTime) > 0.01) {
      const deltaTime = constrainedStartTime - clip.startTime;
      logger.debug('[useClipTrimming] Trimming clip start =>', {
        clipId: clip.id,
        oldStart: clip.startTime,
        newStart: constrainedStartTime,
        sourceStart: sourceMediaStart,
        sourceEnd: sourceMediaEnd,
        oldMediaOffset: clip.mediaOffset,
        newMediaOffset,
        deltaTime
      });

      // Update handle positions relative to source media start
      const newHandles = {
        startPosition: newMediaOffset,
        endPosition: newMediaOffset + (clip.endTime - constrainedStartTime)
      };
      timeline.trimClip(clip.id, constrainedStartTime, undefined, 1.0, { handles: newHandles });
    }
  }, [timeline]);

  const handleTrimEnd = useCallback((
    clip: ClipWithLayer, 
    track: Track, 
    newEndTime: number,
    options?: { ripple?: boolean }
  ) => {
    logger.debug('[useClipTrimming] Starting trim end =>', {
      clipId: clip.id,
      currentEndTime: clip.endTime,
      newEndTime,
      startTime: clip.startTime,
      mediaOffset: clip.mediaOffset,
      mediaDuration: clip.mediaDuration,
      rippleMode: options?.ripple,
      fps: timeline.fps
    });

    // Calculate end time based on mode and available media
    let targetEndTime;
    let newHandles = {
      startPosition: clip.mediaOffset,
      endPosition: clip.mediaOffset + clip.mediaDuration
    };
    
    if (options?.ripple) {
      // In ripple mode, calculate extension based on available media
      const currentDuration = clip.endTime - clip.startTime;
      const availableExtension = clip.mediaDuration - currentDuration;
      const desiredExtension = newEndTime - clip.endTime;
      const actualExtension = Math.min(desiredExtension, availableExtension);
      targetEndTime = clip.endTime + actualExtension;

      logger.debug('[useClipTrimming] Ripple mode calculation =>', {
        currentDuration,
        availableExtension,
        desiredExtension,
        actualExtension,
        targetEndTime
      });
    } else {
      // In normal mode, use reference bounds to compute target end time
      const refStart = clip.initialBounds ? clip.initialBounds.mediaOffset : clip.mediaOffset;
      const refDuration = clip.initialBounds ? clip.initialBounds.mediaDuration : clip.mediaDuration;
      
      logger.debug('[useClipTrimming] Normal mode calculation =>', {
        currentEndTime: clip.endTime,
        startTime: clip.startTime,
        mediaDuration: clip.mediaDuration,
        mediaOffset: clip.mediaOffset,
        refStart,
        refDuration
      });

      // In normal mode, check if we're dragging right
      const dragDistance = newEndTime - clip.endTime;
      if (dragDistance > 0) {
        // When dragging right in normal mode, extend to full media duration
        // Use initial bounds if available, otherwise use clip's media bounds
        const fullDuration = clip.initialBounds?.mediaDuration ?? clip.mediaDuration;
        
        // Calculate maximum possible end time based on available media
        const maxEndTime = clip.startTime + (clip.mediaDuration - (clip.startTime - clip.mediaOffset));
        
        // Extend to available media duration, but don't exceed maxEndTime
        targetEndTime = Math.min(clip.startTime + fullDuration, maxEndTime);
        
        // Update handles to reflect actual media range
        const actualDuration = targetEndTime - clip.startTime;
        newHandles = {
          startPosition: clip.mediaOffset,
          endPosition: clip.mediaOffset + actualDuration
        };
        
        // Validate against media bounds
        const validation = validateClipTrim(
          clip.mediaOffset,
          targetEndTime - clip.startTime,
          clip.mediaDuration,
          timeline.fps
        );

        if (!validation.isValid) {
          logger.warn('[useClipTrimming] Invalid trim:', validation.errors);
          return;
        }
        
        // Ensure frame alignment
        targetEndTime = roundToFrame(targetEndTime, timeline.fps);
        
        logger.debug('[useClipTrimming] Normal mode calculation =>', {
          dragDistance,
          fullDuration,
          targetEndTime,
          mediaDuration: clip.mediaDuration,
          startTime: clip.startTime,
          endTime: clip.endTime,
          mediaOffset: clip.mediaOffset,
          finalDuration: targetEndTime - clip.startTime,
          handles: newHandles
        });
      } else {
        targetEndTime = clip.endTime;
      }
    }

    // Apply the trim
    timeline.trimClip(clip.id, undefined, targetEndTime, 1.0, { 
      handles: newHandles,
      ripple: false
    });
  }, [timeline]);

  const handleSplitClip = useCallback((clip: ClipWithLayer, splitTime: number, track: Track) => {
    if (splitTime > clip.startTime && splitTime < clip.endTime) {
      // Validate both parts of the split
      const firstPartDuration = splitTime - clip.startTime;
      const secondPartDuration = clip.endTime - splitTime;

      const firstPartValidation = validateClipTrim(
        clip.mediaOffset,
        firstPartDuration,
        clip.mediaDuration,
        timeline.fps
      );

      const secondPartValidation = validateClipTrim(
        clip.mediaOffset + firstPartDuration,
        secondPartDuration,
        clip.mediaDuration - firstPartDuration,
        timeline.fps
      );

      if (!firstPartValidation.isValid || !secondPartValidation.isValid) {
        logger.warn('[useClipTrimming] Invalid split:', {
          firstPart: firstPartValidation.errors,
          secondPart: secondPartValidation.errors
        });
        return;
      }

      logger.debug('[useClipTrimming] Splitting clip =>', {
        clipId: clip.id,
        at: splitTime,
        firstPartDuration,
        secondPartDuration
      });

      timeline.splitClip(track.id, clip.id, splitTime);
    }
  }, [timeline]);

  return {
    handleTrimStart,
    handleTrimEnd,
    handleSplitClip,
    handleClipDrag,
  };
};
