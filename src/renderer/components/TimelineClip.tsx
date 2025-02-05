import React, { useCallback, useState, CSSProperties, useRef, useEffect } from 'react';
import { ClipWithLayer, isVideoClip, isAudioClip, isCaptionClip, Track, ActionTypes } from '../types/timeline';
import { VideoClipContent } from './clips/VideoClipContent';
import { AudioClipContent } from './clips/AudioClipContent';
import { CaptionClipContent } from './clips/CaptionClipContent';
import { formatTime } from '../utils/timelineUnits';
import { timeToPixels, pixelsToTime } from '../utils/timelineScale';
import { TimelineConstants } from '../utils/timelineConstants';
import { useRippleEdit } from '../hooks/useRippleEdit';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { useTimeline } from '../hooks/useTimeline';
import { useSnapPoints } from '../hooks/useSnapPoints';
import { logger } from '../utils/logger';
import { clampTime, validateClipTrim } from '../utils/timeValidation';
import { TrimModeTooltip } from './TrimModeTooltip';

interface TimelineClipProps {
  clip: ClipWithLayer;
  track: Track;
  layer: number;
  zoom: number;
  fps: number;
  onSelect: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  tabIndex?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  style?: CSSProperties;
}

const KEYBOARD_MOVE_STEP = 1;
const KEYBOARD_MOVE_FAST = 10;
const TRACK_LABEL_WIDTH = 160;
const SNAP_THRESHOLD = 5;

interface DragState {
  isDragging: boolean;
  isTrimming: 'start' | 'end' | null;
  pointerDownX: number;
  originalStartPixels: number;
  originalEndPixels: number;
  pointerId: number;
  scrollX: number;
  lastDeltaPixels: number;
  maxExtension: number;
}

