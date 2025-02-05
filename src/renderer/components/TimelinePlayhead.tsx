import React, { useCallback, useEffect, useRef } from 'react';
import { TimelineConstants } from '../utils/timelineConstants';
import { timeToPixels } from '../utils/timelineScale';
import { logger } from '../utils/logger';
import { syncManager } from '../utils/SyncManager';

interface TimelinePlayheadProps {
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  fps: number;
  onTimeUpdate: (time: number) => void;
  className?: string;
  isDragging?: boolean;
}

export const TimelinePlayhead: React.FC<TimelinePlayheadProps> = ({
  currentTime,
  isPlaying,
  zoom,
  fps,
  onTimeUpdate,
  className,
  isDragging = false
}) => {
  const playheadRef = useRef<HTMLDivElement>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();

  const targetPositionRef = useRef(timeToPixels(syncManager.snapToFrame(currentTime), zoom));
  const currentPositionRef = useRef(targetPositionRef.current);
  const lastTimeUpdateRef = useRef(0);
  const frameIntervalRef = useRef(1000 / fps); // Time between frames in ms

  // Reset animation refs when playback state changes
  useEffect(() => {
    if (isPlaying) {
      lastFrameTimeRef.current = 0;
      lastTimeUpdateRef.current = 0;
    }
  }, [isPlaying]);

  // Handle smooth playhead animation
  useEffect(() => {
    targetPositionRef.current = timeToPixels(currentTime, zoom);
    
    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
        lastTimeUpdateRef.current = timestamp;
        currentPositionRef.current = targetPositionRef.current;
      }

      if (playheadRef.current) {
        if (isPlaying) {
          // During playback, use frame-accurate updates
          const timeSinceLastUpdate = timestamp - lastTimeUpdateRef.current;
          const newTime = currentTime + (timeSinceLastUpdate / 1000);
          const snappedTime = syncManager.snapToFrame(newTime);
          onTimeUpdate(snappedTime);
          lastTimeUpdateRef.current = timestamp;
          
          // Update position with frame accuracy
          targetPositionRef.current = timeToPixels(snappedTime, zoom);
          currentPositionRef.current = targetPositionRef.current;

          // Update sync manager
          syncManager.updateTime(snappedTime, timestamp);
        } else if (!isDragging) {
          // Smooth interpolation during scrubbing, but not during dragging
          const diff = targetPositionRef.current - currentPositionRef.current;
          const speed = Math.abs(diff) * 0.5; // Faster for more responsive scrubbing
          if (Math.abs(diff) > 0.01) {
            currentPositionRef.current += Math.sign(diff) * Math.min(speed, Math.abs(diff));
          } else {
            currentPositionRef.current = targetPositionRef.current;
          }
        } else {
          // Direct update during dragging
          currentPositionRef.current = targetPositionRef.current;
        }

        // Apply visual update with sub-pixel smoothing and scaled offset
        const smoothX = Math.round(currentPositionRef.current * 100) / 100;
        playheadRef.current.style.transform = `translateX(${smoothX + 100}px)`;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentTime, zoom, isPlaying, onTimeUpdate, isDragging]);

  return (
    <div
      ref={playheadRef}
      className={`timeline-playhead ${className || ''}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '2px',
        height: '100%',
        backgroundColor: '#ff4444',
        pointerEvents: 'none',
        zIndex: 999,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
        transition: 'none'
      }}
    >
      <div
        className="timeline-playhead-head"
        style={{
          position: 'absolute',
          top: -5,
          left: -4,
          width: 0,
          height: 0,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
          borderTop: '5px solid #ff4444'
        }}
      />
    </div>
  );
};
