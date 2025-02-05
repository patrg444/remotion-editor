import { renderHook, act } from '@testing-library/react-hooks';
import { useGPU, __updateStats, __clearCallbacks } from '../__mocks__/useGPU';
import { GPUStats } from '../../types/api';
import type { RenderHookResult } from '@testing-library/react-hooks';

describe('useGPU Stress Tests', () => {
  const mockOnStatsUpdate = jest.fn();

  beforeEach(() => {
    mockOnStatsUpdate.mockClear();
    __clearCallbacks();
  });

  describe('Performance', () => {
    it('handles rapid stats updates', () => {
      const { result } = renderHook(() => useGPU(mockOnStatsUpdate));
      const numUpdates = 1000;
      const startTime = Date.now();

      // Simulate rapid GPU stats updates
      act(() => {
        for (let i = 0; i < numUpdates; i++) {
          __updateStats({
            memoryUsed: Math.random() * 8192, // 0-8GB
            memoryTotal: 8192, // 8GB
            utilization: Math.random() * 100, // 0-100%
            temperature: 50 + Math.random() * 30 // 50-80°C
          });
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const updatesPerSecond = numUpdates / (duration / 1000);

      // Should handle at least 1,000 updates per second
      expect(updatesPerSecond).toBeGreaterThan(1000);
      expect(mockOnStatsUpdate).toHaveBeenCalledTimes(numUpdates);
    });

    it('maintains performance with multiple subscribers', () => {
      const numSubscribers = 100;
      const numUpdates = 100;
      const mockCallbacks = Array.from({ length: numSubscribers }, () => jest.fn());
      const hooks: RenderHookResult<unknown, GPUStats>[] = mockCallbacks.map(callback => 
        renderHook(() => useGPU(callback))
      );

      const startTime = Date.now();

      // Simulate updates with many subscribers
      act(() => {
        for (let i = 0; i < numUpdates; i++) {
          __updateStats({
            memoryUsed: Math.random() * 8192,
            memoryTotal: 8192,
            utilization: Math.random() * 100,
            temperature: 50 + Math.random() * 30
          });
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const updatesPerSecond = (numSubscribers * numUpdates) / (duration / 1000);

      // Should handle at least 10,000 callback executions per second
      expect(updatesPerSecond).toBeGreaterThan(10000);

      // Verify all callbacks were called
      mockCallbacks.forEach(callback => {
        expect(callback).toHaveBeenCalledTimes(numUpdates);
      });

      // Cleanup
      hooks.forEach(hook => hook.unmount());
    });
  });

  describe('Memory Management', () => {
    it('handles rapid mount/unmount cycles', () => {
      const cycles = 1000;
      const startTime = Date.now();

      // Rapidly mount and unmount hooks
      for (let i = 0; i < cycles; i++) {
        const { unmount } = renderHook(() => useGPU(mockOnStatsUpdate));
        unmount();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const cyclesPerSecond = cycles / (duration / 1000);

      // Should handle at least 100 mount/unmount cycles per second
      expect(cyclesPerSecond).toBeGreaterThan(100);
    });

    it('maintains consistent memory usage during updates', () => {
      const numHooks = 100;
      const hooks: RenderHookResult<unknown, GPUStats>[] = [];
      const initialHeap = process.memoryUsage().heapUsed;

      // Create many hooks
      for (let i = 0; i < numHooks; i++) {
        hooks.push(renderHook(() => useGPU(mockOnStatsUpdate)));
      }

      // Perform many updates
      act(() => {
        for (let i = 0; i < 100; i++) {
          __updateStats({
            memoryUsed: Math.random() * 8192,
            memoryTotal: 8192,
            utilization: Math.random() * 100,
            temperature: 50 + Math.random() * 30
          });
        }
      });

      const finalHeap = process.memoryUsage().heapUsed;
      const heapGrowth = finalHeap - initialHeap;

      // Memory growth should be minimal (less than 1MB)
      expect(heapGrowth).toBeLessThan(1024 * 1024);

      // Cleanup
      hooks.forEach(hook => hook.unmount());
    });

    it('properly cleans up subscribers', () => {
      const { result, unmount } = renderHook(() => useGPU(mockOnStatsUpdate));

      // Unmount and verify no more updates
      unmount();
      mockOnStatsUpdate.mockClear();

      act(() => {
        __updateStats({
          memoryUsed: 1024,
          memoryTotal: 8192,
          utilization: 50,
          temperature: 60
        });
      });

      expect(mockOnStatsUpdate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles extreme GPU stats values', () => {
      const { result } = renderHook(() => useGPU(mockOnStatsUpdate));

      // Test extreme values
      act(() => {
        __updateStats({
          memoryUsed: Number.MAX_SAFE_INTEGER,
          memoryTotal: Number.MAX_SAFE_INTEGER,
          utilization: 100,
          temperature: 100
        });
      });

      expect(result.current.memoryUsed).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.current.memoryTotal).toBe(Number.MAX_SAFE_INTEGER);
      expect(result.current.utilization).toBe(100);
      expect(result.current.temperature).toBe(100);
    });

    it('handles rapid subscription changes', () => {
      const hooks: RenderHookResult<unknown, GPUStats>[] = [];
      const numCycles = 100;

      // Rapidly create and destroy subscriptions while updating
      for (let i = 0; i < numCycles; i++) {
        // Add new subscriber
        hooks.push(renderHook(() => useGPU(mockOnStatsUpdate)));

        // Update stats
        act(() => {
          __updateStats({
            memoryUsed: Math.random() * 8192,
            memoryTotal: 8192,
            utilization: Math.random() * 100,
            temperature: 60
          });
        });

        // Remove random subscriber
        if (hooks.length > 1) {
          const index = Math.floor(Math.random() * hooks.length);
          hooks[index].unmount();
          hooks.splice(index, 1);
        }
      }

      // Cleanup remaining hooks
      hooks.forEach(hook => hook.unmount());
    });
  });
});
