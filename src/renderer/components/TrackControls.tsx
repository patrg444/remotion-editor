import React, { useRef, useState } from 'react';
import { Track } from '../types/timeline';
import { TimelineConstants } from '../utils/timelineConstants';

interface TrackControlsProps {
  track: Track;
  isSelected: boolean;
  onSelect: (trackId: string) => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (trackId: string) => void;
}

export const TrackControls: React.FC<TrackControlsProps> = ({
  track,
  isSelected,
  onSelect,
  onUpdateTrack,
  onDeleteTrack,
  onMoveTrack,
  onToggleVisibility
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(track.name);

  return (
    <div 
      className={`track-controls ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(track.id)}
      style={{
        opacity: track.isVisible ? 1 : 0.5
      }}
    >
      <div className="track-buttons-left">
        {isEditing ? (
          <input
            ref={inputRef}
            className="track-name-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onUpdateTrack(track.id, { name: e.currentTarget.value });
                setIsEditing(false);
              }
            }}
            onBlur={(e) => {
              onUpdateTrack(track.id, { name: e.currentTarget.value });
              setIsEditing(false);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span 
            className="track-name"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            {track.name}
          </span>
        )}
        <div className="track-controls-group">
          <button
            className="track-visibility-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(track.id);
            }}
            aria-label={track.isVisible ? "Hide track" : "Show track"}
          >
            {track.isVisible ? "👁" : "👁‍🗨"}
          </button>
          <button
            className="track-mute-toggle"
            onClick={(e) => {
              e.stopPropagation();
              onUpdateTrack(track.id, { isMuted: !track.isMuted });
            }}
            aria-label={track.isMuted ? "Unmute track" : "Mute track"}
          >
            {track.isMuted ? "🔇" : "🔊"}
          </button>
          <div className="track-arrows">
            <button
              className="track-move-up"
              onClick={(e) => {
                e.stopPropagation();
                onMoveTrack(track.id, 'up');
              }}
              aria-label="Move track up"
            >
              ↑
            </button>
            <button
              className="track-move-down"
              onClick={(e) => {
                e.stopPropagation();
                onMoveTrack(track.id, 'down');
              }}
              aria-label="Move track down"
            >
              ↓
            </button>
          </div>
          <button
            className="track-delete-button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTrack(track.id);
            }}
            aria-label="Delete track"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
