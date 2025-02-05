import { renderHook, act } from '@testing-library/react';
import { useTimelineScroll } from '../useTimelineScroll';
import { useTimelineContext } from '../useTimelineContext';
import { RefObject } from 'react';

// Mock the timeline context
jest.mock('../useTimelineContext', () => ({
  useTimelineContext: jest.fn()
}));

describe('useTimelineScroll', () => {
  const mockScrollElement = {
    scrollLeft: 0,
    scrollTop: 0,
    scrollWidth: 1000,
    scrollHeight: 500,
    clientWidth: 800,
    clientHeight: 400,
    scrollTo: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  };

  const mockRef: RefObject<HTMLElement> = {
    current: mockScrollElement as unknown as HTMLElement
  };

  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimelineContext as jest.Mock).mockReturnValue({
      state: {
        scrollX: 0,
        scrollY: 0
      },
      dispatch: mockDispatch
    });
  });

  it('scrolls to specified position', () => {
    const { result } = renderHook(() => useTimelineScroll(mockRef));

    act(() => {
      result.current.scrollTo({ left: 100, top: 50 });
    });

    expect(mockScrollElement.scrollTo).toHaveBeenCalledWith({
      left: 100,
      top: 50
    });
  });

  it('updates scroll state on scroll events', () => {
    const { result } = renderHook(() => useTimelineScroll(mockRef));

    // Simulate scroll event
    const scrollEvent = new Event('scroll');
    Object.defineProperty(mockScrollElement, 'scrollLeft', { value: 150 });
    Object.defineProperty(mockScrollElement, 'scrollTop', { value: 75 });

    act(() => {
      mockScrollElement.addEventListener.mock.calls[0][1](scrollEvent);
    });

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCROLL_X',
      payload: 150
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_SCROLL_Y',
      payload: 75
    });
  });

  it('tracks scrolling state', () => {
    const { result } = renderHook(() => useTimelineScroll(mockRef));

    // Simulate scroll start
    act(() => {
      mockScrollElement.addEventListener.mock.calls[0][1](new Event('scroll'));
    });

    expect(result.current.isScrolling).toBe(true);

    // Fast-forward timers to simulate scroll end
    jest.runAllTimers();

    expect(result.current.isScrolling).toBe(false);
  });

  it('provides current scroll state', () => {
    (useTimelineContext as jest.Mock).mockReturnValue({
      state: {
        scrollX: 100,
        scrollY: 50
      },
      dispatch: mockDispatch
    });

    const { result } = renderHook(() => useTimelineScroll(mockRef));

    expect(result.current.scrollState).toEqual({
      scrollX: 100,
      scrollY: 50,
      maxScrollX: 200,
      maxScrollY: 100
    });
  });

  it('removes event listeners on cleanup', () => {
    const { unmount } = renderHook(() => useTimelineScroll(mockRef));

    unmount();

    expect(mockScrollElement.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('handles null ref', () => {
    const nullRef: RefObject<HTMLElement> = { current: null };
    const { result } = renderHook(() => useTimelineScroll(nullRef));

    act(() => {
      result.current.scrollTo({ left: 100, top: 50 });
    });

    expect(mockScrollElement.scrollTo).not.toHaveBeenCalled();
  });
});
