import { renderHook, act } from '@testing-library/react-hooks';
import { useMediaDuration } from '../useMediaDuration';
import type { RenderHookResult } from '@testing-library/react-hooks';

interface UseMediaDurationResult {
  duration: number;
  frameRate: number;
  isLoading: boolean;
  error: string | null;
}

describe('useMediaDuration Stress Tests', () => {
  // Mock video element and its methods
  let mockVideo: any;
  let loadedMetadataCallback: Function;
  let errorCallback: Function;

  beforeEach(() => {
    // Reset callbacks
    loadedMetadataCallback = () => {};
    errorCallback = () => {};

    // Create mock video element
    mockVideo = {
      src: '',
      duration: 0,
      addEventListener: jest.fn((event, callback) => {
        if (event === 'loadedmetadata') loadedMetadataCallback = callback;
        if (event === 'error') errorCallback = callback;
      }),
      removeEventListener: jest.fn(),
      getVideoPlaybackQuality: jest.fn(() => ({
        totalVideoFrames: 1800 // 60fps for 30 seconds
      }))
    };

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'video') return mockVideo;
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Performance', () => {
    it('handles concurrent metadata loading', async () => {
      const numVideos = 100;
      const startTime = Date.now();
      const hooks: RenderHookResult<unknown, UseMediaDurationResult>[] = [];

      // Load many videos concurrently
      for (let i = 0; i < numVideos; i++) {
        const hook = renderHook(() => useMediaDuration(`video${i}.mp4`));
        hooks.push(hook);

        // Simulate successful metadata load
        await act(async () => {
          mockVideo.duration = 30; // 30 seconds
          loadedMetadataCallback();
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const videosPerSecond = numVideos / (duration / 1000);

      // Should handle at least 100 videos per second
      expect(videosPerSecond).toBeGreaterThan(100);

      // Verify all videos loaded correctly
      hooks.forEach(hook => {
        expect(hook.result.current.duration).toBe(30);
        expect(hook.result.current.frameRate).toBe(60);
        expect(hook.result.current.isLoading).toBe(false);
        expect(hook.result.current.error).toBeNull();
      });
    });

    it('maintains performance with large video files', async () => {
      const { result } = renderHook(() => useMediaDuration('large-video.mp4'));

      // Simulate metadata load for a large video (4K, high frame rate)
      mockVideo.duration = 7200; // 2 hours
      mockVideo.getVideoPlaybackQuality = jest.fn(() => ({
        totalVideoFrames: 7200 * 120 // 120fps for 2 hours
      }));

      await act(async () => {
        loadedMetadataCallback();
      });

      expect(result.current.duration).toBe(7200);
      expect(result.current.frameRate).toBe(120);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles rapid path changes', async () => {
      const { rerender } = renderHook(
        (path: string | null) => useMediaDuration(path),
        { initialProps: 'video1.mp4' }
      );

      const numChanges = 1000;
      const startTime = Date.now();

      // Rapidly change video paths
      for (let i = 0; i < numChanges; i++) {
        rerender(`video${i}.mp4`);
        await act(async () => {
          mockVideo.duration = 30;
          loadedMetadataCallback();
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const changesPerSecond = numChanges / (duration / 1000);

      // Should handle at least 100 path changes per second
      expect(changesPerSecond).toBeGreaterThan(100);
    });
  });

  describe('Memory Management', () => {
    it('handles rapid mount/unmount cycles', () => {
      const cycles = 1000;
      const startTime = Date.now();

      // Rapidly mount and unmount hooks
      for (let i = 0; i < cycles; i++) {
        const { unmount } = renderHook(() => useMediaDuration('video.mp4'));
        unmount();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const cyclesPerSecond = cycles / (duration / 1000);

      // Should handle at least 100 mount/unmount cycles per second
      expect(cyclesPerSecond).toBeGreaterThan(100);
      expect(mockVideo.removeEventListener).toHaveBeenCalled();
    });

    it('maintains consistent memory usage during concurrent loads', async () => {
      const numVideos = 100;
      const hooks: RenderHookResult<unknown, UseMediaDurationResult>[] = [];
      const initialHeap = process.memoryUsage().heapUsed;

      // Load many videos concurrently
      for (let i = 0; i < numVideos; i++) {
        hooks.push(renderHook(() => useMediaDuration(`video${i}.mp4`)));
        await act(async () => {
          mockVideo.duration = 30;
          loadedMetadataCallback();
        });
      }

      const finalHeap = process.memoryUsage().heapUsed;
      const heapGrowth = finalHeap - initialHeap;

      // Memory growth should be minimal (less than 1MB)
      expect(heapGrowth).toBeLessThan(1024 * 1024);

      // Cleanup
      hooks.forEach(hook => hook.unmount());
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely long videos', async () => {
      const { result } = renderHook(() => useMediaDuration('long-video.mp4'));

      // Simulate metadata load for an extremely long video
      mockVideo.duration = 86400; // 24 hours
      mockVideo.getVideoPlaybackQuality = jest.fn(() => ({
        totalVideoFrames: 86400 * 60 // 60fps for 24 hours
      }));

      await act(async () => {
        loadedMetadataCallback();
      });

      expect(result.current.duration).toBe(86400);
      expect(result.current.frameRate).toBe(60);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles concurrent error cases', async () => {
      const numVideos = 100;
      const hooks: RenderHookResult<unknown, UseMediaDurationResult>[] = [];
      const startTime = Date.now();

      // Load many videos that will fail
      for (let i = 0; i < numVideos; i++) {
        hooks.push(renderHook(() => useMediaDuration(`invalid${i}.mp4`)));
        await act(async () => {
          errorCallback();
        });
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const errorsPerSecond = numVideos / (duration / 1000);

      // Should handle at least 100 errors per second
      expect(errorsPerSecond).toBeGreaterThan(100);

      // Verify all errors handled correctly
      hooks.forEach(hook => {
        expect(hook.result.current.error).toBe('Failed to load video metadata');
        expect(hook.result.current.isLoading).toBe(false);
        expect(hook.result.current.duration).toBe(0);
      });

      // Cleanup
      hooks.forEach(hook => hook.unmount());
    });
  });
});
