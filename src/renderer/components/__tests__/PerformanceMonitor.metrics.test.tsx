import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Mock the usePerformanceMonitor hook
jest.mock('../../hooks/usePerformanceMonitor');

describe('PerformanceMonitor - Metrics Tests', () => {
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

  describe('metrics display', () => {
    it('shows all performance metrics', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('60')).toBeInTheDocument(); // FPS
      expect(screen.getByText('16.5ms')).toBeInTheDocument(); // Frame Time
      expect(screen.getByText('250MB')).toBeInTheDocument(); // Memory
      expect(screen.getByText('50')).toBeInTheDocument(); // Textures
      expect(screen.getByText('5')).toBeInTheDocument(); // Active Clips
      expect(screen.getByText('12.3ms')).toBeInTheDocument(); // Render Time
    });

    it('adds warning class to low FPS', () => {
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: { ...mockMetrics, fps: 25 },
        getWarnings: () => mockWarnings,
        getHistory: () => mockHistory,
      }));
      render(<PerformanceMonitor />);
      expect(screen.getByText('25')).toHaveClass('warning');
    });

    it('adds warning class to high frame time', () => {
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: { ...mockMetrics, frameTime: 35 },
        getWarnings: () => mockWarnings,
        getHistory: () => mockHistory,
      }));
      render(<PerformanceMonitor />);
      expect(screen.getByText('35.0ms')).toHaveClass('warning');
    });

    it('adds warning class to high memory usage', () => {
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: { ...mockMetrics, memoryUsage: 600 },
        getWarnings: () => mockWarnings,
        getHistory: () => mockHistory,
      }));
      render(<PerformanceMonitor />);
      expect(screen.getByText('600MB')).toHaveClass('warning');
    });

    it('adds warning class to high texture count', () => {
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: { ...mockMetrics, textureCount: 120 },
        getWarnings: () => mockWarnings,
        getHistory: () => mockHistory,
      }));
      render(<PerformanceMonitor />);
      expect(screen.getByText('120')).toHaveClass('warning');
    });

    it('adds warning class to high render time', () => {
      (usePerformanceMonitor as jest.Mock).mockImplementation(() => ({
        metrics: { ...mockMetrics, renderTime: 18 },
        getWarnings: () => mockWarnings,
        getHistory: () => mockHistory,
      }));
      render(<PerformanceMonitor />);
      expect(screen.getByText('18.0ms')).toHaveClass('warning');
    });
  });

  describe('accessibility', () => {
    it('has metric labels', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('FPS')).toHaveClass('metric-label');
      expect(screen.getByText('Frame Time')).toHaveClass('metric-label');
      expect(screen.getByText('Memory')).toHaveClass('metric-label');
      expect(screen.getByText('Textures')).toHaveClass('metric-label');
      expect(screen.getByText('Active Clips')).toHaveClass('metric-label');
      expect(screen.getByText('Render Time')).toHaveClass('metric-label');
    });

    it('has metric values', () => {
      render(<PerformanceMonitor />);
      expect(screen.getByText('60')).toHaveClass('metric-value');
      expect(screen.getByText('16.5ms')).toHaveClass('metric-value');
      expect(screen.getByText('250MB')).toHaveClass('metric-value');
      expect(screen.getByText('50')).toHaveClass('metric-value');
      expect(screen.getByText('5')).toHaveClass('metric-value');
      expect(screen.getByText('12.3ms')).toHaveClass('metric-value');
    });
  });
});
