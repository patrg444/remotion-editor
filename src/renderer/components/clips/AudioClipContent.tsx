import React from 'react';
import { AudioClip } from '../../types/timeline';

export interface AudioClipContentProps {
  clip: AudioClip;
  isSelected: boolean;
  zoom: number;
  fps: number;
}

export const AudioClipContent: React.FC<AudioClipContentProps> = ({
  clip,
  isSelected,
  zoom,
  fps
}) => {
  return (
    <div className={`audio-clip-content ${isSelected ? 'selected' : ''}`}>
      <div className="clip-label">{clip.name}</div>
      {clip.effects.length > 0 && (
        <div className="clip-effects">
          {clip.effects.map(effect => (
            <div key={effect.id} className={`effect ${effect.enabled ? 'enabled' : 'disabled'}`}>
              {effect.type}
            </div>
          ))}
        </div>
      )}
      {clip.mediaOffset > 0 && (
        <div className="trim-indicator start" style={{ left: 0 }} />
      )}
      {clip.mediaDuration < clip.originalDuration && (
        <div className="trim-indicator end" style={{ right: 0 }} />
      )}
      <div className="waveform-placeholder" />
    </div>
  );
};
