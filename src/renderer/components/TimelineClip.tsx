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

  const { rippleDelete, rippleTrim } = useRippleEdit();
  const { state, dispatch } = useTimelineContext();
  const timeline = useTimeline();
  const { getAllSnapPoints, findNearestSnapPoint } = useSnapPoints(fps);
  const clipRef = useRef<HTMLDivElement>(null);

  // Track emissions to handle Strict Mode double-mounting
  const hasEmittedRef = useRef(false);
  const lastPropsRef = useRef({ id: clip.id, startTime: clip.startTime, endTime: clip.endTime, layer });

  // Format times for display
  const startTimeFormatted = formatTime(clip.startTime, { fps, showFrames: true });
  const endTimeFormatted = formatTime(clip.endTime, { fps, showFrames: true });
  const durationFormatted = formatTime(clip.endTime - clip.startTime, { fps, showFrames: true });
  const clipDuration = clip.endTime - clip.startTime;

  // Check if clip is selected
  const isSelected = state.selectedClipIds?.includes(clip.id) ?? false;

  // Emit clip events when mounted, positioned, or updated
  useEffect(() => {
    const propsChanged = 
      lastPropsRef.current.id !== clip.id ||
      lastPropsRef.current.startTime !== clip.startTime ||
      lastPropsRef.current.endTime !== clip.endTime ||
      lastPropsRef.current.layer !== layer;

    if (propsChanged) {
      hasEmittedRef.current = false;
      lastPropsRef.current = { id: clip.id, startTime: clip.startTime, endTime: clip.endTime, layer };
    }

    if (!hasEmittedRef.current && clipRef.current) {
      // Force a reflow to ensure styles are applied
      void clipRef.current.offsetHeight;

      // Calculate position and dimensions
      const left = timeToPixels(clip.startTime, zoom);
      const width = timeToPixels(clip.endTime - clip.startTime, zoom);
      const top = layer * TimelineConstants.UI.TRACK_HEIGHT;

      // Update styles
      clipRef.current.style.transition = 'none';
      clipRef.current.style.left = `${Math.round(left)}px`;
      clipRef.current.style.width = `${Math.round(width)}px`;
      clipRef.current.style.top = `${top}px`;

      // Force another reflow
      void clipRef.current.offsetHeight;
      clipRef.current.style.transition = '';

      // Dispatch rendered event
      window.dispatchEvent(new CustomEvent('clip:rendered', {
        detail: {
          clipId: clip.id,
          startTime: clip.startTime,
          endTime: clip.endTime,
          layer,
          left,
          width,
          top
        }
      }));

      // Wait for next frame to ensure styles are applied
      requestAnimationFrame(() => {
        if (!clipRef.current) return;

        // Get final position after styles are applied
        const rect = clipRef.current.getBoundingClientRect();

        // Dispatch positioned event
        window.dispatchEvent(new CustomEvent('clip:positioned', {
          detail: {
            clipId: clip.id,
            left: rect.left,
            width: rect.width,
            top: rect.top
          }
        }));

        hasEmittedRef.current = true;
      });
    }

    return () => {
      // Reset emission flag on cleanup only if props changed
      if (propsChanged) {
        hasEmittedRef.current = false;
      }
    };
  }, [clip.id, clip.startTime, clip.endTime, layer, zoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent, trimSide?: 'trim-start' | 'trim-end') => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const isTrimmingMode = trimSide ? (trimSide === 'trim-start' ? 'start' : 'end') : null;
    setIsDragging(!isTrimmingMode);
    setIsTrimming(isTrimmingMode);
    onSelect();
    onDragStart();
  }, [onSelect, onDragStart]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
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
    }
  }, [onSelect, rippleDelete, clip, track]);

  const renderClipContent = () => {
    if (isVideoClip(clip)) {
      return (
        <VideoClipContent
          clip={clip}
          isSelected={isSelected}
          zoom={zoom}
          fps={fps}
        />
      );
    }
    if (isAudioClip(clip)) {
      return (
        <AudioClipContent
          clip={clip}
          isSelected={isSelected}
          zoom={zoom}
          fps={fps}
        />
      );
    }
    if (isCaptionClip(clip)) {
      return (
        <CaptionClipContent
          clip={clip}
          isSelected={isSelected}
          zoom={zoom}
          fps={fps}
        />
      );
    }
    return null;
  };

  const clipStyle: CSSProperties = {
    position: 'absolute',
    left: `${Math.round(timeToPixels(clip.startTime, zoom))}px`,
    width: `${Math.round(timeToPixels(clip.endTime - clip.startTime, zoom))}px`,
    height: '100%',
    cursor: isKeyboardDragging ? 'move' : isDragging ? 'grabbing' : 'grab',
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
      className={`timeline-clip ${clip.type} ${isKeyboardDragging ? 'keyboard-dragging' : ''} ${isSelected ? 'selected' : ''}`}
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
      data-selected={isSelected}
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
