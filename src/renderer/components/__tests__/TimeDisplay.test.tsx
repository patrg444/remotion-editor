import React from 'react';
import { render, screen } from '@testing-library/react';
import { TimeDisplay } from '../TimeDisplay';
import { TimelineContext } from '../../contexts/TimelineContext';
import { TimelineContextValue, TimelineState } from '../../types/timeline';

// Mock TimelineContext
const mockTimelineContext = (currentTime: number, duration: number, fps: number): TimelineContextValue => ({
  state: {
    tracks: [],
    currentTime,
    duration,
    zoom: 1,
    fps,
    isPlaying: false,
    selectedTrackIds: [],
    selectedClipIds: [],
    history: {
      past: [],
      present: {
        id: '1',
        type: 'init',
        timestamp: Date.now(),
        description: 'Initial state',
        data: {},
        undo: () => {},
        redo: () => {},
      },
      future: [],
      undoStack: []
    },
    historyIndex: 0,
    playhead: currentTime,
    selection: null,
    currentState: null,
    undoStack: []
  } as TimelineState,
  dispatch: jest.fn(),
});

const renderWithContext = (currentTime: number, duration: number, fps: number = 30) => {
  return render(
    <TimelineContext.Provider value={mockTimelineContext(currentTime, duration, fps)}>
      <TimeDisplay />
    </TimelineContext.Provider>
  );
};

describe('TimeDisplay', () => {
  it('renders current time and duration with default fps', () => {
    renderWithContext(65.5, 120.75);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('01:05:15');
    expect(screen.getByLabelText('duration')).toHaveTextContent('02:00:23'); // Adjusted for rounding
  });

  it('handles negative time values by using 0', () => {
    renderWithContext(-10.5, 60);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:00:00');
  });

  it('handles zero fps correctly', () => {
    renderWithContext(30.5, 60, 0);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:30:00');
    expect(screen.getByLabelText('duration')).toHaveTextContent('01:00:00');
  });

  it('handles different fps values', () => {
    renderWithContext(10.5, 20.75, 24);
    
    // At 24fps, 10.5 seconds = 252 frames total
    // 252 frames = 10 seconds (240 frames) + 12 frames
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:10:12');
  });

  it('rounds time values close to whole numbers', () => {
    renderWithContext(59.999, 60.001);
    
    // The component rounds to millisecond precision first
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:59:00');
    expect(screen.getByLabelText('duration')).toHaveTextContent('01:00:00');
  });

  it('pads numbers with leading zeros', () => {
    renderWithContext(5.5, 9.25);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:05:15');
    expect(screen.getByLabelText('duration')).toHaveTextContent('00:09:08'); // Adjusted for rounding
  });

  it('applies correct CSS classes', () => {
    const { container } = renderWithContext(30, 60);
    
    expect(container.firstChild).toHaveClass('time-display');
    expect(screen.getByLabelText('current time')).toBeInTheDocument();
    expect(screen.getByText('/')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByLabelText('duration')).toBeInTheDocument();
  });

  it('handles very large time values', () => {
    renderWithContext(3600.5, 7200.75); // 1 hour and 2 hours
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('60:00:15');
    expect(screen.getByLabelText('duration')).toHaveTextContent('120:00:23'); // Adjusted for rounding
  });
});
