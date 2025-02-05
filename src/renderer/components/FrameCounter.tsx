import React from 'react';
import { FrameCounterProps } from '../types/components';

export const FrameCounter: React.FC<FrameCounterProps> = ({
  currentFrame,
  totalFrames,
  fps,
}) => {
  const formatFrameCount = (frame: number): string => {
    const nonNegativeFrame = Math.max(0, frame);
    const nonNegativeTotal = Math.max(0, totalFrames);
    return nonNegativeFrame.toString().padStart(nonNegativeTotal.toString().length, '0');
  };

  const formatTime = (frames: number): string => {
    const safeFps = Math.max(1, fps); // Ensure fps is at least 1
    const nonNegativeFrames = Math.max(0, frames);
    
    // Use integer division for minutes and seconds to avoid floating point errors
    const totalSeconds = Math.floor(nonNegativeFrames / safeFps);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Calculate remaining frames using modulo
    const remainingFrames = Math.round(nonNegativeFrames % safeFps);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}:${remainingFrames.toString().padStart(2, '0')}`;
  };

  return (
    <div className="frame-counter">
      <div className="frame-count">
        <span className="current-frame" aria-label="current frame">{formatFrameCount(currentFrame)}</span>
        <span className="separator" aria-hidden="true">/</span>
        <span className="total-frames" aria-label="total frames">{formatFrameCount(totalFrames)}</span>
      </div>
      <div className="time-display">
        <span className="current-time" aria-label="current time">{formatTime(currentFrame)}</span>
        <span className="separator" aria-hidden="true">/</span>
        <span className="total-time" aria-label="total time">{formatTime(totalFrames)}</span>
      </div>
      <div className="fps-display" aria-label="frame rate">{Math.max(1, fps)} fps</div>
    </div>
  );
};
