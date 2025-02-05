import React from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { GPUMonitor } from '../GPUMonitor';
import * as MockedUseGPU from '../../hooks/useGPU';

// Mock the real module path
jest.mock('../../hooks/useGPU');

describe('GPUMonitor', () => {
  beforeEach(() => {
    (MockedUseGPU as any).__clearCallbacks?.();
  });

  const getMemoryText = () => screen.getByText(/GPU Memory:/).textContent;
  const getUtilizationText = () => screen.getByText(/GPU Utilization:/).textContent;
  const getTemperatureText = () => screen.getByText(/GPU Temperature:/).textContent;

  it('renders initial GPU stats', () => {
    render(<GPUMonitor />);

    // Initial state should show zeros
    expect(getMemoryText()).toBe('GPU Memory: 0MB / 0MB');
    expect(getUtilizationText()).toBe('GPU Utilization: 0%');
    expect(getTemperatureText()).toBe('GPU Temperature: 0°C');
  });

  it('updates when GPU stats change', () => {
    render(<GPUMonitor />);

    // Update stats through the mock
    act(() => {
      (MockedUseGPU as any).__updateStats({
        memoryUsed: 1024 * 1024 * 512, // 512 MB
        memoryTotal: 1024 * 1024 * 1024, // 1 GB
        utilization: 75,
        temperature: 70
      });
    });

    // Check if the display updates
    expect(getMemoryText()).toBe('GPU Memory: 512MB / 1024MB');
    expect(getUtilizationText()).toBe('GPU Utilization: 75%');
    expect(getTemperatureText()).toBe('GPU Temperature: 70°C');
  });

  it('applies className prop correctly', () => {
    const { container } = render(<GPUMonitor className="test-class" />);
    expect(container.firstChild).toHaveClass('test-class');
  });

  it('handles zero values correctly', () => {
    render(<GPUMonitor />);
    act(() => {
      (MockedUseGPU as any).__updateStats({
        memoryUsed: 0,
        memoryTotal: 0,
        utilization: 0,
        temperature: 0
      });
    });

    expect(getMemoryText()).toBe('GPU Memory: 0MB / 0MB');
    expect(getUtilizationText()).toBe('GPU Utilization: 0%');
    expect(getTemperatureText()).toBe('GPU Temperature: 0°C');
  });

  it('rounds decimal values correctly', () => {
    render(<GPUMonitor />);
    act(() => {
      (MockedUseGPU as any).__updateStats({
        memoryUsed: 1024 * 1024 * 123.456, // ~123.5 MB
        memoryTotal: 1024 * 1024 * 1024.789,
        utilization: 45.678,
        temperature: 65.432
      });
    });

    expect(getMemoryText()).toBe('GPU Memory: 123MB / 1025MB');
    expect(getUtilizationText()).toBe('GPU Utilization: 46%');
    expect(getTemperatureText()).toBe('GPU Temperature: 65°C');
  });
});
