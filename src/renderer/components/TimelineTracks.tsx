import React, { useEffect, useRef } from 'react';
import { TimelineConstants } from '../utils/timelineConstants';
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
  const tracksRef = useRef<HTMLDivElement>(null);
  const lastTracksRef = useRef<Track[]>(tracks);

  // Handle track updates and positioning
  useEffect(() => {
    const tracksChanged = tracks !== lastTracksRef.current;
    lastTracksRef.current = tracks;

    if (tracksRef.current) {
      const height = tracks.length * TimelineConstants.UI.TRACK_HEIGHT;
      tracksRef.current.style.height = `${height}px`;
      
      // Force reflow to ensure height is applied
      void tracksRef.current.offsetHeight;

      // Notify that tracks container is ready
      window.dispatchEvent(new CustomEvent('tracks:ready', {
        detail: {
          height,
          trackCount: tracks.length,
          tracks: tracks.map(t => ({
            id: t.id,
            clipCount: t.clips.length,
            clips: t.clips.map(c => ({
              id: c.id,
              startTime: c.startTime,
              endTime: c.endTime,
              layer: c.layer
            }))
          }))
        }
      }));

      // Wait for next frame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (tracksRef.current) {
          // Get final dimensions after styles are applied
          const rect = tracksRef.current.getBoundingClientRect();
          
          // Notify that tracks are positioned
          window.dispatchEvent(new CustomEvent('tracks:positioned', {
            detail: {
              height: rect.height,
              trackCount: tracks.length,
              tracks: tracks.map(t => ({
                id: t.id,
                clipCount: t.clips.length,
                clips: t.clips.map(c => ({
                  id: c.id,
                  startTime: c.startTime,
                  endTime: c.endTime,
                  layer: c.layer
                }))
              }))
            }
          }));

          // Force another reflow to ensure all updates are applied
          void tracksRef.current.offsetHeight;
        }
      });
    }
  }, [tracks]);

  // Handle track ready events
  useEffect(() => {
    const handleTrackReady = (e: CustomEvent) => {
      const { trackId, clipCount } = e.detail;
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        requestAnimationFrame(() => {
          window.dispatchEvent(new CustomEvent('tracks:ready', {
            detail: {
              height: tracks.length * TimelineConstants.UI.TRACK_HEIGHT,
              trackCount: tracks.length,
              tracks: tracks.map(t => ({
                id: t.id,
                clipCount: t.clips.length,
                clips: t.clips.map(c => ({
                  id: c.id,
                  startTime: c.startTime,
                  endTime: c.endTime,
                  layer: c.layer
                }))
              }))
            }
          }));
        });
      }
    };

    window.addEventListener('track:ready', handleTrackReady as EventListener);
    return () => {
      window.removeEventListener('track:ready', handleTrackReady as EventListener);
    };
  }, [tracks]);

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
      <div 
        ref={tracksRef}
        className="timeline-tracks-content" 
        data-testid="timeline-tracks-content" 
        onClick={handleContainerClick}
      >
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
          <div 
            className="timeline-tracks-empty"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('timeline:add-track-requested'));
            }}
          >
            <div className="timeline-tracks-empty-icon">
              ➕
            </div>
            <span>No tracks yet—click to add a track</span>
          </div>
        )}
      </div>
    </div>
  );
};
