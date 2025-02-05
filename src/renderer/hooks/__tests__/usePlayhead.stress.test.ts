import { renderHook, act } from '@testing-library/react-hooks';
import { usePlayhead } from '../usePlayhead';
import { PlayheadOptions } from '../../types/playhead';

describe('usePlayhead Stress Tests', () => {
  // Mock options with high frame rate
  const mockOptions: PlayheadOptions = {
    duration: 3600, // 1 hour duration
    frameRate: 60,  // 60fps
    zoom: 1,
    onPositionChange: jest.fn(),
    onSpeedChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    let frameId = 0;
    let timestamp = 0;
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
      frameId++;
      setTimeout(() => cb(timestamp += 16.67), 0);
      return frameId;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    (window.requestAnimationFrame as jest.Mock).mockRestore();
  });

  describe('Performance', () => {
    it('maintains frame accuracy during long playback', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      // Start playback
      act(() => {
        actions.playForward();
      });

      // Simulate 10 minutes of playback
      const frames = 10 * 60 * 60; // 10 minutes * 60 seconds * 60 fps
      const expectedPosition = 10 * 60; // 10 minutes in seconds

      for (let i = 0; i < frames; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67); // ~60fps
        });
      }

      // Position should be accurate within 1 frame
      const frameTime = 1 / mockOptions.frameRate;
      expect(result.current[0].position).toBeCloseTo(expectedPosition, frameTime);
      expect(mockOptions.onPositionChange).toHaveBeenCalledTimes(frames);
    });

    it('handles rapid speed changes', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      // Simulate rapid speed changes
      const speeds = [1, 2, -1, -2, 4, -4, 0];
      for (let speed of speeds) {
        act(() => {
          if (speed === 0) {
            actions.pause();
          } else if (speed > 0) {
            for (let i = 0; i < speed; i++) actions.playForward();
          } else {
            for (let i = 0; i > speed; i--) actions.playBackward();
          }
        });

        // Play for a short duration at each speed
        for (let i = 0; i < 10; i++) {
          await act(async () => {
            jest.advanceTimersByTime(16.67);
          });
        }

        expect(result.current[0].speed).toBe(speed);
        expect(mockOptions.onSpeedChange).toHaveBeenCalledWith(speed);
      }
    });

    it('handles rapid seeking operations', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      // Perform 1000 rapid seek operations
      for (let i = 0; i < 1000; i++) {
        act(() => {
          actions.setPosition(Math.random() * mockOptions.duration);
        });
      }

      // Position should be within valid bounds
      expect(result.current[0].position).toBeGreaterThanOrEqual(0);
      expect(result.current[0].position).toBeLessThanOrEqual(mockOptions.duration);
    });

    it('maintains performance during rapid frame stepping', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      const startTime = Date.now();
      const steps = 1000;

      // Perform 1000 frame steps forward and backward
      for (let i = 0; i < steps; i++) {
        act(() => {
          actions.seekToNextFrame();
        });
      }

      for (let i = 0; i < steps; i++) {
        act(() => {
          actions.seekToPrevFrame();
        });
      }

      const endTime = Date.now();
      const operationsPerSecond = (steps * 2) / ((endTime - startTime) / 1000);

      // Should handle at least 1000 operations per second
      expect(operationsPerSecond).toBeGreaterThan(1000);
    });
  });

  describe('Edge Cases', () => {
    it('handles playback near duration boundary', async () => {
      const { result } = renderHook(() => usePlayhead({
        ...mockOptions,
        duration: 10
      }));
      const [, actions] = result.current;

      // Set position near the end
      act(() => {
        actions.setPosition(9.9);
        actions.playForward();
      });

      // Play for a while
      for (let i = 0; i < 60; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      // Should not exceed duration
      expect(result.current[0].position).toBe(10);
    });

    it('handles extreme speed changes', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      // Set extremely high speed
      act(() => {
        for (let i = 0; i < 100; i++) {
          actions.playForward();
        }
      });

      // Play for a short duration
      for (let i = 0; i < 10; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      // Position should still be within bounds
      expect(result.current[0].position).toBeLessThanOrEqual(mockOptions.duration);
    });

    it('handles rapid play/pause toggles', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      // Perform 1000 rapid play/pause toggles
      for (let i = 0; i < 1000; i++) {
        act(() => {
          actions.togglePlayPause();
        });

        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      // State should be consistent
      expect(typeof result.current[0].speed).toBe('number');
      expect(result.current[0].speed).toBeGreaterThanOrEqual(-4);
      expect(result.current[0].speed).toBeLessThanOrEqual(4);
    });
  });
});
