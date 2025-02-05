import React, { useCallback, useMemo, useRef } from 'react';
import { formatTime } from '../utils/timelineUnits';
import { logger } from '../utils/logger';

interface TimelineRulerProps {
  currentTime: number;
  duration: number;
  zoom: number;
  fps: number;
  onTimeChange: (time: number) => void;
  containerWidth: number;
  scrollLeft: number;
  isDragging?: boolean;
}

const BASE_PIXELS_PER_SECOND = 100;
const MIN_DIVISION_SPACING = 50; // Minimum pixels between divisions
const MAX_DIVISIONS = 200; // Maximum number of divisions to render
const FRAME_MARKER_HEIGHT = 10;
const SECOND_MARKER_HEIGHT = 15;
const LABEL_OFFSET = 25;
const RULER_HEIGHT = 30;

interface Division {
  time: number;
  x: number;
  isSecond: boolean;
  label?: string;
}

export const TimelineRuler: React.FC<TimelineRulerProps> = ({
  currentTime,
  duration,
  zoom,
  fps,
  onTimeChange,
  containerWidth,
  scrollLeft,
  isDragging = false
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  // Calculate divisions for ruler marks, but only when not dragging
  const divisions = useMemo(() => {
    if (isDragging) return [];

    const pixelsPerSecond = BASE_PIXELS_PER_SECOND * zoom;
    const visibleDuration = containerWidth / pixelsPerSecond;
    const startTime = scrollLeft / pixelsPerSecond;
    const endTime = startTime + visibleDuration;

    // Determine optimal division interval
    const frameInterval = 1 / fps;
    const minInterval = MIN_DIVISION_SPACING / pixelsPerSecond;
    let interval = frameInterval;

    // Scale up interval if divisions would be too dense
    while (interval < minInterval) {
      if (interval < 0.1) interval *= 2;
      else if (interval < 0.5) interval = 0.5;
      else if (interval < 1) interval = 1;
      else interval = Math.ceil(interval) * 2;
    }

    const result: Division[] = [];
    let time = Math.floor(startTime / interval) * interval;

    while (time <= endTime && result.length < MAX_DIVISIONS) {
      const x = time * pixelsPerSecond;
      const isSecond = Math.abs(time % 1) < 0.001;

      result.push({
        time,
        x,
        isSecond,
        label: isSecond ? formatTime(time, { fps, showFrames: false }) : undefined
      });

      time += interval;
    }

    return result;
  }, [containerWidth, zoom, fps, scrollLeft, isDragging]);

  // Draw ruler, but only update divisions when not dragging
  const drawRuler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size with device pixel ratio for sharp text
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = containerWidth;
    const displayHeight = RULER_HEIGHT;

    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Scale context for retina displays
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // Set styles
    ctx.strokeStyle = '#666';
    ctx.fillStyle = '#999';
    ctx.font = '10px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // Draw divisions only if not dragging
    if (!isDragging) {
      divisions.forEach(({ x, isSecond, label }) => {
        const height = isSecond ? SECOND_MARKER_HEIGHT : FRAME_MARKER_HEIGHT;
        const xPos = x - scrollLeft;

        if (xPos >= 0 && xPos <= displayWidth) {
          ctx.beginPath();
          ctx.moveTo(xPos, 0);
          ctx.lineTo(xPos, height);
          ctx.stroke();

          if (label) {
            ctx.fillText(label, xPos, LABEL_OFFSET - 10);
          }
        }
      });
    }

    // Draw current time marker
    const currentX = (currentTime * BASE_PIXELS_PER_SECOND * zoom) - scrollLeft;
    if (currentX >= 0 && currentX <= displayWidth) {
      ctx.strokeStyle = '#f00';
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, displayHeight);
      ctx.stroke();
    }
  }, [divisions, currentTime, zoom, containerWidth, scrollLeft, isDragging]);

  // Update canvas when needed
  React.useLayoutEffect(() => {
    drawRuler();
  }, [drawRuler]);

  const updateTimeFromEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pixelsPerSecond = BASE_PIXELS_PER_SECOND * zoom;
    const time = Math.max(0, Math.min(duration, (x + scrollLeft) / pixelsPerSecond));

    logger.debug('Time update:', {
      clientX: e.clientX,
      rectLeft: rect.left,
      x,
      scrollLeft,
      pixelsPerSecond,
      time,
      isDragging: isDraggingRef.current,
      eventType: e.type
    });

    onTimeChange(time);
  }, [duration, scrollLeft, zoom, onTimeChange]);

  // Handle mouse events
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      updateTimeFromEvent(e);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      isDraggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove, { capture: true });
    document.addEventListener('mouseup', handleMouseUp, { capture: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove, { capture: true });
      document.removeEventListener('mouseup', handleMouseUp, { capture: true });
    };
  }, [updateTimeFromEvent]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    logger.debug('Mouse down on ruler:', {
      clientX: e.clientX,
      offsetX: e.nativeEvent.offsetX,
      target: e.target,
      currentTarget: e.currentTarget
    });

    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    updateTimeFromEvent(e);
  }, [updateTimeFromEvent]);

  return (
    <div className="timeline-ruler" data-testid="timeline-ruler">
      <div className="timeline-ruler-area" data-testid="timeline-ruler-area" />
      <div 
        ref={containerRef}
        className="timeline-ruler-content"
        data-testid="timeline-ruler-content"
        onMouseDown={handleMouseDown}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            pointerEvents: 'none'
          }}
        />
      </div>
    </div>
  );
};
