import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { TimelineClip } from '../TimelineClip';
import { ClipWithLayer } from '../../types/timeline';
import { TimelineContext } from '../../contexts/TimelineContext';

describe('TimelineClip', () => {
  const mockState = {
    tracks: [],
    currentTime: 0,
    duration: 100,
    zoom: 1,
    fps: 30,
    isPlaying: false,
    isDragging: false,
    scrollX: 0,
    scrollY: 0,
    selectedClipIds: [],
    markers: [],
    history: {
      entries: [],
      currentIndex: -1
    }
  };

  const mockDispatch = jest.fn();

  const mockVideoClip: ClipWithLayer = {
    id: 'clip1',
    type: 'video',
    name: 'Test Video',
    startTime: 0,
    endTime: 10,
    src: 'test.mp4',
    originalDuration: 10,
    effects: [],
    layer: 0
  };

  const mockAudioClip: ClipWithLayer = {
    id: 'clip2',
    type: 'audio',
    name: 'Test Audio',
    startTime: 5,
    endTime: 15,
    src: 'test.mp3',
    originalDuration: 10,
    effects: [],
    volume: 1,
    isMuted: false,
    layer: 1
  };

  const mockCaptionClip: ClipWithLayer = {
    id: 'clip3',
    type: 'caption',
    name: 'Test Caption',
    startTime: 2,
    endTime: 8,
    text: 'Test caption text',
    effects: [],
    captions: [{
      id: 'caption1',
      text: 'Hello world',
      start: 2,
      end: 4,
      speakerId: 'speaker1'
    }],
    speakerStyles: {
      fontSize: 16,
      fontFamily: 'Arial',
      speakers: {
        speaker1: {
          id: 'speaker1',
          name: 'Speaker 1',
          color: '#ff0000'
        }
      }
    },
    layer: 2
  };

  const defaultProps = {
    layer: 0,
    zoom: 1,
    fps: 30,
    onSelect: jest.fn(),
    onDragStart: jest.fn(),
    onDragEnd: jest.fn()
  };

  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
        {ui}
      </TimelineContext.Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders video clip correctly', () => {
    const { container } = renderWithContext(
      <TimelineClip
        clip={mockVideoClip}
        {...defaultProps}
      />
    );
    expect(container.querySelector('.video-clip')).toBeTruthy();
  });

  it('renders audio clip correctly', () => {
    const { container } = renderWithContext(
      <TimelineClip
        clip={mockAudioClip}
        {...defaultProps}
        layer={1}
      />
    );
    expect(container.querySelector('.audio-clip')).toBeTruthy();
  });

  it('renders caption clip correctly', () => {
    const { container } = renderWithContext(
      <TimelineClip
        clip={mockCaptionClip}
        {...defaultProps}
        layer={2}
      />
    );
    expect(container.querySelector('.caption-clip')).toBeTruthy();
  });

  it('shows selection state correctly', () => {
    const stateWithSelection = {
      ...mockState,
      selectedClipIds: [mockVideoClip.id]
    };

    const { container } = render(
      <TimelineContext.Provider value={{ state: stateWithSelection, dispatch: mockDispatch }}>
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      </TimelineContext.Provider>
    );
    expect(container.querySelector('.selected')).toBeTruthy();
  });

  it('shows dragging state correctly', () => {
    const stateWithDragging = {
      ...mockState,
      isDragging: true,
      selectedClipIds: [mockVideoClip.id]
    };

    const { container } = render(
      <TimelineContext.Provider value={{ state: stateWithDragging, dispatch: mockDispatch }}>
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      </TimelineContext.Provider>
    );
    expect(container.querySelector('.dragging')).toBeTruthy();
  });

  describe('keyboard interactions', () => {
    it('handles Enter key for selection', () => {
      const { container } = renderWithContext(
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      );
      const clip = container.querySelector('.timeline-clip');
      fireEvent.keyDown(clip!, { key: 'Enter' });
      expect(defaultProps.onSelect).toHaveBeenCalled();
    });

    it('handles Space key for selection', () => {
      const { container } = renderWithContext(
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      );
      const clip = container.querySelector('.timeline-clip');
      fireEvent.keyDown(clip!, { key: ' ' });
      expect(defaultProps.onSelect).toHaveBeenCalled();
    });

    it('enters keyboard dragging mode with M key', () => {
      const { container } = renderWithContext(
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      );
      const clip = container.querySelector('.timeline-clip');
      fireEvent.keyDown(clip!, { key: 'm' });
      expect(defaultProps.onDragStart).toHaveBeenCalled();
      expect(container.querySelector('.keyboard-dragging')).toBeTruthy();
    });

    it('handles arrow keys in keyboard dragging mode', () => {
      const { container } = renderWithContext(
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      );
      const clip = container.querySelector('.timeline-clip');

      // Enter dragging mode
      fireEvent.keyDown(clip!, { key: 'm' });

      // Move left
      fireEvent.keyDown(clip!, { key: 'ArrowLeft' });
      // Move right
      fireEvent.keyDown(clip!, { key: 'ArrowRight' });
      // Move left fast
      fireEvent.keyDown(clip!, { key: 'ArrowLeft', shiftKey: true });
      // Move right fast
      fireEvent.keyDown(clip!, { key: 'ArrowRight', shiftKey: true });

      // Exit dragging mode
      fireEvent.keyDown(clip!, { key: 'Escape' });
      expect(defaultProps.onDragEnd).toHaveBeenCalled();
      expect(container.querySelector('.keyboard-dragging')).toBeFalsy();
    });
  });

  describe('mouse interactions', () => {
    it('handles mouse down for drag start', () => {
      const { container } = renderWithContext(
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      );
      const clip = container.querySelector('.timeline-clip');
      fireEvent.mouseDown(clip!);
      expect(defaultProps.onSelect).toHaveBeenCalled();
      expect(defaultProps.onDragStart).toHaveBeenCalled();
    });

    it('handles mouse up for drag end', () => {
      const { container } = renderWithContext(
        <TimelineClip
          clip={mockVideoClip}
          {...defaultProps}
        />
      );
      const clip = container.querySelector('.timeline-clip');
      fireEvent.mouseUp(clip!);
      expect(defaultProps.onDragEnd).toHaveBeenCalled();
    });
  });
});
