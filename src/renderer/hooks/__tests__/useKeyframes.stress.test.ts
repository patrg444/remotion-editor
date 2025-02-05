import { renderHook, act } from '@testing-library/react-hooks';
import { useKeyframes } from '../useKeyframes';
import { InterpolationType } from '../../types/keyframe';

describe('useKeyframes Stress Tests', () => {
  describe('Performance', () => {
    it('handles large number of tracks and keyframes', () => {
      const { result } = renderHook(() => useKeyframes());
      const numTracks = 100;
      const numKeyframesPerTrack = 1000;

      const startTime = Date.now();

      // Create many tracks with many keyframes
      act(() => {
        for (let i = 0; i < numTracks; i++) {
          const trackId = `effect${i}-opacity`;
          result.current.createTrack(`effect${i}`, 'opacity', 1.0, 0, 1, 0.1);

          // Add keyframes with random values
          for (let j = 0; j < numKeyframesPerTrack; j++) {
            const time = j * (60 / numKeyframesPerTrack); // Spread over 60 seconds
            const value = Math.random();
            result.current.addKeyframe(trackId, time, value);
          }
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const operationsPerSecond = (numTracks * numKeyframesPerTrack) / (duration / 1000);

      // Should handle at least 10,000 operations per second
      expect(operationsPerSecond).toBeGreaterThan(10000);

      // Verify tracks and keyframes were created correctly
      for (let i = 0; i < numTracks; i++) {
        const track = result.current.getTrack(`effect${i}-opacity`);
        expect(track).toBeDefined();
        expect(track?.keyframes).toHaveLength(numKeyframesPerTrack);
      }
    });

    it('maintains performance during rapid value queries', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      // Create a track with many keyframes
      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0, 0, 1, 0.1);
        for (let i = 0; i < 1000; i++) {
          const time = i * 0.1; // One keyframe every 0.1 seconds
          result.current.addKeyframe(trackId, time, Math.random());
        }
      });

      const track = result.current.getTrack(trackId);
      const startTime = Date.now();
      const numQueries = 10000;

      // Perform many value queries
      for (let i = 0; i < numQueries; i++) {
        const time = Math.random() * 100; // Random time between 0 and 100 seconds
        track?.getValue(time);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const queriesPerSecond = numQueries / (duration / 1000);

      // Should handle at least 10,000 queries per second
      expect(queriesPerSecond).toBeGreaterThan(10000);
    });

    it('handles rapid keyframe updates', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      // Create a track with keyframes
      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0, 0, 1, 0.1);
        for (let i = 0; i < 100; i++) {
          result.current.addKeyframe(trackId, i, 0.5);
        }
      });

      const startTime = Date.now();
      const numUpdates = 1000;

      // Perform rapid updates
      act(() => {
        for (let i = 0; i < numUpdates; i++) {
          const keyframeIndex = Math.floor(Math.random() * 100);
          result.current.updateKeyframe(trackId, keyframeIndex, Math.random());
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const updatesPerSecond = numUpdates / (duration / 1000);

      // Should handle at least 1,000 updates per second
      expect(updatesPerSecond).toBeGreaterThan(1000);
    });
  });

  describe('Complex Interpolation', () => {
    it('handles mixed interpolation types in large datasets', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      // Create a track with alternating interpolation types
      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0, 0, 1, 0.1);
        for (let i = 0; i < 100; i++) {
          result.current.addKeyframe(
            trackId,
            i,
            Math.random(),
            i % 2 === 0 ? InterpolationType.Linear : InterpolationType.Step
          );
        }
      });

      const track = result.current.getTrack(trackId);
      const values: number[] = [];

      // Sample many points
      for (let i = 0; i < 1000; i++) {
        const time = i * 0.1;
        values.push(track?.getValue(time) ?? 0);
      }

      // Verify interpolation consistency
      for (let i = 1; i < values.length; i++) {
        const diff = Math.abs(values[i] - values[i - 1]);
        expect(diff).toBeLessThanOrEqual(1); // No extreme jumps
      }
    });

    it('maintains accuracy during rapid interpolation changes', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0, 0, 1, 0.1);
        result.current.addKeyframe(trackId, 0, 0);
        result.current.addKeyframe(trackId, 1, 1);
      });

      const track = result.current.getTrack(trackId);
      const samples = 1000;
      const values: number[] = [];

      // Sample many points with high precision
      for (let i = 0; i < samples; i++) {
        const time = i / samples;
        values.push(track?.getValue(time) ?? 0);
      }

      // Verify linear interpolation accuracy
      for (let i = 0; i < samples; i++) {
        const time = i / samples;
        const expectedValue = time; // Linear interpolation from 0 to 1
        expect(values[i]).toBeCloseTo(expectedValue, 6); // 6 decimal places
      }
    });
  });

  describe('Memory Management', () => {
    it('handles track cleanup with large datasets', () => {
      const { result } = renderHook(() => useKeyframes());
      const numTracks = 100;

      // Create many tracks
      act(() => {
        for (let i = 0; i < numTracks; i++) {
          result.current.createTrack(`effect${i}`, 'opacity', 1.0);
          // Add many keyframes
          for (let j = 0; j < 100; j++) {
            result.current.addKeyframe(`effect${i}-opacity`, j, Math.random());
          }
        }
      });

      // Remove tracks and verify cleanup
      act(() => {
        for (let i = 0; i < numTracks; i++) {
          result.current.removeTrack(`effect${i}-opacity`);
        }
      });

      // Verify all tracks were removed
      for (let i = 0; i < numTracks; i++) {
        expect(result.current.getTrack(`effect${i}-opacity`)).toBeUndefined();
      }
    });

    it('maintains performance during group operations', () => {
      const { result } = renderHook(() => useKeyframes());
      const numGroups = 100;
      const tracksPerGroup = 10;

      const startTime = Date.now();

      // Create many groups with multiple tracks
      act(() => {
        for (let i = 0; i < numGroups; i++) {
          const tracks = Array.from({ length: tracksPerGroup }, (_, j) => ({
            trackId: `effect${i}-${j}-opacity`,
            effectId: `effect${i}-${j}`,
            paramId: 'opacity'
          }));

          result.current.addKeyframeGroup(`group${i}`, `Effect Group ${i}`, tracks);
        }
      });

      // Toggle all groups rapidly
      act(() => {
        for (let i = 0; i < numGroups; i++) {
          result.current.toggleGroupExpansion(`group${i}`);
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const operationsPerSecond = (numGroups * (1 + tracksPerGroup)) / (duration / 1000);

      // Should handle at least 1,000 group operations per second
      expect(operationsPerSecond).toBeGreaterThan(1000);
    });
  });
});
