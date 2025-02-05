import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestApp } from './test-utils';
import { Track, VideoClip, ActionTypes } from '../../types/timeline';
import type { TransformKeyframe } from '../../types/timeline';

const tracksWithTransform = [{
  id: '1',
  name: 'Video Track 1',
  type: 'video' as const,
  clips: [{
    id: 'clip1',
    type: 'video' as const,
    startTime: 0,
    endTime: 60,
    duration: 60,
    name: 'Test Video',
    effects: [],
    src: '/test/video-1.mp4',
    path: '/test/video-1.mp4',
    transform: {
      position: { x: 0, y: 0 },
      scale: { x: 1, y: 1 },
      rotation: 0
    }
  }]
}];

describe('Transform Workflow', () => {
  beforeEach(() => {
    // Reset URL.createObjectURL between tests
    URL.createObjectURL = jest.fn(() => 'mock-url');
  });

  it('should update position transform in real-time', async () => {
    const { container } = render(<TestApp initialTracks={tracksWithTransform} />);

    // Select clip
    const clipElement = screen.getByTestId('clip-clip1');
    fireEvent.click(clipElement);

    // Update position
    const positionXInput = screen.getByTestId('transform-position-x');
    const positionYInput = screen.getByTestId('transform-position-y');

    fireEvent.change(positionXInput, { target: { value: '100' } });
    fireEvent.change(positionYInput, { target: { value: '50' } });

    // Verify preview updates with new position
    const preview = screen.getByTestId('preview-display');
    expect(preview).toHaveAttribute('data-transform-position-x', '100');
    expect(preview).toHaveAttribute('data-transform-position-y', '50');

    // Cleanup
    container.remove();
  });

  it('should update scale transform in real-time', async () => {
    const { container } = render(<TestApp initialTracks={tracksWithTransform} />);

    // Select clip
    const clipElement = screen.getByTestId('clip-clip1');
    fireEvent.click(clipElement);

    // Update scale
    const scaleXInput = screen.getByTestId('transform-scale-x');
    const scaleYInput = screen.getByTestId('transform-scale-y');

    fireEvent.change(scaleXInput, { target: { value: '1.5' } });
    fireEvent.change(scaleYInput, { target: { value: '0.75' } });

    // Verify preview updates with new scale
    const preview = screen.getByTestId('preview-display');
    expect(preview).toHaveAttribute('data-transform-scale-x', '1.5');
    expect(preview).toHaveAttribute('data-transform-scale-y', '0.75');

    // Cleanup
    container.remove();
  });

  it('should update rotation transform in real-time', async () => {
    const { container } = render(<TestApp initialTracks={tracksWithTransform} />);

    // Select clip
    const clipElement = screen.getByTestId('clip-clip1');
    fireEvent.click(clipElement);

    // Update rotation
    const rotationInput = screen.getByTestId('transform-rotation');
    fireEvent.change(rotationInput, { target: { value: '45' } });

    // Verify preview updates with new rotation
    const preview = screen.getByTestId('preview-display');
    expect(preview).toHaveAttribute('data-transform-rotation', '45');

    // Cleanup
    container.remove();
  });

  it('should handle undo/redo of transform changes', async () => {
    const { container } = render(<TestApp initialTracks={tracksWithTransform} />);

    // Select clip
    const clipElement = screen.getByTestId('clip-clip1');
    fireEvent.click(clipElement);

    // Update position
    const positionXInput = screen.getByTestId('transform-position-x');
    fireEvent.change(positionXInput, { target: { value: '100' } });

    // Undo changes
    const undoButton = screen.getByLabelText('Undo');
    fireEvent.click(undoButton);

    // Wait for state update and verify position reverted
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    const preview = screen.getByTestId('preview-display');
    expect(preview).toHaveAttribute('data-transform-position-x', '0');

    // Redo changes
    const redoButton = screen.getByLabelText('Redo');
    fireEvent.click(redoButton);

    // Wait for state update and verify position restored
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    expect(preview).toHaveAttribute('data-transform-position-x', '100');

    // Cleanup
    container.remove();
  });

  it('should handle transform keyframing', async () => {
    const initialTracks = [{
      id: '1',
      name: 'Video Track 1',
      type: 'video' as const,
      clips: [{
        id: 'clip1',
        type: 'video' as const,
        startTime: 0,
        endTime: 60,
        duration: 60,
        name: 'Test Video',
        effects: [],
        src: '/test/video-1.mp4',
        path: '/test/video-1.mp4',
        transform: {
          position: {
            x: 0,
            y: 0,
            keyframes: [
              { time: 0, value: 0 },
              { time: 2, value: 100 }
            ] as TransformKeyframe[]
          },
          scale: { x: 1, y: 1 },
          rotation: 0
        }
      }]
    }];

    const { container } = render(
      <TestApp
        initialTracks={initialTracks}
        state={{
          selectedClipId: 'clip1',
          currentTime: 1 // Set to middle of keyframe range
        }}
      />
    );

    // Wait for initial render and state updates
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify interpolated position
    const preview = screen.getByTestId('preview-display');
    expect(preview).toHaveAttribute('data-transform-position-x', '50'); // Interpolated value (0 + (100 - 0) * 0.5)

    // Cleanup
    container.remove();
  });

  it('should maintain transform state between clips', async () => {
    const initialTracks = [{
      id: '1',
      name: 'Video Track 1',
      type: 'video' as const,
      clips: [{
        id: 'clip1',
        type: 'video' as const,
        startTime: 0,
        endTime: 30,
        duration: 30,
        name: 'Test Video 1',
        effects: [],
        src: '/test/video-1.mp4',
        path: '/test/video-1.mp4',
        transform: {
          position: { x: 0, y: 0 },
          scale: { x: 1, y: 1 },
          rotation: 0
        }
      }, {
        id: 'clip2',
        type: 'video' as const,
        startTime: 30,
        endTime: 60,
        duration: 30,
        name: 'Test Video 2',
        effects: [],
        src: '/test/video-2.mp4',
        path: '/test/video-2.mp4',
        transform: {
          position: { x: 0, y: 0 },
          scale: { x: 1, y: 1 },
          rotation: 0
        }
      }]
    }];

    const { container } = render(
      <TestApp
        initialTracks={initialTracks}
        state={{
          selectedClipId: 'clip1'
        }}
      />
    );

    // Wait for initial render
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Update first clip's transform
    const positionXInput = screen.getByTestId('transform-position-x');
    fireEvent.change(positionXInput, { target: { value: '100' } });

    // Select second clip
    const clip2 = screen.getByTestId('clip-clip2');
    fireEvent.click(clip2);

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Verify second clip has independent transform
    const preview = screen.getByTestId('preview-display');
    expect(preview).toHaveAttribute('data-transform-position-x', '0'); // Default value

    // Cleanup
    container.remove();
  });
});
