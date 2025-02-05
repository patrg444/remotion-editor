import { Logger } from '../../main/utils/logger';
import { 
  InterpolationType,
  BaseKeyframeInterpolation,
  KeyframeInterpolation,
  KeyframeTrack,
  BezierControlPoints,
  KeyframeState,
  Keyframe
} from './types';

const logger = new Logger('keyframes/utils');

/**
 * Create a new keyframe track
 */
export function createKeyframeTrack<T extends number | string>(
  trackId: string,
  paramId: string,
  defaultValue: T,
  min?: number,
  max?: number,
  step?: number
): KeyframeTrack<T> {
  return {
    id: trackId,
    paramId,
    property: paramId,
    defaultValue,
    keyframes: [],
    min,
    max,
    step,
    getValue: (time: number) => getTrackValue({ 
      id: trackId,
      paramId,
      property: paramId,
      defaultValue,
      keyframes: [],
      min,
      max,
      step,
      getValue: () => defaultValue
    }, time)
  };
}

/**
 * Create a new keyframe
 */
export function createKeyframe<T extends number | string>(
  time: number,
  value: T,
  interpolation: InterpolationType | BaseKeyframeInterpolation
): Keyframe<T> {
  return {
    time,
    value,
    interpolation: createKeyframeInterpolation(interpolation)
  };
}

/**
 * Sort keyframes by time
 */
export function sortKeyframes<T extends number | string>(
  keyframes: Keyframe<T>[]
): Keyframe<T>[] {
  return [...keyframes].sort((a, b) => a.time - b.time);
}

/**
 * Validate keyframe update
 */
export function validateKeyframeUpdate<T extends number | string>(
  time: number,
  value: T,
  track: KeyframeTrack<T>,
  state: KeyframeState<T>
): boolean {
  if (time < 0) return false;
  if (typeof value === 'number' && track.min !== undefined && track.max !== undefined) {
    if (value < track.min || value > track.max) return false;
  }
  return true;
}

/**
 * Update duration cache
 */
export function updateDurationCache<T extends number | string>(
  state: KeyframeState<T>
): KeyframeState<T> {
  const maxTime = Math.max(
    ...Object.values(state.tracks)
      .flatMap(track => track.keyframes)
      .map(kf => kf.time)
      .concat([0])
  );
  return {
    ...state,
    duration: maxTime,
    lastModified: Date.now()
  };
}

/**
 * Create an interpolation function for a given type
 * @param type Interpolation type or configuration
 * @returns Complete interpolation object with function
 */
export function createKeyframeInterpolation(
  type: InterpolationType | BaseKeyframeInterpolation
): KeyframeInterpolation {
  if (typeof type === 'string') {
    // Handle simple interpolation types
    const fn = getInterpolationFunction(type);
    return {
      type,
      fn
    } as KeyframeInterpolation;
  }

  // Handle object configuration
  if (type.type === InterpolationType.Bezier) {
    return {
      type: InterpolationType.Bezier,
      controlPoints: type.controlPoints,
      fn: createBezierFunction(type.controlPoints)
    };
  }

  // Handle other interpolation types
  return {
    type: type.type,
    fn: getInterpolationFunction(type.type)
  } as KeyframeInterpolation;
}

/**
 * Get the interpolation function for a given type
 */
