import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Mock the usePerformanceMonitor hook
jest.mock('../../hooks/usePerformanceMonitor');

describe('PerformanceMonitor - Warning Tests', () => {
  const mockMetrics = {
    fps: 60,
    frameTime: 16.5,
    memoryUsage: 250,
    textureCount: 50,
    activeClips: 5,
    renderTime: 12.3,
  };

  const mockHistory = Array.from({ length: 10 }, (_, i) => ({
    timestamp: 1000 + i * 100,
    metrics: { ...mockMetrics, fps: 60 - i }
  }));

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('warning callback', () => {
    it('calls onWarning when warnings are present', () => {
      const warnings = ['Low FPS', 'High memory usage'];
      const onWarning = jest.fn();
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: mockMetrics,
        getWarnings: () => warnings,
        getHistory: () => mockHistory,
      }));

      render(<PerformanceMonitor onWarning={onWarning} />);
      expect(onWarning).toHaveBeenCalledWith(warnings);
    });

    it('does not call onWarning when no warnings', () => {
      const onWarning = jest.fn();
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: mockMetrics,
        getWarnings: () => [],
        getHistory: () => mockHistory,
      }));

      render(<PerformanceMonitor onWarning={onWarning} />);
      expect(onWarning).not.toHaveBeenCalled();
    });

    it('does not call onWarning when disabled', () => {
      const warnings = ['Low FPS'];
      const onWarning = jest.fn();
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: mockMetrics,
        getWarnings: () => warnings,
        getHistory: () => mockHistory,
      }));

      render(<PerformanceMonitor enabled={false} onWarning={onWarning} />);
      expect(onWarning).not.toHaveBeenCalled();
    });
  });
});
