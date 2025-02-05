import React from 'react';
import { fireEvent, waitFor, screen, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockTimelineProvider, mockElectron, renderWithContext, mockTimelineState } from './test-utils';
import { FaceTrackingInspector } from '../FaceTrackingInspector';
import { Timeline } from '../Timeline';
import { CaptionList } from '../CaptionList';
import { VideoClipWithFaceTracking } from '../../../types/face-tracking';
import { InterpolationType } from '../../types/keyframe';
import { useFaceTracking } from '../../hooks/useFaceTracking';
import { Track, Caption, CaptionClip } from '../../types/timeline';

jest.mock('../../hooks/useKeyframes');
jest.mock('../../hooks/useFaceTracking');
jest.mock('../../hooks/useTimeline');

describe('Face Tracking Integration Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockElectron.invoke.mockReset();
    mockElectron.on.mockReset();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const mockCaptions: Caption[] = [
    { id: 'caption-1', text: 'Speaker 1: Hello', startTime: 0, endTime: 2, speaker: 'speaker1' },
    { id: 'caption-2', text: 'Speaker 2: Hi', startTime: 2, endTime: 4, speaker: 'speaker2' }
  ];

  const createMockClip = (id: string = 'test-clip'): VideoClipWithFaceTracking => ({
    id,
    type: 'video',
    name: 'Test Video',
    path: '/path/to/video.mp4',
    src: '/path/to/video.mp4',
    startTime: 0,
    endTime: 10,
    duration: 10,
    faceTracking: {
      enabled: false,
      faces: [
        {
          id: 'face-1',
          frames: [{ time: 0, bbox: [0.1, 0.1, 0.3, 0.3], confidence: 0.95 }],
          confidence: 0.95,
          thumbnail: 'data:image/png;base64face1thumbnail'
        },
        {
          id: 'face-2',
          frames: [{ time: 0, bbox: [0.6, 0.1, 0.8, 0.3], confidence: 0.92 }],
          confidence: 0.92,
          thumbnail: 'data:image/png;base64face2thumbnail'
        }
      ],
      keyframes: {
        trackedFaces: [{ 
          time: 0, 
          value: ['face-1', 'face-2'],
          interpolation: { type: InterpolationType.Linear }
        }],
        layoutMode: [{ 
          time: 0, 
          value: 'horizontal',
          interpolation: { type: InterpolationType.Linear }
        }],
        zoom: [{ 
          time: 0, 
          value: 1.0,
          interpolation: { type: InterpolationType.Linear }
        }],
        smoothing: [{ 
          time: 0, 
          value: 0.5,
          interpolation: { type: InterpolationType.Linear }
        }],
        speakerMappings: [],
        neutralZone: [{
          time: 0,
          value: {
            size: 0.3,
            position: { x: 0.5, y: 0.5 },
            reframeThreshold: 0.2,
            reframeSpeed: 0.5
          },
          interpolation: { type: InterpolationType.Linear }
        }]
      }
    }
  });

  const createCaptionClip = (clip: VideoClipWithFaceTracking): CaptionClip => ({
    id: `${clip.id}-captions`,
    type: 'caption',
    name: 'Captions',
    startTime: clip.startTime,
    endTime: clip.endTime,
    duration: clip.duration,
    captions: mockCaptions
  });

  const mockTracks: Track[] = [
    { id: 'track-1', type: 'video', clips: [] },
    { id: 'track-2', type: 'audio', clips: [] }
  ];

  const timelineProps = {
    tracks: mockTracks,
    currentTime: 0,
    duration: 10,
    zoom: 1,
    fps: 30,
    isPlaying: false,
    onTrackClick: () => {},
    onClipClick: () => {},
    onZoomChange: () => {}
  };

  const renderComponents = (clip: VideoClipWithFaceTracking) => {
    const captionClip = createCaptionClip(clip);
    const initialState = {
      ...mockTimelineState,
      selectedClipId: clip.id,
      selectedClipIds: [clip.id],
      aspectRatio: '16:9',
      clips: [clip],
      captions: mockCaptions
    };

    return renderWithContext(
      <>
        <FaceTrackingInspector clip={clip} />
        <Timeline {...timelineProps} />
        <CaptionList clip={captionClip} />
      </>,
      { state: initialState }
    );
  };

  it('should maintain diarization settings when switching clips', async () => {
    const clip1 = createMockClip('clip-1');
    const clip2 = createMockClip('clip-2');
    const { rerender } = renderComponents(clip1);

    // Enable tracking and diarization on first clip
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    const diarizationToggle = screen.getByLabelText(/enable auto-switching/i);
    await act(async () => {
      fireEvent.click(diarizationToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });
    expect(diarizationToggle).toBeChecked();

    // Switch to second clip
    const newState = {
      ...mockTimelineState,
      selectedClipId: clip2.id,
      selectedClipIds: [clip2.id],
      clips: [clip1, clip2]
    };

    await act(async () => {
      rerender(
        <MockTimelineProvider state={newState}>
          <FaceTrackingInspector clip={clip2} />
          <Timeline {...timelineProps} />
          <CaptionList clip={createCaptionClip(clip2)} />
        </MockTimelineProvider>
      );
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Enable tracking on second clip
    const newTrackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(newTrackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Verify diarization state is preserved
    const newDiarizationToggle = screen.getByLabelText(/enable auto-switching/i);
    expect(newDiarizationToggle).toBeChecked();
  });

  it('should sync speaker mappings with captions', async () => {
    const clip = createMockClip();
    (useFaceTracking as any).setMockOverrides({
      isTracking: true,
      isDiarizationEnabled: true,
      speakerMappings: [
        { speakerId: 'speaker1', faceId: 'face-1' },
        { speakerId: 'speaker2', faceId: 'face-2' }
      ]
    });

    renderComponents(clip);

    // Verify speaker mappings are displayed
    expect(screen.getByText('speaker1')).toBeInTheDocument();
    expect(screen.getByText('speaker2')).toBeInTheDocument();
  });

  it('should handle error states', async () => {
    const clip = createMockClip();
    const errorMessage = 'Face tracking failed';
    
    (useFaceTracking as any).setMockOverrides({
      isTracking: true,
      error: errorMessage
    });

    renderComponents(clip);

    // Verify error is displayed in error class
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement.parentElement).toHaveClass('error');
  });

  it('should handle processing state', async () => {
    const clip = createMockClip();
    
    (useFaceTracking as any).setMockOverrides({
      isTracking: true,
      isProcessing: true
    });

    renderComponents(clip);

    // Verify processing indicator is shown
    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('should adjust layout based on aspect ratio', async () => {
    const clip = createMockClip();
    const { rerender } = renderComponents(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Change to vertical aspect ratio
    const newState = {
      ...mockTimelineState,
      aspectRatio: '9:16',
      clips: [clip]
    };

    // Mock layout mode update
    (useFaceTracking as any).setMockOverrides({
      isTracking: true,
      getTrack: (trackId: string) => ({
        getValue: () => trackId === 'face-tracking-layout' ? 'vertical' : undefined
      })
    });

    await act(async () => {
      rerender(
        <MockTimelineProvider state={newState}>
          <FaceTrackingInspector clip={clip} />
          <Timeline {...timelineProps} />
          <CaptionList clip={createCaptionClip(clip)} />
        </MockTimelineProvider>
      );
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Verify layout mode is updated
    const layoutSelect = screen.getByLabelText('Layout Mode') as HTMLSelectElement;
    expect(layoutSelect.value).toBe('vertical');
  });

  it('should handle neutral zone position updates', async () => {
    const clip = createMockClip();
    renderComponents(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Mock neutral zone update
    (useFaceTracking as any).setMockOverrides({
      isTracking: true,
      getTrack: (trackId: string) => ({
        getValue: () => trackId === 'face-tracking-neutral-zone' ? {
          size: 0.4,
          position: { x: 0.6, y: 0.4 },
          reframeThreshold: 0.3,
          reframeSpeed: 0.6
        } : undefined
      })
    });

    // Update neutral zone position
    const sizeSlider = screen.getByLabelText(/neutral zone size/i) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(sizeSlider, { target: { value: '0.4' } });
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Wait for state updates to propagate
    await waitFor(() => {
      expect(sizeSlider.value).toBe('0.4');
    });
  });

  it('should persist smoothing value changes', async () => {
    const clip = createMockClip();
    renderComponents(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Mock smoothing update
    (useFaceTracking as any).setMockOverrides({
      isTracking: true,
      getTrack: (trackId: string) => ({
        getValue: () => trackId === 'face-tracking-smoothing' ? 0.8 : undefined
      })
    });

    // Change smoothing value
    const smoothingSlider = screen.getByLabelText(/smoothing level/i) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(smoothingSlider, { target: { value: '0.8' } });
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Wait for state updates to propagate
    await waitFor(() => {
      expect(smoothingSlider.value).toBe('0.8');
    });
  });
});
