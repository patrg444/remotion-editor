import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Track, Clip, ClipWithLayer, Effect, ActionTypes, createClip } from '../types/timeline';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { TimelineClip } from './TimelineClip';
import { TimelineTransition } from './TimelineTransition';
import { useLayerManagement } from '../hooks/useLayerManagement';
import { logger } from '../utils/logger';
import { TimelineConstants } from '../utils/timelineConstants';

interface TimelineTrackProps {
  track: Track & { isEditing?: boolean };
  isSelected: boolean;
  zoom: number;
  fps: number;
  onSelectTrack: (trackId: string) => void;
  onSelectClip: (clipId: string) => void;
  onClipDragStart: (clipId: string) => void;
  onClipDragEnd: () => void;
  onToggleVisibility: (trackId: string) => void;
  onUpdateTrack: (trackId: string, updates: Partial<Track>) => void;
  onDeleteTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, direction: 'up' | 'down') => void;
}

export const TimelineTrack: React.FC<TimelineTrackProps> = ({
  track,
  isSelected,
  zoom,
  fps,
  onSelectTrack,
  onSelectClip,
  onClipDragStart,
  onClipDragEnd,
  onToggleVisibility,
  onUpdateTrack,
  onDeleteTrack,
  onMoveTrack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { assignLayers, getTrackHeight, getClipTop } = useLayerManagement();
  const { state, dispatch } = useTimelineContext();

  // Get clips with optimized layer assignments
  const clipsWithLayers = useCallback(() => {
    const layeredClips = assignLayers(track.clips, track);

    logger.debug('Track clips with layers:', {
      trackId: track.id,
      clips: layeredClips.map(c => ({
        id: c.id,
        layer: c.layer,
        start: c.startTime,
        end: c.endTime
      }))
    });

    return layeredClips;
  }, [track, assignLayers]);

  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (e.currentTarget === e.target) {
      onSelectTrack(track.id);
    }
  }, [track.id, onSelectTrack]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logger.debug('Track drag enter:', {
      target: e.target,
      currentTarget: e.currentTarget,
      className: e.currentTarget.className
    });
    e.currentTarget.classList.add('drag-over');
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logger.debug('Track drag over:', {
      target: e.target,
      currentTarget: e.currentTarget,
      className: e.currentTarget.className
    });
    e.currentTarget.classList.add('drag-over');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    logger.debug('Track drag leave:', {
      target: e.target,
      currentTarget: e.currentTarget,
      className: e.currentTarget.className
    });
    e.currentTarget.classList.remove('drag-over');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      logger.debug('Drop event:', {
        types: e.dataTransfer.types,
        data: e.dataTransfer.getData('application/json'),
        target: e.currentTarget.className,
        currentTarget: e.currentTarget.className,
        clientX: e.clientX,
        clientY: e.clientY
      });
      
      const jsonData = e.dataTransfer.getData('application/json');
      if (!jsonData) {
        logger.error('No JSON data in drop event');
        return;
      }

      const data = JSON.parse(jsonData);
      logger.debug('Parsed drop data:', data);

      // Log track state
      logger.debug('Track state:', {
        id: track.id,
        type: track.type,
        clips: track.clips?.length || 0
      });

      if (data) {
        // Calculate time position based on drop coordinates
        const trackRect = e.currentTarget.getBoundingClientRect();
        const dropX = e.clientX - trackRect.left;
        const timeScale = TimelineConstants.Scale.getScale(state.zoom);
        const startTime = Math.max(0, (dropX + state.scrollX) / timeScale); // Convert to time, accounting for scroll

        logger.debug('Time calculations:', {
          dropX,
          timeScale,
          startTime,
          trackRect: {
            left: trackRect.left,
            width: trackRect.width
          },
          zoom: state.zoom
        });

        // Create clip using helper
        let clip: ClipWithLayer;
          // Create clip with proper duration properties
          const initialDuration = data.duration;
          const baseProps = {
            name: data.name,
            startTime,
            endTime: startTime + initialDuration,
            mediaOffset: 0,
            mediaDuration: initialDuration,
            originalDuration: initialDuration, // Store the initial duration
            initialDuration: initialDuration, // Add a new property to track initial duration
            effects: []
          };

          logger.debug('Creating clip with duration:', {
            duration: initialDuration,
            mediaDuration: initialDuration,
            originalDuration: initialDuration,
            startTime,
            endTime: startTime + initialDuration,
            maxAllowedDuration: initialDuration
          });

        switch (data.type) {
          case 'video': {
            const videoClip = createClip('video', {
              ...baseProps,
              src: data.path,
              transform: {
                scale: 1,
                rotation: 0,
                position: { x: 0, y: 0 },
                opacity: 1
              }
            });
            clip = { ...videoClip, layer: 0 };
            break;
          }
          case 'audio': {
            const audioClip = createClip('audio', {
              ...baseProps,
              src: data.path,
              volume: 1,
              isMuted: false
            });
            clip = { ...audioClip, layer: 0 };
            break;
          }
          case 'caption': {
            const captionClip = createClip('caption', {
              ...baseProps,
              text: '',
              captions: []
            });
            clip = { ...captionClip, layer: 0 };
            break;
          }
          default:
            throw new Error(`Unsupported clip type: ${data.type}`);
        }

        logger.debug('Created clip:', {
          ...clip,
          currentDuration: clip.endTime - clip.startTime,
          mediaDuration: clip.mediaDuration,
          mediaOffset: clip.mediaOffset,
          originalDuration: clip.originalDuration,
          maxAllowedDuration: clip.originalDuration || clip.mediaDuration,
          startTime: clip.startTime,
          endTime: clip.endTime
        });

        // Ensure track type matches clip type
        if ((track.type === 'video' && data.type === 'video') ||
            (track.type === 'audio' && data.type === 'audio') ||
            (track.type === 'caption' && data.type === 'caption')) {
          // Update track with new clip
          const updatedClips = [...(track.clips || []), clip];
          onUpdateTrack(track.id, { clips: updatedClips });

          // Update timeline duration if needed
          const maxEndTime = Math.max(...updatedClips.map(c => c.endTime));
          if (maxEndTime > state.duration) {
            dispatch({
              type: ActionTypes.SET_DURATION,
              payload: Math.max(maxEndTime, 10)
            });
          }
        } else {
          console.error(`Track type (${track.type}) does not match clip type (${data.type})`);
          return;
        }

        logger.debug('Updated timeline:', {
          clipEndTime: clip.endTime,
          currentDuration: state.duration
        });
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  }, [track.id, track.clips, onUpdateTrack, state, dispatch, state.zoom]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelectTrack(track.id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Focus previous track
        const prevTrack = containerRef.current?.previousElementSibling;
        if (prevTrack instanceof HTMLElement) {
          prevTrack.focus();
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Focus next track
        const nextTrack = containerRef.current?.nextElementSibling;
        if (nextTrack instanceof HTMLElement) {
          nextTrack.focus();
        }
        break;
      case 'Tab':
        // Let default tab behavior work, but ensure clips are in tab order
        if (e.shiftKey && isSelected) {
          // When shift+tab on selected track, focus last clip
          const clips = containerRef.current?.querySelectorAll('.timeline-clip');
          const lastClip = clips?.[clips.length - 1];
          if (lastClip instanceof HTMLElement) {
            e.preventDefault();
            lastClip.focus();
          }
        }
        break;
    }
  }, [track.id, onSelectTrack, isSelected]);

  const layeredClips = clipsWithLayers();
  const trackHeight = getTrackHeight(layeredClips);

  return (
    <div 
      ref={containerRef}
      data-testid="timeline-track"
      className={`timeline-track ${isSelected ? 'selected' : ''} ${track.type} ${!track.clips?.length ? 'empty' : ''}`}
      onClick={handleTrackClick}
      onKeyDown={handleKeyDown}
      role="region"
      aria-label={`${track.name} track`}
      aria-selected={isSelected}
      tabIndex={0}
      style={{
        opacity: track.isVisible ? 1 : 0.5
      }}
    >
      <div 
        data-testid="track-content"
        className="track-content"
        role="list"
        aria-label={`Clips in ${track.name}`}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.add('drag-over');
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.add('drag-over');
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX <= rect.left ||
            e.clientX >= rect.right ||
            e.clientY <= rect.top ||
            e.clientY >= rect.bottom
          ) {
            e.currentTarget.classList.remove('drag-over');
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.currentTarget.classList.remove('drag-over');
          handleDrop(e);
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            handleTrackClick(e);
          }
        }}
        onMouseMove={(e) => {
          logger.debug('Track mouse move:', {
            clientX: e.clientX,
            offsetX: e.nativeEvent.offsetX,
            trackId: track.id,
            zoom: state.zoom,
            scale: TimelineConstants.Scale.getScale(state.zoom)
          });
        }}
      >
        {layeredClips.map((clip, index) => (
          <TimelineClip
            key={clip.id}
            clip={clip}
            track={track}
            layer={clip.layer}
            zoom={state.zoom}
            fps={state.fps}
            onSelect={() => onSelectClip(clip.id)}
            onDragStart={() => onClipDragStart(clip.id)}
            onDragEnd={onClipDragEnd}
            tabIndex={isSelected ? 0 : -1}
            aria-posinset={index + 1}
            aria-setsize={layeredClips.length}
            style={{
              top: getClipTop(clip.layer)
            }}
          />
        ))}
      </div>
    </div>
  );
};
