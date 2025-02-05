import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimelinePlayhead } from '../TimelinePlayhead';

describe('TimelinePlayhead', () => {
  const defaultProps = {
    duration: 10,
    frameRate: 30,
    zoom: 1,
    currentTime: 5,
    isPlaying: false,
    onTimeChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any rendered components
    screen.queryAllByRole('slider').forEach(node => node.remove());
  });

  describe('rendering', () => {
    it('renders playhead at correct position', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('.timeline-playhead');
      
      expect(playhead).toHaveStyle({
        transform: 'translateX(5px)', // currentTime * zoom
      });
    });

    it('applies zoom level to position', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} zoom={2} />);
      const playhead = container.querySelector('.timeline-playhead');
      
      expect(playhead).toHaveStyle({
        transform: 'translateX(10px)', // currentTime * zoom
      });
    });

    it('shows playing state when isPlaying is true', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} isPlaying />);
      const playhead = container.querySelector('.timeline-playhead');
      
      expect(playhead).toHaveClass('playing');
    });
  });

  describe('mouse interaction', () => {
    const addMouseEventListeners = jest.spyOn(document, 'addEventListener');
    const removeMouseEventListeners = jest.spyOn(document, 'removeEventListener');

    beforeEach(() => {
      addMouseEventListeners.mockClear();
      removeMouseEventListeners.mockClear();
    });

    it('starts dragging on left mouse down', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('g');
      
      fireEvent.mouseDown(playhead!, { button: 0, clientX: 100 });
      
      expect(addMouseEventListeners).toHaveBeenCalledTimes(2);
      expect(addMouseEventListeners).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(addMouseEventListeners).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('ignores non-left mouse clicks', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('g');
      
      fireEvent.mouseDown(playhead!, { button: 2, clientX: 100 });
      
      expect(addMouseEventListeners).not.toHaveBeenCalled();
    });

    it('updates time on mouse move', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('g');
      
      // Start drag
      fireEvent.mouseDown(playhead!, { button: 0, clientX: 100 });
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 200 });
      
      // Calculate expected time change: (200 - 100) / (zoom * 100)
      expect(defaultProps.onTimeChange).toHaveBeenCalledWith(expect.any(Number));
    });

    it('clamps time between 0 and duration', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('g');
      
      // Start drag
      fireEvent.mouseDown(playhead!, { button: 0, clientX: 100 });
      
      // Move mouse far left (should clamp to 0)
      fireEvent.mouseMove(document, { clientX: -1000 });
      expect(defaultProps.onTimeChange).toHaveBeenCalledWith(0);
      
      // Move mouse far right (should clamp to duration)
      fireEvent.mouseMove(document, { clientX: 2000 });
      expect(defaultProps.onTimeChange).toHaveBeenCalledWith(10);
    });

    it('snaps to frames when zoomed in', () => {
      const onTimeChange = jest.fn();
      const { container } = render(
        <TimelinePlayhead {...defaultProps} zoom={25} onTimeChange={onTimeChange} />
      );
      const playhead = container.querySelector('g');
      
      // Start drag
      fireEvent.mouseDown(playhead!, { button: 0, clientX: 100 });
      
      // Move mouse
      fireEvent.mouseMove(document, { clientX: 110 });
      
      // Should snap to nearest frame
      const frameTime = 1 / 30;
      const lastCall = onTimeChange.mock.calls[onTimeChange.mock.calls.length - 1][0];
      expect(lastCall % frameTime).toBeCloseTo(0, 10);
    });

    it('stops dragging on mouse up', () => {
      const { container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('g');
      
      // Start drag
      fireEvent.mouseDown(playhead!, { button: 0, clientX: 100 });
      
      // End drag
      fireEvent.mouseUp(document);
      
      expect(removeMouseEventListeners).toHaveBeenCalledTimes(2);
      expect(removeMouseEventListeners).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeMouseEventListeners).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount, container } = render(<TimelinePlayhead {...defaultProps} />);
      const playhead = container.querySelector('g');
      
      // Start drag
      fireEvent.mouseDown(playhead!, { button: 0, clientX: 100 });
      
      unmount();
      
      expect(removeMouseEventListeners).toHaveBeenCalledWith('mousemove', expect.any(Function));
      expect(removeMouseEventListeners).toHaveBeenCalledWith('mouseup', expect.any(Function));
    });
  });

  describe('keyboard interaction', () => {
    it('moves one frame left on ArrowLeft', () => {
      render(<TimelinePlayhead {...defaultProps} />);
      const playhead = screen.getByRole('slider');
      
      fireEvent.keyDown(playhead, { key: 'ArrowLeft' });
      
      expect(defaultProps.onTimeChange).toHaveBeenCalledWith(5 - 1/30);
    });

    it('moves one frame right on ArrowRight', () => {
      render(<TimelinePlayhead {...defaultProps} />);
      const playhead = screen.getByRole('slider');
      
      fireEvent.keyDown(playhead, { key: 'ArrowRight' });
      
      expect(defaultProps.onTimeChange).toHaveBeenCalledWith(5 + 1/30);
    });

    it('clamps keyboard navigation to duration bounds', () => {
      // Test left boundary
      const { container: container1 } = render(<TimelinePlayhead {...defaultProps} currentTime={0} />);
      const leftPlayhead = container1.querySelector('svg');
      fireEvent.keyDown(leftPlayhead!, { key: 'ArrowLeft' });
      expect(defaultProps.onTimeChange).toHaveBeenLastCalledWith(0);
      
      // Test right boundary
      defaultProps.onTimeChange.mockClear();
      const { container: container2 } = render(<TimelinePlayhead {...defaultProps} currentTime={10} />);
      const rightPlayhead = container2.querySelector('svg');
      fireEvent.keyDown(rightPlayhead!, { key: 'ArrowRight' });
      expect(defaultProps.onTimeChange).toHaveBeenLastCalledWith(10);
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<TimelinePlayhead {...defaultProps} />);
      const playhead = screen.getByRole('slider');
      
      expect(playhead).toHaveAttribute('aria-valuemin', '0');
      expect(playhead).toHaveAttribute('aria-valuemax', '10');
      expect(playhead).toHaveAttribute('aria-valuenow', '5');
      expect(playhead).toHaveAttribute('aria-label', 'playhead at 5.00 seconds');
    });

    it('is focusable', () => {
      render(<TimelinePlayhead {...defaultProps} />);
      const playhead = screen.getByRole('slider');
      
      expect(playhead).toHaveAttribute('tabindex', '0');
    });
  });
});
