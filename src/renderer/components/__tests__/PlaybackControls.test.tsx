import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlaybackControls } from '../PlaybackControls';
import { useTimeline } from '../../hooks/useTimeline';
import { useTimelineShortcuts } from '../../hooks/useTimelineShortcuts';

// Mock the hooks
jest.mock('../../hooks/useTimeline');
jest.mock('../../hooks/useTimelineShortcuts');

describe('PlaybackControls', () => {
  const mockTimeline = {
    state: {
      isPlaying: false,
      currentTime: 5,
      duration: 10,
    },
    setPlaying: jest.fn(),
    setCurrentTime: jest.fn(),
  };

  const mockHandleKeyDown = jest.fn();

  const mockRect = {
    left: 0,
    top: 0,
    width: 400,
    height: 400,
    right: 400,
    bottom: 400,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimeline as jest.Mock).mockReturnValue(mockTimeline);
    (useTimelineShortcuts as jest.Mock).mockReturnValue(mockHandleKeyDown);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders all playback buttons', () => {
    render(<PlaybackControls />);
    
    expect(screen.getByText('Step Back')).toBeInTheDocument();
    expect(screen.getByText('Play')).toBeInTheDocument();
    expect(screen.getByText('Step Forward')).toBeInTheDocument();
  });

  it('shows Pause text when playing', () => {
    (useTimeline as jest.Mock).mockReturnValue({
      ...mockTimeline,
      state: { ...mockTimeline.state, isPlaying: true },
    });

    render(<PlaybackControls />);
    
    expect(screen.getByText('Pause')).toBeInTheDocument();
  });

  it('disables Step Back button at start', () => {
    (useTimeline as jest.Mock).mockReturnValue({
      ...mockTimeline,
      state: { ...mockTimeline.state, currentTime: 0 },
    });

    render(<PlaybackControls />);
    
    expect(screen.getByText('Step Back')).toBeDisabled();
  });

  it('disables Step Forward button at end', () => {
    (useTimeline as jest.Mock).mockReturnValue({
      ...mockTimeline,
      state: { ...mockTimeline.state, currentTime: 10 },
    });

    render(<PlaybackControls />);
    
    expect(screen.getByText('Step Forward')).toBeDisabled();
  });

  it('toggles play state on Play/Pause click', () => {
    render(<PlaybackControls />);
    
    fireEvent.click(screen.getByText('Play'));
    expect(mockTimeline.setPlaying).toHaveBeenCalledWith(true);

    // Simulate playing state
    (useTimeline as jest.Mock).mockReturnValue({
      ...mockTimeline,
      state: { ...mockTimeline.state, isPlaying: true },
    });

    render(<PlaybackControls />);
    fireEvent.click(screen.getByText('Pause'));
    expect(mockTimeline.setPlaying).toHaveBeenCalledWith(false);
  });

  it('steps back on Step Back click', () => {
    render(<PlaybackControls />);
    
    fireEvent.click(screen.getByText('Step Back'));
    expect(mockTimeline.setPlaying).toHaveBeenCalledWith(false);
    expect(mockTimeline.setCurrentTime).toHaveBeenCalledWith(4); // 5 - 1
  });

  it('steps forward on Step Forward click', () => {
    render(<PlaybackControls />);
    
    fireEvent.click(screen.getByText('Step Forward'));
    expect(mockTimeline.setPlaying).toHaveBeenCalledWith(false);
    expect(mockTimeline.setCurrentTime).toHaveBeenCalledWith(6); // 5 + 1
  });

  it('adds keyboard event listener on mount', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    
    render(<PlaybackControls />);
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', mockHandleKeyDown);
  });

  it('removes keyboard event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
    
    const { unmount } = render(<PlaybackControls />);
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', mockHandleKeyDown);
  });

  it('applies custom className', () => {
    const { container } = render(<PlaybackControls className="custom-class" />);
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('playback-controls');
    expect(element).toHaveClass('custom-class');
  });

  it('applies default classes without custom className', () => {
    const { container } = render(<PlaybackControls />);
    
    const element = container.firstChild as HTMLElement;
    expect(element).toHaveClass('playback-controls');
    expect(element).not.toHaveClass('undefined');
  });

  it('prevents stepping back below 0', () => {
    (useTimeline as jest.Mock).mockReturnValue({
      ...mockTimeline,
      state: { ...mockTimeline.state, currentTime: 0.5 },
    });

    render(<PlaybackControls />);
    
    fireEvent.click(screen.getByText('Step Back'));
    expect(mockTimeline.setCurrentTime).toHaveBeenCalledWith(0);
  });

  it('maintains button order', () => {
    const { container } = render(<PlaybackControls />);
    
    const buttons = container.querySelectorAll('button');
    expect(buttons[0]).toHaveTextContent('Step Back');
    expect(buttons[1]).toHaveTextContent('Play');
    expect(buttons[2]).toHaveTextContent('Step Forward');
  });
});
