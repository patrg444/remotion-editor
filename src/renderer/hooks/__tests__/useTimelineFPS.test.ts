import { renderHook, act } from '@testing-library/react';
import { useTimelineFPS } from '../useTimelineFPS';

describe('useTimelineFPS', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initializes with default FPS', () => {
    const { result } = renderHook(() => useTimelineFPS());
    expect(result.current.fps).toBe(30); // Default FPS
  });

  it('updates FPS correctly', () => {
    const { result } = renderHook(() => useTimelineFPS());

    act(() => {
      result.current.setFPS(60);
    });

    expect(result.current.fps).toBe(60);
  });

  it('calculates frame duration correctly', () => {
    const { result } = renderHook(() => useTimelineFPS());

    // At 30 FPS, each frame is 1/30 second
    expect(result.current.frameDuration).toBeCloseTo(1/30);

    act(() => {
      result.current.setFPS(60);
    });

    // At 60 FPS, each frame is 1/60 second
    expect(result.current.frameDuration).toBeCloseTo(1/60);
  });

  it('converts time to frame number correctly', () => {
    const { result } = renderHook(() => useTimelineFPS());

    // At 30 FPS
    expect(result.current.timeToFrame(1)).toBe(30); // 1 second = 30 frames
    expect(result.current.timeToFrame(0.5)).toBe(15); // 0.5 seconds = 15 frames
    expect(result.current.timeToFrame(2)).toBe(60); // 2 seconds = 60 frames

    act(() => {
      result.current.setFPS(60);
    });

    // At 60 FPS
    expect(result.current.timeToFrame(1)).toBe(60); // 1 second = 60 frames
    expect(result.current.timeToFrame(0.5)).toBe(30); // 0.5 seconds = 30 frames
    expect(result.current.timeToFrame(2)).toBe(120); // 2 seconds = 120 frames
  });

  it('converts frame number to time correctly', () => {
    const { result } = renderHook(() => useTimelineFPS());

    // At 30 FPS
    expect(result.current.frameToTime(30)).toBeCloseTo(1); // 30 frames = 1 second
    expect(result.current.frameToTime(15)).toBeCloseTo(0.5); // 15 frames = 0.5 seconds
    expect(result.current.frameToTime(60)).toBeCloseTo(2); // 60 frames = 2 seconds

    act(() => {
      result.current.setFPS(60);
    });

    // At 60 FPS
    expect(result.current.frameToTime(60)).toBeCloseTo(1); // 60 frames = 1 second
    expect(result.current.frameToTime(30)).toBeCloseTo(0.5); // 30 frames = 0.5 seconds
    expect(result.current.frameToTime(120)).toBeCloseTo(2); // 120 frames = 2 seconds
  });

  it('snaps time to nearest frame boundary', () => {
    const { result } = renderHook(() => useTimelineFPS());

    // At 30 FPS (frame duration ≈ 0.0333 seconds)
    expect(result.current.snapToFrame(0.03)).toBeCloseTo(0.0333); // Snaps up to frame 1
    expect(result.current.snapToFrame(0.05)).toBeCloseTo(0.0333); // Snaps down to frame 1
    expect(result.current.snapToFrame(0.0667)).toBeCloseTo(0.0667); // Exactly frame 2

    act(() => {
      result.current.setFPS(60);
    });

    // At 60 FPS (frame duration ≈ 0.0167 seconds)
    expect(result.current.snapToFrame(0.015)).toBeCloseTo(0.0167); // Snaps up to frame 1
    expect(result.current.snapToFrame(0.025)).toBeCloseTo(0.0167); // Snaps down to frame 1
    expect(result.current.snapToFrame(0.0333)).toBeCloseTo(0.0333); // Exactly frame 2
  });

  it('validates standard FPS values', () => {
    const { result } = renderHook(() => useTimelineFPS());

    // Common standard FPS values
    expect(result.current.isStandardFPS(23.976)).toBe(true);
    expect(result.current.isStandardFPS(24)).toBe(true);
    expect(result.current.isStandardFPS(25)).toBe(true);
    expect(result.current.isStandardFPS(29.97)).toBe(true);
    expect(result.current.isStandardFPS(30)).toBe(true);
    expect(result.current.isStandardFPS(50)).toBe(true);
    expect(result.current.isStandardFPS(59.94)).toBe(true);
    expect(result.current.isStandardFPS(60)).toBe(true);

    // Non-standard values
    expect(result.current.isStandardFPS(40)).toBe(false);
    expect(result.current.isStandardFPS(45)).toBe(false);
  });

  it('finds nearest standard FPS', () => {
    const { result } = renderHook(() => useTimelineFPS());

    expect(result.current.getNearestStandardFPS(23.5)).toBe(23.976);
    expect(result.current.getNearestStandardFPS(24.5)).toBe(24);
    expect(result.current.getNearestStandardFPS(29.5)).toBe(29.97);
    expect(result.current.getNearestStandardFPS(59.5)).toBe(59.94);
  });
});
