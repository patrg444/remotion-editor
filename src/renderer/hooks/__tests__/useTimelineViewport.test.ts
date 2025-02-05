import { renderHook, act } from '@testing-library/react';
import { useTimelineViewport } from '../useTimelineViewport';
import { useTimelineContext } from '../useTimelineContext';

// Mock the timeline context
jest.mock('../useTimelineContext', () => ({
  useTimelineContext: jest.fn()
}));

describe('useTimelineViewport', () => {
  const mockState = {
    duration: 100,
    zoom: 1,
    fps: 30,
    scrollX: 0,
    scrollY: 0
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimelineContext as jest.Mock).mockReturnValue({
      state: mockState,
      dispatch: mockDispatch
    });
  });

  it('calculates viewport dimensions correctly', () => {
    const { result } = renderHook(() => useTimelineViewport());

    const dimensions = result.current.getViewportDimensions(800, 600);
    expect(dimensions).toEqual({
      width: 800,
      height: 600,
      contentWidth: 10000, // duration * zoom * 100 (pixels per second)
      contentHeight: 600,
      visibleDuration: 8, // width / (zoom * 100)
      scrollLeft: 0,
      scrollTop: 0
    });
  });

  it('converts time to pixels correctly', () => {
    const { result } = renderHook(() => useTimelineViewport());

    // At zoom level 1, each second is 100 pixels
    expect(result.current.timeToPixels(5)).toBe(500);
    expect(result.current.timeToPixels(10.5)).toBe(1050);

    // Update zoom
    act(() => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: { ...mockState, zoom: 2 },
        dispatch: mockDispatch
      });
    });

    // At zoom level 2, each second is 200 pixels
    expect(result.current.timeToPixels(5)).toBe(1000);
    expect(result.current.timeToPixels(10.5)).toBe(2100);
  });

  it('converts pixels to time correctly', () => {
    const { result } = renderHook(() => useTimelineViewport());

    // At zoom level 1, each 100 pixels is 1 second
    expect(result.current.pixelsToTime(500)).toBe(5);
    expect(result.current.pixelsToTime(1050)).toBe(10.5);

    // Update zoom
    act(() => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: { ...mockState, zoom: 2 },
        dispatch: mockDispatch
      });
    });

    // At zoom level 2, each 200 pixels is 1 second
    expect(result.current.pixelsToTime(1000)).toBe(5);
    expect(result.current.pixelsToTime(2100)).toBe(10.5);
  });

  it('calculates visible time range correctly', () => {
    const { result } = renderHook(() => useTimelineViewport());

    const [start, end] = result.current.getVisibleTimeRange(800);
    expect(start).toBe(0); // scrollX = 0
    expect(end).toBe(8); // width / (zoom * 100)

    // Update scroll position
    act(() => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: { ...mockState, scrollX: 1000 },
        dispatch: mockDispatch
      });
    });

    const [scrolledStart, scrolledEnd] = result.current.getVisibleTimeRange(800);
    expect(scrolledStart).toBe(10); // scrollX / (zoom * 100)
    expect(scrolledEnd).toBe(18); // (scrollX + width) / (zoom * 100)
  });

  it('checks if time is visible correctly', () => {
    const { result } = renderHook(() => useTimelineViewport());

    expect(result.current.isTimeVisible(5, 800)).toBe(true); // 5s is within 0-8s
    expect(result.current.isTimeVisible(10, 800)).toBe(false); // 10s is outside 0-8s

    // Update scroll position
    act(() => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: { ...mockState, scrollX: 1000 },
        dispatch: mockDispatch
      });
    });

    expect(result.current.isTimeVisible(5, 800)).toBe(false); // 5s is outside 10-18s
    expect(result.current.isTimeVisible(15, 800)).toBe(true); // 15s is within 10-18s
  });

  it('calculates optimal zoom level correctly', () => {
    const { result } = renderHook(() => useTimelineViewport());

    // For 100s duration and 1000px width, optimal zoom should be 0.1
    // (1000px / (100s * 100px/s)) = 0.1
    const zoom = result.current.getOptimalZoom(1000);
    expect(zoom).toBeCloseTo(0.1);

    // Update duration
    act(() => {
      (useTimelineContext as jest.Mock).mockReturnValue({
        state: { ...mockState, duration: 50 },
        dispatch: mockDispatch
      });
    });

    // For 50s duration and 1000px width, optimal zoom should be 0.2
    const newZoom = result.current.getOptimalZoom(1000);
    expect(newZoom).toBeCloseTo(0.2);
  });
});
