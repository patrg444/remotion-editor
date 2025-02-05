/**
 * Timeline constants and configuration
 */

// Scale and zoom constants
export const PIXELS_PER_SECOND = 100; // Base scale at zoom level 1.0
export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;
export const DEFAULT_ZOOM = 1;

// Time formatting defaults
export const DEFAULT_FPS = 30;
export const DEFAULT_TIME_FORMAT = 'standard' as const;
export const DEFAULT_TIME_OPTIONS = {
  fps: DEFAULT_FPS,
  showFrames: true,
  showMilliseconds: false,
  padHours: false,
  compact: false,
  format: DEFAULT_TIME_FORMAT
} as const;

// Clip duration handling
export const getDuration = (startTime: number, endTime: number): number => {
  return endTime - startTime;
};

export const getEndTime = (startTime: number, duration: number): number => {
  return startTime + duration;
};

// Scale conversion helpers
export const getScale = (zoom: number): number => {
  return PIXELS_PER_SECOND * zoom;
};

export const getZoom = (scale: number): number => {
  return scale / PIXELS_PER_SECOND;
};

// Frame conversion constants
export const FRAME_RATE_OPTIONS = [
  23.976,
  24,
  25,
  29.97,
  30,
  50,
  59.94,
  60
] as const;

// Snap point thresholds
export const SNAP_THRESHOLD = 5; // pixels
export const MIN_FRAME_SNAP_SPACING = 10; // minimum pixels between frame snap points
export const MAX_FRAME_SNAP_ZOOM = 4; // maximum zoom level for frame snapping

// Virtual scroll constants
export const VIRTUAL_SCROLL_BUFFER = 2.0; // buffer multiplier for virtual scrolling
export const MIN_CLIP_WIDTH = 10; // minimum width in pixels to render a clip
export const MAX_VISIBLE_CLIPS = 1000; // maximum number of clips to render at once

// History constants
export const MAX_HISTORY_SIZE = 100; // maximum number of history entries

// Performance constants
export const SCROLL_THROTTLE = 16; // ms (~ 1 frame at 60fps)
export const PLAYBACK_UPDATE_INTERVAL = 16; // ms
export const WAVEFORM_RESOLUTION = 2048; // samples per waveform chunk

// UI constants
export const TRACK_HEIGHT = 60; // pixels
export const HEADER_HEIGHT = 40; // pixels
export const RULER_HEIGHT = 30; // pixels
export const MIN_TRACK_WIDTH = 800; // pixels
export const MAX_TRACK_LENGTH = 7200; // seconds (2 hours)

// Layer constants
export const MAX_LAYERS = 10; // maximum number of layers per track
export const MIN_LAYER_HEIGHT = 60; // minimum height for a layer
export const LAYER_SPACING = 2; // pixels between layers

// Transition constants
export const MIN_TRANSITION_DURATION = 0.5; // seconds
export const MAX_TRANSITION_DURATION = 5.0; // seconds
export const DEFAULT_TRANSITION_DURATION = 1.0; // seconds
export const TRANSITION_HANDLE_SIZE = 10; // pixels

// Effect constants
export const MAX_EFFECTS_PER_CLIP = 10;
export const EFFECT_PREVIEW_RESOLUTION = 0.5; // 50% resolution for effect previews

// Waveform constants
export const WAVEFORM_HEIGHT = 30; // pixels
export const WAVEFORM_COLOR = '#4a9eff';
export const WAVEFORM_BACKGROUND = '#2a2a2a';
export const WAVEFORM_CHUNK_SIZE = 1024; // samples per chunk for streaming
export const WAVEFORM_MAX_CHUNKS = 100; // maximum chunks to keep in memory

// Render quality settings
export const RENDER_QUALITY = {
  draft: {
    resolution: 0.5,
    effects: false,
    transitions: false
  },
  preview: {
    resolution: 0.75,
    effects: true,
    transitions: true
  },
  full: {
    resolution: 1.0,
    effects: true,
    transitions: true
  }
} as const;

// Export these grouped constants for easier imports
export const TimelineConstants = {
  Scale: {
    PIXELS_PER_SECOND: 100,
    MIN_ZOOM: 0.1,
    MAX_ZOOM: 10,
    DEFAULT_ZOOM: 1,
    getScale: (zoom: number) => zoom * TimelineConstants.Scale.PIXELS_PER_SECOND,
    getZoom: (scale: number) => scale / TimelineConstants.Scale.PIXELS_PER_SECOND
  },
  MIN_DURATION: 0.1, // Minimum clip duration in seconds
  MAX_CLIP_DURATION: 1800.0, // Maximum clip duration in seconds (30 minutes)
  Time: {
    DEFAULT_FPS,
    DEFAULT_TIME_FORMAT,
    DEFAULT_TIME_OPTIONS,
    FRAME_RATE_OPTIONS,
    getDuration,
    getEndTime
  },
  Snapping: {
    SNAP_THRESHOLD,
    MIN_FRAME_SNAP_SPACING,
    MAX_FRAME_SNAP_ZOOM
  },
  VirtualScroll: {
    VIRTUAL_SCROLL_BUFFER,
    MIN_CLIP_WIDTH,
    MAX_VISIBLE_CLIPS
  },
  History: {
    MAX_HISTORY_SIZE
  },
  Performance: {
    SCROLL_THROTTLE,
    PLAYBACK_UPDATE_INTERVAL,
    WAVEFORM_RESOLUTION
  },
  UI: {
    TRACK_HEIGHT,
    HEADER_HEIGHT,
    RULER_HEIGHT,
    MIN_TRACK_WIDTH,
    MAX_TRACK_LENGTH
  },
  Layers: {
    MAX_LAYERS,
    MIN_LAYER_HEIGHT,
    LAYER_SPACING
  },
  Transitions: {
    MIN_DURATION: MIN_TRANSITION_DURATION,
    MAX_DURATION: MAX_TRANSITION_DURATION,
    DEFAULT_DURATION: DEFAULT_TRANSITION_DURATION,
    HANDLE_SIZE: TRANSITION_HANDLE_SIZE
  },
  Effects: {
    MAX_PER_CLIP: MAX_EFFECTS_PER_CLIP,
    PREVIEW_RESOLUTION: EFFECT_PREVIEW_RESOLUTION
  },
  Waveform: {
    HEIGHT: WAVEFORM_HEIGHT,
    COLOR: WAVEFORM_COLOR,
    BACKGROUND: WAVEFORM_BACKGROUND,
    CHUNK_SIZE: WAVEFORM_CHUNK_SIZE,
    MAX_CHUNKS: WAVEFORM_MAX_CHUNKS
  },
  RenderQuality: RENDER_QUALITY
} as const;
