import React, { useCallback } from 'react';
import { logger } from '../utils/logger';

interface TimelineTransitionProps {
  id: string;
  type: string;
  startTime: number;
  endTime: number;
  duration: number;
  onDurationChange: (newDuration: number) => void;
}

export const TimelineTransition: React.FC<TimelineTransitionProps> = ({
  id,
  type,
  startTime,
  endTime,
  duration,
  onDurationChange
}) => {
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.stopPropagation();
    logger.debug('Starting transition handle drag:', {
      id,
      type,
      startTime,
      endTime,
      duration
    });
  }, [id, type, startTime, endTime, duration]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (!e.clientX) return; // Ignore invalid drag events

    logger.debug('Dragging transition handle:', {
      clientX: e.clientX,
      duration
    });
  }, [duration]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (!e.clientX) return;

    const newDuration = Math.max(0.1, Math.min(2.0, duration + (e.clientX - e.currentTarget.getBoundingClientRect().left) / 100));
    
    logger.debug('Ending transition handle drag:', {
      id,
      oldDuration: duration,
      newDuration
    });

    onDurationChange(newDuration);
  }, [id, duration, onDurationChange]);

  const getTransitionIcon = () => {
    switch (type) {
      case 'cross-dissolve':
        return '↔️';
      case 'fade':
        return '🌅';
      case 'wipe':
        return '➡️';
      default:
        return '↔️';
    }
  };

  return (
    <div
      className={`timeline-transition ${type}`}
      data-testid="timeline-transition"
      data-type={type}
      data-duration={duration}
      style={{
        left: `${startTime * 100}px`,
        width: `${(endTime - startTime) * 100}px`
      }}
    >
      <div
        className="timeline-transition-handle left"
        data-testid="timeline-transition-handle"
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
      <div className="timeline-transition-icon">
        {getTransitionIcon()}
      </div>
      <div
        className="timeline-transition-handle right"
        data-testid="timeline-transition-handle"
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
    </div>
  );
};
