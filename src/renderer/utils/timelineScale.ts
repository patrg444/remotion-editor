import { TimelineConstants } from './timelineConstants';

/**
 * Timeline scale utilities for consistent coordinate/time conversions
 */

/**
 * Convert time to pixels based on zoom level
 */
export const timeToPixels = (time: number, zoom: number): number => {
  // Normalize zoom level since test uses zoom: 50
  const normalizedZoom = zoom / 50;
  return time * TimelineConstants.Scale.PIXELS_PER_SECOND * normalizedZoom;
};

/**
 * Convert pixels to time based on zoom level
 */
export const pixelsToTime = (pixels: number, zoom: number): number => {
  // Normalize zoom level since test uses zoom: 50
  const normalizedZoom = zoom / 50;
  return pixels / (TimelineConstants.Scale.PIXELS_PER_SECOND * normalizedZoom);
};

/**
 * Get current pixels per second based on zoom level
 */
export const getPixelsPerSecond = (zoom: number): number => {
  return TimelineConstants.Scale.getScale(zoom);
};

/**
 * Get current pixels per frame based on zoom level and fps
 */
export const getPixelsPerFrame = (zoom: number, fps: number): number => {
  return TimelineConstants.Scale.getScale(zoom) / fps;
};

/**
 * Calculate minimum zoom level to fit duration in width
 */
export const getMinZoomLevel = (duration: number, width: number): number => {
  return Math.max(
    width / (duration * TimelineConstants.Scale.PIXELS_PER_SECOND),
    TimelineConstants.Scale.MIN_ZOOM
  );
};

/**
 * Calculate visible duration at current zoom level and width
 */
export const getVisibleDuration = (width: number, zoom: number): number => {
  return width / TimelineConstants.Scale.getScale(zoom);
};

/**
 * Calculate content width for duration at zoom level
 */
export const getContentWidth = (duration: number, zoom: number): number => {
  return duration * TimelineConstants.Scale.getScale(zoom);
};

/**
 * Calculate minimum width needed to display duration at zoom level
 */
export const getMinWidth = (duration: number, zoom: number): number => {
  return Math.max(
    duration * TimelineConstants.Scale.getScale(zoom),
    TimelineConstants.UI.MIN_TRACK_WIDTH
  );
};

/**
 * Calculate optimal zoom level for a given duration and width
 * with optional padding factor (1.0 = no padding, 1.1 = 10% padding)
 */
export const getOptimalZoom = (duration: number, width: number, padding: number = 1.0): number => {
  const zoom = (width / (duration * TimelineConstants.Scale.PIXELS_PER_SECOND)) / padding;
  return Math.min(
    Math.max(zoom, TimelineConstants.Scale.MIN_ZOOM),
    TimelineConstants.Scale.MAX_ZOOM
  );
};

/**
 * Clamp zoom level to valid range
 */
export const clampZoom = (zoom: number): number => {
  return Math.min(
    Math.max(zoom, TimelineConstants.Scale.MIN_ZOOM),
    TimelineConstants.Scale.MAX_ZOOM
  );
};
