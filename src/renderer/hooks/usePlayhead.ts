import { useState, useEffect, useCallback, useRef } from 'react';
import { PlaybackSpeed, PlayheadState, PlayheadActions, PlayheadOptions } from '../types/playhead';
import { Logger } from '../../main/utils/logger';

const logger = new Logger('usePlayhead');

const FRAME_DURATION = 1000 / 60; // 60fps for smooth animation

export function usePlayhead({
  duration,
  frameRate,
  zoom,
  onPositionChange,
  onSpeedChange
}: PlayheadOptions): [PlayheadState, PlayheadActions] {
  const [state, setState] = useState<PlayheadState>({
    position: 0,
    speed: 0,
    isDragging: false
  });

  const lastUpdateTime = useRef<number>(0);
  const animationFrameId = useRef<number>();

  const clampPosition = useCallback((pos: number) => {
    return Math.max(0, Math.min(pos, duration));
  }, [duration]);

  const setPosition = useCallback((position: number) => {
    const newPosition = clampPosition(position);
    setState(prev => ({ ...prev, position: newPosition }));
    onPositionChange?.(newPosition);
  }, [clampPosition, onPositionChange]);

  const setSpeed = useCallback((speed: PlaybackSpeed) => {
    setState(prev => ({ ...prev, speed }));
    if (speed !== 0) {
      lastUpdateTime.current = 0; // Reset timing when changing speed
    }
    onSpeedChange?.(speed);
  }, [onSpeedChange]);

  // Playback animation loop
  useEffect(() => {
    if (state.speed === 0 || state.isDragging) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastUpdateTime.current) {
        lastUpdateTime.current = timestamp;
      }

      const deltaTime = timestamp - lastUpdateTime.current;
      const delta = (deltaTime / 1000) * state.speed;
      const newPosition = state.position + delta;
      
      // Stop at duration limit
      if (newPosition >= duration) {
        setPosition(duration);
        setSpeed(0);
        lastUpdateTime.current = 0;
        return;
      }

      setPosition(newPosition);
      lastUpdateTime.current = timestamp;
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [state.speed, state.isDragging, state.position, setPosition]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const startDragging = useCallback(() => {
    setState(prev => ({ ...prev, isDragging: true, speed: 0 }));
  }, []);

  const stopDragging = useCallback(() => {
    setState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const playBackward = useCallback(() => {
    setState(prev => {
      const newSpeed = prev.speed === -1 ? -2 : -1;
      lastUpdateTime.current = 0; // Reset timing when changing speed
      onSpeedChange?.(newSpeed);
      return { ...prev, speed: newSpeed };
    });
  }, [onSpeedChange]);

  const playForward = useCallback(() => {
    setState(prev => {
      const newSpeed = prev.speed === 1 ? 2 : 1;
      lastUpdateTime.current = 0; // Reset timing when changing speed
      onSpeedChange?.(newSpeed);
      return { ...prev, speed: newSpeed };
    });
  }, [onSpeedChange]);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, speed: 0 }));
    onSpeedChange?.(0);
  }, [onSpeedChange]);

  const togglePlayPause = useCallback(() => {
    setState(prev => {
      const newSpeed = prev.speed === 0 ? 1 : 0;
      // Reset lastUpdateTime when starting playback
      if (newSpeed !== 0) {
        lastUpdateTime.current = 0;
      }
      onSpeedChange?.(newSpeed);
      return { ...prev, speed: newSpeed };
    });
  }, [onSpeedChange]);

  const seekToNextFrame = useCallback(() => {
    setPosition(state.position + (1 / frameRate));
  }, [frameRate, state.position, setPosition]);

  const seekToPrevFrame = useCallback(() => {
    setPosition(state.position - (1 / frameRate));
  }, [frameRate, state.position, setPosition]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey } = event;

    switch (key) {
      case 'j':
        playBackward();
        break;
      case 'k':
        pause();
        break;
      case 'l':
        playForward();
        break;
      case ' ':
        event.preventDefault();
        togglePlayPause();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (shiftKey) {
          setPosition(Math.max(0, state.position - 1)); // Jump 1 second back
        } else {
          seekToPrevFrame();
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (shiftKey) {
          setPosition(Math.min(duration, state.position + 1)); // Jump 1 second forward
        } else {
          seekToNextFrame();
        }
        break;
    }
  }, [
    playBackward,
    pause,
    playForward,
    togglePlayPause,
    seekToPrevFrame,
    seekToNextFrame,
    setPosition,
    state.position,
    duration
  ]);

  // Register keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return [
    state,
    {
      setPosition,
      setSpeed,
      startDragging,
      stopDragging,
      playBackward,
      playForward,
      pause,
      togglePlayPause,
      seekToNextFrame,
      seekToPrevFrame
    }
  ];
}
