import { renderHook, act } from '@testing-library/react-hooks';
import { useCompositing } from '../useCompositing';
import { useKeyframes } from '../useKeyframes';
import { useEditHistory } from '../useEditHistory';
import { CompositeLayer, TrackGroup } from '../../types/compositing';

// Mock dependencies
jest.mock('../useKeyframes');
jest.mock('../useEditHistory');

describe('useCompositing - Nested Groups', () => {
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

  it('handles nested group parameter inheritance', () => {
    const { result } = renderHook(() => useCompositing());

    // Create layer in track1
    let initialLayer: CompositeLayer;
    act(() => {
      initialLayer = result.current.addLayer('track1', 'clip1');
    });

    // Update layer parameters
    act(() => {
      result.current.updateLayer(initialLayer!.id, { opacity: 0.8, blendMode: 'normal' });
    });

    // Create outer group first (root)
    let outerGroup: TrackGroup;
    act(() => {
      // Increment Date.now to ensure unique ID
      (Date.now as jest.Mock).mockReturnValue(2000);
      outerGroup = result.current.createGroup('Outer Group', ['track1']);
    });

    // Update outer group parameters
    act(() => {
      result.current.updateGroup(outerGroup!.id, { opacity: 0.6, blendMode: 'overlay' });
    });

    // Create inner group second (leaf)
    let innerGroup: TrackGroup;
    act(() => {
      // Increment Date.now to ensure unique ID
      (Date.now as jest.Mock).mockReturnValue(3000);
      innerGroup = result.current.createGroup('Inner Group', ['track1', outerGroup!.id]);
    });

    // Update inner group parameters
    act(() => {
      result.current.updateGroup(innerGroup!.id, { opacity: 0.5, blendMode: 'multiply' });
    });

    // Update layer to use inner group
    act(() => {
      const updatedLayer = result.current.getLayer(initialLayer!.id);
      if (updatedLayer) {
        result.current.addLayer(updatedLayer.trackId, updatedLayer.clipId, innerGroup!.id);
      }
    });

    // Get the layer's effective parameters
    const finalLayer = result.current.getLayer(initialLayer!.id);
    if (!finalLayer) {
      throw new Error('Layer not found after update');
    }
    const effectiveParams = result.current.getEffectiveParameters(finalLayer);

    // Log the current state for debugging
    console.log('Layer:', finalLayer);
    console.log('Groups:', result.current.groups);
    console.log('Effective Parameters:', effectiveParams);
    
    // Layer opacity: 0.8
    // Inner group opacity: 0.5
    // Outer group opacity: 0.6
    // Final opacity: 0.8 * 0.5 * 0.6 = 0.24
    expect(effectiveParams.opacity).toBeCloseTo(0.24);
    
    // Blend mode should be from outer group since it's the root
    expect(effectiveParams.blendMode).toBe('overlay');
  });

  it('handles group parameter inheritance with shared track', () => {
    const { result } = renderHook(() => useCompositing());

    // Create layer in track1
    let initialLayer: CompositeLayer;
    act(() => {
      initialLayer = result.current.addLayer('track1', 'clip1');
    });

    // Update layer parameters
    act(() => {
      result.current.updateLayer(initialLayer!.id, { opacity: 0.8, blendMode: 'normal' });
    });

    // Create outer group first (root)
    let outerGroup: TrackGroup;
    act(() => {
      // Increment Date.now to ensure unique ID
      (Date.now as jest.Mock).mockReturnValue(2000);
      outerGroup = result.current.createGroup('Outer Group', ['track1']);
    });

    // Update outer group parameters
    act(() => {
      result.current.updateGroup(outerGroup!.id, { opacity: 0.6, blendMode: 'overlay' });
    });

    // Create inner group second (leaf)
    let innerGroup: TrackGroup;
    act(() => {
      // Increment Date.now to ensure unique ID
      (Date.now as jest.Mock).mockReturnValue(3000);
      innerGroup = result.current.createGroup('Inner Group', ['track1', outerGroup!.id]);
    });

    // Update inner group parameters
    act(() => {
      result.current.updateGroup(innerGroup!.id, { opacity: 0.5, blendMode: 'multiply' });
    });

    // Update layer to use inner group
    act(() => {
      const updatedLayer = result.current.getLayer(initialLayer!.id);
      if (updatedLayer) {
        result.current.addLayer(updatedLayer.trackId, updatedLayer.clipId, innerGroup!.id);
      }
    });

    // Get the layer's effective parameters
    const finalLayer = result.current.getLayer(initialLayer!.id);
    if (!finalLayer) {
      throw new Error('Layer not found after update');
    }
    const effectiveParams = result.current.getEffectiveParameters(finalLayer);

    // Log the current state for debugging
    console.log('Layer:', finalLayer);
    console.log('Groups:', result.current.groups);
    console.log('Effective Parameters:', effectiveParams);
    
    // Layer opacity: 0.8
    // Inner group opacity: 0.5
    // Outer group opacity: 0.6
    // Final opacity: 0.8 * 0.5 * 0.6 = 0.24
    expect(effectiveParams.opacity).toBeCloseTo(0.24);
    
    // Blend mode should be from outer group since it's the root
    expect(effectiveParams.blendMode).toBe('overlay');
  });
});