export const TimelineClip: React.FC<TimelineClipProps> = ({
  clip,
  track,
  layer,
  zoom,
  fps,
  onSelect,
  onDragStart,
  onDragEnd,
  tabIndex = 0,
  'aria-posinset': posinset,
  'aria-setsize': setsize,
  style
}) => {
  const [isKeyboardDragging, setIsKeyboardDragging] = useState(false);
  const [isAtLimit, setIsAtLimit] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isTrimming, setIsTrimming] = useState<'start' | 'end' | null>(null);
  const [trimMode, setTrimMode] = useState<'normal' | 'ripple' | 'slip'>('normal');

  // Handle trim mode change events
  useEffect(() => {
    const handleTrimModeChange = (e: CustomEvent) => {
      if (isTrimming) {
        const newMode = e.detail?.mode;
        if (newMode && ['normal', 'ripple', 'slip'].includes(newMode)) {
          logger.debug('Setting trim mode from event:', {
            mode: newMode,
            isTrimming,
            currentMode: trimMode
          });
          setTrimMode(newMode);
        }
      }
    };

    window.addEventListener('trimModeChange', handleTrimModeChange as EventListener);
    return () => {
      window.removeEventListener('trimModeChange', handleTrimModeChange as EventListener);
    };
  }, [isTrimming, trimMode]);

  const { rippleDelete, rippleTrim } = useRippleEdit();
  const { state, dispatch } = useTimelineContext();
  const timeline = useTimeline();
  const { getAllSnapPoints, findNearestSnapPoint } = useSnapPoints(fps);
  const clipRef = useRef<HTMLDivElement>(null);

  const dragStateRef = useRef<DragState>({
    isDragging: false,
    isTrimming: null,
    pointerDownX: 0,
    originalStartPixels: 0,
    originalEndPixels: 0,
    pointerId: -1,
    scrollX: 0,
    lastDeltaPixels: 0,
    maxExtension: 0,
  });

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState.isDragging && !dragState.isTrimming) return;
      if (e.pointerId !== dragState.pointerId) return;

      if (clipRef.current) {
      if (dragState.isDragging) {
        const pointerDelta = (e.clientX - TRACK_LABEL_WIDTH) - dragState.pointerDownX;
        const proposedLeft = dragState.originalStartPixels + pointerDelta;
        let newLeft = Math.max(0, proposedLeft);

        // Apply snapping if enabled
        if (state.isSnappingEnabled) {
          const currentTime = pixelsToTime(newLeft, zoom);
          const snapPoints = getAllSnapPoints(state.tracks, state.markers, currentTime, zoom);
          const nearestPoint = findNearestSnapPoint(currentTime, snapPoints, 0.1, ['playhead']);
          
          if (nearestPoint) {
            newLeft = timeToPixels(nearestPoint.time, zoom);
            logger.debug('Snapped to point:', {
              type: nearestPoint.type,
              time: nearestPoint.time,
              source: nearestPoint.source
            });
          }
        }

        clipRef.current.style.left = `${Math.round(newLeft)}px`;
        dragStateRef.current.lastDeltaPixels = newLeft - dragState.originalStartPixels;
        setIsAtLimit(newLeft === 0);
        } else if (dragState.isTrimming === 'start') {
          const minDurationPixels = timeToPixels(TimelineConstants.MIN_DURATION, zoom);
          const minLeftPos = trimMode === 'ripple' ? 0 : timeToPixels(clip.mediaOffset, zoom);
          const maxRightPos = timeToPixels(clip.endTime - TimelineConstants.MIN_DURATION, zoom);
          const pointerDelta = e.clientX - TRACK_LABEL_WIDTH - dragState.pointerDownX;
          const proposedLeft = dragState.originalStartPixels + pointerDelta;
          let newLeft = Math.max(minLeftPos, Math.min(maxRightPos, proposedLeft));

          // Apply snapping if enabled
          if (state.isSnappingEnabled) {
            const currentTime = pixelsToTime(newLeft, zoom);
            const snapPoints = getAllSnapPoints(state.tracks, state.markers, currentTime, zoom);
            const nearestPoint = findNearestSnapPoint(currentTime, snapPoints, 0.1, ['playhead']);
            
            if (nearestPoint) {
              newLeft = timeToPixels(nearestPoint.time, zoom);
              logger.debug('Snapped trim start to point:', {
                type: nearestPoint.type,
                time: nearestPoint.time,
                source: nearestPoint.source
              });
            }
          }

          const newDuration = dragState.originalEndPixels - newLeft;
          if (newDuration >= minDurationPixels) {
            clipRef.current.style.left = `${Math.round(newLeft)}px`;
            clipRef.current.style.width = `${Math.round(newDuration)}px`;
            dragStateRef.current.lastDeltaPixels = newLeft - dragState.originalStartPixels;
            setIsAtLimit(newLeft === minLeftPos);
          }
        } else if (dragState.isTrimming === 'end') {
          const minDurationPixels = timeToPixels(TimelineConstants.MIN_DURATION, zoom);
          const minLeftPos = timeToPixels(clip.startTime + TimelineConstants.MIN_DURATION, zoom);
          
          // In ripple mode, allow extending up to full media duration
          const maxRightPos = timeToPixels(clip.mediaOffset + clip.mediaDuration, zoom);
          
          // Calculate target position
          const pointerDelta = e.clientX - TRACK_LABEL_WIDTH - dragState.pointerDownX;
          const proposedRight = dragState.originalEndPixels + pointerDelta;
          let newRight = Math.max(minLeftPos, Math.min(maxRightPos, proposedRight));

          // Apply snapping if enabled
          if (state.isSnappingEnabled) {
            const currentTime = pixelsToTime(newRight, zoom);
            const snapPoints = getAllSnapPoints(state.tracks, state.markers, currentTime, zoom);
            const nearestPoint = findNearestSnapPoint(currentTime, snapPoints, 0.1, ['playhead']);
            
            if (nearestPoint) {
              newRight = timeToPixels(nearestPoint.time, zoom);
              logger.debug('Snapped trim end to point:', {
                type: nearestPoint.type,
                time: nearestPoint.time,
                source: nearestPoint.source
              });
            }
          }

          const newWidth = newRight - dragState.originalStartPixels;

          // Calculate time delta based on pixel movement
          const deltaPixels = newRight - dragState.originalEndPixels;
          const deltaTime = pixelsToTime(deltaPixels, zoom);

          logger.debug('Trim move calculation:', {
            deltaPixels,
            deltaTime,
            zoom,
            newRight,
            newWidth,
            originalEndPixels: dragState.originalEndPixels,
            originalStartPixels: dragState.originalStartPixels
          });

          // Log values for debugging
          logger.debug('Trim move:', {
            newRight,
            newWidth,
            originalEndPixels: dragState.originalEndPixels,
            originalStartPixels: dragState.originalStartPixels,
            zoom,
            time: pixelsToTime(newRight, zoom)
          });
          
          if (newWidth >= minDurationPixels) {
            clipRef.current.style.width = `${Math.round(newWidth)}px`;
            dragStateRef.current.lastDeltaPixels = newRight - dragState.originalEndPixels;
            setIsAtLimit(newRight === maxRightPos);

            // Let useRippleEdit handle ripple mode trimming
          }
        }
        clipRef.current.style.transition = 'none';
      }
    },
    [clip, zoom, state, trimMode]
  );

  const handlePointerUp = useCallback((e: PointerEvent) => {
    const dragState = dragStateRef.current;
    if (dragState.pointerId === -1) return;

    // Release pointer capture
    if (clipRef.current) {
      try {
        clipRef.current.releasePointerCapture(dragState.pointerId);
      } catch (err) {
        // Ignore errors if pointer capture was already released
      }
    }

    if (dragState.isDragging) {
      const deltaPixels = dragState.lastDeltaPixels;
      const deltaTime = pixelsToTime(deltaPixels, zoom);
      if (Math.abs(deltaTime) > 0.01) {
        const newStartTime = clip.startTime + deltaTime;
        const newEndTime = clip.endTime + deltaTime;
        timeline.updateClip(track.id, clip.id, {
          startTime: newStartTime,
          endTime: newEndTime,
          mediaOffset: clip.mediaOffset + deltaTime
        });
      }
    } else if (dragState.isTrimming === 'start') {
      const deltaPixels = dragState.lastDeltaPixels;
      const deltaTime = pixelsToTime(deltaPixels, zoom);
      if (Math.abs(deltaTime) > 0.01) {
        const newStartTime = clip.startTime + deltaTime;
        const newMediaOffset = clip.mediaOffset + deltaTime;
        timeline.trimClip(clip.id, newStartTime, undefined, 1.0, {
          handles: {
            startPosition: newMediaOffset,
            endPosition: newMediaOffset + (clip.endTime - newStartTime)
          },
          ripple: trimMode === 'ripple'
        });
      }
    } else if (dragState.isTrimming === 'end') {
      const deltaPixels = dragState.lastDeltaPixels;
      const deltaTime = pixelsToTime(deltaPixels, zoom);
      if (Math.abs(deltaTime) > 0.01) {
      // Calculate target end time based on mode
      const targetEndTime = clip.endTime + deltaTime;

      // In ripple mode, constrain to media duration
      if (trimMode === 'ripple') {
        const maxEndTime = clip.mediaOffset + clip.mediaDuration;
        const constrainedEndTime = Math.min(targetEndTime, maxEndTime);

        logger.debug('Trim end calculation:', {
          clipId: clip.id,
          deltaPixels,
          deltaTime,
          clipEndTime: clip.endTime,
          targetEndTime,
          constrainedEndTime,
          zoom,
          trimMode,
          ripple: true
        });

        timeline.trimClip(clip.id, undefined, constrainedEndTime, 1.0, {
          handles: {
            startPosition: clip.mediaOffset,
            endPosition: clip.mediaOffset + (constrainedEndTime - clip.startTime)
          },
          ripple: true
        });
      } else {
        // In normal mode, just use the delta
        logger.debug('Trim end calculation:', {
          clipId: clip.id,
          deltaPixels,
          deltaTime,
          clipEndTime: clip.endTime,
          targetEndTime,
          zoom,
          trimMode,
          ripple: false
        });

        timeline.trimClip(clip.id, undefined, targetEndTime, 1.0, {
          handles: {
            startPosition: clip.mediaOffset,
            endPosition: Math.min(
              clip.mediaOffset + clip.mediaDuration,
              clip.mediaOffset + (targetEndTime - clip.startTime)
            )
          },
          ripple: false
        });
      }
      }
    }

    // Reset drag state
    dragStateRef.current = {
      isDragging: false,
      isTrimming: null,
      pointerDownX: 0,
      originalStartPixels: 0,
      originalEndPixels: 0,
      pointerId: -1,
      scrollX: 0,
      lastDeltaPixels: 0,
      maxExtension: 0,
    };

    // Reset clip styles
    if (clipRef.current) {
      clipRef.current.style.transition = '';
      clipRef.current.style.transform = '';
      clipRef.current.style.willChange = '';
    }

    setIsDragging(false);
    setIsTrimming(null);
    setIsAtLimit(false);
    onDragEnd();

    dispatch({
      type: ActionTypes.SET_DRAGGING,
      payload: {
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
      },
    });
  }, [clip, track, zoom, timeline, onDragEnd, dispatch, trimMode]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, trimSide?: 'trim-start' | 'trim-end') => {
      // Determine trim mode based on modifier keys
      if (trimSide) {
        logger.debug('Pointer down with modifiers:', {
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          trimSide
        });
        
        if (e.altKey) {
          setTrimMode('ripple');
          // Force ripple mode immediately
          setTimeout(() => {
            setTrimMode('ripple');
          }, 0);
        } else if (e.shiftKey) {
          setTrimMode('slip');
        } else {
          setTrimMode('normal');
        }
      }
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget;
      target.setPointerCapture(e.pointerId);

      const isTrimmingMode = trimSide ? (trimSide === 'trim-start' ? 'start' : 'end') : null;
      // Calculate initial positions based on clip state
      const startPixels = timeToPixels(clip.startTime, zoom);
      const endPixels = timeToPixels(clip.endTime, zoom);

      // Store original positions for drag calculations
      const originalStartPixels = startPixels;
      const originalEndPixels = endPixels;

      // Calculate maximum allowed movement based on source media bounds (used for trimming)
      let maxExtension = 0;
      if (isTrimmingMode === 'start') {
        const distanceToSourceStart = clip.startTime - clip.mediaOffset;
        maxExtension = timeToPixels(distanceToSourceStart, zoom);
      } else if (isTrimmingMode === 'end') {
        const sourceEndTime = clip.mediaOffset + clip.mediaDuration;
        const distanceToSourceEnd = sourceEndTime - clip.endTime;
        maxExtension = timeToPixels(distanceToSourceEnd, zoom);
      } else {
        const distanceToSourceStart = clip.startTime - clip.mediaOffset;
        const distanceToSourceEnd = (clip.mediaOffset + clip.mediaDuration) - (clip.startTime + (clip.endTime - clip.startTime));
        maxExtension = Math.min(timeToPixels(distanceToSourceStart, zoom), timeToPixels(distanceToSourceEnd, zoom));
      }

      dragStateRef.current = {
        isDragging: !isTrimmingMode,
        isTrimming: isTrimmingMode,
        pointerDownX: e.clientX - TRACK_LABEL_WIDTH,
        originalStartPixels,
        originalEndPixels,
        pointerId: e.pointerId,
        scrollX: state.scrollX,
        lastDeltaPixels: 0,
        maxExtension,
      };

      if (clipRef.current) {
        clipRef.current.style.transform = '';
        clipRef.current.style.transition = 'none';
      }

      onSelect();
      onDragStart();
      
      setIsDragging(!isTrimmingMode);
      setIsTrimming(isTrimmingMode);
      setIsAtLimit(false);

      dispatch({
        type: ActionTypes.SET_DRAGGING,
        payload: {
          isDragging: true,
          dragStartX: e.clientX - TRACK_LABEL_WIDTH,
          dragStartY: e.clientY,
        },
      });
    },
    [onSelect, onDragStart, clip, state.scrollX, zoom, dispatch]
  );

  // Handle modifier keys for trim mode switching
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTrimming) {
        logger.debug('Key down in trim mode:', {
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          key: e.key,
          code: e.code
        });

        if (e.altKey) {
          setTrimMode('ripple');
          // Force ripple mode immediately
          setTimeout(() => {
            setTrimMode('ripple');
          }, 0);
        } else if (e.shiftKey) {
          setTrimMode('slip');
        } else {
          setTrimMode('normal');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (isTrimming) {
        logger.debug('Key up in trim mode:', {
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          key: e.key,
          code: e.code
        });

        if (!e.altKey && !e.shiftKey) {
          setTrimMode('normal');
        } else if (e.altKey) {
          setTrimMode('ripple');
        } else if (e.shiftKey) {
          setTrimMode('slip');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('keyup', handleKeyUp, { capture: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('keyup', handleKeyUp, { capture: true });
    };
  }, [isTrimming]);

  // Handle window pointer events
  useEffect(() => {
    const handleWindowPointerMove = (e: PointerEvent) => {
      handlePointerMove(e);
    };

    const handleWindowPointerUp = (e: PointerEvent) => {
      handlePointerUp(e);
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      // Also handle mouseup to ensure cleanup happens
      if (dragStateRef.current.pointerId !== -1) {
        handlePointerUp(new PointerEvent('pointerup', {
          pointerId: dragStateRef.current.pointerId,
          clientX: e.clientX,
          clientY: e.clientY,
          bubbles: true,
          cancelable: true,
        }));
      }
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerUp);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerUp);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  const moveClip = useCallback(
    (frameOffset: number) => {
      const frameDuration = 1 / fps;
      const timeOffset = frameOffset * frameDuration;
      const proposedStartTime = clip.startTime + timeOffset;
      const minStartTime = 0;
      const maxStartTime = timeline.duration - (clip.endTime - clip.startTime);
      const newStartTime = Math.max(minStartTime, Math.min(maxStartTime, proposedStartTime));
      const duration = clip.endTime - clip.startTime;
      timeline.updateClip(track.id, clip.id, {
        startTime: newStartTime,
        endTime: newStartTime + duration,
        mediaOffset: clip.mediaOffset + (newStartTime - clip.startTime)
      });
    },
    [clip, track, fps, timeline]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Update trim mode based on modifier keys or specific keys when trimming
      if (isTrimming) {
        logger.debug('Key down in clip:', {
          key: e.key,
          code: e.code,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          isTrimming
        });

        if (e.key === 'r' || e.key === 'R') {
          e.preventDefault();
          e.stopPropagation();
          setTrimMode('ripple');
          // Force ripple mode immediately and ensure it stays in ripple mode
          setTimeout(() => {
            setTrimMode('ripple');
            // Dispatch a custom event to ensure ripple mode is set
            window.dispatchEvent(new CustomEvent('trimModeChange', { 
              detail: { mode: 'ripple' } 
            }));
          }, 0);
        } else if (e.altKey) {
          setTrimMode('ripple');
        } else if (e.shiftKey) {
          setTrimMode('slip');
        } else {
          setTrimMode('normal');
        }
      }

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          rippleDelete(clip, track);
          break;
        case 'm':
          if (!isKeyboardDragging) {
            e.preventDefault();
            setIsKeyboardDragging(true);
            onDragStart();
          }
          break;
        case 'ArrowLeft':
          if (isKeyboardDragging) {
            e.preventDefault();
            moveClip(e.shiftKey ? -KEYBOARD_MOVE_FAST : -KEYBOARD_MOVE_STEP);
          }
          break;
        case 'ArrowRight':
          if (isKeyboardDragging) {
            e.preventDefault();
            moveClip(e.shiftKey ? KEYBOARD_MOVE_FAST : KEYBOARD_MOVE_STEP);
          }
          break;
        case 'Escape':
          if (isKeyboardDragging) {
            e.preventDefault();
            setIsKeyboardDragging(false);
            onDragEnd();
          }
          break;
        case 'r':
        case 'R':
          if (isTrimming) {
            e.preventDefault();
            e.stopPropagation();
            setTrimMode('ripple');
            // Force ripple mode immediately
            setTimeout(() => {
              setTrimMode('ripple');
            }, 0);
          }
          break;
        case 's':
        case 'S':
          if (isTrimming) {
            e.preventDefault();
            setTrimMode('slip');
          } else {
            e.preventDefault();
            dispatch({
              type: ActionTypes.SET_SNAPPING,
              payload: !state.isSnappingEnabled
            });
          }
          break;
        case 'n':
        case 'N':
          if (isTrimming) {
            e.preventDefault();
            setTrimMode('normal');
          }
          break;
      }
    },
    [isKeyboardDragging, onSelect, onDragStart, onDragEnd, moveClip, clip, track, rippleDelete, isTrimming]
  );

  const renderClipContent = () => {
    if (isVideoClip(clip)) {
      return (
        <VideoClipContent
          clip={clip}
          isSelected={state.selectedClipIds.includes(clip.id)}
          zoom={zoom}
          fps={fps}
        />
      );
    }
    if (isAudioClip(clip)) {
      return (
        <AudioClipContent
          clip={clip}
          isSelected={state.selectedClipIds.includes(clip.id)}
          zoom={zoom}
          fps={fps}
        />
      );
    }
    if (isCaptionClip(clip)) {
      return (
        <CaptionClipContent
          clip={clip}
          isSelected={state.selectedClipIds.includes(clip.id)}
          zoom={zoom}
          fps={fps}
        />
      );
    }
    return null;
  };

  const startTimeFormatted = formatTime(clip.startTime, { fps, showFrames: true });
  const endTimeFormatted = formatTime(clip.endTime, { fps, showFrames: true });
  const durationFormatted = formatTime(clip.endTime - clip.startTime, { fps, showFrames: true });

  const clipDuration = clip.endTime - clip.startTime;
  const sourceStart = clip.mediaOffset;
  const sourceEnd = clip.mediaOffset + clip.mediaDuration;
  const clipStart = Math.max(clip.startTime, sourceStart);
  const clipEnd = Math.min(clip.endTime, sourceEnd);
  // In ripple mode, allow the clip to extend beyond its media duration
  const currentDuration = trimMode === 'ripple' ? clipDuration : Math.min(clipDuration, clip.mediaDuration);
  const widthPixels = Math.max(0, Math.round(timeToPixels(currentDuration, zoom)));

  if (clipDuration > clip.mediaDuration) {
    logger.warn('Clip exceeds source media duration:', {
      clipId: clip.id,
      duration: clipDuration,
      sourceStart,
      sourceEnd,
      mediaDuration: clip.mediaDuration
    });
  }
  
  const initialLeft = timeToPixels(clip.startTime, zoom);

  const clipStyle: CSSProperties = {
    position: 'absolute',
    left: `${Math.round(initialLeft)}px`,
    width: `${widthPixels}px`,
    height: '100%',
    cursor: isKeyboardDragging ? 'move' : dragStateRef.current.isTrimming ? 'col-resize' : isDragging ? 'grabbing' : 'grab',
    top: style?.top,
    willChange: isDragging ? 'transform' : undefined,
    touchAction: 'none',
    userSelect: 'none',
    pointerEvents: 'auto',
    zIndex: isDragging || isTrimming ? 100 : 1,
    opacity: clipDuration > clip.mediaDuration ? 0.7 : 1
  };

  return (
    <div
      ref={clipRef}
      data-testid="timeline-clip"
      className={`timeline-clip ${clip.type} ${isKeyboardDragging ? 'keyboard-dragging' : ''} ${state.selectedClipIds.includes(clip.id) ? 'selected' : ''}`}
      style={clipStyle}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-label={`${clip.name} clip from ${startTimeFormatted} to ${endTimeFormatted}, duration ${durationFormatted}`}
      aria-grabbed={isKeyboardDragging}
      aria-dropeffect="move"
      tabIndex={tabIndex}
      aria-posinset={posinset}
      aria-setsize={setsize}
      data-clip-id={clip.id}
      data-moving={isDragging || isTrimming ? 'true' : undefined}
      data-trimming={isTrimming || undefined}
      data-at-limit={isAtLimit || (clip.endTime - clip.startTime) > clip.mediaDuration || undefined}
      data-trim-mode={trimMode}
    >
      {isTrimming && <TrimModeTooltip mode={trimMode} />}
      <div
        className="clip-handle left clip-trim-start"
        onPointerDown={(e) => {
          e.stopPropagation();
          handlePointerDown(e, 'trim-start');
        }}
        style={{
          position: 'absolute',
          left: -8,
          width: 16,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          opacity: 0,
          transition: 'opacity 0.15s ease'
        }}
      />
      {renderClipContent()}
      <div
        className="clip-handle right clip-trim-end"
        onPointerDown={(e) => {
          e.stopPropagation();
          handlePointerDown(e, 'trim-end');
        }}
        style={{
          position: 'absolute',
          right: -8,
          width: 16,
          height: '100%',
          cursor: 'col-resize',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.1)',
          opacity: 0,
          transition: 'opacity 0.15s ease'
        }}
      />
      <div className="clip-duration">
        {durationFormatted}
        {clipDuration > clip.mediaDuration && (
          <span style={{ fontSize: '0.8em', opacity: 0.7, marginLeft: '4px', color: '#ff6b6b' }}>
            ({formatTime(clip.mediaDuration, { fps, showFrames: true })} source)
          </span>
        )}
      </div>
    </div>
  );
};
