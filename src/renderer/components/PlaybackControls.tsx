import React, { useCallback } from 'react';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { ActionTypes } from '../types/timeline';
import { timeToFrames, framesToTime } from '../utils/timelineUnits';

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  onPlayPause
}) => {
  const { state, dispatch } = useTimelineContext();

  const stepFrames = useCallback((frames: number) => {
    // Convert current time to frames
    const currentFrames = timeToFrames(currentTime, state.fps);
    // Add step and convert back to time
    const newTime = framesToTime(currentFrames + frames, state.fps);
    // Clamp to valid range
    const clampedTime = Math.max(0, Math.min(newTime, duration));

    dispatch({
      type: ActionTypes.SET_CURRENT_TIME,
      payload: { time: clampedTime }
    });
  }, [currentTime, duration, state.fps, dispatch]);

  const handleStepBackward = useCallback(() => {
    if (!isPlaying) {
      stepFrames(-1);
    }
  }, [isPlaying, stepFrames]);

  const handleStepForward = useCallback(() => {
    if (!isPlaying) {
      stepFrames(1);
    }
  }, [isPlaying, stepFrames]);

  const handleJumpToStart = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_CURRENT_TIME,
      payload: { time: 0 }
    });
  }, [dispatch]);

  const handleJumpToEnd = useCallback(() => {
    dispatch({
      type: ActionTypes.SET_CURRENT_TIME,
      payload: { time: duration }
    });
  }, [duration, dispatch]);

  return (
    <div data-testid="playback-controls" className="playback-controls">
      <button
        data-testid="jump-to-start-button"
        onClick={handleJumpToStart}
        className="control-button"
        aria-label="Jump to start"
        title="Jump to start"
        disabled={currentTime <= 0}
      >
        <span className="icon">⏮</span>
      </button>
      <button
        data-testid="step-backward-button"
        onClick={handleStepBackward}
        className="control-button"
        aria-label="Step backward"
        title="Step backward"
        disabled={isPlaying || currentTime <= 0}
      >
        <span className="icon">⏪</span>
      </button>
      <button
        data-testid="play-button"
        onClick={onPlayPause}
        className="control-button play-button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        <span className="icon">{isPlaying ? '⏸' : '▶'}</span>
      </button>
      <button
        data-testid="step-forward-button"
        onClick={handleStepForward}
        className="control-button"
        aria-label="Step forward"
        title="Step forward"
        disabled={isPlaying || currentTime >= duration}
      >
        <span className="icon">⏩</span>
      </button>
      <button
        data-testid="jump-to-end-button"
        onClick={handleJumpToEnd}
        className="control-button"
        aria-label="Jump to end"
        title="Jump to end"
        disabled={currentTime >= duration}
      >
        <span className="icon">⏭</span>
      </button>
    </div>
  );
};
