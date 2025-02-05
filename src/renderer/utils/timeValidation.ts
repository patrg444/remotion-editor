import { timeToFrames, framesToTime } from './timelineUnits';
import { logger } from './logger';

interface TimeValidationOptions {
  minValue?: number;
  maxValue?: number;
  snapToFrames?: boolean;
  fps?: number;
}

const DEFAULT_OPTIONS: Required<TimeValidationOptions> = {
  minValue: 0,
  maxValue: Infinity,
  snapToFrames: true,
  fps: 30
};

/**
 * Clamps a time value within bounds and optionally snaps to frame boundaries
 */
export const clampTime = (time: number, options: TimeValidationOptions = {}): number => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { minValue, maxValue, snapToFrames, fps } = opts;

  let result = Math.max(minValue, Math.min(maxValue, time));

  if (snapToFrames) {
    // Convert to frames and back to ensure frame-accurate timing
    const frames = timeToFrames(result, fps);
    result = framesToTime(frames, fps);
  }

  return result;
};

interface ClipValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates clip media boundaries against clip duration and frame boundaries
 */
export const validateClipTrim = (
  mediaOffset: number,
  mediaDuration: number,
  originalDuration: number,
  fps: number
): ClipValidationResult => {
  const result: ClipValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Convert to frame boundaries for validation
  const offsetFrame = timeToFrames(mediaOffset, fps);
  const durationFrame = timeToFrames(mediaDuration, fps);
  const totalFrame = timeToFrames(originalDuration, fps);

  // Validate media boundaries
  if (offsetFrame < 0) {
    result.errors.push('Media offset cannot be negative');
    result.isValid = false;
  }

  if (mediaOffset < 0 || mediaOffset > originalDuration) {
    result.errors.push('Media offset must be within source media duration');
    result.isValid = false;
  }

  if (mediaDuration <= 0) {
    result.errors.push('Media duration must be greater than zero');
    result.isValid = false;
  }

  // Check for potential issues
  if (mediaDuration < 1) {
    result.warnings.push('Media duration is less than one second');
  }

  return result;
};

interface TimeRangeValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a time range against bounds and frame boundaries
 */
export const validateTimeRange = (
  startTime: number,
  endTime: number,
  options: TimeValidationOptions = {}
): TimeRangeValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const { minValue, maxValue, snapToFrames, fps } = opts;

  const result: TimeRangeValidationResult = {
    isValid: true,
    errors: []
  };

  // Clamp times to valid range
  const clampedStart = clampTime(startTime, opts);
  const clampedEnd = clampTime(endTime, opts);

  if (clampedStart !== startTime || clampedEnd !== endTime) {
    result.errors.push('Time values must be within valid range');
    result.isValid = false;
  }

  if (snapToFrames) {
    const startFrame = timeToFrames(startTime, fps);
    const endFrame = timeToFrames(endTime, fps);

    if (framesToTime(startFrame, fps) !== startTime || 
        framesToTime(endFrame, fps) !== endTime) {
      result.errors.push('Time values must align with frame boundaries');
      result.isValid = false;
    }
  }

  if (startTime >= endTime) {
    result.errors.push('Start time must be less than end time');
    result.isValid = false;
  }

  return result;
};

/**
 * Validates that a time value aligns with frame boundaries
 */
export const isFrameAligned = (time: number, fps: number): boolean => {
  const frame = timeToFrames(time, fps);
  return Math.abs(time - framesToTime(frame, fps)) < Number.EPSILON;
};

/**
 * Rounds a time value to the nearest frame boundary
 */
export const roundToFrame = (time: number, fps: number): number => {
  return framesToTime(Math.round(time * fps), fps);
};

// Export common validation options
export const VALIDATION = {
  PLAYHEAD: {
    snapToFrames: true,
    minValue: 0
  },
  CLIP_TRIM: {
    snapToFrames: true,
    minValue: 0
  },
  ZOOM: {
    snapToFrames: false,
    minValue: 0.1,
    maxValue: 10
  }
} as const;
