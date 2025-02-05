import React, { useCallback, useRef, useState } from 'react';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { useTimelineViewport } from '../hooks/useTimelineViewport';
import { useSnapPoints } from '../hooks/useSnapPoints';
import { clampTime } from '../utils/timeValidation';
import { logger } from '../utils/logger';

interface TimelineTransitionHandleProps {
  clipId: string;
  time: number;
  type: 'in' | 'out';
  onChange: (time: number) => void;
}

const SNAP_THRESHOLD = 10; // pixels
const HANDLE_WIDTH = 12;

export const TimelineTransitionHandle: React.FC<TimelineTransitionHandleProps> = ({
  clipId,
  time,
  type,
  onChange
}) => {
  const { state } = useTimelineContext();
  const { timeToPixels, pixelsToTime } = useTimelineViewport();
  const { getAllSnapPoints, findNearestSnapPoint } = useSnapPoints(state.fps);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;

    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartTime(time);
    containerRef.current.setPointerCapture(e.pointerId);

    logger.debug('Transition handle drag started:', {
      clipId,
      type,
      time
    });
  }, [clipId, type, time]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.parentElement?.scrollLeft || 0;
    
    // Calculate timeline coordinates accounting for scroll
    const timelineX = e.clientX - rect.left + scrollLeft;
    const deltaX = e.clientX - dragStartX;
    const newTime = dragStartTime + pixelsToTime(deltaX);

    // Get snap points
    const snapPoints = getAllSnapPoints(
      state.tracks,
      state.markers,
      state.currentTime
    );

    // Find nearest snap point within threshold
    const snapPoint = findNearestSnapPoint(
      newTime,
      snapPoints,
      pixelsToTime(SNAP_THRESHOLD),
      [type === 'in' ? 'clip-end' : 'clip-start']
    );

    // Apply snap or use raw position
    const snappedTime = snapPoint ? snapPoint.time : newTime;

    // Clamp to valid range
    const clampedTime = clampTime(snappedTime, {
      minValue: type === 'in' ? 0 : time,
      maxValue: type === 'out' ? state.duration : time,
      snapToFrames: true,
      fps: state.fps
    });

    onChange(clampedTime);

    logger.debug('Transition handle dragged:', {
      clipId,
      type,
      newTime: clampedTime,
      snapped: !!snapPoint
    });
  }, [
    isDragging,
    dragStartX,
    dragStartTime,
    state.tracks,
    state.markers,
    state.currentTime,
    state.duration,
    state.fps,
    clipId,
    type,
    time,
    getAllSnapPoints,
    findNearestSnapPoint,
    pixelsToTime,
    onChange
  ]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current) return;

    setIsDragging(false);
    containerRef.current.releasePointerCapture(e.pointerId);

    logger.debug('Transition handle drag ended:', {
      clipId,
      type,
      finalTime: time
    });
  }, [clipId, type, time]);

  return (
    <div
      ref={containerRef}
      className={`transition-handle ${type} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: timeToPixels(time) - (type === 'in' ? 0 : HANDLE_WIDTH),
        width: HANDLE_WIDTH,
        top: 0,
        bottom: 0,
        cursor: 'ew-resize'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      role="slider"
      aria-label={`${type} transition handle`}
      aria-valuemin={type === 'in' ? 0 : time}
      aria-valuemax={type === 'out' ? state.duration : time}
      aria-valuenow={time}
    >
      <div className="handle-grip" />
    </div>
  );
};
