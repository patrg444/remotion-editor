import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineTransitionHandle } from '../TimelineTransitionHandle';
import { useTimelineContext } from '../../hooks/useTimelineContext';
import { useSnapPoints } from '../../hooks/useSnapPoints';
import { Track, TimelineMarker } from '../../types/timeline';

// Mock hooks
jest.mock('../../hooks/useTimelineContext');
jest.mock('../../hooks/useSnapPoints');

// Mock data
const mockMarkers: TimelineMarker[] = [
  { id: 'marker1', time: 50, type: 'marker' },
  { id: 'marker2', time: 100, type: 'marker' }
];

const mockTracks: Track[] = [
  {
    id: 'track1',
    name: 'Track 1',
    type: 'video',
    clips: [],
    duration: 100,
    isVisible: true
  }
];

describe('TimelineTransitionHandle', () => {
  const mockOnPositionChange = jest.fn();
  const mockOnDragStart = jest.fn();
  const mockOnDragEnd = jest.fn();

  // Mock hook implementations
  const mockFindNearestSnapPoint = jest.fn();
  const mockGetMarkerSnapPoints = jest.fn();
  const mockGetClipSnapPoints = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock useTimelineContext
    (useTimelineContext as jest.Mock).mockReturnValue({
      state: {
        markers: mockMarkers,
        tracks: mockTracks
      }
    });

    // Mock useSnapPoints
    (useSnapPoints as jest.Mock).mockReturnValue({
      findNearestSnapPoint: mockFindNearestSnapPoint,
      getMarkerSnapPoints: mockGetMarkerSnapPoints,
      getClipSnapPoints: mockGetClipSnapPoints
    });

    // Default snap points behavior
    mockGetMarkerSnapPoints.mockReturnValue([]);
    mockGetClipSnapPoints.mockReturnValue([]);
    mockFindNearestSnapPoint.mockReturnValue(null);
  });

  const renderHandle = (props = {}) => {
    const defaultProps = {
      position: 0,
      onPositionChange: mockOnPositionChange,
      onDragStart: mockOnDragStart,
      onDragEnd: mockOnDragEnd,
      snapThreshold: 10,
      ...props
    };

    return render(<TimelineTransitionHandle {...defaultProps} />);
  };

  describe('Rendering', () => {
    it('renders at the correct position', () => {
      const { container } = renderHandle({ position: 100 });
      const handle = container.querySelector('.timeline-transition-handle');
      expect(handle).toHaveStyle({ left: '100px' });
    });

    it('is draggable', () => {
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle');
      expect(handle).toHaveAttribute('draggable', 'true');
    });
  });

  describe('Drag Behavior', () => {
    it('calls onDragStart when drag begins', () => {
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      fireEvent.dragStart(handle);
      expect(mockOnDragStart).toHaveBeenCalled();
    });

    it('calls onDragEnd when drag ends', () => {
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      fireEvent.dragEnd(handle);
      expect(mockOnDragEnd).toHaveBeenCalled();
    });

    it('updates position during drag without snap points', async () => {
      console.log('\n=== Testing Drag Without Snap Points ===');
      console.log('1. Setting up test environment');
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      expect(handle).toBeTruthy();
      console.log('✓ Found transition handle element');
      
      const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
      console.log('✓ Created mock data transfer');

      // Simulate drag sequence with reduced movement
      console.log('\n2. Starting drag sequence');
      await act(async () => {
        // Initial position
        const startX = 0;
        console.log('Initial position:', startX);
        
        // Start drag
        console.log('Triggering dragStart event');
        fireEvent.dragStart(handle, { 
          dataTransfer: mockDataTransfer, 
          clientX: startX,
          screenX: startX,
          screenY: 0,
          buttons: 1,
          preventDefault: jest.fn()
        });
        await new Promise(resolve => setTimeout(resolve, 150));

        // Perform drag movements
        const movements = [30, 60];
        for (const moveX of movements) {
          console.log(`Moving to position: ${moveX}px`);
          // React's drag event uses pageX/pageY instead of clientX/clientY
          const dragEvent = new MouseEvent('drag', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: moveX,
            screenX: moveX
          });
          Object.defineProperty(dragEvent, 'dataTransfer', {
            value: mockDataTransfer
          });
          fireEvent(handle, dragEvent);
          await new Promise(resolve => setTimeout(resolve, 150));
          
          console.log('Position change calls:', mockOnPositionChange.mock.calls.length);
          const lastCall = mockOnPositionChange.mock.calls[mockOnPositionChange.mock.calls.length - 1];
          console.log('Last reported position:', lastCall?.[0]);
        }

        // End drag
        const finalX = 60;
        console.log('\n3. Ending drag at position:', finalX);
        fireEvent.dragEnd(handle, { 
          dataTransfer: mockDataTransfer,
          clientX: finalX,
          screenX: finalX,
          screenY: 0,
          preventDefault: jest.fn()
        });
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Verify results
      console.log('\n=== Test Results ===');
      console.log('• Total position changes:', mockOnPositionChange.mock.calls.length);
      console.log('• Final position:', mockOnPositionChange.mock.calls[mockOnPositionChange.mock.calls.length - 1]?.[0]);
      expect(mockOnPositionChange).toHaveBeenCalledWith(60);
    });

    it('snaps to nearest point when within threshold', async () => {
      console.log('\n=== Testing Snap Points Behavior ===');
      console.log('1. Setting up test environment');
      
      // Configure snap point
      const snapPoint = { time: 100 };
      mockFindNearestSnapPoint.mockReturnValue(snapPoint);
      console.log('✓ Configured snap point at:', snapPoint.time);
      
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      expect(handle).toBeTruthy();
      console.log('✓ Found transition handle element');
      
      const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
      console.log('✓ Created mock data transfer');

      // Simulate drag sequence with reduced movement
      console.log('\n2. Starting drag sequence');
      await act(async () => {
        // Initial position
        const startX = 0;
        console.log('Initial position:', startX);
        
        // Start drag
        console.log('Triggering dragStart event');
        fireEvent.dragStart(handle, { 
          dataTransfer: mockDataTransfer, 
          clientX: startX,
          screenX: startX,
          screenY: 0,
          buttons: 1,
          preventDefault: jest.fn()
        });
        await new Promise(resolve => setTimeout(resolve, 150));

        // Move near snap point
        const nearSnapX = 95; // Close to snap point at 100
        console.log(`Moving to position near snap point: ${nearSnapX}px`);
          const dragEvent = new MouseEvent('drag', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: nearSnapX,
            screenX: nearSnapX
          });
          Object.defineProperty(dragEvent, 'dataTransfer', {
            value: mockDataTransfer
          });
          fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Log snap point check
        console.log('Checking for snap points:', {
          position: nearSnapX,
          nearestSnap: snapPoint.time,
          threshold: 10
        });

        // End drag
        console.log('\n3. Ending drag');
        fireEvent.dragEnd(handle, { 
          dataTransfer: mockDataTransfer,
          clientX: nearSnapX,
          screenX: nearSnapX,
          screenY: 0,
          preventDefault: jest.fn()
        });
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Verify results
      console.log('\n=== Test Results ===');
      console.log('• Position changes:', mockOnPositionChange.mock.calls.length);
      console.log('• Final snapped position:', snapPoint.time);
      expect(mockOnPositionChange).toHaveBeenCalledWith(snapPoint.time);
    });

    it('ignores snap points outside threshold', async () => {
      mockFindNearestSnapPoint.mockReturnValue(null);
      
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        const dragEvent = new MouseEvent('drag', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 150,
          screenX: 150
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          clientX: 150,
          screenX: 150,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockOnPositionChange).toHaveBeenCalledWith(150);
    });
  });

  describe('Snap Points', () => {
    it('gets snap points from markers', async () => {
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      const markerSnapPoints = [{ time: 50 }, { time: 100 }];
      mockGetMarkerSnapPoints.mockReturnValue(markerSnapPoints);
      
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        const dragEvent = new MouseEvent('drag', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 75,
          screenX: 75
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          clientX: 75,
          screenX: 75,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockGetMarkerSnapPoints).toHaveBeenCalledWith(mockMarkers);
    });

    it('gets snap points from clips', async () => {
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      const clipSnapPoints = [{ time: 0 }, { time: 10 }];
      mockGetClipSnapPoints.mockReturnValue(clipSnapPoints);
      
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        const dragEvent = new MouseEvent('drag', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 5,
          screenX: 5
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          clientX: 5,
          screenX: 5,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockGetClipSnapPoints).toHaveBeenCalledWith(mockTracks);
    });

    it('uses custom snap threshold', async () => {
      const customThreshold = 20;
      const { container } = renderHandle({ snapThreshold: customThreshold });
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      const markerSnapPoints = [{ time: 50 }];
      const clipSnapPoints = [{ time: 0 }];
      mockGetMarkerSnapPoints.mockReturnValue(markerSnapPoints);
      mockGetClipSnapPoints.mockReturnValue(clipSnapPoints);
      
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        const dragEvent = new MouseEvent('drag', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 95,
          screenX: 95
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          clientX: 95,
          screenX: 95,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockFindNearestSnapPoint).toHaveBeenCalledWith(
        95,
        [...markerSnapPoints, ...clipSnapPoints],
        customThreshold
      );
    });
  });

  describe('Edge Cases', () => {
    it('handles missing markers', async () => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: {
          tracks: mockTracks
        }
      });

      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        const dragEvent = new MouseEvent('drag', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 100,
          screenX: 100
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          clientX: 100,
          screenX: 100,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockGetMarkerSnapPoints).toHaveBeenCalledWith([]);
    });

    it('handles missing tracks', async () => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: {
          markers: mockMarkers
        }
      });

      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        const dragEvent = new MouseEvent('drag', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: 100,
          screenX: 100
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          clientX: 100,
          screenX: 100,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockGetClipSnapPoints).toHaveBeenCalledWith(undefined);
    });

    it('handles drag event without clientX', async () => {
      const { container } = renderHandle();
      const handle = container.querySelector('.timeline-transition-handle')!;
      
      // When clientX is undefined, the drag event should be ignored
      await act(async () => {
        const mockDataTransfer = { setData: jest.fn(), getData: jest.fn() };
        const startEvent = { 
          dataTransfer: mockDataTransfer, 
          clientX: 0,
          screenX: 0,
          screenY: 0,
          buttons: 1 
        };
        // Create drag event without any coordinates to simulate invalid drag
        const dragEvent = new Event('drag', {
          bubbles: true,
          cancelable: true
        });
        Object.defineProperty(dragEvent, 'dataTransfer', {
          value: mockDataTransfer
        });
        const endEvent = { 
          dataTransfer: mockDataTransfer,
          screenX: 0,
          screenY: 0
        };
        
        // Simulate drag sequence
        fireEvent.dragStart(handle, { ...startEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent(handle, dragEvent);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        fireEvent.dragEnd(handle, { ...endEvent, preventDefault: jest.fn() });
        await new Promise(resolve => setTimeout(resolve, 100));
      });
      expect(mockOnPositionChange).not.toHaveBeenCalled();
    });
  });
});
