import React, { useCallback, useRef, useEffect, useState, memo } from 'react';
import { TimelineTracks } from './TimelineTracks';
import { TimelineRuler } from './TimelineRuler';
import { TimelinePlayhead } from './TimelinePlayhead';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { useTimelineViewport } from '../hooks/useTimelineViewport';
import { throttle, THROTTLE } from '../utils/throttle';
import { ActionTypes, Track, isMediaClip, ClipWithLayer, Clip } from '../types/timeline';
import { logger } from '../utils/logger';

interface TimelineProps {
  containerWidth: number;
  scrollLeft: number;
  onScroll: (scrollLeft: number, scrollTop: number) => void;
  onTimeUpdate: (time: number) => void;
}

const RULER_HEIGHT = 30;

export const Timeline: React.FC<TimelineProps> = memo(({
  containerWidth,
  scrollLeft,
  onScroll,
  onTimeUpdate
}) => {
  const { state, dispatch } = useTimelineContext();
  const { timeToPixels } = useTimelineViewport();
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);
  const lastStateRef = useRef(state);

  // Update duration based on clips and media duration, but only when not dragging
  useEffect(() => {
    if (!state.isDragging) {
      const maxEndTime = state.tracks.reduce((maxTime: number, track: Track) => {
        const trackEndTime = track.clips.reduce<number>((trackMax: number, clip: ClipWithLayer) => {
          const endTime = clip.endTime;
          const startTime = clip.startTime;
          
          if (isMediaClip(clip)) {
            const clipDuration = endTime - startTime;
            const availableDuration = clip.mediaDuration - clip.mediaOffset;
            return Math.max(trackMax, startTime + Math.min(clipDuration, availableDuration));
          }
          return Math.max(trackMax, endTime);
        }, 0);
        return Math.max(maxTime, trackEndTime);
      }, 0);

      // Only update if duration has changed significantly (>0.1s)
      if (Math.abs(maxEndTime - state.duration) > 0.1) {
        dispatch({
          type: ActionTypes.SET_DURATION,
          payload: Math.max(maxEndTime, 10) // Minimum 10 seconds duration
        });
      }
    }
  }, [state.tracks, dispatch, state.duration, state.isDragging]);

  // Handle state updates and notify components
  useEffect(() => {
    const stateChanged = state !== lastStateRef.current;
    lastStateRef.current = state;

    if (stateChanged && containerRef.current) {
      // Force reflow to ensure state changes are applied
      void containerRef.current.offsetHeight;

      // Notify that timeline state has changed
      window.dispatchEvent(new CustomEvent('timeline:state-changed', {
        detail: {
          tracks: state.tracks.map(t => ({
            id: t.id,
            clipCount: t.clips.length,
            clips: t.clips.map(c => ({
              id: c.id,
              startTime: c.startTime,
              endTime: c.endTime,
              layer: c.layer
            }))
          })),
          selectedClipIds: state.selectedClipIds,
          currentTime: state.currentTime,
          zoom: state.zoom
        }
      }));

      // Wait for next frame to ensure DOM is updated
      requestAnimationFrame(() => {
        // Force another reflow to ensure all updates are applied
        if (containerRef.current) {
          void containerRef.current.offsetHeight;
        }
      });
    }
  }, [state]);

  // Memoize callback handlers to prevent unnecessary re-renders
  const handleTimeChange = useCallback((time: number) => {
    logger.debug('Time change in Timeline:', {
      time,
      zoom: state.zoom,
      duration: state.duration,
      scrollLeft,
      containerWidth
    });

    dispatch({
      type: ActionTypes.SET_CURRENT_TIME,
      payload: time
    });
    onTimeUpdate(time);
  }, [dispatch, onTimeUpdate, state.zoom, state.duration, scrollLeft, containerWidth]);

  const handleSelectTrack = useCallback((trackId: string) => {
    dispatch({
      type: ActionTypes.SELECT_TRACK,
      payload: { trackId }
    });
  }, [dispatch]);

  const handleSelectClip = useCallback((clipId: string) => {
    logger.debug('Selecting clip:', clipId);
    dispatch({
      type: ActionTypes.SELECT_CLIPS,
      payload: { clipIds: [clipId] }
    });
  }, [dispatch]);

  const handleClipDragStart = useCallback((clipId: string) => {
    dispatch({
      type: ActionTypes.SET_DRAGGING,
      payload: {
        isDragging: true,
        dragStartX: 0,
        dragStartY: 0
      }
    });
  }, [dispatch]);

  const handleSplitClip = useCallback((clipId: string, time: number) => {
    const track = state.tracks.find(t => t.clips.some(c => c.id === clipId));
    if (!track) return;

    const clip = track.clips.find(c => c.id === clipId);
    if (!clip) return;

    // Only split if time is within clip bounds
    if (time > clip.startTime && time < clip.endTime) {
      dispatch({
        type: ActionTypes.SPLIT_CLIP,
        payload: {
          trackId: track.id,
          clipId,
          time
        }
      });

      // Wait for next frame to ensure state is updated
      requestAnimationFrame(() => {
        // Notify that clip was split
        window.dispatchEvent(new CustomEvent('timeline:clip-split', {
          detail: {
            trackId: track.id,
            originalClipId: clipId,
            splitTime: time,
            firstClipId: `${clipId}-1`,
            secondClipId: `${clipId}-2`
          }
        }));
      });
    }
  }, [state.tracks, dispatch]);

  // Expose for testing
  useEffect(() => {
    logger.debug('Exposing timeline functions for testing');
    const timelineFunctions = {
      handleSelectClip,
      handleSplitClip
    };
    (window as any).timelineFunctions = timelineFunctions;
    logger.debug('Timeline functions exposed:', {
      isExposed: !!(window as any).timelineFunctions,
      functions: Object.keys(timelineFunctions)
    });
  }, [handleSelectClip, handleSplitClip]);

  const handleClipDragEnd = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_DRAGGING,
      payload: {
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0
      }
    });
  }, [dispatch]);

  const handleUpdateTrack = useCallback((trackId: string, updates: Partial<Track>) => {
    dispatch({
      type: ActionTypes.UPDATE_TRACK,
      payload: { trackId, track: updates }
    });
  }, [dispatch]);

  const handleDeleteTrack = useCallback((trackId: string) => {
    dispatch({
      type: ActionTypes.REMOVE_TRACK,
      payload: { trackId }
    });
  }, [dispatch]);

  const handleMoveTrack = useCallback((trackId: string, direction: 'up' | 'down') => {
    const tracks = [...state.tracks];
    const trackIndex = tracks.findIndex((track: Track) => track.id === trackId);
    if (trackIndex === -1) return;

    const newIndex = direction === 'up' 
      ? Math.max(0, trackIndex - 1)
      : Math.min(tracks.length - 1, trackIndex + 1);

    if (newIndex !== trackIndex) {
      const [movedTrack] = tracks.splice(trackIndex, 1) as Track[];
      tracks.splice(newIndex, 0, movedTrack);

      dispatch({
        type: ActionTypes.SET_TRACKS,
        payload: tracks
      });
    }
  }, [dispatch, state.tracks]);

  const handleToggleVisibility = useCallback((trackId: string) => {
    dispatch({
      type: ActionTypes.UPDATE_TRACK,
      payload: {
        trackId,
        changes: (track: Track) => ({ ...track, isVisible: !track.isVisible })
      }
    });
  }, [dispatch]);

  // Calculate content width based on duration and zoom, but only when not dragging
  useEffect(() => {
    if (!state.isDragging) {
      const minWidth = containerWidth;
      const durationWidth = state.duration * state.zoom * 100;
      const newWidth = Math.max(minWidth, durationWidth);
      setContentWidth(newWidth);

      logger.debug('Timeline content width updated:', {
        containerWidth,
        durationWidth,
        contentWidth: newWidth,
        zoom: state.zoom,
        duration: state.duration,
        isDragging: state.isDragging
      });
    }
  }, [containerWidth, state.duration, state.zoom, state.isDragging]);

  // Handle scroll events with throttling
  const handleScroll = useCallback(throttle((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    onScroll(target.scrollLeft, target.scrollTop);
  }, THROTTLE.SCROLL), [onScroll]);

  // Sync scroll position from props
  useEffect(() => {
    if (containerRef.current && containerRef.current.scrollLeft !== scrollLeft) {
      containerRef.current.scrollLeft = scrollLeft;
    }
  }, [scrollLeft]);

  // Focus timeline on mount
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.focus();
    }
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Handle undo/redo shortcuts regardless of selection state
    if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (e.shiftKey) {
        logger.debug('Redo shortcut pressed (Cmd/Ctrl + Shift + Z)');
        dispatch({
          type: ActionTypes.REDO
        });
      } else {
        logger.debug('Undo shortcut pressed (Cmd/Ctrl + Z)');
        dispatch({
          type: ActionTypes.UNDO
        });
      }
      return;
    }

    // Only handle other shortcuts when a clip is selected
    if (state.selectedClipIds.length === 1) {
      switch (e.key) {
        case 's':
        case 'S':
          e.preventDefault();
          logger.debug('Split key pressed:', {
            selectedClipIds: state.selectedClipIds,
            currentTime: state.currentTime,
            tracks: state.tracks
          });
          handleSplitClip(state.selectedClipIds[0], state.currentTime);
          logger.debug('After split attempt:', {
            tracks: state.tracks
          });
          break;
      }
    }
  }, [state.selectedClipIds, state.currentTime, handleSplitClip, dispatch]);

  // Handle mouse events to maintain focus
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Prevent focus loss when clicking inside timeline
    if (timelineRef.current && !timelineRef.current.contains(document.activeElement)) {
      timelineRef.current.focus();
    }
  }, []);

  return (
    <div 
      ref={timelineRef}
      className="timeline-wrapper" 
      data-testid="timeline" 
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
    >
      <TimelineRuler
        currentTime={state.currentTime}
        duration={state.duration}
        zoom={state.zoom}
        fps={state.fps}
        onTimeChange={handleTimeChange}
        containerWidth={containerWidth}
        scrollLeft={scrollLeft}
        isDragging={state.isDragging}
      />
      <div className="timeline-body" data-testid="timeline-body">
        <div 
          ref={containerRef}
          className="timeline-content"
          data-testid="timeline-content"
          style={{
            width: contentWidth,
            minWidth: '100%',
            position: 'relative',
            overflow: 'visible',
            height: '100%',
            transform: 'none', // Remove transform from container
            transformOrigin: '0 0',
            willChange: 'transform'
          }}
          onScroll={handleScroll}
        >
          <TimelinePlayhead
            currentTime={state.currentTime}
            isPlaying={state.isPlaying}
            zoom={state.zoom}
            fps={state.fps}
            onTimeUpdate={handleTimeChange}
            className="ruler"
            isDragging={state.isDragging}
          />
          <TimelinePlayhead
            currentTime={state.currentTime}
            isPlaying={state.isPlaying}
            zoom={state.zoom}
            fps={state.fps}
            onTimeUpdate={handleTimeChange}
            className="tracks"
            isDragging={state.isDragging}
          />
          <TimelineTracks
            tracks={state.tracks}
            selectedTrackId={state.selectedTrackId}
            selectedClipIds={state.selectedClipIds}
            onSelectTrack={handleSelectTrack}
            onSelectClip={handleSelectClip}
            onClipDragStart={handleClipDragStart}
            onClipDragEnd={handleClipDragEnd}
            onUpdateTrack={handleUpdateTrack}
            onDeleteTrack={handleDeleteTrack}
            onMoveTrack={handleMoveTrack}
            onToggleVisibility={handleToggleVisibility}
            zoom={state.zoom}
            fps={state.fps}
          />
        </div>
      </div>
    </div>
  );
});

Timeline.displayName = 'Timeline';
