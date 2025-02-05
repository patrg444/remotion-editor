import { renderHook, act } from '@testing-library/react-hooks';
import { usePerformanceMonitor } from '../usePerformanceMonitor';

describe('usePerformanceMonitor', () => {
  // Mock performance.now
  let nowValue = 0;
  const mockNow = jest.fn(() => nowValue);
  const originalPerformanceNow = performance.now;

  // Mock requestAnimationFrame
  let rafCallback: FrameRequestCallback | null = null;
  const mockRaf = jest.fn((callback: FrameRequestCallback) => {
    rafCallback = callback;
    return 1;
  });
  const originalRaf = window.requestAnimationFrame;

  beforeAll(() => {
    performance.now = mockNow;
    window.requestAnimationFrame = mockRaf;
  });

  afterAll(() => {
    performance.now = originalPerformanceNow;
    window.requestAnimationFrame = originalRaf;
  });

  beforeEach(() => {
    nowValue = 0;
    rafCallback = null;
    jest.clearAllMocks();
  });

  describe('Frame Timing', () => {
    it('calculates FPS correctly', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      // Simulate 60 frames over 1 second
      for (let i = 0; i < 60; i++) {
        nowValue += 1000 / 60; // ~16.67ms per frame
        act(() => {
          rafCallback?.(nowValue);
        });
      }

      expect(result.current.metrics.fps).toBeCloseTo(60);
      expect(result.current.metrics.frameTime).toBeCloseTo(16.67);
    });

    it('handles low frame rates', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      // Simulate 20 frames over 1 second
      for (let i = 0; i < 20; i++) {
        nowValue += 1000 / 20; // 50ms per frame
        act(() => {
          rafCallback?.(nowValue);
        });
      }

      expect(result.current.metrics.fps).toBeCloseTo(20);
      expect(result.current.metrics.frameTime).toBeCloseTo(50);
      expect(result.current.getWarnings()).toContain('Low framerate detected');
    });
  });

  describe('Metrics Updates', () => {
    it('updates metrics correctly', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      act(() => {
        result.current.updateMetrics({
          memoryUsage: 300,
          textureCount: 50,
          activeClips: 10
        });
      });

      expect(result.current.metrics.memoryUsage).toBe(300);
      expect(result.current.metrics.textureCount).toBe(50);
      expect(result.current.metrics.activeClips).toBe(10);
    });

    it('ignores updates when disabled', () => {
      const { result } = renderHook(() => usePerformanceMonitor(false));

      act(() => {
        result.current.updateMetrics({
          memoryUsage: 300,
          textureCount: 50
        });
      });

      expect(result.current.metrics.memoryUsage).toBe(0);
      expect(result.current.metrics.textureCount).toBe(0);
    });
  });

  describe('Render Timing', () => {
    it('measures render time', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      act(() => {
        const endRender = result.current.beginRender();
        nowValue += 10; // 10ms render time
        endRender();
      });

      expect(result.current.metrics.renderTime).toBe(10);
    });

    it('warns about slow renders', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      act(() => {
        const endRender = result.current.beginRender();
        nowValue += 20; // 20ms render time (above 16ms threshold)
        endRender();
      });

      expect(result.current.getWarnings()).toContain('Slow render time');
    });

    it('returns no-op when disabled', () => {
      const { result } = renderHook(() => usePerformanceMonitor(false));

      act(() => {
        const endRender = result.current.beginRender();
        nowValue += 10;
        endRender();
      });

      expect(result.current.metrics.renderTime).toBe(0);
    });
  });

  describe('Performance History', () => {
    it('maintains history of metrics', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      // Simulate multiple frames with different metrics
      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.updateMetrics({
            memoryUsage: 100 * (i + 1),
            textureCount: 10 * (i + 1)
          });
          nowValue += 1000; // Advance 1 second
          rafCallback?.(nowValue);
        });
      }

      const history = result.current.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].metrics.memoryUsage).toBe(100);
      expect(history[1].metrics.memoryUsage).toBe(200);
      expect(history[2].metrics.memoryUsage).toBe(300);
    });

    it('limits history length', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      // Simulate more than HISTORY_LENGTH frames
      for (let i = 0; i < 70; i++) {
        act(() => {
          nowValue += 1000;
          rafCallback?.(nowValue);
        });
      }

      const history = result.current.getHistory();
      expect(history).toHaveLength(60); // HISTORY_LENGTH constant
    });
  });

  describe('Warning Generation', () => {
    it('warns about high memory usage', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      act(() => {
        result.current.updateMetrics({
          memoryUsage: 600 // Above 500MB threshold
        });
      });

      expect(result.current.getWarnings()).toContain('High memory usage');
    });

    it('warns about large texture cache', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      act(() => {
        result.current.updateMetrics({
          textureCount: 150 // Above 100 threshold
        });
      });

      expect(result.current.getWarnings()).toContain('Large texture cache');
    });

    it('returns multiple warnings when appropriate', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      act(() => {
        result.current.updateMetrics({
          memoryUsage: 600,
          textureCount: 150
        });
        const endRender = result.current.beginRender();
        nowValue += 20;
        endRender();
      });

      const warnings = result.current.getWarnings();
      expect(warnings).toContain('High memory usage');
      expect(warnings).toContain('Large texture cache');
      expect(warnings).toContain('Slow render time');
    });
  });

  describe('Reset Functionality', () => {
    it('resets all metrics and history', () => {
      const { result } = renderHook(() => usePerformanceMonitor(true));

      // Set some metrics
      act(() => {
        result.current.updateMetrics({
          memoryUsage: 300,
          textureCount: 50
        });
        nowValue += 1000;
        rafCallback?.(nowValue);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.metrics).toEqual({
        fps: 0,
        frameTime: 0,
        memoryUsage: 0,
        textureCount: 0,
        activeClips: 0,
        renderTime: 0
      });
      expect(result.current.getHistory()).toHaveLength(0);
    });
  });
});
