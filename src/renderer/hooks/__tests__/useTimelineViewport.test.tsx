import React from 'react';
import { render } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimelineViewport } from '../useTimelineViewport';
import { TimelineState } from '../../types/timeline';
import { useTimelineContext } from '../../contexts/TimelineContext';

describe('useTimelineViewport', () => {
  const CONTAINER_WIDTH = 800;
  const CONTAINER_HEIGHT = 200;

  interface TestStateInitializerProps {
    state: Partial<TimelineState>;
    children: React.ReactNode;
  }

  const TestStateInitializer: React.FC<TestStateInitializerProps> = ({ state, children }) => {
    const { dispatch } = useTimelineContext();
    React.useEffect(() => {
      dispatch({ type: 'SET_STATE', payload: state });
    }, [dispatch, state]);
    return <>{children}</>;
  };

  const ViewportTestComponent: React.FC = () => {
    const {
      timeToPixels,
      pixelsToTime,
      getPixelsPerSecond,
      getPixelsPerFrame,
      getViewportDimensions,
      getOptimalZoom,
      getMinZoomLevel,
      getVisibleTimeRange,
      isTimeVisible
    } = useTimelineViewport();

    const dimensions = getViewportDimensions(CONTAINER_WIDTH, CONTAINER_HEIGHT);
    const [visibleStart, visibleEnd] = getVisibleTimeRange(CONTAINER_WIDTH);

    return (
      <div>
        <div data-testid="time-to-pixels">{timeToPixels(5)}</div>
        <div data-testid="pixels-to-time">{pixelsToTime(500)}</div>
        <div data-testid="pixels-per-second">{getPixelsPerSecond()}</div>
        <div data-testid="pixels-per-frame">{getPixelsPerFrame()}</div>
        <div data-testid="viewport-dimensions">{JSON.stringify(dimensions)}</div>
        <div data-testid="optimal-zoom">{getOptimalZoom(CONTAINER_WIDTH)}</div>
        <div data-testid="min-zoom">{getMinZoomLevel(CONTAINER_WIDTH)}</div>
        <div data-testid="visible-range">{JSON.stringify([visibleStart, visibleEnd])}</div>
        <div data-testid="is-time-visible">{isTimeVisible(5, CONTAINER_WIDTH).toString()}</div>
      </div>
    );
  };

  it('converts between time and pixels', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{ zoom: 1, fps: 30 }}>
          <ViewportTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const pixels = Number(getByTestId('time-to-pixels').textContent);
    const time = Number(getByTestId('pixels-to-time').textContent);
    const pixelsPerSecond = Number(getByTestId('pixels-per-second').textContent);
    const pixelsPerFrame = Number(getByTestId('pixels-per-frame').textContent);

    expect(pixels).toBe(500); // 5 seconds * 100 pixels/second at zoom 1
    expect(time).toBe(5); // 500 pixels / 100 pixels/second at zoom 1
    expect(pixelsPerSecond).toBe(100); // Base scale at zoom 1
    expect(pixelsPerFrame).toBe(100 / 30); // pixelsPerSecond / fps
  });

  it('calculates viewport dimensions', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{
          zoom: 1,
          scrollX: 0,
          scrollY: 0,
          duration: 10
        }}>
          <ViewportTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const dimensions = JSON.parse(getByTestId('viewport-dimensions').textContent || '{}');

    expect(dimensions.width).toBe(CONTAINER_WIDTH);
    expect(dimensions.height).toBe(CONTAINER_HEIGHT);
    expect(dimensions.contentWidth).toBe(1000); // 10 seconds * 100 pixels/second
    expect(dimensions.visibleDuration).toBe(8); // 800 pixels / 100 pixels/second
  });

  it('calculates zoom levels', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{ duration: 10 }}>
          <ViewportTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const optimalZoom = Number(getByTestId('optimal-zoom').textContent);
    const minZoom = Number(getByTestId('min-zoom').textContent);

    expect(optimalZoom).toBeGreaterThan(0);
    expect(minZoom).toBeGreaterThan(0);
    expect(optimalZoom).toBeGreaterThan(minZoom);
  });

  it('determines visible time range', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{
          zoom: 1,
          scrollX: 100,
          duration: 20
        }}>
          <ViewportTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const [start, end] = JSON.parse(getByTestId('visible-range').textContent || '[]');

    expect(start).toBe(1); // scrollX 100 / 100 pixels per second
    expect(end).toBe(9); // start + container width / pixels per second
  });

  it('checks time visibility', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{
          zoom: 1,
          scrollX: 0,
          duration: 20
        }}>
          <ViewportTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const isVisible = getByTestId('is-time-visible').textContent === 'true';
    expect(isVisible).toBe(true); // 5 seconds should be visible in initial viewport
  });

  describe('zoom behavior', () => {
    it('scales time-pixel conversion with zoom', () => {
      const { getByTestId, rerender } = render(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 1 }}>
            <ViewportTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const initialPixels = Number(getByTestId('time-to-pixels').textContent);

      // Double zoom
      rerender(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 2 }}>
            <ViewportTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const zoomedPixels = Number(getByTestId('time-to-pixels').textContent);
      expect(zoomedPixels).toBe(initialPixels * 2);
    });

    it('adjusts visible duration with zoom', () => {
      const { getByTestId, rerender } = render(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 1, scrollX: 0, duration: 20 }}>
            <ViewportTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const [initialStart, initialEnd] = JSON.parse(getByTestId('visible-range').textContent || '[]');
      const initialDuration = initialEnd - initialStart;

      // Double zoom
      rerender(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 2, scrollX: 0, duration: 20 }}>
            <ViewportTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const [zoomedStart, zoomedEnd] = JSON.parse(getByTestId('visible-range').textContent || '[]');
      const zoomedDuration = zoomedEnd - zoomedStart;

      expect(zoomedDuration).toBe(initialDuration / 2);
    });
  });
});
