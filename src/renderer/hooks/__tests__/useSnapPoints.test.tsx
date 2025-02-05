import React from 'react';
import { render } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useSnapPoints } from '../useSnapPoints';
import { Track, Clip, VideoClip } from '../../types/timeline';

describe('useSnapPoints', () => {
  const mockClip: VideoClip = {
    id: 'clip1',
    type: 'video',
    name: 'Test Video',
    startTime: 5,
    endTime: 10,
    src: 'test.mp4',
    originalDuration: 10,
    effects: [],
    mediaOffset: 1,
    mediaDuration: 8
  };

  const mockTrack: Track = {
    id: 'track1',
    name: 'Video Track',
    type: 'video',
    clips: [{ ...mockClip, layer: 0 }]
  };

  const mockMarkers = [
    { id: 'marker1', time: 3 },
    { id: 'marker2', time: 7 }
  ];

  const SnapPointsTestComponent: React.FC = () => {
    const { getAllSnapPoints, findNearestSnapPoint, getClipSnapPoints } = useSnapPoints(30); // 30fps

    const clipPoints = getClipSnapPoints(mockClip);
    const allPoints = getAllSnapPoints([mockTrack], mockMarkers, 5);
    const nearestPoint = findNearestSnapPoint(4.9, allPoints, 0.2);

    return (
      <div>
        <div data-testid="clip-points">{JSON.stringify(clipPoints)}</div>
        <div data-testid="all-points">{JSON.stringify(allPoints)}</div>
        <div data-testid="nearest-point">{JSON.stringify(nearestPoint)}</div>
      </div>
    );
  };

  it('generates clip snap points', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <SnapPointsTestComponent />
      </TimelineProvider>
    );

    const clipPoints = JSON.parse(getByTestId('clip-points').textContent || '[]');
    expect(clipPoints).toContainEqual({
      time: mockClip.startTime,
      type: 'clip-start',
      source: mockClip.id
    });
    expect(clipPoints).toContainEqual({
      time: mockClip.endTime,
      type: 'clip-end',
      source: mockClip.id
    });
    expect(clipPoints).toContainEqual({
      time: mockClip.startTime + mockClip.mediaOffset,
      type: 'trim-start',
      source: mockClip.id
    });
    expect(clipPoints).toContainEqual({
      time: mockClip.startTime + mockClip.mediaOffset + mockClip.mediaDuration,
      type: 'trim-end',
      source: mockClip.id
    });
  });

  it('collects all snap points', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <SnapPointsTestComponent />
      </TimelineProvider>
    );

    const allPoints = JSON.parse(getByTestId('all-points').textContent || '[]');

    // Should include clip points
    expect(allPoints).toContainEqual({
      time: mockClip.startTime,
      type: 'clip-start',
      source: mockClip.id
    });

    // Should include marker points
    expect(allPoints).toContainEqual({
      time: mockMarkers[0].time,
      type: 'marker',
      source: mockMarkers[0].id
    });

    // Should include playhead point
    expect(allPoints).toContainEqual({
      time: 5,
      type: 'playhead',
      source: 'playhead'
    });

    // Should include frame points
    expect(allPoints.some((p: any) => p.type === 'frame')).toBe(true);
  });

  it('finds nearest snap point', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <SnapPointsTestComponent />
      </TimelineProvider>
    );

    const nearestPoint = JSON.parse(getByTestId('nearest-point').textContent || 'null');
    expect(nearestPoint).not.toBeNull();
    expect(nearestPoint.time).toBe(5); // Should snap to clip start at 5s
  });

  describe('frame snapping', () => {
    const FrameSnapTestComponent: React.FC = () => {
      const { getAllSnapPoints, findNearestSnapPoint } = useSnapPoints(30); // 30fps
      const points = getAllSnapPoints([], [], 5);
      const nearestPoint = findNearestSnapPoint(5.016, points, 0.02); // Just off a frame boundary

      return (
        <div data-testid="frame-snap">{JSON.stringify(nearestPoint)}</div>
      );
    };

    it('snaps to frame boundaries', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <FrameSnapTestComponent />
        </TimelineProvider>
      );

      const snappedPoint = JSON.parse(getByTestId('frame-snap').textContent || 'null');
      expect(snappedPoint).not.toBeNull();
      expect(snappedPoint.type).toBe('frame');
      expect(snappedPoint.time).toBe(5); // Should snap to exact frame
    });
  });

  describe('snap point filtering', () => {
    const FilterTestComponent: React.FC = () => {
      const { getAllSnapPoints, findNearestSnapPoint } = useSnapPoints(30);
      const points = getAllSnapPoints([mockTrack], mockMarkers, 5);
      const nearestPoint = findNearestSnapPoint(4.9, points, 0.2, ['marker']); // Exclude markers

      return (
        <div data-testid="filtered-point">{JSON.stringify(nearestPoint)}</div>
      );
    };

    it('respects excluded types', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <FilterTestComponent />
        </TimelineProvider>
      );

      const filteredPoint = JSON.parse(getByTestId('filtered-point').textContent || 'null');
      expect(filteredPoint).not.toBeNull();
      expect(filteredPoint.type).not.toBe('marker');
    });
  });
});
