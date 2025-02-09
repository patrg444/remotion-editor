import React, { useCallback, useRef, useEffect } from 'react';
import { logger } from '../utils/logger';
import { TransitionType } from '../types/transition';
import { TransitionRenderer } from './TransitionRenderer';
import { TimelineConstants } from '../utils/timelineConstants';

interface TimelineTransitionProps {
  id: string;
  type: TransitionType | string;
  startTime: number;
  endTime: number;
  duration: number;
  clipAId: string;
  clipBId: string;
  clipAThumbnail?: string;
  clipBThumbnail?: string;
  direction?: string;
  params?: Record<string, any>;
  onDurationChange: (newDuration: number) => void;
}

const TimelineTransitionComponent: React.FC<TimelineTransitionProps> = (props) => {
  const {
    id,
    type,
    startTime,
    endTime,
    duration,
    clipAId,
    clipBId,
    clipAThumbnail,
    clipBThumbnail,
    direction,
    params,
    onDurationChange
  } = props;

  useEffect(() => {
    console.log('TimelineTransition mounted:', {
      id,
      type,
      startTime,
      endTime,
      duration,
      clipAId,
      clipBId,
      direction,
      params
    });
  }, [id, type, startTime, endTime, duration, clipAId, clipBId, direction, params]);

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

    const newDuration = Math.max(
      TimelineConstants.Transitions.MIN_DURATION,
      Math.min(
        TimelineConstants.Transitions.MAX_DURATION,
        duration + (e.clientX - e.currentTarget.getBoundingClientRect().left) / 100
      )
    );
    
    logger.debug('Ending transition handle drag:', {
      id,
      oldDuration: duration,
      newDuration
    });

    onDurationChange(newDuration);
  }, [id, duration, onDurationChange]);

  const getTransitionIcon = () => {
    switch (type) {
      case 'dissolve':
      case 'crossfade':
        return '↔️';
      case 'fade':
        return '🌅';
      case 'wipe':
        return '➡️';
      case 'slide':
        return '⏩';
      case 'zoom':
        return '🔍';
      case 'push':
        return '👉';
      default:
        return '↔️';
    }
  };

  return (
    <div
      className={`timeline-transition ${type}`}
      data-testid="timeline-transition"
      data-transition-id={id}
      data-type={type}
      data-direction={direction || params?.direction || 'right'}
      data-easing={params?.easing || 'linear'}
      data-params={JSON.stringify({
        ...params,
        direction: direction || params?.direction || 'right',
        duration: params?.duration || duration,
        easing: params?.easing || 'linear'
      })}
      data-duration={duration.toString()}
      style={{
        left: `${startTime * 50}px`, // Use zoom level of 50 from setup
        width: `${(endTime - startTime) * 50}px`, // Use zoom level of 50 from setup
        top: '50%',
        transform: 'translateY(-50%)',
        position: 'absolute',
        height: '20px',
        backgroundColor: 'rgba(0, 123, 255, 0.3)',
        border: '1px solid rgba(0, 123, 255, 0.5)',
        borderRadius: '4px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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
      <div className="timeline-transition-preview">
        <TransitionRenderer
          transition={{
            id,
            type: type as TransitionType,
            duration: Number(duration),
            clipAId,
            clipBId,
            params: params || {}
          }}
          fromClip={{
            id: clipAId,
            thumbnail: clipAThumbnail || '/test.webm',
            duration: 2,
            startTime: startTime
          }}
          toClip={{
            id: clipBId,
            thumbnail: clipBThumbnail || '/test.webm',
            duration: 2,
            startTime: endTime - duration
          }}
          progress={0.5} // Default to mid-transition for preview
          width={200}
          height={20}
        />
      </div>
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

export const TimelineTransition = React.memo(TimelineTransitionComponent);
