import { renderHook, act } from '@testing-library/react-hooks';
import { usePlayhead } from '../usePlayhead';
import { PlayheadOptions } from '../../types/playhead';

describe('usePlayhead', () => {
  // Mock options
  const mockOptions: PlayheadOptions = {
    duration: 10,
    frameRate: 30,
    zoom: 1,
    onPositionChange: jest.fn(),
    onSpeedChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initial State', () => {
    it('initializes with default state', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [state] = result.current;

      expect(state).toEqual({
        position: 0,
        speed: 0,
        isDragging: false
      });
    });
  });

  describe('Position Control', () => {
    it('clamps position within duration bounds', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.setPosition(-5); // Try to set below 0
      });
      expect(result.current[0].position).toBe(0);

      act(() => {
        actions.setPosition(15); // Try to set above duration
      });
      expect(result.current[0].position).toBe(10);

      act(() => {
        actions.setPosition(5); // Set within bounds
      });
      expect(result.current[0].position).toBe(5);
    });

    it('calls onPositionChange when position updates', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.setPosition(5);
      });

      expect(mockOptions.onPositionChange).toHaveBeenCalledWith(5);
    });
  });

  describe('Playback Control', () => {
    it('toggles play/pause state', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.togglePlayPause();
      });
      expect(result.current[0].speed).toBe(1);

      act(() => {
        actions.togglePlayPause();
      });
      expect(result.current[0].speed).toBe(0);
    });

    it('controls playback speed', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.playForward();
      });
      expect(result.current[0].speed).toBe(1);

      act(() => {
        actions.playForward(); // Double speed
      });
      expect(result.current[0].speed).toBe(2);

      act(() => {
        actions.playBackward();
      });
      expect(result.current[0].speed).toBe(-1);

      act(() => {
        actions.playBackward(); // Double speed backward
      });
      expect(result.current[0].speed).toBe(-2);

      act(() => {
        actions.pause();
      });
      expect(result.current[0].speed).toBe(0);
    });

    it('seeks by frames', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;
      const frameStep = 1 / mockOptions.frameRate;

      act(() => {
        actions.seekToNextFrame();
      });
      expect(result.current[0].position).toBe(frameStep);

      act(() => {
        actions.seekToPrevFrame();
      });
      expect(result.current[0].position).toBe(0);
    });
  });

  describe('Dragging', () => {
    it('handles drag state', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.startDragging();
      });
      expect(result.current[0].isDragging).toBe(true);
      expect(result.current[0].speed).toBe(0); // Should pause while dragging

      act(() => {
        actions.stopDragging();
      });
      expect(result.current[0].isDragging).toBe(false);
    });
  });

  describe('Keyboard Controls', () => {
    it('handles keyboard shortcuts', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));

      // Space to toggle play/pause
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
      });
      expect(result.current[0].speed).toBe(1);

      // K to pause
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }));
      });
      expect(result.current[0].speed).toBe(0);

      // L to play forward
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'l' }));
      });
      expect(result.current[0].speed).toBe(1);

      // J to play backward
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'j' }));
      });
      expect(result.current[0].speed).toBe(-1);

      // Arrow keys for frame stepping
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      });
      expect(mockOptions.onPositionChange).toHaveBeenCalledWith(1/30); // One frame forward

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
      });
      expect(mockOptions.onPositionChange).toHaveBeenCalledWith(0); // One frame back
    });

    it('handles shift + arrow keys for larger jumps', () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true }));
      });
      expect(mockOptions.onPositionChange).toHaveBeenCalledWith(1); // One second forward

      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', shiftKey: true }));
      });
      expect(mockOptions.onPositionChange).toHaveBeenCalledWith(0); // One second back
    });
  });

  describe('Animation Frame Handling', () => {
    beforeEach(() => {
      let frameId = 0;
      let timestamp = 0;
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => {
        frameId++;
        setTimeout(() => cb(timestamp += 16.67), 0);
        return frameId;
      });
    });

    afterEach(() => {
      (window.requestAnimationFrame as jest.Mock).mockRestore();
    });

    it('updates position during playback', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.playForward();
      });

      // Simulate 1 second of playback (approximately 60 frames)
      for (let i = 0; i < 60; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      expect(result.current[0].position).toBeGreaterThan(0.8);
      expect(result.current[0].position).toBeLessThan(1.2);
    });

    it('stops animation when paused', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.playForward();
      });

      // Play for ~0.5 seconds
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      act(() => {
        actions.pause();
      });

      const positionAfterPause = result.current[0].position;

      // Try to advance time further
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      // Position should not have changed after pause
      expect(result.current[0].position).toBeCloseTo(positionAfterPause, 1);
      expect(positionAfterPause).toBeGreaterThan(0.4);
      expect(positionAfterPause).toBeLessThan(0.6);
    });

    it('stops animation when dragging', async () => {
      const { result } = renderHook(() => usePlayhead(mockOptions));
      const [, actions] = result.current;

      act(() => {
        actions.playForward();
      });

      // Play for ~0.5 seconds
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      const positionBeforeDrag = result.current[0].position;

      act(() => {
        actions.startDragging();
      });

      // Try to advance time further
      for (let i = 0; i < 30; i++) {
        await act(async () => {
          jest.advanceTimersByTime(16.67);
        });
      }

      // Position should not have changed while dragging
      expect(result.current[0].position).toBeCloseTo(positionBeforeDrag, 1);
      expect(positionBeforeDrag).toBeGreaterThan(0.4);
      expect(positionBeforeDrag).toBeLessThan(0.6);
    });
  });
});
