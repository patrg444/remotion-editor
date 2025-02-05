import { renderHook, act } from '@testing-library/react-hooks';
import { useGPU, __updateStats, __clearCallbacks } from '../__mocks__/useGPU';
import { GPUStats } from '../../types/api';

describe('useGPU', () => {
  const mockOnStatsUpdate = jest.fn();

  beforeEach(() => {
    mockOnStatsUpdate.mockClear();
    __clearCallbacks();
  });

  it('initializes with default stats', () => {
    const { result } = renderHook(() => useGPU(mockOnStatsUpdate));

    expect(result.current).toEqual({
      memoryUsed: 0,
      memoryTotal: 0,
      utilization: 0,
      temperature: 0
    });
    expect(mockOnStatsUpdate).not.toHaveBeenCalled();
  });

  it('updates stats and calls callback when stats change', () => {
    const { result } = renderHook(() => useGPU(mockOnStatsUpdate));

    const newStats: GPUStats = {
      memoryUsed: 1024,
      memoryTotal: 4096,
      utilization: 50,
      temperature: 75
    };

    act(() => {
      __updateStats(newStats);
    });

    expect(result.current).toEqual(newStats);
    expect(mockOnStatsUpdate).toHaveBeenCalledWith(newStats);
    expect(mockOnStatsUpdate).toHaveBeenCalledTimes(1);
  });

  it('handles multiple stats updates', () => {
    const { result } = renderHook(() => useGPU(mockOnStatsUpdate));

    const updates: GPUStats[] = [
      {
        memoryUsed: 1024,
        memoryTotal: 4096,
        utilization: 50,
        temperature: 75
      },
      {
        memoryUsed: 2048,
        memoryTotal: 4096,
        utilization: 75,
        temperature: 80
      },
      {
        memoryUsed: 3072,
        memoryTotal: 4096,
        utilization: 90,
        temperature: 85
      }
    ];

    updates.forEach(stats => {
      act(() => {
        __updateStats(stats);
      });
      expect(result.current).toEqual(stats);
      expect(mockOnStatsUpdate).toHaveBeenCalledWith(stats);
    });

    expect(mockOnStatsUpdate).toHaveBeenCalledTimes(updates.length);
  });

  it('cleans up subscriptions on unmount', () => {
    const { unmount } = renderHook(() => useGPU(mockOnStatsUpdate));
    unmount();

    const newStats: GPUStats = {
      memoryUsed: 1024,
      memoryTotal: 4096,
      utilization: 50,
      temperature: 75
    };

    act(() => {
      __updateStats(newStats);
    });
    expect(mockOnStatsUpdate).not.toHaveBeenCalled();
  });

  it('handles multiple instances independently', () => {
    const mockCallback1 = jest.fn();
    const mockCallback2 = jest.fn();

    const { result: result1 } = renderHook(() => useGPU(mockCallback1));
    const { result: result2 } = renderHook(() => useGPU(mockCallback2));

    const newStats: GPUStats = {
      memoryUsed: 1024,
      memoryTotal: 4096,
      utilization: 50,
      temperature: 75
    };

    act(() => {
      __updateStats(newStats);
    });

    expect(result1.current).toEqual(newStats);
    expect(result2.current).toEqual(newStats);
    expect(mockCallback1).toHaveBeenCalledWith(newStats);
    expect(mockCallback2).toHaveBeenCalledWith(newStats);
    expect(mockCallback1).toHaveBeenCalledTimes(1);
    expect(mockCallback2).toHaveBeenCalledTimes(1);
  });
});
