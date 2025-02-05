import React from 'react';
import { render, act } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimeline } from '../useTimeline';
import { useTimelineHistory } from '../useTimelineHistory';
import { useTimelineViewport } from '../useTimelineViewport';
import { useTimelineCoordinates } from '../useTimelineCoordinates';
import { useSnapPoints } from '../useSnapPoints';
import { Track, VideoClip } from '../../types/timeline';

describe('Timeline Hooks Integration', () => {
  const createMockClip = (id: string, startTime: number, duration: number): VideoClip => ({
    id,
    type: 'video',
    name: `Video ${id}`,
    startTime,
    endTime: startTime + duration,
    src: 'test.mp4',
    originalDuration: duration,
    effects: []
  });

  const createMockTrack = (id: string): Track => ({
    id,
    name: `Track ${id}`,
    type: 'video',
    clips: []
  });

  const IntegrationTestComponent: React.FC = () => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const {
      addTrack,
      addClip,
      moveClip,
      tracks
    } = useTimeline();

    const {
      pushHistory,
      undo,
      redo,
      getHistoryStatus
    } = useTimelineHistory();

    const {
      timeToPixels,
      pixelsToTime,
      getVisibleTimeRange
    } = useTimelineViewport();

    const {
      clientToTime,
      timeToClient
    } = useTimelineCoordinates(containerRef);

    const {
      getAllSnapPoints,
      findNearestSnapPoint
    } = useSnapPoints(30); // 30fps

    const performComplexOperation = () => {
      // Add track and clip
      addTrack(createMockTrack('track-1'));
      addClip('track-1', createMockClip('clip-1', 0, 5));
      pushHistory('Add track and clip');

      // Move clip
      moveClip('clip-1', 'track-1', 'track-1', 10);
      pushHistory('Move clip');
    };

    const snapClipToNearestPoint = (clipTime: number) => {
      const snapPoints = getAllSnapPoints(tracks, [], clipTime);
      const nearestPoint = findNearestSnapPoint(clipTime, snapPoints, 0.5);
      return nearestPoint?.time ?? clipTime;
    };

    return (
      <div ref={containerRef} style={{ width: 800, height: 200 }}>
        <div data-testid="tracks">{JSON.stringify(tracks)}</div>
        <div data-testid="history-status">{JSON.stringify(getHistoryStatus())}</div>
        <div data-testid="time-conversion">
          {JSON.stringify({
            pixels: timeToPixels(5),
            time: pixelsToTime(500),
            clientTime: clientToTime({ x: 100, y: 0 }),
            clientCoords: timeToClient(5)
          })}
        </div>
        <div data-testid="visible-range">{JSON.stringify(getVisibleTimeRange(800))}</div>
        <div data-testid="snap-points">
          {JSON.stringify(getAllSnapPoints(tracks, [], 5))}
        </div>
        <button data-testid="complex-operation" onClick={performComplexOperation}>
          Perform Operation
        </button>
        <button data-testid="undo" onClick={undo}>Undo</button>
        <button data-testid="redo" onClick={redo}>Redo</button>
        <button
          data-testid="snap-clip"
          onClick={() => {
            const snappedTime = snapClipToNearestPoint(4.8);
            if (tracks[0]?.clips[0]) {
              moveClip(tracks[0].clips[0].id, 'track-1', 'track-1', snappedTime);
              pushHistory('Snap clip');
            }
          }}
        >
          Snap Clip
        </button>
      </div>
    );
  };

  beforeEach(() => {
    // Mock element dimensions for coordinate calculations
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        x: 0,
        y: 0,
        width: 800,
        height: 200,
        top: 0,
        right: 800,
        bottom: 200,
        left: 0,
        toJSON: () => ({})
      })
    });
  });

  it('coordinates timeline operations with history', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <IntegrationTestComponent />
      </TimelineProvider>
    );

    // Perform complex operation
    act(() => {
      getByTestId('complex-operation').click();
    });

    // Verify track and clip added
    let tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks).toHaveLength(1);
    expect(tracks[0].clips).toHaveLength(1);
    expect(tracks[0].clips[0].startTime).toBe(10); // Moved to 10s

    // Verify history state
    let historyStatus = JSON.parse(getByTestId('history-status').textContent || '{}');
    expect(historyStatus.totalEntries).toBe(2);
    expect(historyStatus.canUndo).toBe(true);

    // Undo both operations
    act(() => {
      getByTestId('undo').click();
      getByTestId('undo').click();
    });

    // Verify state reverted
    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks).toHaveLength(0);

    // Redo operations
    act(() => {
      getByTestId('redo').click();
      getByTestId('redo').click();
    });

    // Verify state restored
    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks).toHaveLength(1);
    expect(tracks[0].clips[0].startTime).toBe(10);
  });

  it('integrates coordinate conversion with snapping', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <IntegrationTestComponent />
      </TimelineProvider>
    );

    // Add content to timeline
    act(() => {
      getByTestId('complex-operation').click();
    });

    // Get coordinate conversions
    const conversions = JSON.parse(getByTestId('time-conversion').textContent || '{}');
    expect(conversions.pixels).toBe(500); // 5s * 100px/s
    expect(conversions.time).toBe(5); // 500px / 100px/s

    // Get snap points
    const snapPoints = JSON.parse(getByTestId('snap-points').textContent || '[]');
    expect(snapPoints.some((p: any) => p.type === 'clip-start')).toBe(true);

    // Snap clip
    act(() => {
      getByTestId('snap-clip').click();
    });

    // Verify clip snapped
    const tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    const clipTime = tracks[0].clips[0].startTime;
    expect(clipTime % (1/30)).toBeLessThan(0.001); // Should snap to frame boundary
  });

  it('maintains viewport state during operations', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <IntegrationTestComponent />
      </TimelineProvider>
    );

    // Add content
    act(() => {
      getByTestId('complex-operation').click();
    });

    // Get visible range
    const [start, end] = JSON.parse(getByTestId('visible-range').textContent || '[]');
    expect(end - start).toBe(8); // 800px / 100px/s = 8s visible

    // Verify clip remains in visible range
    const tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks[0].clips[0].startTime).toBeLessThan(end);
    expect(tracks[0].clips[0].endTime).toBeGreaterThan(start);
  });
});
