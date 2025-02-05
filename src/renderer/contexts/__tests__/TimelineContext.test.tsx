import React from 'react';
import { render, act } from '@testing-library/react';
import { TimelineProvider, TimelineContext, timelineReducer } from '../TimelineContext';
import { TimelineState, Track, VideoClip } from '../../types/timeline';

const useTimelineContext = () => {
  const context = React.useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
};

describe('TimelineProvider', () => {
  const mockVideoClip: VideoClip & { layer: number } = {
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

  const TestComponent: React.FC = () => {
    const { state, dispatch } = useTimelineContext();

    return (
      <div>
        <span data-testid="current-time">{state.currentTime}</span>
        <span data-testid="is-playing">{state.isPlaying.toString()}</span>
        <button
          data-testid="play-button"
          onClick={() => dispatch({ type: 'SET_IS_PLAYING', payload: true })}
        >
          Play
        </button>
        <button
          data-testid="add-track-button"
          onClick={() => dispatch({ type: 'ADD_TRACK', payload: mockTrack })}
        >
          Add Track
        </button>
      </div>
    );
  };

  const TestStateReader: React.FC<{ onState: (state: TimelineState) => void }> = ({ onState }) => {
    const { state } = useTimelineContext();
    React.useEffect(() => {
      onState(state);
    }, [state, onState]);
    return null;
  };

  it('provides initial state', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestComponent />
      </TimelineProvider>
    );

    expect(getByTestId('current-time').textContent).toBe('0');
    expect(getByTestId('is-playing').textContent).toBe('false');
  });

  it('updates state through dispatch', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TestComponent />
      </TimelineProvider>
    );

    act(() => {
      getByTestId('play-button').click();
    });

    expect(getByTestId('is-playing').textContent).toBe('true');
  });

  it('handles complex state updates', () => {
    let currentState: TimelineState | undefined;

    render(
      <TimelineProvider>
        <TestComponent />
        <TestStateReader onState={state => { currentState = state; }} />
      </TimelineProvider>
    );

    act(() => {
      const button = document.querySelector('[data-testid="add-track-button"]');
      if (button) {
        (button as HTMLButtonElement).click();
      }
    });

    expect(currentState?.tracks).toHaveLength(1);
    expect(currentState?.tracks[0]).toEqual(mockTrack);
  });

  it('maintains history for state changes', () => {
    let currentState: TimelineState | undefined;

    render(
      <TimelineProvider>
        <TestComponent />
        <TestStateReader onState={state => { currentState = state; }} />
      </TimelineProvider>
    );

    act(() => {
      const button = document.querySelector('[data-testid="add-track-button"]');
      if (button) {
        (button as HTMLButtonElement).click();
      }
    });

    expect(currentState?.history.entries).toHaveLength(1);
    expect(currentState?.history.currentIndex).toBe(0);
  });

  describe('TimelineContext error boundary', () => {
    const ErrorComponent: React.FC = () => {
      const { dispatch } = useTimelineContext();

      return (
        <button
          data-testid="error-button"
          onClick={() => dispatch({ type: 'INVALID_ACTION' as any })}
        >
          Trigger Error
        </button>
      );
    };

    it('handles invalid actions gracefully', () => {
      let currentState: TimelineState | undefined;

      render(
        <TimelineProvider>
          <ErrorComponent />
          <TestStateReader onState={state => { currentState = state; }} />
        </TimelineProvider>
      );

      act(() => {
        const button = document.querySelector('[data-testid="error-button"]');
        if (button) {
          (button as HTMLButtonElement).click();
        }
      });

      expect(currentState?.error).toBeDefined();
    });

    it('recovers from errors on valid actions', () => {
      let currentState: TimelineState | undefined;

      render(
        <TimelineProvider>
          <TestComponent />
          <ErrorComponent />
          <TestStateReader onState={state => { currentState = state; }} />
        </TimelineProvider>
      );

      // Trigger error
      act(() => {
        const errorButton = document.querySelector('[data-testid="error-button"]');
        if (errorButton) {
          (errorButton as HTMLButtonElement).click();
        }
      });

      // Perform valid action
      act(() => {
        const playButton = document.querySelector('[data-testid="play-button"]');
        if (playButton) {
          (playButton as HTMLButtonElement).click();
        }
      });

      expect(currentState?.error).toBeUndefined();
      expect(currentState?.isPlaying).toBe(true);
    });
  });

  describe('TimelineContext performance optimizations', () => {
    const RenderCounter = React.memo(() => {
      const renders = React.useRef(0);
      renders.current++;

      return <div data-testid="render-count">{renders.current}</div>;
    });

    it('prevents unnecessary re-renders', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <RenderCounter />
          <TestComponent />
        </TimelineProvider>
      );

      const initialRenderCount = Number(getByTestId('render-count').textContent);

      // Update unrelated state
      act(() => {
        getByTestId('play-button').click();
      });

      expect(Number(getByTestId('render-count').textContent)).toBe(initialRenderCount);
    });
  });
});
