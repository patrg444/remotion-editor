import { renderHook, act } from '@testing-library/react-hooks';
import { useCompositing } from '../useCompositing';
import { useKeyframes } from '../useKeyframes';
import { useEditHistory } from '../useEditHistory';
import { InterpolationType } from '../../types/keyframe';
import { CompositeLayer, TrackGroup } from '../../types/compositing';

// Mock dependencies
jest.mock('../useKeyframes');
jest.mock('../useEditHistory');

describe('useCompositing', () => {
  // Mock implementations
  const mockAddKeyframe = jest.fn();
  const mockUpdateKeyframe = jest.fn();
  const mockRemoveKeyframe = jest.fn();
  const mockAddOperation = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useKeyframes as jest.Mock).mockReturnValue({
      addKeyframe: mockAddKeyframe,
      updateKeyframe: mockUpdateKeyframe,
      removeKeyframe: mockRemoveKeyframe
    });
    (useEditHistory as jest.Mock).mockReturnValue({
      addOperation: mockAddOperation
    });
  });

  describe('Layer Management', () => {
    it('adds a new layer', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
      });

      expect(layer).toBeDefined();
      expect(layer?.trackId).toBe('track1');
      expect(layer?.clipId).toBe('clip1');
      expect(result.current.layers).toHaveLength(1);
      expect(result.current.selectedLayerId).toBe(layer?.id);
      expect(mockAddOperation).toHaveBeenCalled();
    });

    it('removes a layer', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
      });

      act(() => {
        result.current.removeLayer(layer!.id);
      });

      expect(result.current.layers).toHaveLength(0);
      expect(result.current.selectedLayerId).toBeNull();
      expect(mockAddOperation).toHaveBeenCalledTimes(2);
    });

    it('updates layer parameters', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
      });

      act(() => {
        result.current.updateLayer(layer!.id, { opacity: 0.5 });
      });

      const updatedLayer = result.current.getLayer(layer!.id);
      expect(updatedLayer?.parameters.opacity).toBe(0.5);
      expect(mockAddOperation).toHaveBeenCalledTimes(2);
    });

    it('creates keyframes when updating with time', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
      });

      act(() => {
        result.current.updateLayer(layer!.id, { opacity: 0.5 }, 1000);
      });

      expect(mockAddKeyframe).toHaveBeenCalledWith(
        `${layer!.id}-opacity`,
        1000,
        0.5,
        InterpolationType.Linear
      );
    });

    it('toggles layer visibility', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
      });

      act(() => {
        result.current.toggleLayer(layer!.id);
      });

      const updatedLayer = result.current.getLayer(layer!.id);
      expect(updatedLayer?.isEnabled).toBe(false);
    });

    it('reorders layers', () => {
      const { result } = renderHook(() => useCompositing());

      let layer1: CompositeLayer | undefined;
      let layer2: CompositeLayer | undefined;
      
      act(() => {
        layer1 = result.current.addLayer('track1', 'clip1');
        layer2 = result.current.addLayer('track1', 'clip2');
      });

      act(() => {
        result.current.reorderLayer(layer1!.id, 1);
      });

      const layers = result.current.layers;
      expect(layers[0].id).toBe(layer2!.id);
      expect(layers[1].id).toBe(layer1!.id);
    });
  });

  describe('Group Management', () => {
    it('creates a new group', () => {
      const { result } = renderHook(() => useCompositing());

      let group: TrackGroup | undefined;
      act(() => {
        group = result.current.createGroup('Group 1', ['track1', 'track2']);
      });

      expect(group).toBeDefined();
      expect(group?.name).toBe('Group 1');
      expect(group?.trackIds).toEqual(['track1', 'track2']);
      expect(result.current.groups).toHaveLength(1);
      expect(result.current.selectedGroupId).toBe(group?.id);
    });

    it('updates group parameters', () => {
      const { result } = renderHook(() => useCompositing());

      let group: TrackGroup | undefined;
      act(() => {
        group = result.current.createGroup('Group 1', ['track1']);
      });

      act(() => {
        result.current.updateGroup(group!.id, { opacity: 0.5 });
      });

      const updatedGroup = result.current.getGroup(group!.id);
      expect(updatedGroup?.opacity).toBe(0.5);
    });

    it('removes a group', () => {
      const { result } = renderHook(() => useCompositing());

      let group: TrackGroup | undefined;
      act(() => {
        group = result.current.createGroup('Group 1', ['track1']);
      });

      act(() => {
        result.current.removeGroup(group!.id);
      });

      expect(result.current.groups).toHaveLength(0);
      expect(result.current.selectedGroupId).toBeNull();
    });
  });

  describe('Layer-Group Relationships', () => {
    it('assigns layers to groups on group creation', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      let group: TrackGroup | undefined;

      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
      });

      act(() => {
        group = result.current.createGroup('Group 1', ['track1']);
      });

      const updatedLayer = result.current.getLayer(layer!.id);
      expect(updatedLayer?.groupId).toBe(group?.id);
    });

    it('removes group references when group is deleted', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      let group: TrackGroup | undefined;

      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
        group = result.current.createGroup('Group 1', ['track1']);
      });

      act(() => {
        result.current.removeGroup(group!.id);
      });

      const updatedLayer = result.current.getLayer(layer!.id);
      expect(updatedLayer?.groupId).toBeUndefined();
    });

    it('calculates effective parameters through group hierarchy', () => {
      const { result } = renderHook(() => useCompositing());

      let layer: CompositeLayer | undefined;
      let group: TrackGroup | undefined;

      act(() => {
        layer = result.current.addLayer('track1', 'clip1');
        result.current.updateLayer(layer!.id, { opacity: 0.8 });
      });

      act(() => {
        group = result.current.createGroup('Group 1', ['track1']);
        result.current.updateGroup(group!.id, { opacity: 0.5 });
      });

      const updatedLayer = result.current.getLayer(layer!.id);
      const effectiveParams = result.current.getEffectiveParameters(updatedLayer!);
      expect(effectiveParams.opacity).toBeCloseTo(0.4); // 0.8 * 0.5
    });
  });

  describe('Utility Functions', () => {
    it('gets layers for a track', () => {
      const { result } = renderHook(() => useCompositing());

      act(() => {
        result.current.addLayer('track1', 'clip1');
        result.current.addLayer('track1', 'clip2');
        result.current.addLayer('track2', 'clip3');
      });

      const track1Layers = result.current.getLayersForTrack('track1');
      expect(track1Layers).toHaveLength(2);
    });

    it('gets layers for a group', () => {
      const { result } = renderHook(() => useCompositing());

      let group: TrackGroup | undefined;
      act(() => {
        result.current.addLayer('track1', 'clip1');
        result.current.addLayer('track2', 'clip2');
        group = result.current.createGroup('Group 1', ['track1']);
      });

      const groupLayers = result.current.getLayersForGroup(group!.id);
      expect(groupLayers).toHaveLength(1);
    });
  });
});
