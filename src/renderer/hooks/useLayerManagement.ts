import { useCallback } from 'react';
import { Clip, ClipWithLayer, Track } from '../types/timeline';
import { TimelineConstants } from '../utils/timelineConstants';
import { logger } from '../utils/logger';

interface LayerGroup {
  startTime: number;
  endTime: number;
  clips: ClipWithLayer[];
}

export const useLayerManagement = () => {
  /**
   * Find optimal layer assignment for clips that minimizes the number of layers needed
   * while respecting clip relationships and track settings
   */
  const assignLayers = useCallback((clips: Clip[], track: Track): ClipWithLayer[] => {
    if (!track.allowOverlap) {
      // If track doesn't allow overlap, keep clips on the same layer
      // since they shouldn't overlap in the first place
      return clips.map(clip => ({
        ...clip,
        layer: 0
      }));
    }

    // Sort clips by start time for initial processing
    const sortedClips = [...clips].sort((a, b) => a.startTime - b.startTime);

    // Group overlapping clips together
    const groups: LayerGroup[] = [];
    sortedClips.forEach(clip => {
      let added = false;
      for (const group of groups) {
        if (clip.startTime < group.endTime) {
          group.clips.push({ ...clip, layer: 0 });
          group.endTime = Math.max(group.endTime, clip.endTime);
          added = true;
          break;
        }
      }
      if (!added) {
        groups.push({
          startTime: clip.startTime,
          endTime: clip.endTime,
          clips: [{ ...clip, layer: 0 }]
        });
      }
    });

    // Merge overlapping groups
    const mergedGroups: LayerGroup[] = [];
    groups.forEach(group => {
      let merged = false;
      for (const existingGroup of mergedGroups) {
        if (group.startTime < existingGroup.endTime) {
          existingGroup.clips.push(...group.clips);
          existingGroup.endTime = Math.max(existingGroup.endTime, group.endTime);
          merged = true;
          break;
        }
      }
      if (!merged) {
        mergedGroups.push(group);
      }
    });

    // Assign layers within each group using graph coloring approach
    mergedGroups.forEach(group => {
      // Create overlap graph
      const overlapGraph: Map<string, Set<string>> = new Map();
      group.clips.forEach(clip => {
        overlapGraph.set(clip.id, new Set());
      });

      // Build overlap relationships
      group.clips.forEach(clip1 => {
        group.clips.forEach(clip2 => {
          if (clip1.id !== clip2.id &&
              clip1.startTime < clip2.endTime &&
              clip2.startTime < clip1.endTime) {
            overlapGraph.get(clip1.id)?.add(clip2.id);
            overlapGraph.get(clip2.id)?.add(clip1.id);
          }
        });
      });

      // Sort clips by number of overlaps (most constrained first)
      const sortedByConstraints = [...group.clips].sort((a, b) => {
        const aOverlaps = overlapGraph.get(a.id)?.size || 0;
        const bOverlaps = overlapGraph.get(b.id)?.size || 0;
        return bOverlaps - aOverlaps;
      });

      // Assign layers using graph coloring
      const clipLayers = new Map<string, number>();
      sortedByConstraints.forEach(clip => {
        const usedLayers = new Set<number>();
        overlapGraph.get(clip.id)?.forEach(overlapId => {
          const layer = clipLayers.get(overlapId);
          if (layer !== undefined) {
            usedLayers.add(layer);
          }
        });

        // Find first available layer
        let layer = 0;
        while (usedLayers.has(layer) && layer < TimelineConstants.Layers.MAX_LAYERS) {
          layer++;
        }
        clipLayers.set(clip.id, layer);
      });

      // Update clips with assigned layers
      group.clips.forEach(clip => {
        clip.layer = clipLayers.get(clip.id) || 0;
      });
    });

    // Combine all clips from groups and sort by original order
    const layeredClips = mergedGroups.flatMap(g => g.clips);
    const originalOrder = new Map(clips.map((clip, index) => [clip.id, index]));
    layeredClips.sort((a, b) => {
      return (originalOrder.get(a.id) || 0) - (originalOrder.get(b.id) || 0);
    });

    logger.debug('Layer assignment:', {
      trackId: track.id,
      clipCount: clips.length,
      groupCount: mergedGroups.length,
      maxLayer: Math.max(...layeredClips.map(c => c.layer))
    });

    return layeredClips;
  }, []);

  /**
   * Calculate track height based on clip layers
   */
  const getTrackHeight = useCallback((clips: ClipWithLayer[]): number => {
    const maxLayer = Math.max(...clips.map(c => c.layer));
    return (maxLayer + 1) * TimelineConstants.Layers.MIN_LAYER_HEIGHT +
           maxLayer * TimelineConstants.Layers.LAYER_SPACING;
  }, []);

  /**
   * Calculate clip vertical position based on layer
   */
  const getClipTop = useCallback((layer: number): number => {
    return layer * (TimelineConstants.Layers.MIN_LAYER_HEIGHT + 
                   TimelineConstants.Layers.LAYER_SPACING);
  }, []);

  return {
    assignLayers,
    getTrackHeight,
    getClipTop
  };
};
