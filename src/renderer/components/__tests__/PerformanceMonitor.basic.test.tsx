import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Mock the usePerformanceMonitor hook
jest.mock('../../hooks/usePerformanceMonitor');

describe('PerformanceMonitor - Basic Tests', () => {
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

  const mockWarnings: string[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
      metrics: mockMetrics,
      getWarnings: () => mockWarnings,
      getHistory: () => mockHistory,
    }));
  });

  describe('visibility', () => {
    it('renders when enabled is true', () => {
      render(<PerformanceMonitor enabled={true} />);
      expect(screen.getByText('FPS')).toBeInTheDocument();
    });

    it('does not render when enabled is false', () => {
      render(<PerformanceMonitor enabled={false} />);
      expect(screen.queryByText('FPS')).not.toBeInTheDocument();
    });
  });
});
