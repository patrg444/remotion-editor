import { renderHook, act } from '@testing-library/react-hooks';
import { useCompositing } from '../useCompositing';
import { useKeyframes } from '../useKeyframes';
import { useEditHistory } from '../useEditHistory';
import { CompositeLayer } from '../../types/compositing';

// Mock dependencies
jest.mock('../useKeyframes');
jest.mock('../useEditHistory');

// Helper to create a dummy layer for initialization
const createDummyLayer = (): CompositeLayer => ({
  id: '',
  trackId: '',
  clipId: '',
  parameters: {
    opacity: 1,
    blendMode: 'normal',
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    effects: []
  },
  keyframeTracks: {},
  renderOrder: 0,
  isEnabled: true
});

describe('useCompositing - Layer Management', () => {
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

    // Reset Date.now to ensure consistent IDs
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('preserves layer parameters when updating existing layer', () => {
    const { result } = renderHook(() => useCompositing());

    // Create initial layer
    let initialLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track1', 'clip1');
      if (!layer) throw new Error('Failed to create initial layer');
      initialLayer = layer;
    });

    // Update layer parameters
    act(() => {
      result.current.updateLayer(initialLayer.id, { opacity: 0.8 });
    });

    // Update layer with new group
    let updatedLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track1', 'clip1', 'group1');
      if (!layer) throw new Error('Failed to update layer');
      updatedLayer = layer;
    });

    expect(updatedLayer.id).toBe(initialLayer.id);
    expect(updatedLayer.parameters.opacity).toBe(0.8);

    // Verify layer state
    const finalLayer = result.current.getLayer(initialLayer.id);
    expect(finalLayer).toBeDefined();
    expect(finalLayer!.id).toBe(initialLayer.id);
    expect(finalLayer!.parameters.opacity).toBe(0.8);
    expect(finalLayer!.groupId).toBe('group1');
  });

  it('preserves keyframe tracks when updating existing layer', () => {
    const { result } = renderHook(() => useCompositing());

    // Create initial layer
    let initialLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track1', 'clip1');
      if (!layer) throw new Error('Failed to create initial layer');
      initialLayer = layer;
    });

    // Add keyframe
    act(() => {
      result.current.updateLayer(initialLayer.id, { opacity: 0.8 }, 1000);
    });

    // Update layer with new group
    let updatedLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track1', 'clip1', 'group1');
      if (!layer) throw new Error('Failed to update layer');
      updatedLayer = layer;
    });

    expect(updatedLayer.keyframeTracks).toEqual(initialLayer.keyframeTracks);

    // Verify keyframes are preserved
    const finalLayer = result.current.getLayer(initialLayer.id);
    expect(finalLayer).toBeDefined();
    expect(finalLayer!.keyframeTracks).toEqual(initialLayer.keyframeTracks);
  });

  it('creates new layer when trackId or clipId changes', () => {
    const { result } = renderHook(() => useCompositing());

    // Create initial layer
    let initialLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track1', 'clip1');
      if (!layer) throw new Error('Failed to create initial layer');
      initialLayer = layer;
    });

    // Update layer parameters
    act(() => {
      result.current.updateLayer(initialLayer.id, { opacity: 0.8 });
    });

    // Create layer with different trackId
    let differentTrackLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track2', 'clip1');
      if (!layer) throw new Error('Failed to create layer with different track');
      differentTrackLayer = layer;
    });

    expect(differentTrackLayer.id).not.toBe(initialLayer.id);

    // Create layer with different clipId
    let differentClipLayer: CompositeLayer = createDummyLayer();
    act(() => {
      const layer = result.current.addLayer('track1', 'clip2');
      if (!layer) throw new Error('Failed to create layer with different clip');
      differentClipLayer = layer;
    });

    expect(differentClipLayer.id).not.toBe(initialLayer.id);

    // Verify all layers exist
    expect(result.current.layers).toHaveLength(3);
  });
});
