import React from 'react';
import { useTimelineViewport } from '../hooks/useTimelineViewport';

interface TimelinePointProps {
  time: number;
  color?: string;
  label?: string;
  zoom: number;
}

export const TimelinePoint: React.FC<TimelinePointProps> = ({
  time,
  color = '#4a9eff',
  label,
  zoom
}) => {
  const { timeToPixels } = useTimelineViewport();

  return (
    <div 
      className="timeline-point"
      style={{
        left: timeToPixels(time),
        backgroundColor: color
      }}
      role="presentation"
      aria-label={label || `Timeline point at ${time.toFixed(2)} seconds`}
    >
      {label && (
        <div className="timeline-point-label">
          {label}
        </div>
      )}
    </div>
  );
};
