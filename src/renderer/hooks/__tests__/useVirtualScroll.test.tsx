import React from 'react';
import { render } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useVirtualScroll } from '../useVirtualScroll';
import { Track, VideoClip } from '../../types/timeline';
import { useTimelineContext } from '../../contexts/TimelineContext';

describe('useVirtualScroll', () => {
  const CONTAINER_WIDTH = 800;

  const createMockClip = (id: number, startTime: number, duration: number): VideoClip => ({
    id: `clip-${id}`,
    type: 'video',
    name: `Clip ${id}`,
    startTime,
    endTime: startTime + duration,
    src: 'test.mp4',
    originalDuration: duration,
    effects: []
  });

  const createMockTrack = (id: number, clips: VideoClip[]): Track => ({
    id: `track-${id}`,
    name: `Track ${id}`,
    type: 'video',
    clips: clips.map(clip => ({ ...clip, layer: 0 }))
  });

  interface TestStateInitializerProps {
    tracks: Track[];
    zoom?: number;
    duration?: number;
    scrollX?: number;
    children: React.ReactNode;
  }

  const TestStateInitializer: React.FC<TestStateInitializerProps> = ({ 
    tracks, 
    zoom = 1, 
    duration = 3600, 
    scrollX = 0,
    children 
  }) => {
    const { dispatch } = useTimelineContext();
    React.useEffect(() => {
      dispatch({ 
        type: 'SET_STATE', 
        payload: { 
          tracks,
          zoom,
          duration,
          scrollX,
          currentTime: 0,
          fps: 30,
          isPlaying: false,
          isDragging: false,
          scrollY: 0,
          selectedClipIds: [],
          markers: [],
          history: { entries: [], currentIndex: -1 }
        }
      });
    }, [dispatch, tracks, zoom, duration, scrollX]);
    return <>{children}</>;
  };

  const VirtualScrollTestComponent: React.FC = () => {
    const {
      virtualizedTracks,
      visibleTimeRange,
      visibleClipsCount,
      totalClipsCount,
      density
    } = useVirtualScroll(CONTAINER_WIDTH);

    return (
      <div>
        <div data-testid="tracks">{JSON.stringify(virtualizedTracks)}</div>
        <div data-testid="time-range">{JSON.stringify(visibleTimeRange)}</div>
        <div data-testid="clip-counts">
          {JSON.stringify({ visible: visibleClipsCount, total: totalClipsCount })}
        </div>
        <div data-testid="density">{density}</div>
      </div>
    );
  };

  it('virtualizes clips based on visible time range', () => {
    // Create a track with clips spanning 1 hour
    const clips = Array.from({ length: 100 }, (_, i) => 
      createMockClip(i, i * 36, 35) // 35-second clips with 1-second gap
    );
    const track = createMockTrack(0, clips);

    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer tracks={[track]} duration={3600}>
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const virtualizedTracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    const timeRange = JSON.parse(getByTestId('time-range').textContent || '[]');
    const counts = JSON.parse(getByTestId('clip-counts').textContent || '{}');

    expect(virtualizedTracks[0].clips.length).toBeLessThan(clips.length);
    expect(timeRange[1] - timeRange[0]).toBeLessThan(3600);
    expect(counts.visible).toBeLessThan(counts.total);
  });

  it('adjusts virtualization based on zoom level', () => {
    const clips = Array.from({ length: 50 }, (_, i) => 
      createMockClip(i, i * 10, 9)
    );
    const track = createMockTrack(0, clips);

    const { getByTestId, rerender } = render(
      <TimelineProvider>
        <TestStateInitializer tracks={[track]} zoom={1}>
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const initialCounts = JSON.parse(getByTestId('clip-counts').textContent || '{}');

    // Zoom out
    rerender(
      <TimelineProvider>
        <TestStateInitializer tracks={[track]} zoom={0.5}>
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const zoomedCounts = JSON.parse(getByTestId('clip-counts').textContent || '{}');
    expect(zoomedCounts.visible).toBeLessThan(initialCounts.visible);
  });

  it('handles high clip density', () => {
    // Create densely packed clips
    const clips = Array.from({ length: 200 }, (_, i) => 
      createMockClip(i, i * 2, 1.9) // Almost no gaps between clips
    );
    const track = createMockTrack(0, clips);

    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer tracks={[track]}>
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const density = Number(getByTestId('density').textContent);
    expect(density).toBeGreaterThan(0.9);

    const counts = JSON.parse(getByTestId('clip-counts').textContent || '{}');
    expect(counts.visible).toBeLessThanOrEqual(1000); // MAX_VISIBLE_CLIPS
  });

  it('prioritizes longer clips when density is high', () => {
    // Mix of long and short clips
    const clips = [
      createMockClip(0, 0, 100), // Long clip
      ...Array.from({ length: 50 }, (_, i) => 
        createMockClip(i + 1, 100 + i * 2, 1) // Short clips
      )
    ];
    const track = createMockTrack(0, clips);

    const { getByTestId } = render(
      <TimelineProvider>
        <TestStateInitializer tracks={[track]} zoom={0.1}>
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const virtualizedTracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    const virtualizedClips = virtualizedTracks[0].clips;

    // Long clip should be included
    expect(virtualizedClips.some((clip: any) => clip.id === 'clip-0')).toBe(true);
  });

  it('maintains smooth scrolling with buffer', () => {
    const clips = Array.from({ length: 100 }, (_, i) => 
      createMockClip(i, i * 10, 9)
    );
    const track = createMockTrack(0, clips);

    const { getByTestId, rerender } = render(
      <TimelineProvider>
        <TestStateInitializer tracks={[track]} scrollX={0}>
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const initialTimeRange = JSON.parse(getByTestId('time-range').textContent || '[]');

    // Scroll halfway through the buffer
    rerender(
      <TimelineProvider>
        <TestStateInitializer 
          tracks={[track]} 
          scrollX={timeToPixels((initialTimeRange[1] - initialTimeRange[0]) / 4)}
        >
          <VirtualScrollTestComponent />
        </TestStateInitializer>
      </TimelineProvider>
    );

    const scrolledTimeRange = JSON.parse(getByTestId('time-range').textContent || '[]');
    
    // Buffer should still include some of the initial range
    expect(scrolledTimeRange[0]).toBeLessThan(initialTimeRange[1]);
  });
});

// Helper function to simulate timeToPixels conversion
const timeToPixels = (time: number): number => time * 100; // 100px per second at zoom 1
