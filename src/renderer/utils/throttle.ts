/**
 * Throttle constants in milliseconds
 */
export const THROTTLE = {
  SCROLL: 16,    // ~60fps
  RESIZE: 100,   // Resize operations
  SAVE: 1000,    // Auto-save operations
  RENDER: 16,    // Canvas/WebGL renders
  PLAYBACK: 16,  // Video/audio playback updates
  DRAG: 16       // Drag operations
} as const;

/**
 * Creates a throttled function that only invokes func at most once per wait period
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (!previous) {
      previous = now;
    }

    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};
