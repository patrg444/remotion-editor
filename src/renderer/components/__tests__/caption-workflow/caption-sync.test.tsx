import React from 'react';
import { fireEvent, waitFor, screen, cleanup, act } from '@testing-library/react';
import { MockTimelineProvider, mockElectron, renderWithContext } from '../test-utils';
import { CaptionClip, Transform, TimelineState, ActionTypes } from '../../../types/timeline';
import { CaptionList } from '../../CaptionList';

const defaultTransform: Transform = {
  position: { x: 0, y: 0 },
  scale: { x: 1, y: 1 },
  rotation: 0
};

describe('Caption Sync Workflow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  const createMockCaptionClip = (): CaptionClip => ({
    id: 'test-caption',
    type: 'caption',
    name: 'Test Caption',
    startTime: 0,
    endTime: 10,
    transform: defaultTransform,
    text: 'Initial caption text',
    captions: [
      {
        id: '1',
        text: 'First caption',
        startTime: 0,
        endTime: 2,
        conf: 0.95
      },
      {
        id: '2',
        text: 'Second caption',
        startTime: 2,
        endTime: 4,
        conf: 0.92
      }
    ],
    style: {
      fontFamily: 'Arial',
      fontSize: 16,
      color: '#ffffff'
    }
  });

  const renderCaptionList = (clip: CaptionClip, onCaptionUpdate?: (clip: CaptionClip) => void) => {
    const initialState = {
      currentTime: 0,
      tracks: [],
      selectedTrackId: undefined,
      selectedClipId: undefined,
      selectedClipIds: [],
      selectedCaptionIds: [],
      isDragging: false,
      zoom: 1,
      scrollLeft: 0,
      isPlaying: false,
      aspectRatio: '16:9'
    };

    const result = renderWithContext(
      <CaptionList clip={clip} onCaptionUpdate={onCaptionUpdate} />,
      {
        state: initialState
      }
    );

    const updateCurrentTime = (time: number) => {
      const updatedState = {
        ...initialState,
        currentTime: time
      };
      
      result.rerender(
        <MockTimelineProvider state={updatedState}>
          <CaptionList clip={clip} onCaptionUpdate={onCaptionUpdate} />
        </MockTimelineProvider>
      );
    };

    return {
      ...result,
      updateCurrentTime
    };
  };

  it('should display captions in sync with timeline', async () => {
    const clip = createMockCaptionClip();
    const { updateCurrentTime } = renderCaptionList(clip);

    // Verify initial caption display
    expect(screen.getByText('First caption')).toBeInTheDocument();
    expect(screen.getByText('Second caption')).toBeInTheDocument();

    // Set current time to 1s
    console.log('Setting current time to 1s');
    act(() => {
      updateCurrentTime(1);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      const firstCaption = screen.getByText('First caption').closest('.caption-item');
      const secondCaption = screen.getByText('Second caption').closest('.caption-item');
      
      if (!firstCaption || !secondCaption) throw new Error('Caption elements not found');

      // First caption should be active
      expect(firstCaption).toHaveClass('active');
      expect(firstCaption).toHaveStyle({
        fontWeight: 'bold',
        fontSize: '18px',
        color: 'rgb(255 255 255)'
      });
      
      // Second caption should be inactive
      expect(secondCaption).not.toHaveClass('active');
      expect(secondCaption).toHaveStyle({
        fontWeight: 'normal',
        fontSize: '16px',
        color: 'rgb(204 204 204)'
      });
    });

    // Set current time to 3s
    console.log('Setting current time to 3s');
    act(() => {
      updateCurrentTime(3);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      const firstCaption = screen.getByText('First caption').closest('.caption-item');
      const secondCaption = screen.getByText('Second caption').closest('.caption-item');
      
      if (!firstCaption || !secondCaption) throw new Error('Caption elements not found');

      // First caption should be inactive
      expect(firstCaption).not.toHaveClass('active');
      expect(firstCaption).toHaveStyle({
        fontWeight: 'normal',
        fontSize: '16px',
        color: 'rgb(204 204 204)'
      });
      
      // Second caption should be active
      expect(secondCaption).toHaveClass('active');
      expect(secondCaption).toHaveStyle({
        fontWeight: 'bold',
        fontSize: '18px',
        color: 'rgb(255 255 255)'
      });
    }, { timeout: 1000 });
  });

  it('should allow editing caption text', async () => {
    const clip = createMockCaptionClip();
    const onCaptionUpdate = jest.fn((updatedClip: CaptionClip) => {
      Object.assign(clip, updatedClip);
    });

    renderCaptionList(clip, onCaptionUpdate);

    // Click edit button for first caption
    fireEvent.click(screen.getByRole('button', { name: 'Edit caption 1' }));

    // Edit text
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Updated caption' } });
    fireEvent.blur(input);

    expect(onCaptionUpdate).toHaveBeenCalled();
    expect(clip.captions[0].text).toBe('Updated caption');
  });

  it('should handle caption timing adjustments', async () => {
    const clip = createMockCaptionClip();
    const onCaptionUpdate = jest.fn((updatedClip: CaptionClip) => {
      Object.assign(clip, updatedClip);
    });

    const { updateCurrentTime } = renderCaptionList(clip, onCaptionUpdate);

    // Adjust timing for first caption
    const startTimeInput = screen.getByLabelText('Start time for caption 1');
    fireEvent.change(startTimeInput, { target: { value: '1.5' } });
    fireEvent.blur(startTimeInput);

    expect(onCaptionUpdate).toHaveBeenCalled();
    expect(clip.captions[0].startTime).toBe(1.5);

    // Verify opacity updates with new timing
    act(() => {
      updateCurrentTime(1);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      const firstCaption = screen.getByText('First caption').closest('.caption-item');
      if (!firstCaption) throw new Error('Caption element not found');
      expect(firstCaption).toHaveStyle({
        fontWeight: 'normal',
        fontSize: '16px',
        color: 'rgb(204 204 204)'
      });
    });

    act(() => {
      updateCurrentTime(1.75);
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      const firstCaption = screen.getByText('First caption').closest('.caption-item');
      if (!firstCaption) throw new Error('Caption element not found');
      expect(firstCaption).toHaveStyle({
        fontWeight: 'bold',
        fontSize: '18px',
        color: 'rgb(255 255 255)'
      });
    });
  });

  it('should allow adding new captions', async () => {
    const clip = createMockCaptionClip();
    const onCaptionUpdate = jest.fn((updatedClip: CaptionClip) => {
      Object.assign(clip, updatedClip);
    });

    const { rerender } = renderCaptionList(clip, onCaptionUpdate);

    // Select first caption
    fireEvent.click(screen.getByText('First caption'));

    // Click add button
    fireEvent.click(screen.getByRole('button', { name: `Add caption after ${clip.captions[0].id}` }));

    // Verify new caption was added
    expect(onCaptionUpdate).toHaveBeenCalled();
    expect(clip.captions).toHaveLength(3);
    expect(clip.captions[2].startTime).toBe(2); // Should start at first caption's end time
    expect(clip.captions[2].endTime).toBe(2.25); // Should be 0.25 seconds long
    expect(clip.captions[2].text).toBe(''); // Should start empty

    // Rerender to reflect the updated clip
    rerender(
      <MockTimelineProvider>
        <CaptionList clip={clip} onCaptionUpdate={onCaptionUpdate} />
      </MockTimelineProvider>
    );

    // Click edit button for the new caption
    fireEvent.click(screen.getByRole('button', { name: `Edit caption ${clip.captions[2].id}` }));

    // Verify it's in edit mode
    const textbox = screen.getByRole('textbox');
    expect(textbox).toBeInTheDocument();
    expect(textbox).toHaveFocus();

    // Edit the new caption
    fireEvent.change(textbox, { target: { value: 'New caption' } });
    fireEvent.blur(textbox);

    expect(clip.captions[2].text).toBe('New caption');
  });

  it('should allow deleting captions', async () => {
    const clip = createMockCaptionClip();
    const onCaptionUpdate = jest.fn((updatedClip: CaptionClip) => {
      Object.assign(clip, updatedClip);
    });

    const { rerender } = renderCaptionList(clip, onCaptionUpdate);

    // Select first caption
    fireEvent.click(screen.getByText('First caption'));

    // Click delete button
    fireEvent.click(screen.getByRole('button', { name: `Delete caption ${clip.captions[0].id}` }));

    // Verify caption was deleted
    expect(onCaptionUpdate).toHaveBeenCalled();
    expect(clip.captions).toHaveLength(1);
    expect(clip.captions[0].text).toBe('Second caption');

    // Rerender to reflect the updated clip
    rerender(
      <MockTimelineProvider>
        <CaptionList clip={clip} onCaptionUpdate={onCaptionUpdate} />
      </MockTimelineProvider>
    );

    // Test delete key
    fireEvent.click(screen.getByText('Second caption'));
    fireEvent.keyDown(screen.getByTestId('caption-list'), { key: 'Delete' });

    expect(onCaptionUpdate).toHaveBeenCalledTimes(2);
    expect(clip.captions).toHaveLength(0);
  });
});
