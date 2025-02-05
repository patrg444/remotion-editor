import React from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import { ActionTypes } from '../types/timeline';
import '../styles/aspect-ratio-control.css';

const PRESETS = [
  { id: '16:9', name: '16:9 (HD)', width: 1920, height: 1080, preset: '16:9' },
  { id: '4:3', name: '4:3 (SD)', width: 1440, height: 1080, preset: '4:3' },
  { id: '1:1', name: '1:1 (Square)', width: 1080, height: 1080, preset: '1:1' },
  { id: '9:16', name: '9:16 (Portrait)', width: 1080, height: 1920, preset: '9:16' },
];

interface AspectRatioControlProps {
  width: number;
  height: number;
  preset: string;
  onChange: (width: number, height: number, preset: string) => void;
}

export const AspectRatioControl: React.FC<AspectRatioControlProps> = ({
  width,
  height,
  preset,
  onChange
}) => {
  const handlePresetChange = (newPreset: string) => {
    const selectedPreset = PRESETS.find(p => p.preset === newPreset);
    if (selectedPreset) {
      onChange(selectedPreset.width, selectedPreset.height, selectedPreset.preset);
    }
  };

  const handleCustomDimensions = (newWidth: number, newHeight: number) => {
    onChange(newWidth, newHeight, 'custom');
  };

  return (
    <div className="aspect-ratio-control">
      <div className="aspect-ratio-presets">
        <select
          value={preset || 'custom'}
          onChange={(e) => handlePresetChange(e.target.value)}
        >
          {PRESETS.map((p) => (
            <option key={p.id} value={p.preset}>
              {p.name}
            </option>
          ))}
          <option value="custom">Custom</option>
        </select>
      </div>
      <div className="aspect-ratio-dimensions">
        <input
          type="number"
          value={width}
          onChange={(e) =>
            handleCustomDimensions(parseInt(e.target.value, 10), height)
          }
          min="1"
        />
        <span>×</span>
        <input
          type="number"
          value={height}
          onChange={(e) =>
            handleCustomDimensions(width, parseInt(e.target.value, 10))
          }
          min="1"
        />
      </div>
    </div>
  );
};
