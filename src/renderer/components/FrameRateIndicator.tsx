import React from 'react';
import { FrameRateIndicatorProps } from '../types/components';

export const FrameRateIndicator: React.FC<FrameRateIndicatorProps> = ({
  frameRate,
  targetFrameRate = 30 // Default target frame rate if not provided
}) => {
  const getStatusClass = (): string => {
    // Handle invalid target frame rate values
    if (targetFrameRate <= 0) {
      return 'status-error';
    }

    if (frameRate >= targetFrameRate) {
      return 'status-good';
    } else if (frameRate >= targetFrameRate * 0.8) {
      return 'status-warning';
    }
    return 'status-error';
  };

  return (
    <div className={`frame-rate-indicator ${getStatusClass()}`} aria-label="frame rate indicator">
      <div className="fps-display">
        <span className="current-fps" aria-label="current fps">{Math.max(0, Math.round(frameRate))}</span>
        <span className="separator" aria-hidden="true">/</span>
        <span className="target-fps" aria-label="target fps">{targetFrameRate}</span>
        <span className="fps-label" aria-hidden="true">fps</span>
      </div>
      <div className="frame-rate">
        <span className="frame-rate-value" aria-label="playback speed">{(frameRate / targetFrameRate).toFixed(2)}x</span>
      </div>
    </div>
  );
};
