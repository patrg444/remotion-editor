import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestApp } from './test-utils';
import { VideoClip } from '../../types/timeline';
import { VideoClipWithFaceTracking } from '../../../types/face-tracking';
import { InterpolationType } from '../../types/keyframe';

const createTestClip = (): VideoClipWithFaceTracking => ({
  id: 'test-clip',
  type: 'video',
  name: 'Test Video',
  path: '/path/to/video.mp4',
  src: '/path/to/video.mp4',
  startTime: 0,
  endTime: 10,
  duration: 10,
  effects: [],
  transform: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0
  },
  faceTracking: {
    enabled: true,
    faces: [
      {
        id: 'face-1',
        frames: [
          {
            time: 0,
            bbox: [0.1, 0.1, 0.3, 0.3],
            confidence: 0.95
          }
        ],
        confidence: 0.95,
        thumbnail: 'data:image/png;base64,face1thumbnail'
      }
    ],
    keyframes: {
      trackedFaces: [],
      layoutMode: [],
      zoom: [],
      smoothing: [],
      speakerMappings: [],
      neutralZone: [{
        time: 0,
        value: {
          size: 0.3,
          position: { x: 0.5, y: 0.5 },
          reframeThreshold: 0.2,
          reframeSpeed: 0.5
        },
        interpolation: {
          type: InterpolationType.Linear
        }
      }]
    }
  }
});

const createTestTracks = (clip: VideoClipWithFaceTracking) => [{
  id: '1',
  name: 'Video Track 1',
  type: 'video' as const,
  clips: [clip]
}];

describe('Face Tracking Workflow', () => {
  it('should render face tracking controls', async () => {
    const clip = createTestClip();
    const { container } = render(
      <TestApp
        initialTracks={createTestTracks(clip)}
        state={{
          selectedClipId: clip.id
        }}
      />
    );

    // Wait for face tracking inspector to load
    const inspector = await screen.findByTestId('face-tracking-inspector');
    expect(inspector).toBeInTheDocument();

    // Verify face tracking toggle is enabled
    const enableToggle = screen.getByLabelText('Enable Face Tracking');
    expect(enableToggle).toBeChecked();

    // Verify face list is rendered
    const faceList = screen.getByTestId('face-list');
    expect(faceList).toBeInTheDocument();
    expect(screen.getByText('Face 1')).toBeInTheDocument();

    // Cleanup
    container.remove();
  });

  it('should handle face tracking toggle', async () => {
    const clip = createTestClip();
    const { container } = render(
      <TestApp
        initialTracks={createTestTracks(clip)}
        state={{
          selectedClipId: clip.id
        }}
      />
    );

    // Find and click toggle
    const enableToggle = await screen.findByLabelText('Enable Face Tracking');
    await act(async () => {
      fireEvent.click(enableToggle);
    });

    // Verify face tracking is disabled
    await waitFor(() => {
      const updatedClip = screen.getByTestId('clip-test-clip');
      const clipData = updatedClip?.getAttribute('data-clip');
      if (clipData) {
        const clip = JSON.parse(clipData);
        expect(clip.faceTracking.enabled).toBe(false);
      }
    });

    // Cleanup
    container.remove();
  });

  it('should handle neutral zone adjustments', async () => {
    const clip = createTestClip();
    const { container } = render(
      <TestApp
        initialTracks={createTestTracks(clip)}
        state={{
          selectedClipId: clip.id
        }}
      />
    );

    // Find neutral zone controls
    const sizeInput = await screen.findByLabelText('Neutral Zone Size');
    const thresholdInput = await screen.findByLabelText('Reframe Threshold');
    const speedInput = await screen.findByLabelText('Reframe Speed');

    // Adjust neutral zone parameters
    await act(async () => {
      fireEvent.change(sizeInput, { target: { value: '0.4' } });
      fireEvent.change(thresholdInput, { target: { value: '0.3' } });
      fireEvent.change(speedInput, { target: { value: '0.6' } });
    });

    // Verify updates are reflected in clip data
    await waitFor(() => {
      const updatedClip = screen.getByTestId('clip-test-clip');
      const clipData = updatedClip?.getAttribute('data-clip');
      if (clipData) {
        const clip = JSON.parse(clipData);
        const neutralZone = clip.faceTracking.keyframes.neutralZone[0].value;
        expect(neutralZone.size).toBe(0.4);
        expect(neutralZone.reframeThreshold).toBe(0.3);
        expect(neutralZone.reframeSpeed).toBe(0.6);
      }
    });

    // Cleanup
    container.remove();
  });

  it('should handle face selection and mapping', async () => {
    const clip = createTestClip();
    const { container } = render(
      <TestApp
        initialTracks={createTestTracks(clip)}
        state={{
          selectedClipId: clip.id
        }}
      />
    );

    // Find and select face
    const faceItem = await screen.findByText('Face 1');
    await act(async () => {
      fireEvent.click(faceItem);
    });

    // Verify face is selected
    expect(faceItem).toHaveClass('selected');

    // Map face to speaker
    const speakerSelect = screen.getByLabelText('Map to Speaker');
    await act(async () => {
      fireEvent.change(speakerSelect, { target: { value: 'Speaker 1' } });
    });

    // Verify mapping is added
    await waitFor(() => {
      const updatedClip = screen.getByTestId('clip-test-clip');
      const clipData = updatedClip?.getAttribute('data-clip');
      if (clipData) {
        const clip = JSON.parse(clipData);
        const mapping = clip.faceTracking.keyframes.speakerMappings[0];
        expect(mapping.value).toBe('Speaker 1');
      }
    });

    // Cleanup
    container.remove();
  });
});
