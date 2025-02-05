import { renderHook } from '@testing-library/react-hooks';
import { useKeyboardShortcuts } from '../useKeyboardShortcuts';
import { useTimeline } from '../useTimeline';
import { Track, ProductionClip } from '../../types/timeline';

// Mock useTimeline hook
jest.mock('../useTimeline');

describe('useKeyboardShortcuts', () => {
  // Mock timeline state and actions
  const mockTimeline = {
    state: {
      selectedClipId: 'clip1',
      selectedTrackId: 'track1',
      currentTime: 10,
      isPlaying: false,
      tracks: [
        {
          id: 'track1',
          name: 'Track 1',
          type: 'video',
          clips: [
            {
              id: 'clip1',
              type: 'video',
              startTime: 5,
              duration: 10,
              source: 'test.mp4'
            }
          ],
          duration: 15,
          isVisible: true
        },
        {
          id: 'track2',
          name: 'Track 2',
          type: 'video',
          clips: [],
          duration: 0,
          isVisible: true
        }
      ] as Track[]
    },
    setPlaying: jest.fn(),
    removeClip: jest.fn(),
    moveClip: jest.fn(),
    setCurrentTime: jest.fn(),
    splitClip: jest.fn(),
    undo: jest.fn(),
    redo: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimeline as jest.Mock).mockReturnValue(mockTimeline);
  });

  describe('Playback Controls', () => {
    it('toggles playback on space key', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: ' ' });

      result.current(event);

      expect(mockTimeline.setPlaying).toHaveBeenCalledWith(true);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Clip Operations', () => {
    it('deletes selected clip on Delete key', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'Delete' });

      result.current(event);

      expect(mockTimeline.removeClip).toHaveBeenCalledWith(
        mockTimeline.state.tracks[0],
        'clip1'
      );
      expect(event.defaultPrevented).toBe(true);
    });

    it('deletes selected clip on Backspace key', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });

      result.current(event);

      expect(mockTimeline.removeClip).toHaveBeenCalledWith(
        mockTimeline.state.tracks[0],
        'clip1'
      );
      expect(event.defaultPrevented).toBe(true);
    });

    it('splits clip at playhead on Ctrl+S', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });

      result.current(event);

      expect(mockTimeline.splitClip).toHaveBeenCalledWith('clip1', 10);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Clip Movement', () => {
    it('moves clip left on Ctrl+Left', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true });

      result.current(event);

      expect(mockTimeline.moveClip).toHaveBeenCalledWith('clip1', 'track1', 4);
      expect(event.defaultPrevented).toBe(true);
    });

    it('moves clip right on Ctrl+Right', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight', ctrlKey: true });

      result.current(event);

      expect(mockTimeline.moveClip).toHaveBeenCalledWith('clip1', 'track1', 6);
      expect(event.defaultPrevented).toBe(true);
    });

    it('moves clip up one track on Ctrl+Up', () => {
      // Setup clip on second track
      const mockTimelineWithLowerClip = {
        ...mockTimeline,
        state: {
          ...mockTimeline.state,
          selectedTrackId: 'track2',
          tracks: [
            mockTimeline.state.tracks[0],
            {
              ...mockTimeline.state.tracks[1],
              clips: [{
                id: 'clip1',
                type: 'video',
                startTime: 5,
                duration: 10,
                source: 'test.mp4'
              }]
            }
          ]
        }
      };
      (useTimeline as jest.Mock).mockReturnValue(mockTimelineWithLowerClip);

      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true });

      result.current(event);

      expect(mockTimelineWithLowerClip.moveClip).toHaveBeenCalledWith('clip1', 'track1', 5);
      expect(event.defaultPrevented).toBe(true);
    });

    it('moves clip down one track on Ctrl+Down', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true });

      result.current(event);

      expect(mockTimeline.moveClip).toHaveBeenCalledWith('clip1', 'track2', 5);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Playhead Movement', () => {
    it('moves playhead left on Left Arrow', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      result.current(event);

      expect(mockTimeline.setCurrentTime).toHaveBeenCalledWith(9);
      expect(event.defaultPrevented).toBe(true);
    });

    it('moves playhead right on Right Arrow', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });

      result.current(event);

      expect(mockTimeline.setCurrentTime).toHaveBeenCalledWith(11);
      expect(event.defaultPrevented).toBe(true);
    });

    it('clamps playhead movement to 0', () => {
      const mockTimelineAtStart = {
        ...mockTimeline,
        state: {
          ...mockTimeline.state,
          currentTime: 0
        }
      };
      (useTimeline as jest.Mock).mockReturnValue(mockTimelineAtStart);

      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });

      result.current(event);

      expect(mockTimelineAtStart.setCurrentTime).toHaveBeenCalledWith(0);
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('History Operations', () => {
    it('undoes on Ctrl+Z', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });

      result.current(event);

      expect(mockTimeline.undo).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('redoes on Ctrl+Shift+Z', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });

      result.current(event);

      expect(mockTimeline.redo).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('does nothing when no clip is selected', () => {
      const mockTimelineNoSelection = {
        ...mockTimeline,
        state: {
          ...mockTimeline.state,
          selectedClipId: null
        }
      };
      (useTimeline as jest.Mock).mockReturnValue(mockTimelineNoSelection);

      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'Delete' });

      result.current(event);

      expect(mockTimelineNoSelection.removeClip).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('does nothing when no track is selected', () => {
      const mockTimelineNoTrack = {
        ...mockTimeline,
        state: {
          ...mockTimeline.state,
          selectedTrackId: null
        }
      };
      (useTimeline as jest.Mock).mockReturnValue(mockTimelineNoTrack);

      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'Delete' });

      result.current(event);

      expect(mockTimelineNoTrack.removeClip).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('does nothing when selected clip is not found', () => {
      const mockTimelineInvalidClip = {
        ...mockTimeline,
        state: {
          ...mockTimeline.state,
          selectedClipId: 'nonexistent-clip'
        }
      };
      (useTimeline as jest.Mock).mockReturnValue(mockTimelineInvalidClip);

      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'Delete' });

      result.current(event);

      expect(mockTimelineInvalidClip.removeClip).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it('prevents moving clip up when on top track', () => {
      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowUp', ctrlKey: true });

      result.current(event);

      expect(mockTimeline.moveClip).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('prevents moving clip down when on bottom track', () => {
      const mockTimelineBottomTrack = {
        ...mockTimeline,
        state: {
          ...mockTimeline.state,
          selectedTrackId: 'track2',
          tracks: [
            mockTimeline.state.tracks[0],
            {
              ...mockTimeline.state.tracks[1],
              clips: [{
                id: 'clip1',
                type: 'video',
                startTime: 5,
                duration: 10,
                source: 'test.mp4'
              }]
            }
          ]
        }
      };
      (useTimeline as jest.Mock).mockReturnValue(mockTimelineBottomTrack);

      const { result } = renderHook(() => useKeyboardShortcuts());
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true });

      result.current(event);

      expect(mockTimelineBottomTrack.moveClip).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });
  });
});
