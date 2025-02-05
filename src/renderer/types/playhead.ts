export type PlaybackSpeed = -2 | -1 | 0 | 1 | 2;

export interface PlayheadState {
  position: number;
  speed: PlaybackSpeed;
  isDragging: boolean;
}

export interface PlayheadActions {
  setPosition: (position: number) => void;
  setSpeed: (speed: PlaybackSpeed) => void;
  startDragging: () => void;
  stopDragging: () => void;
  playBackward: () => void;
  playForward: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  seekToNextFrame: () => void;
  seekToPrevFrame: () => void;
}

export interface PlayheadOptions {
  duration: number;
  frameRate: number;
  zoom: number;
  onPositionChange?: (position: number) => void;
  onSpeedChange?: (speed: PlaybackSpeed) => void;
}
