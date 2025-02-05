import React from 'react';
import { formatTime, TimeFormatOptions } from '../utils/timelineUnits';

interface TimeDisplayProps {
  time: number;
  fps: number;
  options?: Omit<TimeFormatOptions, 'fps'>;
  className?: string;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  time,
  fps,
  options = {},
  className
}) => {
  const formattedTime = formatTime(time, {
    ...options,
    fps
  });

  return (
    <div className={`time-display ${className || ''}`}>
      {formattedTime}
    </div>
  );
};
