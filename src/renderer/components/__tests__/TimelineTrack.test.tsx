import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { TimelineTrack } from '../TimelineTrack';
import { Track } from '../../types/timeline';
import { TimelineContext } from '../../contexts/TimelineContext';

const mockTrack: Track = {
  id: 'track-1',
  name: 'Test Track',
  type: 'video',
  clips: [],
  isVisible: true,
  isMuted: false
};

const mockState = {
  tracks: [mockTrack],
  currentTime: 0,
  duration: 10,
  zoom: 1,
  fps: 30,
  isPlaying: false,
  isDragging: false,
  scrollX: 0,
  scrollY: 0,
  scrollLeft: 0,
  selectedClipIds: [],
  selectedTrackId: '',
  selectedCaptionIds: [],
  markers: [],
  history: {
    entries: [],
    currentIndex: -1
  }
};

const mockDispatch = jest.fn();

const defaultProps = {
  track: mockTrack,
  isSelected: false,
  zoom: 1,
  fps: 30,
  onSelectTrack: jest.fn(),
  onSelectClip: jest.fn(),
  onClipDragStart: jest.fn(),
  onClipDragEnd: jest.fn(),
  onToggleVisibility: jest.fn(),
  onUpdateTrack: jest.fn(),
  onDeleteTrack: jest.fn(),
  onMoveTrack: jest.fn()
};

const renderTrack = (props = {}) => {
  return render(
    <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
      <TimelineTrack {...defaultProps} {...props} />
    </TimelineContext.Provider>
  );
};

describe('TimelineTrack', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders track name', () => {
    renderTrack();
    expect(screen.getByText('Test Track')).toBeInTheDocument();
  });

  it('allows track name editing on double click', () => {
    renderTrack();
    const trackName = screen.getByTestId('track-name');
    fireEvent.doubleClick(trackName);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Test Track');
  });

  it('updates track name on enter key', () => {
    renderTrack();
    const trackName = screen.getByTestId('track-name');
    fireEvent.doubleClick(trackName);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'New Track Name' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onUpdateTrack).toHaveBeenCalledWith('track-1', { name: 'New Track Name' });
  });

  it('toggles track visibility', () => {
    renderTrack();
    const visibilityButton = screen.getByTestId('track-visibility-toggle');
    fireEvent.click(visibilityButton);
    expect(defaultProps.onToggleVisibility).toHaveBeenCalledWith('track-1');
  });

  it('toggles track mute state', () => {
    renderTrack();
    const muteButton = screen.getByTestId('track-mute-toggle');
    fireEvent.click(muteButton);
    expect(defaultProps.onUpdateTrack).toHaveBeenCalledWith('track-1', { isMuted: true });
  });

  describe('Track reordering', () => {
    it('moves track up when up arrow clicked', () => {
      renderTrack();
      const upButton = screen.getByTestId('track-move-up');
      fireEvent.click(upButton);
      expect(defaultProps.onMoveTrack).toHaveBeenCalledWith('track-1', 'up');
    });

    it('moves track down when down arrow clicked', () => {
      renderTrack();
      const downButton = screen.getByTestId('track-move-down');
      fireEvent.click(downButton);
      expect(defaultProps.onMoveTrack).toHaveBeenCalledWith('track-1', 'down');
    });

    it('prevents event bubbling when clicking move buttons', () => {
      renderTrack();
      const upButton = screen.getByTestId('track-move-up');
      const downButton = screen.getByTestId('track-move-down');
      const mockStopPropagation = jest.fn();

      fireEvent.click(upButton, { stopPropagation: mockStopPropagation });
      fireEvent.click(downButton, { stopPropagation: mockStopPropagation });

      expect(mockStopPropagation).toHaveBeenCalledTimes(2);
    });
  });

  it('deletes track', () => {
    renderTrack();
    const deleteButton = screen.getByTestId('track-delete-button');
    fireEvent.click(deleteButton);
    expect(defaultProps.onDeleteTrack).toHaveBeenCalledWith('track-1');
  });

  it('selects track on click', () => {
    renderTrack();
    const track = screen.getByRole('region');
    fireEvent.click(track);
    expect(defaultProps.onSelectTrack).toHaveBeenCalledWith('track-1');
  });

  it('applies selected class when track is selected', () => {
    renderTrack({ isSelected: true });
    const track = screen.getByRole('region');
    expect(track).toHaveClass('selected');
  });

  it('handles keyboard navigation', () => {
    renderTrack();
    const track = screen.getByRole('region');
    
    fireEvent.keyDown(track, { key: 'Enter' });
    expect(defaultProps.onSelectTrack).toHaveBeenCalledWith('track-1');

    fireEvent.keyDown(track, { key: ' ' });
    expect(defaultProps.onSelectTrack).toHaveBeenCalledWith('track-1');
  });
});
