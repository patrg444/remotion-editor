import React from 'react';
import { fireEvent, waitFor, screen, cleanup, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Logger } from '../../../../main/utils/logger';
import { MockTimelineProvider, mockElectron, renderWithContext, mockTimelineState } from '../test-utils';
import { FaceTrackingInspector } from '../../FaceTrackingInspector';
import { VideoClipWithFaceTracking } from '../../../../types/face-tracking';
import { InterpolationType } from '../../../types/keyframe';
import { useFaceTracking } from '../../../hooks/useFaceTracking';

jest.mock('../../../hooks/useKeyframes');
jest.mock('../../../hooks/useFaceTracking');

const logger = new Logger('DiarizationTest');

// Get the original mock implementation
const originalMock = jest.requireMock('../../../hooks/useFaceTracking');

describe('Face Tracking Diarization Workflow', () => {
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

  const createMockClip = (): VideoClipWithFaceTracking => ({
    id: 'test-clip',
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

  const renderInspector = (clip: VideoClipWithFaceTracking) => {
    const initialState = {
      ...mockTimelineState,
      selectedClipId: clip.id,
      selectedClipIds: [clip.id],
      aspectRatio: '16:9'
    };

    return renderWithContext(
      <FaceTrackingInspector clip={clip} />,
      { state: initialState }
    );
  };

  it('should update layout based on aspect ratio', async () => {
    const clip = createMockClip();
    const { rerender } = renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Verify initial layout
    await waitFor(() => {
      const select = screen.getByRole('combobox', { name: /layout mode/i });
      expect(select).toBeInTheDocument();
      expect((select as HTMLSelectElement).value).toBe('horizontal');
    });

    // Change to 9:16
    const newState = {
      ...mockTimelineState,
      selectedClipId: clip.id,
      selectedClipIds: [clip.id],
      aspectRatio: '9:16'
    };

    await act(async () => {
      rerender(
        <MockTimelineProvider state={newState}>
          <FaceTrackingInspector clip={clip} />
        </MockTimelineProvider>
      );
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Verify layout updated
    await waitFor(() => {
      const select = screen.getByRole('combobox', { name: /layout mode/i });
      expect((select as HTMLSelectElement).value).toBe('vertical');
    });
  });

  it('should toggle diarization', async () => {
    const clip = createMockClip();
    renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Wait for diarization section
    await waitFor(() => {
      expect(screen.getByText('Speaker Diarization')).toBeInTheDocument();
    });

    // Toggle diarization on
    const diarizationToggle = screen.getByLabelText(/enable auto-switching/i);
    await act(async () => {
      fireEvent.click(diarizationToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });
    expect(diarizationToggle).toBeChecked();

    // Toggle diarization off
    await act(async () => {
      fireEvent.click(diarizationToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });
    expect(diarizationToggle).not.toBeChecked();
  });

  it('should handle face selection', async () => {
    const clip = createMockClip();
    renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Wait for face selection section
    await waitFor(() => {
      expect(screen.getByText(/tracked faces/i)).toBeInTheDocument();
    });

    // Get face checkboxes
    const faceCheckboxes = Array.from(document.querySelectorAll('.face-selection input[type="checkbox"]'))
      .map(el => el as HTMLInputElement);
    expect(faceCheckboxes).toHaveLength(2);
    expect(faceCheckboxes[0]).toBeChecked();
    expect(faceCheckboxes[1]).toBeChecked();

    // Uncheck first face
    await act(async () => {
      fireEvent.click(faceCheckboxes[0]);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Verify state
    const updatedCheckboxes = Array.from(document.querySelectorAll('.face-selection input[type="checkbox"]'))
      .map(el => el as HTMLInputElement);
    expect(updatedCheckboxes[0].checked).toBe(false);
    expect(updatedCheckboxes[1].checked).toBe(true);

    // Check first face again
    await act(async () => {
      fireEvent.click(faceCheckboxes[0]);
      await Promise.resolve();
      jest.runAllTimers();
    });
    expect(faceCheckboxes[0]).toBeChecked();
    expect(faceCheckboxes[1]).toBeChecked();
  });

  it('should update neutral zone settings', async () => {
    const clip = createMockClip();
    renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Wait for controls
    await waitFor(() => {
      expect(screen.getByLabelText(/neutral zone size/i)).toBeInTheDocument();
    });

    // Update settings
    const sizeSlider = screen.getByLabelText(/neutral zone size/i) as HTMLInputElement;
    const thresholdSlider = screen.getByLabelText(/reframe threshold/i) as HTMLInputElement;
    const speedSlider = screen.getByLabelText(/reframe speed/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(sizeSlider, { target: { value: '0.4' } });
      fireEvent.change(thresholdSlider, { target: { value: '0.3' } });
      fireEvent.change(speedSlider, { target: { value: '0.7' } });
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(sizeSlider.value).toBe('0.4');
    expect(thresholdSlider.value).toBe('0.3');
    expect(speedSlider.value).toBe('0.7');
  });

  it('should update zoom and smoothing settings', async () => {
    const clip = createMockClip();
    renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Update settings
    const zoomSlider = screen.getByLabelText(/zoom level/i) as HTMLInputElement;
    const smoothingSlider = screen.getByLabelText(/smoothing level/i) as HTMLInputElement;

    await act(async () => {
      fireEvent.change(zoomSlider, { target: { value: '1.5' } });
      fireEvent.change(smoothingSlider, { target: { value: '0.8' } });
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(zoomSlider.value).toBe('1.5');
    expect(smoothingSlider.value).toBe('0.8');
  });

  it('should disable diarization when face tracking is disabled', async () => {
    const clip = createMockClip();
    renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Wait for diarization section
    await waitFor(() => {
      expect(screen.getByText('Speaker Diarization')).toBeInTheDocument();
    });

    // Enable diarization
    const diarizationToggle = screen.getByLabelText(/enable auto-switching/i);
    await act(async () => {
      fireEvent.click(diarizationToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Disable tracking
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Verify diarization section removed
    await waitFor(() => {
      expect(screen.queryByText('Speaker Diarization')).not.toBeInTheDocument();
    });
  });

  it('should allow manual layout mode changes', async () => {
    const clip = createMockClip();
    renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Change layout mode
    const layoutSelect = screen.getByRole('combobox', { name: /layout mode/i });
    await act(async () => {
      fireEvent.change(layoutSelect, { target: { value: 'vertical' } });
      await Promise.resolve();
      jest.runAllTimers();
    });
    expect(layoutSelect).toHaveValue('vertical');

    // Change back to horizontal
    await act(async () => {
      fireEvent.change(layoutSelect, { target: { value: 'horizontal' } });
      await Promise.resolve();
      jest.runAllTimers();
    });
    expect(layoutSelect).toHaveValue('horizontal');
  });

  it('should handle speaker mappings', async () => {
    const clip = createMockClip();
    const { rerender } = renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Enable diarization
    const diarizationToggle = screen.getByLabelText(/enable auto-switching/i);
    await act(async () => {
      fireEvent.click(diarizationToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Mock speaker mapping update
    (useFaceTracking as jest.Mock).mockImplementationOnce((clip, aspectRatio) => ({
      ...originalMock.baseImplementation(clip, aspectRatio),
      speakerMappings: [{ speakerId: 'speaker1', faceId: 'face-1' }]
    }));

    // Rerender with speaker mapping
    await act(async () => {
      rerender(<FaceTrackingInspector clip={clip} />);
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(screen.getByText(/speaker1/i)).toBeInTheDocument();
  });

  it('should handle error recovery', async () => {
    const clip = createMockClip();
    const { rerender } = renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Set error state
    (useFaceTracking as jest.Mock).mockImplementationOnce((clip, aspectRatio) => ({
      ...originalMock.baseImplementation(clip, aspectRatio),
      error: 'Face tracking failed'
    }));

    // Rerender with error
    await act(async () => {
      rerender(<FaceTrackingInspector clip={clip} />);
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(screen.getByText(/face tracking failed/i)).toBeInTheDocument();

    // Clear error
    (useFaceTracking as jest.Mock).mockImplementationOnce((clip, aspectRatio) => ({
      ...originalMock.baseImplementation(clip, aspectRatio),
      error: null
    }));

    // Rerender without error
    await act(async () => {
      rerender(<FaceTrackingInspector clip={clip} />);
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(screen.queryByText(/face tracking failed/i)).not.toBeInTheDocument();
  });

  it('should handle processing state transitions', async () => {
    const clip = createMockClip();
    const { rerender } = renderInspector(clip);

    // Enable tracking
    const trackingToggle = screen.getByLabelText(/enable face tracking/i);
    await act(async () => {
      fireEvent.click(trackingToggle);
      await Promise.resolve();
      jest.runAllTimers();
    });

    // Set processing state
    (useFaceTracking as jest.Mock).mockImplementationOnce((clip, aspectRatio) => ({
      ...originalMock.baseImplementation(clip, aspectRatio),
      isProcessing: true
    }));

    // Rerender with processing
    await act(async () => {
      rerender(<FaceTrackingInspector clip={clip} />);
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(screen.getByText(/processing/i)).toBeInTheDocument();

    // Clear processing
    (useFaceTracking as jest.Mock).mockImplementationOnce((clip, aspectRatio) => ({
      ...originalMock.baseImplementation(clip, aspectRatio),
      isProcessing: false
    }));

    // Rerender without processing
    await act(async () => {
      rerender(<FaceTrackingInspector clip={clip} />);
      await Promise.resolve();
      jest.runAllTimers();
    });

    expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
  });
});
