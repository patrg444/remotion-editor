import React from 'react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { TimelineState, Track, ActionTypes } from '../../types/timeline';
import { EditHistoryProvider } from '../../contexts/EditHistoryContext';
import { useTimelineContext } from '../../hooks/useTimelineContext';
import { MediaBinProvider } from '../../contexts/MediaBinContext';

interface TestAppProps {
  children: React.ReactNode;
  initialTracks?: Track[];
}

const TestAppInitializer: React.FC<{ initialState: TimelineState }> = ({ initialState }) => {
  const { dispatch } = useTimelineContext();
  React.useEffect(() => {
    dispatch({
      type: ActionTypes.SET_STATE,
      payload: initialState
    });
  }, [dispatch, initialState]);
  return null;
};

export const TestApp: React.FC<TestAppProps> = ({ children, initialTracks = [] }) => {
  const initialState: TimelineState = {
    tracks: initialTracks,
    currentTime: 0,
    duration: 0,
    isDragging: false,
    isPlaying: false,
    zoom: 1,
    scrollLeft: 0,
    scrollX: 0,
    scrollY: 0,
    aspectRatio: '16:9',
    selectedClipIds: initialTracks[0]?.clips[0]?.id ? [initialTracks[0].clips[0].id] : [],
    selectedCaptionIds: [],
    markers: [],
    fps: 30,
    history: {
      entries: [],
      currentIndex: -1
    },
    error: undefined,
    showEffects: true,
    renderQuality: 'preview' as const,
    isSnappingEnabled: true,
    rippleState: {}
  };

  return (
    <EditHistoryProvider>
      <TimelineProvider>
        <MediaBinProvider>
          <TestAppInitializer initialState={initialState} />
          {children}
        </MediaBinProvider>
      </TimelineProvider>
    </EditHistoryProvider>
  );
};
