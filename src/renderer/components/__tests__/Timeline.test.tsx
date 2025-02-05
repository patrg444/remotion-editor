import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Timeline } from '../Timeline';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { Track, ProductionClip } from '../../types/timeline';

// Mock clip data
const mockClip: ProductionClip = {
  id: 'clip1',
  type: 'video',
  source: 'video1.mp4',
  startTime: 0,
  duration: 10,
  inPoint: 0,
  outPoint: 10,
  volume: 1,
  isMuted: false,
  isLocked: false,
  opacity: 1,
  name: 'Test Clip',
  trackId: 'track1',
  thumbnail: new ImageData(1, 1),
  trackStart: 0,
  trackEnd: 10
};

// Mock track data
const mockTrack: Track = {
  id: 'track1',
  name: 'Video Track 1',
  type: 'video',
  clips: [mockClip],
  duration: 10,
  isLocked: false,
  isMuted: false,
  isSolo: false,
  height: 100,
  isVisible: true,
  index: 0
};

describe('Timeline', () => {
  const mockOnTrackClick = jest.fn();
  const mockOnTrackDrop = jest.fn();
  const mockOnClipDrop = jest.fn();
  const mockOnZoomChange = jest.fn();
  const mockOnTimeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderTimeline = (props = {}) => {
    const defaultProps = {
      tracks: [mockTrack],
      currentTime: 0,
      duration: 10,
      zoom: 1,
      fps: 30,
      isPlaying: false,
      selectedTrackId: undefined,
      onTrackClick: mockOnTrackClick,
      onTrackDrop: mockOnTrackDrop,
      onClipDrop: mockOnClipDrop,
      onZoomChange: mockOnZoomChange,
      onTimeChange: mockOnTimeChange,
      ...props
    };

    return render(
      <TimelineProvider>
        <Timeline {...defaultProps} />
      </TimelineProvider>
    );
  };

  describe('Timeline Display', () => {
    it('renders timeline ruler', () => {
      renderTimeline();
      expect(screen.getByTestId('timeline-ruler-svg')).toBeInTheDocument();
    });

    it('renders timeline playhead', () => {
      renderTimeline();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders tracks', () => {
      renderTimeline();
      expect(screen.getByText('Video Track 1')).toBeInTheDocument();
    });

    it('applies correct content width based on duration and zoom', () => {
      const { container } = renderTimeline({ duration: 20, zoom: 2 });
      const content = container.querySelector('.timeline-content');
      expect(content).toHaveStyle({ width: '40px' }); // duration * zoom
    });
  });

  describe('Track Interaction', () => {
    it('handles track click', () => {
      renderTimeline();
      const track = screen.getByText('Video Track 1').closest('[data-testid="timeline-track"]')!;
      fireEvent.click(track);
      expect(mockOnTrackClick).toHaveBeenCalledWith('track1');
    });

    it('handles track drop', () => {
      renderTimeline();
      const track = screen.getByText('Video Track 1').closest('[data-testid="timeline-track"]')!;
      const mockDataTransfer = {
        getData: jest.fn().mockImplementation((key) => {
          if (key === 'track-id') return 'track1';
          return '';
        })
      };

      fireEvent.drop(track, { dataTransfer: mockDataTransfer });
      expect(mockOnTrackDrop).toHaveBeenCalledWith('track1', expect.any(Number));
    });

    it('handles clip drop', () => {
      renderTimeline();
      const track = screen.getByText('Video Track 1').closest('[data-testid="timeline-track"]')!;
      const mockDataTransfer = {
        getData: jest.fn().mockImplementation((key) => {
          if (key === 'clip-id') return 'clip1';
          if (key === 'source-track-id') return 'track1';
          return '';
        })
      };

      fireEvent.drop(track, { dataTransfer: mockDataTransfer });
      expect(mockOnClipDrop).toHaveBeenCalledWith('clip1', 'track1', 'track1', expect.any(Number));
    });
  });

  describe('Zoom Behavior', () => {
    it('updates zoom when prop changes', () => {
      const { rerender } = renderTimeline({ zoom: 1 });
      rerender(
        <TimelineProvider>
          <Timeline
            tracks={[mockTrack]}
            currentTime={0}
            duration={10}
            zoom={2}
            fps={30}
            isPlaying={false}
            onTrackClick={mockOnTrackClick}
            onTrackDrop={mockOnTrackDrop}
            onClipDrop={mockOnClipDrop}
            onZoomChange={mockOnZoomChange}
            onTimeChange={mockOnTimeChange}
          />
        </TimelineProvider>
      );
      expect(mockOnZoomChange).toHaveBeenCalledWith(2);
    });

    it('clamps zoom value between 0.1 and 10', () => {
      const { rerender } = renderTimeline({ zoom: 1 });
      
      // Test minimum zoom
      rerender(
        <TimelineProvider>
          <Timeline
            tracks={[mockTrack]}
            currentTime={0}
            duration={10}
            zoom={0.05}
            fps={30}
            isPlaying={false}
            onTrackClick={mockOnTrackClick}
            onTrackDrop={mockOnTrackDrop}
            onClipDrop={mockOnClipDrop}
            onZoomChange={mockOnZoomChange}
            onTimeChange={mockOnTimeChange}
          />
        </TimelineProvider>
      );
      expect(mockOnZoomChange).toHaveBeenCalledWith(0.1);

      // Test maximum zoom
      rerender(
        <TimelineProvider>
          <Timeline
            tracks={[mockTrack]}
            currentTime={0}
            duration={10}
            zoom={15}
            fps={30}
            isPlaying={false}
            onTrackClick={mockOnTrackClick}
            onTrackDrop={mockOnTrackDrop}
            onClipDrop={mockOnClipDrop}
            onZoomChange={mockOnZoomChange}
            onTimeChange={mockOnTimeChange}
          />
        </TimelineProvider>
      );
      expect(mockOnZoomChange).toHaveBeenCalledWith(10);
    });
  });

  describe('Scroll Behavior', () => {
    it('handles scroll events', () => {
      const { container } = renderTimeline();
      const timelineContainer = container.querySelector('.timeline-container')!;
      
      fireEvent.scroll(timelineContainer, { target: { scrollLeft: 100 } });
      // Verify the scroll position is maintained
      expect(timelineContainer.scrollLeft).toBe(100);
    });
  });

  describe('Time Change', () => {
    it('handles time change from playhead', async () => {
      console.log('=== Starting Timeline Playhead Test ===');
      console.log('1. Initializing test environment');
      const { container } = renderTimeline();
      console.log('✓ Timeline component rendered');

      const timeline = container.querySelector('.timeline-container')!;
      console.log('✓ Timeline container found:', {
        exists: !!timeline,
        className: timeline?.className
      });

      // Wait for playhead to be available
      console.log('\n2. Locating playhead element');
      const playhead = await screen.findByRole('slider');
      console.log('✓ Playhead element found:', {
        role: playhead.getAttribute('role'),
        ariaLabel: playhead.getAttribute('aria-label')
      });

      console.log('\n3. Setting up timeline dimensions');
      const zoom = 1; // Base zoom level
      const duration = 10; // Timeline duration in seconds
      const startTime = 0; // Initial playhead position
      
      // Calculate initial playhead position in pixels
      const startPosition = startTime * zoom;
      console.log('Initial position:', {
        startTime,
        zoom,
        startPosition,
        duration
      });

      // Find the playhead handle specifically
      const playheadHandle = playhead.querySelector('g');
      expect(playheadHandle).toBeTruthy();
      console.log('✓ Found playhead handle element');

      // Simulate drag sequence
      console.log('\n4. Starting drag sequence');
      
      // Initial mousedown on playhead handle
      await act(async () => {
        const startX = 100; // Starting X coordinate
        console.log('Mousedown at:', startX);
        fireEvent.mouseDown(playheadHandle!, {
          clientX: startX,
          button: 0,
          bubbles: true
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Simulate small, controlled movements
      console.log('\n5. Simulating drag movements');
      for (let i = 1; i <= 3; i++) {
        await act(async () => {
          // Move in small increments (10px = 0.1 seconds at zoom level 1)
          const moveX = 100 + (i * 10);
          console.log(`Movement ${i}: clientX = ${moveX}`);
          
          fireEvent.mouseMove(document, {
            clientX: moveX,
            buttons: 1,
            bubbles: true
          });
          
          // Log expected time change
          const expectedDelta = (10 / (zoom * 100)); // 10px movement
          console.log(`Expected time change: +${expectedDelta.toFixed(3)}s`);
          
          await new Promise(resolve => setTimeout(resolve, 100));
        });
      }

      // Release mouse
      await act(async () => {
        console.log('\n6. Releasing mouse button');
        fireEvent.mouseUp(document, {
          clientX: 130, // Final position after 3 movements of 10px
          bubbles: true
        });
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      // Verify time changes
      console.log('\n7. Verifying results');
      expect(mockOnTimeChange).toHaveBeenCalled();
      const timeChangeCalls = mockOnTimeChange.mock.calls;
      console.log('Time change calls:', timeChangeCalls.length);
      timeChangeCalls.forEach((call, i) => {
        console.log(`Call ${i + 1}: time = ${call[0]}`);
      });
      
      console.log('\n=== Test Results ===');
      console.log('• onTimeChange called:', mockOnTimeChange.mock.calls.length, 'times');
      console.log('• Last time value:', mockOnTimeChange.mock.calls[mockOnTimeChange.mock.calls.length - 1]?.[0]);
      expect(mockOnTimeChange).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('provides timeline role and label', () => {
      renderTimeline();
      expect(screen.getByRole('slider')).toHaveAccessibleName(/playhead/i);
    });

    it('supports keyboard navigation', () => {
      renderTimeline();
      const playhead = screen.getByRole('slider');
      
      fireEvent.keyDown(playhead, { key: 'ArrowRight' });
      expect(mockOnTimeChange).toHaveBeenCalled();
    });
  });
});
