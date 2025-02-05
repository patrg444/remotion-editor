import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Mock the usePerformanceMonitor hook
jest.mock('../../hooks/usePerformanceMonitor');

describe('PerformanceMonitor - Graph Tests', () => {
  const mockMetrics = {
    fps: 30,
    frameTime: 8.5,
    memoryUsage: 125,
    textureCount: 25,
    activeClips: 3,
    renderTime: 6.3,
  };

  // Using smaller history length and lower FPS values for less intensive testing
  const mockHistory = Array.from({ length: 3 }, (_, i) => ({
    timestamp: 1000 + i * 200, // Increased time gap between samples
    metrics: { ...mockMetrics, fps: 30 - (i * 2) } // Lower FPS range: 30-26
  }));

  const mockWarnings: string[] = [];

  beforeEach(() => {
    console.log('beforeEach: Clearing all mocks');
    jest.clearAllMocks();
    (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
      metrics: mockMetrics,
      getWarnings: () => mockWarnings,
      getHistory: () => mockHistory,
    }));
  });

  describe('graph rendering', () => {
    it('shows graph when showGraph is true', () => {
      console.log('Testing graph visibility');
      render(<PerformanceMonitor showGraph={true} />);
      const canvas = screen.getByRole('img', { hidden: true });
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe('CANVAS');
      expect(canvas).toHaveClass('performance-graph');
    });

    it('hides graph when showGraph is false', () => {
      console.log('Testing graph hidden state');
      render(<PerformanceMonitor showGraph={false} />);
      expect(screen.queryByRole('img', { hidden: true })).not.toBeInTheDocument();
    });

    it('creates canvas with correct dimensions', () => {
      console.log('Testing canvas dimensions');
      render(<PerformanceMonitor showGraph={true} />);
      const canvas = screen.getByRole('img', { hidden: true }) as HTMLCanvasElement;
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(100);
    });

    it('draws graph when metrics update', async () => {
      console.log('Test start: Creating mock functions');
      // Create local mocks for canvas context methods
      const localMockClearRect = jest.fn().mockImplementation((...args) => {
        console.log('localMockClearRect called with args:', args);
      });
      const localMockFillRect = jest.fn().mockImplementation((...args) => {
        console.log('localMockFillRect called with args:', args);
      });
      const localMockBeginPath = jest.fn().mockImplementation(() => {
        console.log('localMockBeginPath called');
      });
      const localMockMoveTo = jest.fn().mockImplementation((...args) => {
        console.log('localMockMoveTo called with args:', args);
      });
      const localMockLineTo = jest.fn().mockImplementation((...args) => {
        console.log('localMockLineTo called with args:', args);
      });
      const localMockStroke = jest.fn().mockImplementation(() => {
        console.log('localMockStroke called');
      });

      console.log('Creating mock context');
      // Create mock context with our local mocks
      const mockContext = {
        clearRect: localMockClearRect,
        fillRect: localMockFillRect,
        beginPath: localMockBeginPath,
        moveTo: localMockMoveTo,
        lineTo: localMockLineTo,
        stroke: localMockStroke,
        fillStyle: '',
        strokeStyle: '',
        lineWidth: 1,
        canvas: { width: 300, height: 100 }
      };

      console.log('Setting up getContext spy');
      // Mock getContext to return our local mock context
      const getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, 'getContext')
        .mockImplementation((contextId) => {
          console.log('getContext called with:', contextId);
          return mockContext as any;
        });

      // Setup initial state with lower intensity metrics
      console.log('Setting up initial state with lower intensity metrics');
      const initialHistory = Array.from({ length: 3 }, (_, i) => ({
        timestamp: 1000 + i * 200,
        metrics: { ...mockMetrics, fps: 20 - (i * 2) } // Lower FPS range: 20-16
      }));

      // Setup hook mock with a function to update metrics
      let currentMetrics = { ...mockMetrics };
      let currentHistory = initialHistory;
      const getHistory = jest.fn(() => {
        console.log('getHistory called, returning history with length:', currentHistory.length);
        console.log('Current history FPS values:', currentHistory.map(h => h.metrics.fps));
        return currentHistory;
      });

      console.log('Setting up usePerformanceMonitor mock');
      // Setup mock implementation
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: currentMetrics,
        getWarnings: () => mockWarnings,
        getHistory,
      }));

      console.log('Initial render');
      // Initial render
      const { rerender } = render(<PerformanceMonitor showGraph={true} />);

      console.log('Waiting for initial render effects');
      // Wait for initial render effects to complete with increased intervals
      await waitFor(() => {
        console.log('Checking initial render expectations');
        console.log('localMockClearRect.mock.calls:', localMockClearRect.mock.calls);
        console.log('localMockFillRect.mock.calls:', localMockFillRect.mock.calls);
        console.log('localMockBeginPath.mock.calls:', localMockBeginPath.mock.calls);
        console.log('localMockStroke.mock.calls:', localMockStroke.mock.calls);
        
        expect(localMockClearRect).toHaveBeenCalledWith(0, 0, 300, 100);
        expect(localMockFillRect).toHaveBeenCalledWith(0, 0, 300, 100);
        expect(localMockBeginPath).toHaveBeenCalledTimes(2);
        expect(localMockStroke).toHaveBeenCalledTimes(2);
        expect(getHistory).toHaveBeenCalled();
      }, { interval: 200, timeout: 6000 }); // Increased intervals for less pressure

      console.log('Clearing mocks after initial render');
      // Clear mocks after initial render
      jest.clearAllMocks();

      console.log('Updating metrics and history with lower intensity values');
      // Update metrics and history with lower values
      const updatedHistory = Array.from({ length: 3 }, (_, i) => ({
        timestamp: 2000 + i * 200,
        metrics: { ...mockMetrics, fps: 10 - i } // Lower FPS range: 10-8
      }));

      // Update state and trigger re-render
      await act(async () => {
        currentMetrics = { ...mockMetrics, fps: 10 };
        currentHistory = updatedHistory;
        console.log('Triggering re-render with updated metrics:', currentMetrics);
        
        // Update the mock implementation to return new values
        (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
          metrics: currentMetrics,
          getWarnings: () => mockWarnings,
          getHistory,
        }));

        rerender(<PerformanceMonitor showGraph={true} />);
        
        // Force a new render cycle
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      console.log('Waiting for re-render effects');
      // Wait for re-render effects to complete with increased intervals
      await waitFor(() => {
        console.log('Checking re-render expectations');
        console.log('getHistory calls:', getHistory.mock.calls.length);
        console.log('localMockClearRect.mock.calls:', localMockClearRect.mock.calls);
        console.log('localMockFillRect.mock.calls:', localMockFillRect.mock.calls);
        console.log('localMockBeginPath.mock.calls:', localMockBeginPath.mock.calls);
        console.log('localMockStroke.mock.calls:', localMockStroke.mock.calls);

        expect(getHistory).toHaveBeenCalled();
        expect(localMockClearRect).toHaveBeenCalledWith(0, 0, 300, 100);
        expect(localMockFillRect).toHaveBeenCalledWith(0, 0, 300, 100);
        expect(localMockBeginPath).toHaveBeenCalledTimes(2);
        expect(localMockStroke).toHaveBeenCalledTimes(2);
      }, { interval: 200, timeout: 6000 }); // Increased intervals for less pressure

      console.log('Test cleanup: Restoring getContext spy');
      // Clean up
      getContextSpy.mockRestore();
    });
  });
});
