import React, { useEffect } from 'react';
import { Track } from '../types/timeline';
import { TimelineTrack } from './TimelineTrack';
import { TrackControls } from './TrackControls';
import { useVirtualScroll } from '../hooks/useVirtualScroll';
import { logger } from '../utils/logger';

interface TimelineTracksProps {
  tracks: Track[];
  selectedTrackId?: string;
  selectedClipIds: string[];
  onSelectTrack: (trackId: string) => void;
  onSelectClip: (clipId: string) => void;
  onClipDragStart: (clipId: string) => void;
  onClipDragEnd: () => void;
  onToggleVisibility: (trackId: string) => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, direction: 'up' | 'down') => void;
  zoom: number;
  fps: number;
}

export const TimelineTracks: React.FC<TimelineTracksProps> = ({
  tracks,
  selectedTrackId,
  selectedClipIds,
  onSelectTrack,
  onSelectClip,
  onClipDragStart,
  onClipDragEnd,
  onToggleVisibility,
  onUpdateTrack,
  onDeleteTrack,
  onMoveTrack,
  zoom,
  fps
}) => {
  // Log track rendering
  useEffect(() => {
    logger.debug('Timeline tracks:', {
      totalTracks: tracks.length,
      trackNames: tracks.map(t => t.name)
    });
  }, [tracks.length]);

  const handleContainerClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the container (not on tracks)
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('timeline-tracks-background')) {
      onSelectTrack('');
    }
  };

  return (
    <div className="timeline-tracks-container">
      <div className="timeline-tracks-controls">
        {tracks.map((track) => (
          <TrackControls
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            onSelect={onSelectTrack}
            onUpdateTrack={onUpdateTrack}
            onDeleteTrack={onDeleteTrack}
            onMoveTrack={onMoveTrack}
            onToggleVisibility={onToggleVisibility}
          />
        ))}
      </div>
      <div className="timeline-tracks-content" data-testid="timeline-tracks-content" onClick={handleContainerClick}>
        <div 
          className="timeline-tracks-background" 
          style={{ 
            position: 'absolute', 
            inset: 0,
            zIndex: -1,
            minHeight: '100%'
          }} 
        />
        {tracks.map((track) => (
          <TimelineTrack
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            zoom={zoom}
            fps={fps}
            onSelectTrack={onSelectTrack}
            onSelectClip={onSelectClip}
            onClipDragStart={onClipDragStart}
            onClipDragEnd={onClipDragEnd}
            onUpdateTrack={onUpdateTrack}
            onDeleteTrack={onDeleteTrack}
            onMoveTrack={onMoveTrack}
            onToggleVisibility={onToggleVisibility}
          />
        ))}
        {tracks.length === 0 && (
          <div className="timeline-tracks-empty">
            <span>No tracks to display</span>
          </div>
        )}
      </div>
    </div>
  );
};
