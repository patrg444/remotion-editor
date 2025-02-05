import { TimelineState, Track, VideoClip, ClipWithLayer, Marker } from '../../types/timeline';
import { timelineReducer } from '../TimelineContext';
import { StateDiff } from '../../utils/historyDiff';

describe('timelineReducer', () => {
  const initialState: TimelineState = {
    tracks: [],
    currentTime: 0,
    duration: 100,
    zoom: 1,
    fps: 30,
    isPlaying: false,
    isDragging: false,
    scrollX: 0,
    scrollY: 0,
    selectedClipIds: [],
    markers: [],
    history: {
      entries: [],
      currentIndex: -1
    }
  };

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

  describe('playback state', () => {
    it('handles SET_IS_PLAYING action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_IS_PLAYING',
        payload: true
      });

      expect(newState.isPlaying).toBe(true);
    });

    it('handles SET_CURRENT_TIME action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_CURRENT_TIME',
        payload: 10
      });

      expect(newState.currentTime).toBe(10);
    });

    it('handles SET_DURATION action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_DURATION',
        payload: 200
      });

      expect(newState.duration).toBe(200);
    });

    it('handles SET_FPS action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_FPS',
        payload: 60
      });

      expect(newState.fps).toBe(60);
    });

    it('stops playback when seeking beyond duration', () => {
      const playingState: TimelineState = {
        ...initialState,
        isPlaying: true,
        duration: 100
      };

      const newState = timelineReducer(playingState, {
        type: 'SET_CURRENT_TIME',
        payload: 110
      });

      expect(newState.isPlaying).toBe(false);
      expect(newState.currentTime).toBe(100);
    });
  });

  describe('scroll and zoom state', () => {
    it('handles SET_ZOOM action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_ZOOM',
        payload: 2
      });

      expect(newState.zoom).toBe(2);
    });

    it('handles SET_SCROLL_X action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_SCROLL_X',
        payload: 100
      });

      expect(newState.scrollX).toBe(100);
    });

    it('handles SET_SCROLL_Y action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_SCROLL_Y',
        payload: 50
      });

      expect(newState.scrollY).toBe(50);
    });

    it('clamps scroll values to valid ranges', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_SCROLL_X',
        payload: -50
      });

      expect(newState.scrollX).toBe(0);
    });

    it('adjusts scroll position when zooming', () => {
      const scrolledState: TimelineState = {
        ...initialState,
        scrollX: 100,
        zoom: 1
      };

      const newState = timelineReducer(scrolledState, {
        type: 'SET_ZOOM',
        payload: 2
      });

      expect(newState.scrollX).toBe(200);
    });
  });

  describe('drag state', () => {
    it('handles SET_IS_DRAGGING action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_IS_DRAGGING',
        payload: true
      });

      expect(newState.isDragging).toBe(true);
    });

    it('clears selection when starting drag without selected items', () => {
      const stateWithSelection: TimelineState = {
        ...initialState,
        selectedClipIds: ['clip1']
      };

      const newState = timelineReducer(stateWithSelection, {
        type: 'SET_IS_DRAGGING',
        payload: true
      });

      expect(newState.selectedClipIds).toEqual([]);
    });

    it('maintains selection when dragging selected items', () => {
      const stateWithSelection: TimelineState = {
        ...initialState,
        selectedClipIds: ['clip1'],
        tracks: [mockTrack]
      };

      const newState = timelineReducer(stateWithSelection, {
        type: 'SET_IS_DRAGGING',
        payload: true
      });

      expect(newState.selectedClipIds).toEqual(['clip1']);
    });
  });

  // ... (previous test sections remain unchanged)

  describe('error handling', () => {
    it('handles SET_ERROR action', () => {
      const newState = timelineReducer(initialState, {
        type: 'SET_ERROR',
        payload: 'Test error message'
      });

      expect(newState.error).toBe('Test error message');
    });

    it('clears error when setting to undefined', () => {
      const stateWithError: TimelineState = {
        ...initialState,
        error: 'Previous error'
      };

      const newState = timelineReducer(stateWithError, {
        type: 'SET_ERROR',
        payload: undefined
      });

      expect(newState.error).toBeUndefined();
    });

    it('clears error when performing successful actions', () => {
      const stateWithError: TimelineState = {
        ...initialState,
        error: 'Previous error'
      };

      const newState = timelineReducer(stateWithError, {
        type: 'SET_CURRENT_TIME',
        payload: 10
      });

      expect(newState.error).toBeUndefined();
    });
  });

  // ... (rest of the test file remains unchanged)
});
