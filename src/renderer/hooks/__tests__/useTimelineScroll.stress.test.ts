import { renderHook } from '@testing-library/react-hooks';
import { useTimelineScroll } from '../useTimelineScroll';

describe('useTimelineScroll Stress Tests', () => {
  describe('Performance', () => {
    it('handles rapid scroll events', () => {
      const { result } = renderHook(() => useTimelineScroll());
      const numEvents = 1000;
      const startTime = Date.now();

      // Simulate rapid scroll events
      for (let i = 0; i < numEvents; i++) {
        const scrollLeft = Math.random() * 9000; // Random position within scrollWidth
        const mockEvent = {
          target: {
            scrollLeft
          }
        } as unknown as React.UIEvent<HTMLDivElement>;

        result.current.handleScroll(mockEvent);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const eventsPerSecond = numEvents / (duration / 1000);

      // Should handle at least 1,000 scroll events per second
      expect(eventsPerSecond).toBeGreaterThan(1000);
      expect(result.current.scrollPosition).toBeGreaterThanOrEqual(0);
    });

    it('maintains scroll position accuracy during rapid updates', () => {
      const { result } = renderHook(() => useTimelineScroll());
      const numEvents = 1000;
      const positions: number[] = [];

      // Generate and store expected positions
      for (let i = 0; i < numEvents; i++) {
        const scrollLeft = i * 10; // Increment by 10px each time
        positions.push(scrollLeft);

        const mockEvent = {
          target: {
            scrollLeft
          }
        } as unknown as React.UIEvent<HTMLDivElement>;

        result.current.handleScroll(mockEvent);
      }

      // Verify final position matches last update
      expect(result.current.scrollPosition).toBe(positions[positions.length - 1]);
    });

    it('handles negative scroll positions', () => {
      const { result } = renderHook(() => useTimelineScroll());
      const numEvents = 1000;

      // Simulate scroll events with negative positions
      for (let i = 0; i < numEvents; i++) {
        const scrollLeft = -Math.random() * 1000; // Random negative position
        const mockEvent = {
          target: {
            scrollLeft
          }
        } as unknown as React.UIEvent<HTMLDivElement>;

        result.current.handleScroll(mockEvent);
      }

      // Should clamp to 0
      expect(result.current.scrollPosition).toBe(0);
    });
  });

  describe('Memory Management', () => {
    it('handles rapid mount/unmount cycles', () => {
      const cycles = 1000;
      const startTime = Date.now();

      // Rapidly mount and unmount the hook
      for (let i = 0; i < cycles; i++) {
        const { unmount } = renderHook(() => useTimelineScroll());
        unmount();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const cyclesPerSecond = cycles / (duration / 1000);

      // Should handle at least 100 mount/unmount cycles per second
      expect(cyclesPerSecond).toBeGreaterThan(100);
    });

    it('maintains consistent memory usage during rapid updates', () => {
      const { result } = renderHook(() => useTimelineScroll());
      const numEvents = 10000;

      // Record initial heap usage
      const initialHeap = process.memoryUsage().heapUsed;

      // Simulate many scroll events
      for (let i = 0; i < numEvents; i++) {
        const mockEvent = {
          target: {
            scrollLeft: i
          }
        } as unknown as React.UIEvent<HTMLDivElement>;

        result.current.handleScroll(mockEvent);
      }

      // Record final heap usage
      const finalHeap = process.memoryUsage().heapUsed;
      const heapGrowth = finalHeap - initialHeap;

      // Heap growth should be minimal (less than 1MB)
      expect(heapGrowth).toBeLessThan(1024 * 1024);
    });
  });

  describe('Edge Cases', () => {
    it('handles extremely large scroll positions', () => {
      const { result } = renderHook(() => useTimelineScroll());

      const mockEvent = {
        target: {
          scrollLeft: Number.MAX_SAFE_INTEGER
        }
      } as unknown as React.UIEvent<HTMLDivElement>;

      result.current.handleScroll(mockEvent);

      // Should handle large numbers without overflow
      expect(result.current.scrollPosition).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('handles rapid identical scroll positions', () => {
      const { result } = renderHook(() => useTimelineScroll());
      const numEvents = 1000;
      const position = 500;

      // Simulate many events with the same scroll position
      for (let i = 0; i < numEvents; i++) {
        const mockEvent = {
          target: {
            scrollLeft: position
          }
        } as unknown as React.UIEvent<HTMLDivElement>;

        result.current.handleScroll(mockEvent);
      }

      // Should maintain correct position
      expect(result.current.scrollPosition).toBe(position);
    });
  });
});
