import React from 'react';
import { LoadingOverlayProps } from '../types/components';

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  isLoading,
  message = 'Loading...',
  progress,
}) => {
  if (!isVisible || !isLoading) {
    return null;
  }

  // Clamp progress between 0 and 1
  const clampedProgress = progress !== undefined 
    ? Math.min(Math.max(progress, 0), 1)
    : progress;

  return (
    <div className="loading-overlay" role="dialog" aria-label="loading overlay">
      <div className="loading-content">
        <div className="loading-spinner" role="progressbar" aria-label="loading" />
        <div className="loading-message" aria-live="polite">{message}</div>
        {clampedProgress !== undefined && (
          <div className="loading-progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              aria-label="progress"
              aria-valuemin={0} 
              aria-valuemax={100} 
              aria-valuenow={Math.round(clampedProgress * 100)}
            >
              <div
                className="progress-fill"
                style={{ width: `${Math.round(clampedProgress * 100)}%` }}
              />
            </div>
            <div className="progress-text" aria-live="polite">
              <span>{Math.round(clampedProgress * 100)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
