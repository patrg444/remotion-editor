import React from 'react';
import { VideoClip, Effect } from '../../types/timeline';

interface VideoClipContentProps {
  clip: VideoClip;
  isSelected: boolean;
  zoom: number;
  fps: number;
}

export const VideoClipContent: React.FC<VideoClipContentProps> = ({
  clip,
  isSelected,
  zoom,
  fps
}) => {
  // Check if effect is active at current time
  const isEffectActive = (effect: Effect, currentTime: number): boolean => {
    if (!effect.enabled) return false;
    
    // If no time range is specified, effect is always active
    if (!effect.startTime && !effect.endTime) return true;
    
    // If only start time is specified, effect is active from that point on
    if (effect.startTime && !effect.endTime) {
      return currentTime >= effect.startTime;
    }
    
    // If only end time is specified, effect is active until that point
    if (!effect.startTime && effect.endTime) {
      return currentTime <= effect.endTime;
    }
    
    // Both start and end times are specified
    return currentTime >= (effect.startTime || 0) && currentTime <= (effect.endTime || Infinity);
  };

  return (
    <div className={`video-clip-content ${isSelected ? 'selected' : ''}`}>
      <div className="clip-header">
        <span className="clip-title">{clip.name}</span>
        {clip.effects.length > 0 && (
          <div className="effect-indicators">
            {clip.effects.map(effect => (
              <span
                key={effect.id}
                className={`effect-indicator ${effect.enabled ? 'active' : ''}`}
                title={`${effect.type} (${effect.enabled ? 'Enabled' : 'Disabled'})`}
              />
            ))}
          </div>
        )}
      </div>
      {clip.thumbnail && (
        <div className="clip-thumbnail">
          <img src={clip.thumbnail} alt={clip.name} />
        </div>
      )}
    </div>
  );
};
