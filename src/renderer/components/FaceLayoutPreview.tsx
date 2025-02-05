import React, { FC, useCallback } from 'react';
import { AspectRatio, FaceLayout } from '../../types/face-tracking';
import { generateLayout } from '../utils/faceLayoutUtils';
import '../styles/face-layout-preview.css';

interface FaceLayoutPreviewProps {
  aspectRatio: AspectRatio;
  numFaces: number;
  selectedLayout?: FaceLayout;
  onLayoutSelect: (layout: FaceLayout) => void;
}

export const FaceLayoutPreview: FC<FaceLayoutPreviewProps> = ({
  aspectRatio,
  numFaces,
  selectedLayout,
  onLayoutSelect,
}) => {
  const handleLockChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedLayout) {
      onLayoutSelect({
        ...selectedLayout,
        isUserOverride: e.target.checked
      });
    }
  }, [selectedLayout, onLayoutSelect]);

  return (
    <div className="face-layout-preview" data-aspect-ratio={aspectRatio}>
      <div className="layout-controls">
        <label>
          <input
            type="checkbox"
            checked={selectedLayout?.isUserOverride}
            onChange={handleLockChange}
          />
          Lock layout (prevent auto-reflow)
        </label>
      </div>
    </div>
  );
};
