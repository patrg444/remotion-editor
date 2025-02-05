import { renderHook } from '@testing-library/react-hooks';
import { useSnapPoints } from '../useSnapPoints';
import { TimelineMarker, Track, ProductionClip } from '../../types/timeline';

describe('useSnapPoints Stress Tests', () => {
  describe('Performance', () => {
    it('handles large number of markers', () => {
      const { result } = renderHook(() => useSnapPoints());
      const numMarkers = 10000;

      const markers: TimelineMarker[] = Array.from({ length: numMarkers }, (_, i) => ({
        id: `marker-${i}`,
        time: i * 0.1, // One marker every 0.1 seconds
        type: 'marker'
      }));

      const startTime = Date.now();
      const snapPoints = result.current.getMarkerSnapPoints(markers);
      const endTime = Date.now();

      const duration = endTime - startTime;
      const markersPerSecond = numMarkers / (duration / 1000);

      // Should handle at least 10,000 markers per second
      expect(markersPerSecond).toBeGreaterThan(10000);
      expect(snapPoints).toHaveLength(numMarkers);
      expect(snapPoints[0].type).toBe('marker');
    });

    it('handles large number of clips across multiple tracks', () => {
      const { result } = renderHook(() => useSnapPoints());
      const numTracks = 100;
      const clipsPerTrack = 100;

      // Create tracks with many clips
      const tracks: Track[] = Array.from({ length: numTracks }, (_, trackIndex) => ({
        id: `track-${trackIndex}`,
        name: `Track ${trackIndex}`,
        type: 'video',
        clips: Array.from({ length: clipsPerTrack }, (_, clipIndex) => ({
          id: `clip-${trackIndex}-${clipIndex}`,
          type: 'video',
          startTime: clipIndex * 10,
          duration: 8, // 8 seconds per clip with 2 second gap
          source: 'test.mp4'
        })),
        duration: clipsPerTrack * 10,
        isVisible: true
      }));

      const startTime = Date.now();
      const snapPoints = result.current.getClipSnapPoints(tracks);
      const endTime = Date.now();

      const duration = endTime - startTime;
      const clipsPerSecond = (numTracks * clipsPerTrack) / (duration / 1000);

      // Should handle at least 10,000 clips per second
      expect(clipsPerSecond).toBeGreaterThan(10000);
      // Two snap points per clip (start and end)
      expect(snapPoints).toHaveLength(numTracks * clipsPerTrack * 2);
    });

    it('maintains performance during rapid nearest point queries', () => {
      const { result } = renderHook(() => useSnapPoints());
      const numSnapPoints = 10000;
      const numQueries = 1000;

      // Create many snap points
      const snapPoints = Array.from({ length: numSnapPoints }, (_, i) => ({
        time: i * 0.1,
        type: 'marker' as const,
        source: {
          type: 'marker' as const,
          markerId: `marker-${i}`,
          time: i * 0.1
        }
      }));

      const startTime = Date.now();

      // Perform many nearest point queries
      for (let i = 0; i < numQueries; i++) {
        const queryTime = Math.random() * (numSnapPoints * 0.1);
        result.current.findNearestSnapPoint(queryTime, snapPoints, 1);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const queriesPerSecond = numQueries / (duration / 1000);

      // Should handle at least 1,000 queries per second
      expect(queriesPerSecond).toBeGreaterThan(1000);
    });
  });

  describe('Memory Management', () => {
    it('maintains consistent memory usage with large datasets', () => {
      const { result } = renderHook(() => useSnapPoints());
      const numMarkers = 100000;

      // Record initial heap usage
      const initialHeap = process.memoryUsage().heapUsed;

      // Create and process large number of markers
      const markers: TimelineMarker[] = Array.from({ length: numMarkers }, (_, i) => ({
        id: `marker-${i}`,
        time: i * 0.1,
        type: 'marker'
      }));

      const snapPoints = result.current.getMarkerSnapPoints(markers);

      // Record final heap usage
      const finalHeap = process.memoryUsage().heapUsed;
      const heapGrowth = finalHeap - initialHeap;

      // Memory growth should be proportional to data size
      // Roughly 100 bytes per snap point (conservative estimate)
      const expectedMaxGrowth = numMarkers * 100;
      expect(heapGrowth).toBeLessThan(expectedMaxGrowth);
    });

    it('handles rapid mount/unmount cycles', () => {
      const cycles = 1000;
      const startTime = Date.now();

      // Rapidly mount and unmount the hook
      for (let i = 0; i < cycles; i++) {
        const { unmount } = renderHook(() => useSnapPoints());
        unmount();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const cyclesPerSecond = cycles / (duration / 1000);

      // Should handle at least 100 mount/unmount cycles per second
      expect(cyclesPerSecond).toBeGreaterThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('handles overlapping snap points', () => {
      const { result } = renderHook(() => useSnapPoints());
      const numPoints = 1000;
      const time = 50; // All points at the same time

      // Create many overlapping snap points
      const snapPoints = Array.from({ length: numPoints }, (_, i) => ({
        time,
        type: 'marker' as const,
        source: {
          type: 'marker' as const,
          markerId: `marker-${i}`,
          time
        }
      }));

      const nearest = result.current.findNearestSnapPoint(time + 0.1, snapPoints, 1);

      // Should find the nearest point even with many overlapping points
      expect(nearest).toBeDefined();
      expect(nearest?.time).toBe(time);
    });

    it('handles extreme time values', () => {
      const { result } = renderHook(() => useSnapPoints());

      // Create snap points with extreme values
      const snapPoints = [
        result.current.getPlayheadSnapPoint(Number.MAX_SAFE_INTEGER),
        result.current.getPlayheadSnapPoint(Number.MIN_SAFE_INTEGER),
        result.current.getPlayheadSnapPoint(0)
      ];

      // Should handle extreme values without errors
      expect(snapPoints[0].time).toBe(Number.MAX_SAFE_INTEGER);
      expect(snapPoints[1].time).toBe(Number.MIN_SAFE_INTEGER);
      expect(snapPoints[2].time).toBe(0);
    });
  });
});
