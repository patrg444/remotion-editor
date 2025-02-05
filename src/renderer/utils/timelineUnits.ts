import { TimelineConstants } from './timelineConstants';

/**
 * Time formatting and conversion utilities
 */

export interface TimeFormatOptions {
  fps?: number;
  showFrames?: boolean;
  showMilliseconds?: boolean;
  padHours?: boolean;
  compact?: boolean;
  format?: 'standard' | 'frames' | 'milliseconds' | 'timecode';
}

/**
 * Format time in seconds to a string representation
 * Formats:
 * - standard: "HH:MM:SS:FF" or "HH:MM:SS.mmm"
 * - frames: "123" (total frames)
 * - milliseconds: "1234" (total milliseconds)
 * - timecode: "01:00:00:00" (SMPTE timecode)
 */
export const formatTime = (seconds: number, options: TimeFormatOptions = {}): string => {
  const opts = { ...TimelineConstants.Time.DEFAULT_TIME_OPTIONS, ...options };
  const { fps, showFrames, showMilliseconds, padHours, compact, format = 'standard' } = opts;

  // Handle special formats
  if (format === 'frames') {
    return Math.floor(seconds * fps).toString();
  }
  if (format === 'milliseconds') {
    return Math.floor(seconds * 1000).toString();
  }

  // Calculate time components
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);
  const milliseconds = Math.floor((seconds % 1) * 1000);

  // Handle compact format (MM:SS)
  if (compact && hours === 0) {
    if (showFrames) {
      return `${minutes}:${String(secs).padStart(2, '0')}:${String(frames).padStart(2, '0')}`;
    }
    if (showMilliseconds) {
      return `${minutes}:${String(secs).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  }

  // Build time parts
  const parts: string[] = [];

  // Add hours if needed
  if (hours > 0 || padHours) {
    parts.push(String(hours).padStart(2, '0'));
  }

  // Add minutes and seconds
  parts.push(String(minutes).padStart(2, '0'));
  parts.push(String(secs).padStart(2, '0'));

  // Add frames or milliseconds
  if (showFrames) {
    parts.push(String(frames).padStart(2, '0'));
  } else if (showMilliseconds) {
    parts.push(String(milliseconds).padStart(3, '0'));
  }

  // Join with appropriate separator
  const separator = showMilliseconds ? '.' : ':';
  const mainParts = parts.slice(0, -1).join(':');
  const fractionalPart = parts[parts.length - 1];

  return showFrames || !showMilliseconds
    ? parts.join(':')
    : `${mainParts}${separator}${fractionalPart}`;
};

/**
 * Parse a time string into seconds
 * Supports formats:
 * - HH:MM:SS:FF (frames)
 * - HH:MM:SS.mmm (milliseconds)
 * - HH:MM:SS
 * - MM:SS
 * - SS
 */
export const parseTime = (timeStr: string, fps: number = TimelineConstants.Time.DEFAULT_FPS): number => {
  // Handle empty or invalid input
  if (!timeStr) return 0;

  // Check for milliseconds format (SS.mmm)
  if (timeStr.includes('.')) {
    const [main, fraction] = timeStr.split('.');
    return parseFloat(`${main}.${fraction}`);
  }

  const parts = timeStr.split(':').map(Number);
  let seconds = 0;

  switch (parts.length) {
    case 4: // HH:MM:SS:FF
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2] + parts[3] / fps;
      break;
    case 3: // HH:MM:SS
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      break;
    case 2: // MM:SS
      seconds = parts[0] * 60 + parts[1];
      break;
    case 1: // SS
      seconds = parts[0];
      break;
    default:
      throw new Error('Invalid time format');
  }

  return seconds;
};

/**
 * Frame-time conversion utilities
 */

export const framesToTime = (frames: number, fps: number = TimelineConstants.Time.DEFAULT_FPS): number => {
  return frames / fps;
};

export const timeToFrames = (time: number, fps: number = TimelineConstants.Time.DEFAULT_FPS): number => {
  return Math.floor(time * fps);
};

export const getFrameAtTime = (time: number, fps: number = TimelineConstants.Time.DEFAULT_FPS): number => {
  return Math.floor(time * fps);
};

export const getTimeAtFrame = (frame: number, fps: number = TimelineConstants.Time.DEFAULT_FPS): number => {
  return frame / fps;
};

/**
 * Check if time aligns with frame boundary
 */
export const isFrameAligned = (time: number, fps: number = TimelineConstants.Time.DEFAULT_FPS): boolean => {
  const frames = time * fps;
  return Math.abs(frames - Math.round(frames)) < Number.EPSILON;
};

/**
 * Duration utilities
 */

export const getDuration = TimelineConstants.Time.getDuration;
export const getEndTime = TimelineConstants.Time.getEndTime;

/**
 * Frame rate utilities
 */

export const isValidFrameRate = (fps: number): boolean => {
  return TimelineConstants.Time.FRAME_RATE_OPTIONS.includes(fps as any);
};

export const getNearestValidFrameRate = (fps: number): number => {
  return TimelineConstants.Time.FRAME_RATE_OPTIONS.reduce((prev, curr) => 
    Math.abs(curr - fps) < Math.abs(prev - fps) ? curr : prev
  );
};
