import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestApp, getContextValue } from './test-utils';
import { ActionTypes } from '../../types/timeline';
import path from 'path';

describe('Effects Workflow', () => {
  const TEST_IMAGE_PATH = path.join(process.cwd(), 'test-assets', 'test-image.svg');
  const clip = {
    id: 'clip1',
    type: 'video' as const,
    startTime: 0,
    endTime: 60,
    duration: 60,
    name: 'Test Video',
    effects: [],
    src: TEST_IMAGE_PATH,
    path: TEST_IMAGE_PATH,
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0
    }
  };

  const audioClip = {
    id: 'audio1',
    type: 'audio' as const,
    startTime: 0,
    endTime: 60,
    duration: 60,
    name: 'Test Audio',
    src: TEST_IMAGE_PATH,
    path: TEST_IMAGE_PATH
  };

  // Convert audio clip to video clip type for Timeline
  const audioAsVideoClip = {
    ...audioClip,
    type: 'video' as const,
    effects: [],
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0
    }
  };

  const videoTrack = {
    id: '1',
    name: 'Video Track 1',
    type: 'video' as const,
    clips: [clip]
  };

  const audioTrack = {
    id: '2',
    name: 'Audio Track 1',
    type: 'video' as const,
    clips: [audioAsVideoClip]
  };

  it('should handle effect keyframing', async () => {
    const { container } = render(
      <TestApp
        initialTracks={[videoTrack]}
        state={{
          selectedClipId: 'clip1',
          currentTime: 0
        }}
      />
    );

    const { dispatch } = getContextValue(container);
    if (!dispatch) throw new Error('Dispatch not available');

    // Wait for initial render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Click effects tab
    const effectsTab = screen.getByRole('button', { name: 'Effects' });
    await act(async () => {
      fireEvent.click(effectsTab);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Add an effect
    const addEffectButton = await screen.findByTestId('add-effect-button');
    await act(async () => {
      fireEvent.click(addEffectButton); // First effect will be Blur
    });

    // Wait for effect to be added to clip state
    await waitFor(() => {
      expect(screen.getByTestId('effect-title-blur')).toBeInTheDocument();
    });

    // Set initial effect value and add keyframe at time 0
    const effectSlider = screen.getByTestId('effect-value-blur');
    const addKeyframeButton = screen.getByTestId('add-keyframe-blur');

    await act(async () => {
      fireEvent.change(effectSlider, { target: { value: '10' } });
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.click(addKeyframeButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify first keyframe is added
    await waitFor(() => {
      const keyframeInputs = screen.getAllByTestId(/keyframe-\d+-value/);
      expect(keyframeInputs).toHaveLength(1);
      expect(keyframeInputs[0]).toHaveValue('10');
    });

    // Move to time 30 and add second keyframe
    await act(async () => {
      dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: { time: 30 } });
      await new Promise(resolve => setTimeout(resolve, 100));

      fireEvent.change(effectSlider, { target: { value: '50' } });
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.click(addKeyframeButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify second keyframe is added
    await waitFor(() => {
      const keyframeInputs = screen.getAllByTestId(/keyframe-\d+-value/);
      expect(keyframeInputs).toHaveLength(2);
      expect(keyframeInputs[0]).toHaveValue('10');
      expect(keyframeInputs[1]).toHaveValue('50');
    });

    // Move to end of clip and add final keyframe
    await act(async () => {
      dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: { time: 60 } });
      await new Promise(resolve => setTimeout(resolve, 100));

      fireEvent.change(effectSlider, { target: { value: '0' } });
      await new Promise(resolve => setTimeout(resolve, 100));
      fireEvent.click(addKeyframeButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify all keyframes are present
    await waitFor(() => {
      const keyframeInputs = screen.getAllByTestId(/keyframe-\d+-value/);
      expect(keyframeInputs).toHaveLength(3);
      expect(keyframeInputs[0]).toHaveValue('10');
      expect(keyframeInputs[1]).toHaveValue('50');
      expect(keyframeInputs[2]).toHaveValue('0');
    });

    // Move to t=15 and check interpolated value
    await act(async () => {
      dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: { time: 15 } });
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Value should be interpolated between 10 and 50 at t=15
    await waitFor(() => {
      const effectSlider = screen.getByTestId('effect-value-blur');
      expect(effectSlider).toHaveValue('30'); // Linear interpolation: 10 + (50-10)*(15/30)
    });

    // Verify effect visualization in timeline
    const effectElement = screen.getByTestId('clip-effect-blur');
    expect(effectElement).toBeInTheDocument();
    expect(effectElement).toHaveClass('enabled');
  });

  it('should handle audio clip effects correctly', async () => {
    render(
      <TestApp
        initialTracks={[audioTrack]}
        state={{
          selectedClipId: 'audio1'
        }}
      />
    );

    // Wait for initial render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Click effects tab
    const effectsTab = screen.getByRole('button', { name: 'Effects' });
    await act(async () => {
      fireEvent.click(effectsTab);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Wait for effects panel to be active
    await waitFor(() => {
      expect(screen.getByTestId('effects-panel')).toBeInTheDocument();
    });

    // Try to add effect (should show error)
    const addEffectButton = screen.getByTestId('add-effect-button');
    await act(async () => {
      fireEvent.click(addEffectButton);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify error message is shown
    await waitFor(() => {
      const errorMessage = screen.getByTestId('effects-disabled-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('error-message');
      expect(errorMessage).toHaveTextContent('Visual effects cannot be applied to audio clips');
    });

    // Verify clip state remains unchanged
    const clip = screen.getByTestId('clip-audio1');
    expect(clip).toBeInTheDocument();
    expect(clip).toHaveClass('audio-clip');
    
    // Verify no effect elements were added
    const effectElements = screen.queryAllByTestId(/^clip-effect-/);
    expect(effectElements).toHaveLength(0);
  });
});
