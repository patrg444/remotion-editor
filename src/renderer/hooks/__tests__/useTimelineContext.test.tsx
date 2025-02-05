import React from 'react';
import { render, act } from '@testing-library/react';
import { TimelineProvider, useTimelineContext } from '../../contexts/TimelineContext';
import { Track, VideoClip } from '../../types/timeline';

describe('useTimelineContext', () => {
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

  const ContextTestComponent: React.FC = () => {
    const { state, dispatch } = useTimelineContext();

    const addTrack = () => {
      dispatch({
        type: 'ADD_TRACK',
        payload: {
          track: createMockTrack(0, [createMockClip(0, 0, 5)])
        }
      });
    };

    const setCurrentTime = (time: number) => {
      dispatch({
        type: 'SET_CURRENT_TIME',
        payload: { time }
      });
    };

    const setZoom = (zoom: number) => {
      dispatch({
        type: 'SET_ZOOM',
        payload: zoom
      });
    };

    return (
      <div>
        <div data-testid="tracks">{JSON.stringify(state.tracks)}</div>
        <div data-testid="current-time">{state.currentTime}</div>
        <div data-testid="zoom">{state.zoom}</div>
        <div data-testid="duration">{state.duration}</div>
        <div data-testid="is-playing">{state.isPlaying.toString()}</div>
        <button data-testid="add-track" onClick={addTrack}>Add Track</button>
        <button data-testid="set-time" onClick={() => setCurrentTime(5)}>Set Time</button>
        <button data-testid="set-zoom" onClick={() => setZoom(2)}>Set Zoom</button>
      </div>
    );
  };

  const InvalidContextComponent: React.FC = () => {
    useTimelineContext();
    return null;
  };

  it('throws error when used outside provider', () => {
    const consoleError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<InvalidContextComponent />);
    }).toThrow('useTimelineContext must be used within a TimelineProvider');
    
    console.error = consoleError;
  });

  it('provides initial state', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ContextTestComponent />
      </TimelineProvider>
    );

    expect(JSON.parse(getByTestId('tracks').textContent || '[]')).toEqual([]);
    expect(Number(getByTestId('current-time').textContent)).toBe(0);
    expect(Number(getByTestId('zoom').textContent)).toBe(1);
    expect(Number(getByTestId('duration').textContent)).toBe(0);
    expect(getByTestId('is-playing').textContent).toBe('false');
  });

  it('handles track operations', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ContextTestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('add-track').click();
    });

    const tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks).toHaveLength(1);
    expect(tracks[0].clips).toHaveLength(1);
    expect(tracks[0].clips[0].originalDuration).toBe(5);
  });

  it('handles timeline state updates', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ContextTestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('set-time').click();
    });

    expect(Number(getByTestId('current-time').textContent)).toBe(5);

    act(() => {
      getByTestId('set-zoom').click();
    });

    expect(Number(getByTestId('zoom').textContent)).toBe(2);
  });

  describe('state updates', () => {
    it('maintains state consistency', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ContextTestComponent />
        </TimelineProvider>
      );

      // Add track and update time
      act(() => {
        getByTestId('add-track').click();
        getByTestId('set-time').click();
      });

      const tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
      expect(tracks).toHaveLength(1);
      expect(Number(getByTestId('current-time').textContent)).toBe(5);
    });

    it('handles multiple state updates', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ContextTestComponent />
        </TimelineProvider>
      );

      // Multiple sequential updates
      act(() => {
        getByTestId('add-track').click();
        getByTestId('set-time').click();
        getByTestId('set-zoom').click();
      });

      const tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
      expect(tracks).toHaveLength(1);
      expect(Number(getByTestId('current-time').textContent)).toBe(5);
      expect(Number(getByTestId('zoom').textContent)).toBe(2);
    });
  });

  describe('error handling', () => {
    const ErrorTestComponent: React.FC = () => {
      const { state, dispatch } = useTimelineContext();

      const triggerError = () => {
        dispatch({
          type: 'UNKNOWN_ACTION' as any,
          payload: {}
        });
      };

      return (
        <div>
          <div data-testid="error">{state.error}</div>
          <button data-testid="trigger-error" onClick={triggerError}>Trigger Error</button>
        </div>
      );
    };

    it('handles invalid actions', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ErrorTestComponent />
        </TimelineProvider>
      );

      act(() => {
        getByTestId('trigger-error').click();
      });

      expect(getByTestId('error').textContent).toBeTruthy();
    });
  });

  describe('nested providers', () => {
    const NestedComponent: React.FC = () => {
      const { state } = useTimelineContext();
      return <div data-testid="nested-time">{state.currentTime}</div>;
    };

    it('uses closest provider context', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <div>
            <TimelineProvider>
              <NestedComponent />
            </TimelineProvider>
          </div>
        </TimelineProvider>
      );

      expect(Number(getByTestId('nested-time').textContent)).toBe(0);
    });
  });
});
