import React from 'react';
import { render } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimelineCoordinates } from '../useTimelineCoordinates';
import { TimelineState } from '../../types/timeline';
import { useTimelineContext } from '../../contexts/TimelineContext';

describe('useTimelineCoordinates', () => {
  const CONTAINER_WIDTH = 800;
  const CONTAINER_HEIGHT = 200;
  const CONTAINER_LEFT = 100;
  const CONTAINER_TOP = 50;

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

  const CoordinatesTestComponent: React.FC = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const {
      clientToTime,
      timeToClient,
      getRelativeCoordinates,
      isWithinContainer,
      getContainerDimensions
    } = useTimelineCoordinates(containerRef);

    // Test coordinates at different positions
    const centerCoords = { x: CONTAINER_LEFT + CONTAINER_WIDTH / 2, y: CONTAINER_TOP + CONTAINER_HEIGHT / 2 };
    const outsideCoords = { x: CONTAINER_LEFT + CONTAINER_WIDTH + 100, y: CONTAINER_TOP + CONTAINER_HEIGHT + 100 };

    return (
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: CONTAINER_LEFT,
          top: CONTAINER_TOP,
          width: CONTAINER_WIDTH,
          height: CONTAINER_HEIGHT,
          overflow: 'auto'
        }}
        data-testid="container"
      >
        <div data-testid="client-to-time">{clientToTime(centerCoords)}</div>
        <div data-testid="time-to-client">{JSON.stringify(timeToClient(5))}</div>
        <div data-testid="relative-coords">{JSON.stringify(getRelativeCoordinates(centerCoords))}</div>
        <div data-testid="is-within-center">{isWithinContainer(centerCoords).toString()}</div>
        <div data-testid="is-within-outside">{isWithinContainer(outsideCoords).toString()}</div>
        <div data-testid="container-dimensions">{JSON.stringify(getContainerDimensions())}</div>
      </div>
    );
  };

  beforeEach(() => {
    // Create a proper DOMRect mock
    const domRect = {
      left: CONTAINER_LEFT,
      top: CONTAINER_TOP,
      width: CONTAINER_WIDTH,
      height: CONTAINER_HEIGHT,
      right: CONTAINER_LEFT + CONTAINER_WIDTH,
      bottom: CONTAINER_TOP + CONTAINER_HEIGHT,
      x: CONTAINER_LEFT,
      y: CONTAINER_TOP,
      toJSON: () => ({
        left: CONTAINER_LEFT,
        top: CONTAINER_TOP,
        width: CONTAINER_WIDTH,
        height: CONTAINER_HEIGHT,
        right: CONTAINER_LEFT + CONTAINER_WIDTH,
        bottom: CONTAINER_TOP + CONTAINER_HEIGHT,
        x: CONTAINER_LEFT,
        y: CONTAINER_TOP
      })
    };

    Element.prototype.getBoundingClientRect = jest.fn(() => domRect as DOMRect);

    // Mock scroll properties
    Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
      configurable: true,
      value: 0
    });
    Object.defineProperty(HTMLElement.prototype, 'scrollTop', {
      configurable: true,
      value: 0
    });
  });

  it('converts between client coordinates and time', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{ zoom: 1, fps: 30, duration: 20 }}>
          <CoordinatesTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const time = Number(getByTestId('client-to-time').textContent || '0');
    const clientCoords = JSON.parse(getByTestId('time-to-client').textContent || '{"x":0,"y":0}');

    // Center coordinates should convert to middle time
    expect(time).toBe(4); // (400px - 100px) / (100px/s) = 4s
    expect(clientCoords.x).toBe(600); // 5s * 100px/s + 100px = 600px
  });

  it('calculates relative coordinates', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{ zoom: 1 }}>
          <CoordinatesTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const relativeCoords = JSON.parse(getByTestId('relative-coords').textContent || '{"x":0,"y":0}');

    // Center coordinates relative to container
    expect(relativeCoords.x).toBe(400); // 500px - 100px = 400px
    expect(relativeCoords.y).toBe(100); // 150px - 50px = 100px
  });

  it('detects coordinates within container', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{ zoom: 1 }}>
          <CoordinatesTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const isWithinCenter = getByTestId('is-within-center').textContent === 'true';
    const isWithinOutside = getByTestId('is-within-outside').textContent === 'true';

    expect(isWithinCenter).toBe(true);
    expect(isWithinOutside).toBe(false);
  });

  it('provides container dimensions', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer state={{ zoom: 1 }}>
          <CoordinatesTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const dimensions = JSON.parse(getByTestId('container-dimensions').textContent || '{}');

    expect(dimensions.width).toBe(CONTAINER_WIDTH);
    expect(dimensions.height).toBe(CONTAINER_HEIGHT);
    expect(dimensions.left).toBe(CONTAINER_LEFT);
    expect(dimensions.top).toBe(CONTAINER_TOP);
    expect(dimensions.scrollLeft).toBe(0);
    expect(dimensions.scrollTop).toBe(0);
  });

  describe('scroll behavior', () => {
    it('adjusts coordinates for scroll position', () => {
      // Mock scrolled position
      Object.defineProperty(HTMLElement.prototype, 'scrollLeft', {
        configurable: true,
        value: 100
      });

      const { getByTestId } = render(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 1, duration: 10 }}>
            <CoordinatesTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const time = Number(getByTestId('client-to-time').textContent || '0');
      const relativeCoords = JSON.parse(getByTestId('relative-coords').textContent || '{"x":0,"y":0}');

      // Should account for scroll position
      expect(time).toBe(5); // (400px - 100px + 100px scroll) / (100px/s) = 5s
      expect(relativeCoords.x).toBe(500); // 500px - 100px + 100px scroll = 500px
    });
  });

  describe('zoom behavior', () => {
    it('scales coordinate conversions with zoom', () => {
      const { getByTestId, rerender } = render(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 1 }}>
            <CoordinatesTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const initialTime = Number(getByTestId('client-to-time').textContent || '0');

      // Double zoom
      rerender(
        <TimelineProvider>
          <TestStateInitializer state={{ zoom: 2 }}>
            <CoordinatesTestComponent />
          </TestStateInitializer>
        </TimelineProvider>
      );

      const zoomedTime = Number(getByTestId('client-to-time').textContent || '0');

      // Time should be halved with double zoom
      expect(zoomedTime).toBe(initialTime / 2);
    });
  });
});
