import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { VolumeEnvelope } from '../VolumeEnvelope';
import { useAudioKeyframes } from '../../hooks/useAudioKeyframes';
import { useEditHistory } from '../../hooks/useEditHistory';
import { InterpolationType } from '../../types/keyframe';

// Mock hooks
jest.mock('../../hooks/useAudioKeyframes');
jest.mock('../../hooks/useEditHistory');

describe('VolumeEnvelope', () => {
  const mockAddOperation = jest.fn();
  const mockAddVolumeKeyframe = jest.fn();
  const mockUpdateVolumeKeyframe = jest.fn().mockImplementation((...args) => {
    console.log('mockUpdateVolumeKeyframe called with:', args);
  });
  const mockRemoveVolumeKeyframe = jest.fn();

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock useEditHistory
    (useEditHistory as jest.Mock).mockReturnValue({
      addOperation: mockAddOperation
    });

    // Mock useAudioKeyframes with default empty state
    (useAudioKeyframes as jest.Mock).mockReturnValue({
      addVolumeKeyframe: mockAddVolumeKeyframe,
      updateVolumeKeyframe: mockUpdateVolumeKeyframe,
      removeVolumeKeyframe: mockRemoveVolumeKeyframe,
      volumeKeyframes: [],
      getAutomationCurves: () => ({ volumeCurve: [1, 1, 1] }) // Unity gain
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllTimers();
  });

  it('renders volume envelope with grid lines', () => {
    render(
      <VolumeEnvelope
        clipId="test-clip"
        duration={10}
        zoom={1}
        isSelected={false}
      />
    );

    // Check grid lines are rendered
    const gridLines = document.querySelectorAll('.grid-line');
    expect(gridLines).toHaveLength(3);
  });

  it('adds keyframe on click when selected', async () => {
    render(
      <VolumeEnvelope
        clipId="test-clip"
        duration={10}
        zoom={1}
        isSelected={true}
      />
    );

    const svg = screen.getByRole('presentation');
    act(() => {
      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      jest.runAllTimers();
    });

    expect(mockAddOperation).toHaveBeenCalled();
    expect(mockAddVolumeKeyframe).toHaveBeenCalled();
  });

  it('does not add keyframe when not selected', async () => {
    render(
      <VolumeEnvelope
        clipId="test-clip"
        duration={10}
        zoom={1}
        isSelected={false}
      />
    );

    const svg = screen.getByRole('presentation');
    act(() => {
      fireEvent.mouseDown(svg, { clientX: 50, clientY: 50 });
      jest.runAllTimers();
    });

    expect(mockAddOperation).not.toHaveBeenCalled();
    expect(mockAddVolumeKeyframe).not.toHaveBeenCalled();
  });

  it('shows tooltip while dragging keyframe', async () => {
    (useAudioKeyframes as jest.Mock).mockReturnValue({
      addVolumeKeyframe: mockAddVolumeKeyframe,
      updateVolumeKeyframe: mockUpdateVolumeKeyframe,
      removeVolumeKeyframe: mockRemoveVolumeKeyframe,
      getAutomationCurves: () => ({ volumeCurve: [1, 1, 1] }),
      volumeKeyframes: [
        { time: 5, value: 1, interpolation: { type: InterpolationType.Linear } } // 0 dB keyframe at center
      ]
    });

    render(
      <VolumeEnvelope
        clipId="test-clip"
        duration={10}
        zoom={1}
        isSelected={true}
      />
    );

    const svg = screen.getByRole('presentation');
    act(() => {
      // Click exactly on the keyframe point (5px across)
      fireEvent.mouseDown(svg, { clientX: 5, clientY: 50 });
      jest.runAllTimers();
      fireEvent.mouseMove(svg, { clientX: 5, clientY: 25 });
      jest.runAllTimers();
    });

    // Check tooltip appears with dB value
    const tooltip = screen.getByText(/dB/);
    expect(tooltip).toBeInTheDocument();
  });

  it('updates keyframe position on drag', async () => {
    const duration = 10;
    const zoom = 1;
    const viewBoxWidth = duration * zoom;

    // Mock the initial state with a keyframe at 50% width
    const mockKeyframe = {
      time: 5,
      value: 1,
      interpolation: { type: InterpolationType.Linear }
    };

    // Mock the hook with our keyframe
    (useAudioKeyframes as jest.Mock).mockReturnValue({
      addVolumeKeyframe: mockAddVolumeKeyframe,
      updateVolumeKeyframe: mockUpdateVolumeKeyframe,
      removeVolumeKeyframe: mockRemoveVolumeKeyframe,
      getAutomationCurves: () => ({ volumeCurve: [1, 1, 1] }),
      volumeKeyframes: [mockKeyframe]
    });

    render(
      <VolumeEnvelope
        clipId="test-clip"
        duration={duration}
        zoom={zoom}
        isSelected={true}
      />
    );

    // Mock getBoundingClientRect to match SVG viewBox
    const mockRect = {
      left: 0,
      top: 0,
      width: viewBoxWidth,
      height: 100,
      right: viewBoxWidth,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    };

    // Calculate keyframe position in client coordinates
    const keyframeX = (mockKeyframe.time / duration) * viewBoxWidth;
    const keyframeY = 50; // Center point

    console.log('Starting drag sequence...');
    console.log('SVG dimensions:', mockRect);
    console.log('Initial keyframe position:', { x: keyframeX, y: keyframeY });

    // Simulate drag sequence
    const svg = screen.getByRole('presentation');
    jest.spyOn(svg, 'getBoundingClientRect').mockReturnValue(mockRect);
    
    // Click exactly on the keyframe point
    console.log('Mouse down on keyframe:', { clientX: keyframeX, clientY: keyframeY });
    act(() => {
      fireEvent.mouseDown(svg, { clientX: keyframeX, clientY: keyframeY });
      jest.runAllTimers();
    });

    // Move to new position (60% across, slightly quieter)
    const moveToX = viewBoxWidth * 0.6; // 60% across
    const moveToY = 60; // Slightly lower = slightly quieter
    console.log('Mouse move to:', { clientX: moveToX, clientY: moveToY });
    act(() => {
      fireEvent.mouseMove(svg, { clientX: moveToX, clientY: moveToY });
      jest.runAllTimers();
    });

    console.log('Mouse up');
    act(() => {
      fireEvent.mouseUp(svg, { clientX: moveToX, clientY: moveToY });
      jest.runAllTimers();
    });

    console.log('Mock update calls:', mockUpdateVolumeKeyframe.mock.calls);

    // Verify the keyframe was updated
    expect(mockUpdateVolumeKeyframe).toHaveBeenCalledWith(
      mockKeyframe.time, // Original time
      6, // New time (60% of duration)
      InterpolationType.Linear
    );
    expect(mockAddOperation).toHaveBeenCalled();
  });

  it('removes tooltip when dragging ends', async () => {
    (useAudioKeyframes as jest.Mock).mockReturnValue({
      addVolumeKeyframe: mockAddVolumeKeyframe,
      updateVolumeKeyframe: mockUpdateVolumeKeyframe,
      removeVolumeKeyframe: mockRemoveVolumeKeyframe,
      getAutomationCurves: () => ({ volumeCurve: [1, 1, 1] }),
      volumeKeyframes: [
        { time: 5, value: 1, interpolation: { type: InterpolationType.Linear } }
      ]
    });

    render(
      <VolumeEnvelope
        clipId="test-clip"
        duration={10}
        zoom={1}
        isSelected={true}
      />
    );

    // Mock getBoundingClientRect
    const mockRect = {
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => {}
    };

    // Drag and release keyframe
    const svg = screen.getByRole('presentation');
    jest.spyOn(svg, 'getBoundingClientRect').mockReturnValue(mockRect);
    
    act(() => {
      // Click exactly on the keyframe point (5px across)
      fireEvent.mouseDown(svg, { clientX: 5, clientY: 50 });
      jest.runAllTimers();
      fireEvent.mouseMove(svg, { clientX: 60, clientY: 40 });
      jest.runAllTimers();
      fireEvent.mouseUp(svg, { clientX: 60, clientY: 40 });
      jest.runAllTimers();
    });

    // Check tooltip is removed
    const tooltip = screen.queryByText(/dB/);
    expect(tooltip).not.toBeInTheDocument();
  });
});
