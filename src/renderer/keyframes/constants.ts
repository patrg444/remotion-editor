import { InterpolationType } from './types';

/**
 * Timeline constants
 */
export const TIMELINE = {
  MIN_ZOOM: 0.1,
  MAX_ZOOM: 10,
  DEFAULT_ZOOM: 1,
  SCROLL_ZOOM_FACTOR: 0.001,
  DURATION_BUFFER: 5, // Extra time buffer for timeline end
  DEFAULT_DURATION: 300, // Default timeline duration in seconds
} as const;

/**
 * Volume constants
 */
export const VOLUME = {
  MIN: 0,
  MAX: 1,
  DEFAULT: 0.5,
  MUTE_THRESHOLD: 0.001,
  DB_VALUES: [-60, -48, -36, -24, -18, -12, -6, -3, 0, 3, 6],
} as const;

/**
 * Keyboard interaction constants
 */
export const KEYBOARD = {
  FINE_CONTROL_STEP: 0.01,
  NORMAL_STEP: 0.1,
  LARGE_STEP: 0.5,
  SHIFT_MULTIPLIER: 10,
} as const;

/**
 * Drag interaction constants
 */
export const DRAG = {
  MIN_DISTANCE: 5,
  FINE_CONTROL_STEP: 0.01,
  NORMAL_STEP: 0.1,
  LARGE_STEP: 0.5,
} as const;

/**
 * Viewport constants
 */
export const VIEWPORT = {
  MIN_WIDTH: 100,
  MIN_HEIGHT: 50,
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 200,
  FINE_RESOLUTION: 0.1,
  NORMAL_RESOLUTION: 1,
} as const;

/**
 * Grid constants
 */
export const GRID = {
  MAJOR_LINES: 10,
  MINOR_LINES: 5,
  OPACITY: 0.2,
  MAJOR_OPACITY: 0.4,
} as const;

/**
 * Indicator constants
 */
export const INDICATOR = {
  SIZE: 8,
  STROKE_WIDTH: 2,
  ACTIVE_STROKE_WIDTH: 3,
} as const;

/**
 * Bezier curve constants
 */
export const BEZIER = {
  CONFIG: {
    resolution: 100,
    handleLength: 50,
    pointRadius: 6,
    hitTestRadius: 10,
    gridDivisions: 4,
    canvasSize: 200,
    activePointBonus: 2,
    tooltipYOffset: 20,
    // Colors and styles
    lineColor: '#666666',
    curveColor: '#4a9eff',
    pointColor: '#ffffff',
    activePointColor: '#4a9eff',
    handleColor: '#888888',
    strokeWidthDivisor: 2,
    dashPattern: [4, 4],
  },
  PRESETS: {
    LINEAR: { in: [0, 0] as [number, number], out: [1, 1] as [number, number] },
    EASE: { in: [0.25, 0.1] as [number, number], out: [0.25, 1] as [number, number] },
    EASE_IN: { in: [0.42, 0] as [number, number], out: [1, 1] as [number, number] },
    EASE_OUT: { in: [0, 0] as [number, number], out: [0.58, 1] as [number, number] },
    EASE_IN_OUT: { in: [0.42, 0] as [number, number], out: [0.58, 1] as [number, number] },
  },
} as const;

/**
 * Interpolation keyboard shortcuts
 */
export const INTERPOLATION_SHORTCUTS = {
  l: InterpolationType.Linear,
  s: InterpolationType.Step,
  i: InterpolationType.EaseIn,
  o: InterpolationType.EaseOut,
  e: InterpolationType.EaseInOut,
  b: InterpolationType.Bezier,
} as const;

/**
 * Detect macOS platform using modern APIs with fallbacks
 */
const isMacOS = (): boolean => {
  // Try modern userAgentData API first
  if ('userAgentData' in navigator) {
    const ua = navigator.userAgentData as { platform?: string };
    if (ua.platform) {
      return ua.platform.toLowerCase().includes('mac');
    }
  }
  
  // Fallback to userAgent string
  if (navigator.userAgent.toLowerCase().includes('mac')) {
    return true;
  }
  
  // Last resort: check platform (deprecated but still widely supported)
  return navigator.platform?.toLowerCase().includes('mac') ?? false;
};

/**
 * Platform-specific keyboard modifiers
 */
export const MODIFIERS = {
  FINE_CONTROL: 'Alt',
  LARGE_STEP: 'Shift',
  ADD_KEYFRAME: isMacOS() ? 'Meta' : 'Control',
} as const;

/**
 * Bezier preset keys
 */
export type BezierPresetKey = keyof typeof BEZIER.PRESETS;

/**
 * Bezier presets
 */
export const BezierPresets = BEZIER.PRESETS;
