import { renderHook } from '@testing-library/react';
import { useSnapPoints } from '../useSnapPoints';
import { Track, Marker, ClipWithLayer } from '../../types/timeline';

describe('useSnapPoints', () => {
  const fps = 30;
  const mockVideoClip: ClipWithLayer = {
    id: 'clip1',
    type: 'video',
    name: 'Test Video',
    startTime: 0,
    endTime: 10,
    src: 'test.mp4',
    originalDuration: 10,
    effects: [],
    layer: 0
  };

  const mockTrack: Track = {
    id: 'track1',
    name: 'Video Track',
    type: 'video',
    clips: [mockVideoClip]
  };

  const mockMarkers: Marker[] = [
    { id: 'marker1', time: 5, label: 'Marker 1' },
    { id: 'marker2', time: 15, label: 'Marker 2' }
  ];

  type SnapPoint = {
    time: number;
    type: 'clip' | 'marker';
    label: string;
    source: string;
  };

  it('generates clip snap points correctly', () => {
    const { result } = renderHook(() => useSnapPoints(fps));
    const clipPoints = result.current.getClipSnapPoints(mockVideoClip);

    // Should generate points at clip boundaries
    expect(clipPoints).toContainEqual({
      time: mockVideoClip.startTime,
      type: 'clip',
      label: 'Clip Start: Test Video',
      source: mockVideoClip.id
    });
    expect(clipPoints).toContainEqual({
      time: mockVideoClip.endTime,
      type: 'clip',
      label: 'Clip End: Test Video',
      source: mockVideoClip.id
    });
  });

  it('finds nearest snap point correctly', () => {
    const { result } = renderHook(() => useSnapPoints(fps));
    const snapPoints: SnapPoint[] = [
      { time: 5, type: 'marker', label: 'Marker 1', source: mockMarkers[0].id },
      { time: 5.1, type: 'clip', label: 'Clip Start', source: mockVideoClip.id }
    ];

    // Test snapping to marker (higher priority)
    const nearestPoint = result.current.findNearestSnapPoint(
      5.05,
      snapPoints,
      0.1,
      ['marker', 'clip']
    );
    expect(nearestPoint?.time).toBe(5);
    expect(nearestPoint?.type).toBe('marker');
  });

  it('respects snap threshold', () => {
    const { result } = renderHook(() => useSnapPoints(fps));
    const snapPoints: SnapPoint[] = [
      { time: 5, type: 'marker', label: 'Marker 1', source: mockMarkers[0].id }
    ];

    // Point is too far from snap point
    const noSnap = result.current.findNearestSnapPoint(
      5.2,
      snapPoints,
      0.1,
      ['marker']
    );
    expect(noSnap).toBeNull();

    // Point is within threshold
    const snap = result.current.findNearestSnapPoint(
      5.05,
      snapPoints,
      0.1,
      ['marker']
    );
    expect(snap?.time).toBe(5);
  });

  it('combines all snap points correctly', () => {
    const { result } = renderHook(() => useSnapPoints(fps));
    const allPoints = result.current.getAllSnapPoints(
      [mockTrack],
      mockMarkers,
      5
    );

    // Should include clip and marker points
    expect(allPoints.some(p => p.type === 'clip')).toBe(true);
    expect(allPoints.some(p => p.type === 'marker')).toBe(true);

    // Points should be sorted by time
    expect(allPoints).toEqual(
      allPoints.slice().sort((a, b) => a.time - b.time)
    );

    // Each point should have a source ID
    expect(allPoints.every(p => typeof p.source === 'string')).toBe(true);
  });
});
