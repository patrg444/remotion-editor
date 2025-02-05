import React from 'react';
import { CaptionClip, Caption } from '../../types/timeline';

interface CaptionClipContentProps {
  clip: CaptionClip;
  isSelected: boolean;
  zoom: number;
  fps: number;
}

export const CaptionClipContent: React.FC<CaptionClipContentProps> = ({
  clip,
  isSelected,
  zoom,
  fps
}) => {
  // Get speaker style for a caption
  const getSpeakerStyle = (caption: Caption) => {
    if (!clip.speakerStyles?.speakers || !caption.speakerId) return {};
    const style = clip.speakerStyles.speakers[caption.speakerId];
    return style ? {
      color: style.color,
      borderColor: style.color
    } : {};
  };

  // Get speaker name for a caption
  const getSpeakerName = (caption: Caption) => {
    if (!clip.speakerStyles?.speakers || !caption.speakerId) return 'Unknown';
    const style = clip.speakerStyles.speakers[caption.speakerId];
    return style ? style.name : 'Unknown';
  };

  return (
    <div className={`caption-clip-content ${isSelected ? 'selected' : ''}`}>
      <div className="caption-header">
        <span className="caption-title">{clip.name}</span>
      </div>
      <div className="caption-body">
        {clip.captions?.map((caption) => (
          <div
            key={caption.id}
            className="caption-item"
            style={getSpeakerStyle(caption)}
          >
            <span className="speaker-name">
              {getSpeakerName(caption)}:
            </span>
            <span className="caption-text">
              {caption.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
