import { useCallback, useMemo } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { useTimelineViewport } from './useTimelineViewport';
import { Track, Clip } from '../types/timeline';
import { logger } from '../utils/logger';

// Increase buffer for smoother scrolling at high resolutions
const BUFFER_FACTOR = 2.0; // Extra buffer to prevent popping at edges
const MIN_CLIP_WIDTH = 10; // Minimum width in pixels to render a clip
const MAX_VISIBLE_CLIPS = 1000; // Maximum number of clips to render at once
const CLIP_DENSITY_THRESHOLD = 0.8; // Threshold for clip density optimization

interface VirtualizedData {
  tracks: Track[];
  visibleTimeRange: [number, number];
  visibleClipsCount: number;
  totalClipsCount: number;
  density: number;
}

export const useVirtualScroll = (containerWidth: number) => {
  const { state } = useTimelineContext();
  const { timeToPixels, pixelsToTime, getVisibleTimeRange } = useTimelineViewport();

  /**
   * Calculate visible time range with dynamic buffer
   */
  const getBufferedTimeRange = useCallback((): [number, number] => {
    const [visibleStart, visibleEnd] = getVisibleTimeRange(containerWidth);
    const visibleDuration = visibleEnd - visibleStart;
    
    // Adjust buffer based on zoom level and timeline duration
    const zoomFactor = Math.max(0.5, Math.min(2, state.zoom));
    const durationFactor = Math.min(1, 60 * 60 / state.duration); // Adjust for timelines > 1 hour
    const dynamicBuffer = visibleDuration * (BUFFER_FACTOR * zoomFactor * durationFactor - 1) / 2;

    return [
      Math.max(0, visibleStart - dynamicBuffer),
      Math.min(state.duration, visibleEnd + dynamicBuffer)
    ];
  }, [containerWidth, state.duration, state.zoom, getVisibleTimeRange]);

  /**
   * Check if clip is visible and renderable
   */
  const isClipVisible = useCallback((clip: Clip, timeRange: [number, number], clipDensity: number): boolean => {
    const [rangeStart, rangeEnd] = timeRange;
    
    // Basic visibility check
    if (clip.endTime < rangeStart || clip.startTime > rangeEnd) {
      return false;
    }

    // Width check with dynamic threshold based on clip density
    const clipWidth = timeToPixels(clip.endTime - clip.startTime);
    const minWidth = clipDensity > CLIP_DENSITY_THRESHOLD ? 
      MIN_CLIP_WIDTH * (1 + (clipDensity - CLIP_DENSITY_THRESHOLD) * 5) : 
      MIN_CLIP_WIDTH;

    if (clipWidth < minWidth) {
      return false;
    }

    return true;
  }, [timeToPixels]);

  /**
   * Calculate clip density in the visible range
   */
  const getClipDensity = useCallback((clips: Clip[], timeRange: [number, number]): number => {
    const [start, end] = timeRange;
    const rangeDuration = end - start;
    const totalClipDuration = clips.reduce((sum, clip) => {
      if (clip.endTime < start || clip.startTime > end) return sum;
      const clipStart = Math.max(start, clip.startTime);
      const clipEnd = Math.min(end, clip.endTime);
      return sum + (clipEnd - clipStart);
    }, 0);

    return totalClipDuration / rangeDuration;
  }, []);

  /**
   * Get virtualized tracks and clips with optimizations
   */
  const getVirtualizedData = useCallback((): VirtualizedData => {
    const timeRange = getBufferedTimeRange();
    let visibleClipsCount = 0;
    let totalClipsCount = 0;
    let totalDensity = 0;

    // First pass: calculate total clip density
    state.tracks.forEach(track => {
      const density = getClipDensity(track.clips, timeRange);
      totalDensity += density;
    });
    const averageDensity = totalDensity / state.tracks.length;

    // Second pass: filter clips with density-based optimizations
    const virtualizedTracks = state.tracks.map(track => {
      totalClipsCount += track.clips.length;

      // Sort clips by duration (longer clips get priority)
      const sortedClips = [...track.clips].sort((a, b) => 
        (b.endTime - b.startTime) - (a.endTime - a.startTime)
      );

      const visibleClips = sortedClips
        .filter(clip => {
          if (visibleClipsCount >= MAX_VISIBLE_CLIPS) return false;
          const visible = isClipVisible(clip, timeRange, averageDensity);
          if (visible) visibleClipsCount++;
          return visible;
        })
        // Restore original order
        .sort((a, b) => a.startTime - b.startTime);

      return {
        ...track,
        clips: visibleClips
      };
    });

    logger.debug('Virtual scroll update:', {
      timeRange,
      visibleClips: visibleClipsCount,
      totalClips: totalClipsCount,
      density: averageDensity,
      reduction: `${Math.round((1 - visibleClipsCount / totalClipsCount) * 100)}%`
    });

    return {
      tracks: virtualizedTracks,
      visibleTimeRange: timeRange,
      visibleClipsCount,
      totalClipsCount,
      density: averageDensity
    };
  }, [state.tracks, getBufferedTimeRange, isClipVisible, getClipDensity]);

  /**
   * Memoize virtualized data with additional dependencies
   */
  const virtualizedData = useMemo(() => getVirtualizedData(), [
    getVirtualizedData,
    state.tracks,
    state.zoom,
    state.scrollX,
    state.duration
  ]);

  return {
    virtualizedTracks: virtualizedData.tracks,
    visibleTimeRange: virtualizedData.visibleTimeRange,
    visibleClipsCount: virtualizedData.visibleClipsCount,
    totalClipsCount: virtualizedData.totalClipsCount,
    density: virtualizedData.density,
    isClipVisible: (clip: Clip, timeRange: [number, number]) => 
      isClipVisible(clip, timeRange, virtualizedData.density)
  };
};