function getInterpolationFunction(type: InterpolationType): (t: number) => number {
  switch (type) {
    case InterpolationType.Linear:
      return (t) => t;
    case InterpolationType.Step:
      return (t) => (t < 1 ? 0 : 1);
    case InterpolationType.EaseIn:
      return (t) => t * t;
    case InterpolationType.EaseOut:
      return (t) => t * (2 - t);
    case InterpolationType.EaseInOut:
      return (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
    default:
      throw new Error(`Unknown interpolation type: ${type}`);
  }
}

/**
 * Create a bezier curve interpolation function
 * @param points Control points for the curve
 * @returns Interpolation function
 */
function createBezierFunction(points: BezierControlPoints): (t: number) => number {
  return (t: number) => {
    const [x1, y1] = points.in;
    const [x2, y2] = points.out;
    
    // Cubic bezier formula
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    
    const sampleCurveX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleCurveY = (t: number) => ((ay * t + by) * t + cy) * t;
    
    // Binary search to find t for given x
    let start = 0;
    let end = 1;
    
    while (start < end) {
      const mid = (start + end) / 2;
      const x = sampleCurveX(mid);
      
      if (Math.abs(x - t) < 0.001) {
        return sampleCurveY(mid);
      }
      
      if (x < t) {
        start = mid;
      } else {
        end = mid;
      }
    }
    
    return sampleCurveY(start);
  };
}

/**
 * Get interpolated value at a specific time
 * @param track Keyframe track to sample
 * @param time Time to sample at
 * @returns Interpolated value
 */
export function getTrackValue<T extends number | string>(
  track: KeyframeTrack<T>,
  time: number
): T {
  const { keyframes, defaultValue } = track;
  
  if (keyframes.length === 0) {
    return defaultValue;
  }
  
  // Find surrounding keyframes
  const nextIndex = keyframes.findIndex(kf => kf.time > time);
  
  // Before first keyframe
  if (nextIndex === 0) {
    return keyframes[0].value;
  }
  
  // After last keyframe
  if (nextIndex === -1) {
    return keyframes[keyframes.length - 1].value;
  }
  
  const prevKeyframe = keyframes[nextIndex - 1];
  const nextKeyframe = keyframes[nextIndex];
  
  // Calculate interpolation
  const t = (time - prevKeyframe.time) / (nextKeyframe.time - prevKeyframe.time);
  const interpolatedT = prevKeyframe.interpolation.fn(t);
  
  if (typeof prevKeyframe.value === 'number' && typeof nextKeyframe.value === 'number') {
    return (prevKeyframe.value + (nextKeyframe.value - prevKeyframe.value) * interpolatedT) as T;
  }
  
  return prevKeyframe.value;
}

/**
 * Validate a time value is within bounds
 * @param time Time value to validate
 * @param duration Maximum duration
 * @returns True if valid, false otherwise
 */
export function validateTime(time: number, duration: number): boolean {
  return time >= 0 && time <= duration;
}

/**
 * Clamp a time value to valid bounds
 * @param time Time value to clamp
 * @param duration Maximum duration
 * @returns Clamped time value
 */
export function clampTime(time: number, duration: number): number {
  return Math.max(0, Math.min(time, duration));
}

/**
 * Validate a value is within bounds
 * @param value Value to validate
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns True if valid, false otherwise
 */
export function isValidValue<T extends number | string>(
  value: T,
  min: T,
  max: T
): boolean {
  if (typeof value === 'number' && typeof min === 'number' && typeof max === 'number') {
    return value >= min && value <= max;
  }
  return true; // Non-numeric values don't have bounds
}

/**
 * Clamp a value to valid bounds
 * @param value Value to clamp
 * @param min Minimum allowed value
 * @param max Maximum allowed value
 * @returns Clamped value
 */
export function clampValue<T extends number | string>(
  value: T,
  min: T,
  max: T
): T {
  if (typeof value === 'number' && typeof min === 'number' && typeof max === 'number') {
    return Math.max(min, Math.min(value, max)) as T;
  }
  return value;
}

/**
 * Get selection bounds from two points
 * @param startX Start X coordinate
 * @param startY Start Y coordinate
 * @param endX End X coordinate
 * @param endY End Y coordinate
 * @returns Selection bounds object
 */
export function getSelectionBounds(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): { left: number; top: number; right: number; bottom: number } {
  return {
    left: Math.min(startX, endX),
    top: Math.min(startY, endY),
    right: Math.max(startX, endX),
    bottom: Math.max(startY, endY)
  };
}

/**
 * Check if a point is within selection bounds
 * @param point Point to check
 * @param bounds Selection bounds
 * @returns True if point is within bounds
 */
export function isPointInSelectionBox(
  point: { x: number; y: number },
  bounds: { left: number; top: number; right: number; bottom: number }
): boolean {
  return (
    point.x >= bounds.left &&
    point.x <= bounds.right &&
    point.y >= bounds.top &&
    point.y <= bounds.bottom
  );
}

/**
 * Convert volume to dB
 * @param volume Linear volume value (0 to 1)
 * @returns Volume in decibels
 */
export function volumeTodB(volume: number): number {
  if (volume <= 0) return -Infinity;
  return 20 * Math.log10(volume);
}

/**
 * Convert dB to volume
 * @param db Volume in decibels
 * @returns Linear volume value (0 to 1)
 */
export function dBToVolume(db: number): number {
  if (db === -Infinity) return 0;
  return Math.pow(10, db / 20);
}

/**
 * Format dB value as string
 * @param db Volume in decibels
 * @returns Formatted string with dB suffix
 */
export function formatdB(db: number): string {
  if (db === -Infinity) return '-∞ dB';
  return `${db.toFixed(1)} dB`;
}
