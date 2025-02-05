import React from 'react';
import { ExportOverlayProps } from '../types/components';

export const ExportOverlay: React.FC<ExportOverlayProps> = ({
  isVisible,
  isExporting,
  progress,
  filename,
  onCancel,
}) => {
  if (!isVisible || !isExporting) {
    return null;
  }

  // Clamp progress between 0 and 1
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const progressPercent = Math.round(clampedProgress * 100);

  return (
    <div className="export-overlay" role="dialog" aria-label="export progress">
      <div className="export-content">
        <h3>Exporting Video</h3>
        <p aria-live="polite">Exporting {filename}...</p>
        <div className="export-progress">
          <div 
            className="progress-bar" 
            role="progressbar"
            aria-label="export progress"
            aria-valuemin={0} 
            aria-valuemax={100} 
            aria-valuenow={progressPercent}
          >
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="progress-text" aria-live="polite">{progressPercent}%</div>
        </div>
        <button
          className="cancel-button"
          onClick={onCancel}
          disabled={progressPercent >= 100}
          aria-label={progressPercent >= 100 ? "Export complete" : "Cancel export"}
        >
          Cancel Export
        </button>
      </div>
    </div>
  );
};
