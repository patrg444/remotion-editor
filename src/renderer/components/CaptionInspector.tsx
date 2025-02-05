import React from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import { ActionTypes, CaptionStyle, Speaker } from '../types/timeline';
import '../styles/caption-inspector.css';

const defaultStyle: {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  speakers: Record<string, Speaker>;
} = {
  fontSize: 24,
  fontFamily: 'Arial',
  color: '#FFFFFF',
  backgroundColor: 'transparent',
  textAlign: 'center',
  speakers: {}
};

export const CaptionInspector: React.FC = () => {
  const { state, dispatch } = useTimelineContext();
  const selectedCaptions = state.selectedCaptionIds || [];

  if (selectedCaptions.length === 0) return null;

  // Get the first selected caption clip's style as a base
  const firstSelectedCaption = state.tracks
    .flatMap(track => track.clips)
    .find(clip => clip.type === 'caption' && clip.captions?.some(c => selectedCaptions.includes(c.id)));

  // Get the speaker styles from the selected caption, falling back to defaults
  const speakerStyles: Partial<CaptionStyle> = firstSelectedCaption?.type === 'caption' 
    ? firstSelectedCaption.speakerStyles || {}
    : {};

  // Create a fully populated style object with all required properties
  const currentStyle = {
    ...defaultStyle,
    ...Object.fromEntries(
      Object.entries(speakerStyles).filter(([_, value]) => value !== undefined)
    )
  } as {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor: string;
    textAlign: 'left' | 'center' | 'right';
    speakers: Record<string, Speaker>;
  };

  const handleStyleChange = (updates: Partial<CaptionStyle>) => {
    dispatch({
      type: ActionTypes.UPDATE_CAPTION_STYLES,
      payload: {
        captionIds: selectedCaptions,
        style: updates
      }
    });
  };

  return (
    <div className="caption-inspector">
      <h3>Caption Style</h3>
      <div className="style-group">
        <label>
          Font Size
          <input
            type="number"
            value={currentStyle.fontSize}
            onChange={(e) => handleStyleChange({ fontSize: parseInt(e.target.value) || defaultStyle.fontSize })}
            min={12}
            max={72}
          />
        </label>

        <label>
          Font Family
          <select
            value={currentStyle.fontFamily}
            onChange={(e) => handleStyleChange({ fontFamily: e.target.value })}
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Courier New">Courier New</option>
          </select>
        </label>

        <label>
          Text Color
          <div className="color-input">
            <input
              type="color"
              value={currentStyle.color}
              onChange={(e) => handleStyleChange({ color: e.target.value })}
            />
            <span>{currentStyle.color.toUpperCase()}</span>
          </div>
        </label>

      </div>

      <div className="preview-text" style={{
        fontFamily: currentStyle.fontFamily,
        fontSize: currentStyle.fontSize,
        color: currentStyle.color
      }}>
        Preview Text
      </div>

      <div className="selection-info">
        {selectedCaptions.length} caption{selectedCaptions.length !== 1 ? 's' : ''} selected
      </div>
    </div>
  );
};
