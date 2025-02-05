import React from 'react';
import { TimeDisplay } from './TimeDisplay';
import { PlaybackControls } from './PlaybackControls';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { ActionTypes } from '../types/timeline';
import { logger } from '../utils/logger';

interface TimelineHeaderProps {
  currentTime: number;
  duration: number;
  zoom: number;
  fps: number;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  currentTime,
  duration,
  zoom,
  fps,
  isPlaying,
  onPlayPause
}) => {
  const { state, dispatch } = useTimelineContext();

  const handleZoomIn = () => {
    dispatch({
      type: ActionTypes.SET_ZOOM,
      payload: zoom * 1.2
    });
    logger.debug('Zoom in:', zoom * 1.2);
  };

  const handleZoomOut = () => {
    dispatch({
      type: ActionTypes.SET_ZOOM,
      payload: zoom / 1.2
    });
    logger.debug('Zoom out:', zoom / 1.2);
  };

  return (
    <div className="timeline-header">
      <div className="timeline-controls">
        <TimeDisplay
          time={currentTime}
          fps={fps}
          options={{ showFrames: true }}
        />
        <PlaybackControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          onPlayPause={onPlayPause}
        />
        <TimeDisplay
          time={duration}
          fps={fps}
          options={{ showFrames: true, compact: true }}
        />
      </div>
      <div className="timeline-tools">
        <button
          onClick={() => dispatch({
            type: ActionTypes.SET_SNAPPING,
            payload: !state.isSnappingEnabled
          })}
          className={`tool-button ${state.isSnappingEnabled ? 'active' : ''}`}
          title={`${state.isSnappingEnabled ? 'Disable' : 'Enable'} snapping (S)`}
        >
          <span role="img" aria-label="magnet">🧲</span>
        </button>
      </div>
      <div className="zoom-controls">
        <button
          onClick={handleZoomOut}
          className="zoom-button"
          title="Zoom out"
          disabled={zoom <= 0.1}
        >
          -
        </button>
        <span className="zoom-level">{Math.round(zoom * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="zoom-button"
          title="Zoom in"
          disabled={zoom >= 10}
        >
          +
        </button>
      </div>
    </div>
  );
};
