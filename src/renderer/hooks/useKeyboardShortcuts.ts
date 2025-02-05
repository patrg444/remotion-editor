import { useCallback } from 'react';
import { useTimeline } from './useTimeline';
import { Track, ActionTypes } from '../types/timeline';
import { useTimelineContext } from './useTimelineContext';

export const useKeyboardShortcuts = () => {
  const { state, dispatch } = useTimelineContext();
  const timeline = useTimeline();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, ctrlKey, shiftKey } = event;

    // Get currently selected clip and track
    const selectedClipId = state.selectedClipIds[0]; // Get first selected clip
    const selectedTrackId = state.selectedTrackId;

    if (!selectedClipId || !selectedTrackId) return;

    // Find the selected clip and track
    const track = state.tracks.find((t: Track) => t.id === selectedTrackId);
    const clip = track?.clips.find((c: { id: string }) => c.id === selectedClipId);

    if (!track || !clip) return;

    const bounds = {
      start: clip.startTime,
      end: clip.endTime
    };

    switch (key) {
      case ' ': // Space
        event.preventDefault();
        dispatch({
          type: ActionTypes.SET_IS_PLAYING,
          payload: !state.isPlaying
        });
        break;

      case 'Delete':
      case 'Backspace':
        event.preventDefault();
        dispatch({
          type: ActionTypes.REMOVE_CLIP,
          payload: { trackId: track.id, clipId: selectedClipId }
        });
        break;

      case 'ArrowLeft':
        event.preventDefault();
        if (ctrlKey) {
          // Move clip left
          const newStartTime = Math.max(0, bounds.start - 1);
          dispatch({
            type: ActionTypes.MOVE_CLIP,
            payload: {
              clipId: selectedClipId,
              sourceTrackId: selectedTrackId,
              targetTrackId: selectedTrackId,
              newStartTime
            }
          });
        } else {
          // Move playhead left
          dispatch({
            type: ActionTypes.SET_CURRENT_TIME,
            payload: Math.max(0, state.currentTime - 1)
          });
        }
        break;

      case 'ArrowRight':
        event.preventDefault();
        if (ctrlKey) {
          // Move clip right
          const newStartTime = bounds.start + 1;
          dispatch({
            type: ActionTypes.MOVE_CLIP,
            payload: {
              clipId: selectedClipId,
              sourceTrackId: selectedTrackId,
              targetTrackId: selectedTrackId,
              newStartTime
            }
          });
        } else {
          // Move playhead right
          dispatch({
            type: ActionTypes.SET_CURRENT_TIME,
            payload: state.currentTime + 1
          });
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (ctrlKey) {
          // Move clip up one track
          const currentTrackIndex = state.tracks.findIndex((t: Track) => t.id === selectedTrackId);
          if (currentTrackIndex > 0) {
            const targetTrack = state.tracks[currentTrackIndex - 1];
            dispatch({
              type: ActionTypes.MOVE_CLIP,
              payload: {
                clipId: selectedClipId,
                sourceTrackId: selectedTrackId,
                targetTrackId: targetTrack.id,
                newStartTime: bounds.start
              }
            });
          }
        }
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (ctrlKey) {
          // Move clip down one track
          const currentTrackIndex = state.tracks.findIndex((t: Track) => t.id === selectedTrackId);
          if (currentTrackIndex < state.tracks.length - 1) {
            const targetTrack = state.tracks[currentTrackIndex + 1];
            dispatch({
              type: ActionTypes.MOVE_CLIP,
              payload: {
                clipId: selectedClipId,
                sourceTrackId: selectedTrackId,
                targetTrackId: targetTrack.id,
                newStartTime: bounds.start
              }
            });
          }
        }
        break;

      case 's':
        if (ctrlKey) {
          event.preventDefault();
          dispatch({
            type: ActionTypes.SPLIT_CLIP,
            payload: {
              trackId: selectedTrackId,
              clipId: selectedClipId,
              time: state.currentTime
            }
          });
        }
        break;

      case 'z':
        if (ctrlKey && !shiftKey) {
          event.preventDefault();
          dispatch({ type: ActionTypes.UNDO });
        } else if (ctrlKey && shiftKey) {
          event.preventDefault();
          dispatch({ type: ActionTypes.REDO });
        }
        break;
    }
  }, [state, dispatch]);

  return handleKeyDown;
};
