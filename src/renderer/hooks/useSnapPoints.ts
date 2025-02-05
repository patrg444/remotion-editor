import { useCallback } from 'react';
import { Track, Clip, isMediaClip } from '../types/timeline';
import { isFrameAligned, roundToFrame } from '../utils/timeValidation';
import { logger } from '../utils/logger';

export interface SnapPoint {
  time: number;
  type: string;
  source: string;
}

// Constants for snap point optimization
const MIN_FRAME_PIXEL_SPACING = 10; // Minimum pixels between frame snap points
const MAX_FRAME_SNAP_ZOOM = 4; // Maximum zoom level for frame snapping
const FRAME_SNAP_WINDOW = 5; // Number of frames to generate on each side of current time

export const useSnapPoints = (fps: number) => {
  const getClipSnapPoints = useCallback((clip: Clip): SnapPoint[] => {
    const points: SnapPoint[] = [
      {
        time: clip.startTime,
        type: 'clip-start',
        source: clip.id
      },
      {
        time: clip.endTime,
        type: 'clip-end',
        source: clip.id
      }
    ];

    // Add trim points if this is a media clip
    if (isMediaClip(clip)) {
      // Add media boundary points if the clip is trimmed
      if (clip.mediaOffset > 0) {
        points.push({
          time: clip.startTime + clip.mediaOffset,
          type: 'trim-start',
          source: clip.id
        });
      }

      const mediaEnd = clip.mediaOffset + clip.mediaDuration;
      const originalDuration = clip.originalDuration || clip.mediaDuration;
      if (mediaEnd < originalDuration) {
        points.push({
          time: clip.startTime + mediaEnd,
          type: 'trim-end',
          source: clip.id
        });
      }
    }

    return points;
  }, []);

  // Memoize clip snap points to prevent recalculation
  const getClipsSnapPoints = useCallback((tracks: Track[]): SnapPoint[] => {
    const points: SnapPoint[] = [];
    tracks.forEach(track => {
      track.clips.forEach(clip => {
        points.push(...getClipSnapPoints(clip));
      });
    });
    return points;
  }, [getClipSnapPoints]);

  // Memoize marker snap points
  const getMarkerSnapPoints = useCallback((markers: { time: number; id: string }[]): SnapPoint[] => {
    return markers.map(marker => ({
      time: marker.time,
      type: 'marker',
      source: marker.id
    }));
  }, []);

  const getFrameSnapPoints = useCallback((
    currentTime: number,
    zoom: number,
    pixelsPerFrame: number
  ): SnapPoint[] => {
    // Skip frame snap points if zoom is too high or frame spacing is too small
    if (zoom > MAX_FRAME_SNAP_ZOOM || pixelsPerFrame < MIN_FRAME_PIXEL_SPACING) {
      return [];
    }

    const currentFrame = Math.round(currentTime * fps);
    const points: SnapPoint[] = [];

    // Only generate frame points within a window around current time
    for (let offset = -FRAME_SNAP_WINDOW; offset <= FRAME_SNAP_WINDOW; offset++) {
      const frame = currentFrame + offset;
      if (frame >= 0) { // Prevent negative frame numbers
        points.push({
          time: frame / fps,
          type: 'frame',
          source: `frame-${frame}`
        });
      }
    }

    return points;
  }, [fps]);

  const getAllSnapPoints = useCallback((
    tracks: Track[],
    markers: { time: number; id: string }[] = [],
    currentTime: number,
    zoom: number = 1,
    pixelsPerFrame: number = 0
  ): SnapPoint[] => {
    // Get clip and marker points (these are relatively few in number)
    const clipPoints = getClipsSnapPoints(tracks);
    const markerPoints = getMarkerSnapPoints(markers);

    // Add playhead point
    const playheadPoint = {
      time: currentTime,
      type: 'playhead',
      source: 'playhead'
    };

    // Get frame points (these can be numerous, so we optimize them)
    const framePoints = getFrameSnapPoints(currentTime, zoom, pixelsPerFrame);

    const allPoints = [
      ...clipPoints,
      ...markerPoints,
      playheadPoint,
      ...framePoints
    ];

    logger.debug('Snap points', {
      total: allPoints.length,
      clips: clipPoints.length,
      markers: markerPoints.length,
      frames: framePoints.length,
      zoom,
      pixelsPerFrame
    });

    return allPoints;
  }, [getClipsSnapPoints, getMarkerSnapPoints, getFrameSnapPoints]);

  const findNearestSnapPoint = useCallback((
    time: number,
    snapPoints: SnapPoint[],
    threshold: number,
    excludeTypes: string[] = []
  ): SnapPoint | null => {
    // Quick check if we're already on a frame boundary
    if (isFrameAligned(time, fps)) {
      return {
        time,
        type: 'frame',
        source: `frame-${Math.round(time * fps)}`
      };
    }

    // Find nearest point within threshold
    let nearestPoint: SnapPoint | null = null;
    let minDistance = threshold;

    // Sort points by distance first to optimize search
    const sortedPoints = snapPoints
      .filter(point => !excludeTypes.includes(point.type))
      .sort((a, b) => Math.abs(a.time - time) - Math.abs(b.time - time));

    // Only check points until we exceed the threshold
    for (const point of sortedPoints) {
      const distance = Math.abs(point.time - time);
      if (distance > minDistance) break; // No need to check further points
      minDistance = distance;
      nearestPoint = point;
    }

    // If no point found within threshold, snap to nearest frame
    if (!nearestPoint) {
      const roundedTime = roundToFrame(time, fps);
      if (Math.abs(roundedTime - time) < threshold) {
        nearestPoint = {
          time: roundedTime,
          type: 'frame',
          source: `frame-${Math.round(roundedTime * fps)}`
        };
      }
    }

    return nearestPoint;
  }, [fps]);

  return {
    getAllSnapPoints,
    findNearestSnapPoint,
    getClipSnapPoints
  };
};
