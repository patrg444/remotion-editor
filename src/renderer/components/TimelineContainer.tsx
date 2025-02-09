import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Timeline } from './Timeline';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { ActionTypes, ClipWithLayer } from '../types/timeline';
import { TimelineConstants } from '../utils/timelineConstants';
import { logger } from '../utils/logger';

export const TimelineContainer: React.FC = () => {
  const { state, dispatch } = useTimelineContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Update container width on resize
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerWidth(rect.width);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateWidth);
    return () => {
      window.removeEventListener('resize', updateWidth);
      resizeObserver.disconnect();
    };
  }, []);

  // Handle scroll events
  const handleScroll = useCallback((scrollLeft: number, scrollTop: number) => {
    dispatch({
      type: ActionTypes.SET_SCROLL_X,
      payload: scrollLeft
    });
    dispatch({
      type: ActionTypes.SET_SCROLL_Y,
      payload: scrollTop
    });
    logger.debug('Timeline scrolled:', { scrollLeft, scrollTop });
  }, [dispatch]);

  // Handle time updates
  const handleTimeUpdate = useCallback((time: number) => {
    console.log('Time update in container:', time);
    dispatch({
      type: ActionTypes.SET_CURRENT_TIME,
      payload: { time }
    });
    logger.debug('Timeline time updated:', time);
  }, [dispatch]);

  // Handle mousewheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = 1 + (delta / 1000);
      const newZoom = Math.min(
        Math.max(state.zoom * zoomFactor, TimelineConstants.Scale.MIN_ZOOM),
        TimelineConstants.Scale.MAX_ZOOM
      );
      
      dispatch({
        type: ActionTypes.SET_ZOOM,
        payload: newZoom
      });
    }
  }, [dispatch, state.zoom]);

  const handleAddTrack = useCallback(() => {
    dispatch({
      type: ActionTypes.ADD_TRACK,
      payload: {
        track: {
          id: `track-${Date.now()}`,
          name: `Track ${state.tracks.length + 1}`,
          type: 'video',
          clips: [] as ClipWithLayer[],
          isLocked: false,
          isVisible: true
        }
      }
    });
  }, [dispatch, state.tracks.length]);

  return (
    <div 
      ref={containerRef}
      className="timeline-container" 
      data-testid="timeline-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflowX: 'visible',
        overflowY: 'visible',
        userSelect: 'none',
        touchAction: 'none',
        backgroundColor: '#1a1a1a',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
      onMouseMove={(e) => {
        // Log container mouse coordinates for debugging
        logger.debug('Container mouse move:', {
          clientX: e.clientX,
          offsetX: e.nativeEvent.offsetX,
          zoom: state.zoom,
          scale: TimelineConstants.Scale.getScale(state.zoom)
        });
      }}
    >
      <div 
        className="timeline-toolbar"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: '8px',
          backgroundColor: '#2a2a2a'
        }}
      >
        <button 
          data-testid="add-track-button"
          onClick={handleAddTrack}
          className="add-track-button"
          style={{
            padding: '4px 8px',
            backgroundColor: '#3a3a3a',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Add Track
        </button>
      </div>
      <div 
        className="timeline-content-wrapper"
        style={{
          position: 'absolute',
          top: 46, // Toolbar height + padding
          left: 0,
          right: 0,
          bottom: 0,
          overflowX: 'visible',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          maxHeight: 'calc(100vh - 46px)' // Subtract toolbar height
        }}
        onWheel={handleWheel}
      >
        <Timeline
          containerWidth={Math.max(0, containerWidth - 200)} // Subtract label width
          scrollLeft={state.scrollX}
          onScroll={handleScroll}
          onTimeUpdate={handleTimeUpdate}
        />
        {state.tracks.length === 0 && (
          <div 
            className="timeline-empty-state" 
            data-testid="empty-state"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666',
              pointerEvents: 'none'
            }}
          >
            No tracks to display
          </div>
        )}
      </div>
    </div>
  );
};
