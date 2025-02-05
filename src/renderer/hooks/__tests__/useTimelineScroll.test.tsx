import React, { useRef } from 'react';
import { render, act } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimelineScroll } from '../useTimelineScroll';
import { useTimelineContext } from '../useTimelineContext';

describe('useTimelineScroll', () => {
  const CONTAINER_WIDTH = 800;
  const CONTAINER_HEIGHT = 200;

  const ScrollTestComponent: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { state } = useTimelineContext();
    const { scrollTo, scrollState, isScrolling } = useTimelineScroll(containerRef);

    return (
      <div
        ref={containerRef}
        style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT, overflow: 'auto' }}
        data-testid="scroll-container"
      >
        <div data-testid="scroll-x">{scrollState.scrollLeft}</div>
        <div data-testid="scroll-y">{scrollState.scrollTop}</div>
        <div data-testid="is-scrolling">{isScrolling.toString()}</div>
        <button
          data-testid="scroll-horizontal"
          onClick={() => scrollTo({ left: 100 })}
        >
          Scroll Horizontal
        </button>
        <button
          data-testid="scroll-vertical"
          onClick={() => scrollTo({ top: 50 })}
        >
          Scroll Vertical
        </button>
        <button
          data-testid="scroll-both"
          onClick={() => scrollTo({ left: 100, top: 50 })}
        >
          Scroll Both
        </button>
        <div data-testid="zoom">{state.zoom}</div>
      </div>
    );
  };

  beforeEach(() => {
    // Mock scrollWidth/scrollHeight
    Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
      configurable: true,
      value: 2000 // Wider than container to allow scrolling
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      value: 500 // Taller than container to allow scrolling
    });

    // Mock scrollLeft/scrollTop
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      value: 0,
      writable: true
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      value: 0,
      writable: true
    });

    // Mock getBoundingClientRect
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        top: 0,
        left: 0,
        right: CONTAINER_WIDTH,
        bottom: CONTAINER_HEIGHT,
        x: 0,
        y: 0
      })
    });

    // Reset scroll state
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('scrolls horizontally', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ScrollTestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('scroll-horizontal').click();
    });

    expect(Number(getByTestId('scroll-x').textContent)).toBe(100);
  });

  it('scrolls vertically', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ScrollTestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('scroll-vertical').click();
    });

    expect(Number(getByTestId('scroll-y').textContent)).toBe(50);
  });

  it('scrolls in both directions', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ScrollTestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('scroll-both').click();
    });

    expect(Number(getByTestId('scroll-x').textContent)).toBe(100);
    expect(Number(getByTestId('scroll-y').textContent)).toBe(50);
  });

  it('tracks scrolling state', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ScrollTestComponent />
      </TimelineProvider>
    );

    // Initial state
    expect(getByTestId('is-scrolling').textContent).toBe('false');

    // Scroll
    act(() => {
      getByTestId('scroll-both').click();
    });

    // Should be scrolling
    expect(getByTestId('is-scrolling').textContent).toBe('true');

    // Wait for scrolling to finish
    act(() => {
      jest.runAllTimers();
    });

    // Should no longer be scrolling
    expect(getByTestId('is-scrolling').textContent).toBe('false');
  });

  describe('scroll behavior with zoom', () => {
    it('maintains scroll position during zoom changes', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ScrollTestComponent />
        </TimelineProvider>
      );

      // Initial scroll
      act(() => {
        getByTestId('scroll-horizontal').click();
      });

      const initialScrollX = Number(getByTestId('scroll-x').textContent);
      const initialZoom = Number(getByTestId('zoom').textContent);

      // Double the zoom
      act(() => {
        const newZoom = initialZoom * 2;
        const event = new CustomEvent('zoom', { detail: newZoom });
        window.dispatchEvent(event);
      });

      // Scroll position should be maintained relative to zoom
      const updatedScrollX = Number(getByTestId('scroll-x').textContent);
      expect(updatedScrollX).toBe(initialScrollX * 2);
    });
  });

  describe('boundary conditions', () => {
    it('clamps scroll values to valid range', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ScrollTestComponent />
        </TimelineProvider>
      );

      // Try to scroll beyond bounds
      act(() => {
        const container = getByTestId('scroll-container');
        const scrollEvent = new Event('scroll');
        Object.defineProperty(scrollEvent, 'target', {
          value: {
            scrollLeft: -100,
            scrollTop: -50
          }
        });
        container.dispatchEvent(scrollEvent);
      });

      // Should clamp to minimum (0)
      expect(Number(getByTestId('scroll-x').textContent)).toBe(0);
      expect(Number(getByTestId('scroll-y').textContent)).toBe(0);
    });
  });
});
