import { renderHook, act } from '@testing-library/react-hooks';
import { useKeyframes } from '../useKeyframes';
import { InterpolationType } from '../../types/keyframe';

describe('useKeyframes', () => {
  describe('Track Management', () => {
    it('creates a track with default values', () => {
      const { result } = renderHook(() => useKeyframes());

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0, 0, 1, 0.1);
      });

      const track = result.current.getTrack('effect1-opacity');
      expect(track).toBeDefined();
      expect(track?.defaultValue).toBe(1.0);
      expect(track?.min).toBe(0);
      expect(track?.max).toBe(1);
      expect(track?.step).toBe(0.1);
      expect(track?.keyframes).toHaveLength(0);
    });

    it('removes a track', () => {
      const { result } = renderHook(() => useKeyframes());

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
      });

      expect(result.current.getTrack('effect1-opacity')).toBeDefined();

      act(() => {
        result.current.removeTrack('effect1-opacity');
      });

      expect(result.current.getTrack('effect1-opacity')).toBeUndefined();
    });
  });

  describe('Keyframe Operations', () => {
    it('adds keyframes in sorted order', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        // Add keyframes out of order
        result.current.addKeyframe(trackId, 2.0, 0.5);
        result.current.addKeyframe(trackId, 1.0, 0.8);
        result.current.addKeyframe(trackId, 3.0, 0.2);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.keyframes).toHaveLength(3);
      expect(track?.keyframes.map(k => k.time)).toEqual([1.0, 2.0, 3.0]);
    });

    it('updates keyframe values', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        result.current.addKeyframe(trackId, 1.0, 0.5);
      });

      act(() => {
        result.current.updateKeyframe(trackId, 1.0, 0.8);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.keyframes[0].value).toBe(0.8);
    });

    it('removes keyframes', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        result.current.addKeyframe(trackId, 1.0, 0.5);
        result.current.addKeyframe(trackId, 2.0, 0.8);
      });

      act(() => {
        result.current.removeKeyframe(trackId, 1.0);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.keyframes).toHaveLength(1);
      expect(track?.keyframes[0].time).toBe(2.0);
    });
  });

  describe('Value Interpolation', () => {
    it('returns default value when no keyframes exist', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(0)).toBe(1.0);
    });

    it('performs linear interpolation between keyframes', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        result.current.addKeyframe(trackId, 0, 0);
        result.current.addKeyframe(trackId, 2, 1);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(1)).toBe(0.5); // Midpoint
      expect(track?.getValue(0.5)).toBe(0.25); // Quarter point
      expect(track?.getValue(1.5)).toBe(0.75); // Three-quarter point
    });

    it('performs step interpolation', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        result.current.addKeyframe(trackId, 0, 0, InterpolationType.Step);
        result.current.addKeyframe(trackId, 2, 1);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(0.9)).toBe(0); // Before midpoint
      expect(track?.getValue(1.1)).toBe(1); // After midpoint
    });

    it('clamps numeric values to min/max', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0, 0, 1);
        result.current.addKeyframe(trackId, 0, -0.5);
        result.current.addKeyframe(trackId, 1, 1.5);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(0)).toBe(0); // Clamped to min
      expect(track?.getValue(1)).toBe(1); // Clamped to max
    });

    it('handles non-numeric values', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-color';

      act(() => {
        result.current.createTrack('effect1', 'color', 'red');
        result.current.addKeyframe(trackId, 0, 'red');
        result.current.addKeyframe(trackId, 1, 'blue');
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(0.5)).toBe('red'); // Uses previous keyframe for non-numeric values
    });
  });

  describe('Group Management', () => {
    it('creates and removes groups', () => {
      const { result } = renderHook(() => useKeyframes());

      act(() => {
        result.current.addKeyframeGroup('group1', 'Effect 1', [
          { trackId: 'effect1-opacity', effectId: 'effect1', paramId: 'opacity' }
        ]);
      });

      expect(result.current.keyframeState.groups['group1']).toBeDefined();
      expect(result.current.keyframeState.groups['group1'].name).toBe('Effect 1');

      act(() => {
        result.current.removeKeyframeGroup('group1');
      });

      expect(result.current.keyframeState.groups['group1']).toBeUndefined();
    });

    it('toggles group expansion', () => {
      const { result } = renderHook(() => useKeyframes());

      act(() => {
        result.current.addKeyframeGroup('group1', 'Effect 1', [
          { trackId: 'effect1-opacity', effectId: 'effect1', paramId: 'opacity' }
        ]);
      });

      expect(result.current.keyframeState.groups['group1'].isExpanded).toBe(false);

      act(() => {
        result.current.toggleGroupExpansion('group1');
      });

      expect(result.current.keyframeState.groups['group1'].isExpanded).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('handles operations on non-existent tracks', () => {
      const { result } = renderHook(() => useKeyframes());

      // These should not throw errors
      act(() => {
        result.current.addKeyframe('nonexistent', 0, 1);
        result.current.removeKeyframe('nonexistent', 0);
        result.current.updateKeyframe('nonexistent', 0, 1);
      });

      expect(result.current.getTrack('nonexistent')).toBeUndefined();
    });

    it('handles value queries before first keyframe', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        result.current.addKeyframe(trackId, 1, 0.5);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(0)).toBe(0.5); // Should use first keyframe value
    });

    it('handles value queries after last keyframe', () => {
      const { result } = renderHook(() => useKeyframes());
      const trackId = 'effect1-opacity';

      act(() => {
        result.current.createTrack('effect1', 'opacity', 1.0);
        result.current.addKeyframe(trackId, 1, 0.5);
      });

      const track = result.current.getTrack(trackId);
      expect(track?.getValue(2)).toBe(0.5); // Should use last keyframe value
    });
  });
});
