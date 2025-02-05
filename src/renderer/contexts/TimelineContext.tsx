import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { produce } from 'immer';
import {
  TimelineState,
  TimelineAction,
  ActionTypes,
  initialTimelineState,
  isMediaClip,
  isVideoClip,
  isAudioClip,
  VideoClip,
  AudioClip,
  CaptionClip,
  ClipWithLayer
} from '../types/timeline';
import { applyStateDiff, createStateDiff, StateDiff } from '../utils/historyDiff';
import { TimelineConstants } from '../utils/timelineConstants';
import { logger } from '../utils/logger';
import { validateTimelineState } from '../utils/timelineValidation';
import { timeToPixels, pixelsToTime } from '../utils/timelineScale';
import { useRippleEdit } from '../hooks/useRippleEdit';

export interface TimelineContextValue {
  state: TimelineState;
  dispatch: React.Dispatch<TimelineAction>;
}

export const TimelineContext = createContext<TimelineContextValue | undefined>(undefined);

const NON_UNDOABLE_ACTIONS = new Set<ActionTypes>([
  ActionTypes.SET_CURRENT_TIME,
  ActionTypes.SET_PLAYING,
  ActionTypes.SET_SCROLL_X,
  ActionTypes.SET_SCROLL_Y,
  ActionTypes.SET_DRAGGING,
  ActionTypes.SET_ERROR,
  ActionTypes.RESTORE_SNAPSHOT,
  ActionTypes.SET_IS_PLAYING,
  ActionTypes.SET_IS_DRAGGING,
  ActionTypes.SET_SELECTED_CLIP_IDS,
  ActionTypes.SELECT_CLIPS,
  ActionTypes.SET_SELECTED_TRACK_ID,
  ActionTypes.SET_DURATION
]);

const CHECKPOINT_ACTIONS = new Set<ActionTypes>([
  ActionTypes.ADD_TRACK,
  ActionTypes.REMOVE_TRACK,
  ActionTypes.ADD_CLIP,
  ActionTypes.REMOVE_CLIP,
  ActionTypes.SPLIT_CLIP,
  ActionTypes.SET_TRACKS,
  ActionTypes.MOVE_TRACK,
  ActionTypes.MOVE_CLIP
]);

export const timelineReducer = (state: TimelineState, action: TimelineAction): TimelineState => {
  return produce(state, draft => {
    let shouldCreateHistoryEntry = false;
    let historyDescription = '';
    let beforeState = state;
    let isCheckpoint = false;

    if (!NON_UNDOABLE_ACTIONS.has(action.type)) {
      shouldCreateHistoryEntry = true;
      historyDescription = getHistoryDescription(action);
      beforeState = { ...state };
      isCheckpoint = CHECKPOINT_ACTIONS.has(action.type);

      logger.debug('Processing action:', {
        type: action.type,
        isCheckpoint,
        description: historyDescription
      });
    }

    switch (action.type) {
      case ActionTypes.SET_STATE:
        return action.payload;

      case ActionTypes.SET_DURATION:
        draft.duration = action.payload;
        break;

      case ActionTypes.SET_TRACKS:
        draft.tracks = action.payload;
        break;

      case ActionTypes.SET_CURRENT_TIME:
        draft.currentTime = action.payload.time;
        break;

      case ActionTypes.SET_PLAYING:
        draft.isPlaying = action.payload;
        break;

      case ActionTypes.SET_SCROLL_X:
        draft.scrollX = action.payload;
        break;

      case ActionTypes.SET_SCROLL_Y:
        draft.scrollY = action.payload;
        break;

      case ActionTypes.SET_ZOOM:
        draft.zoom = action.payload;
        break;

      case ActionTypes.SET_FPS:
        draft.fps = action.payload;
        break;

      case ActionTypes.SET_DRAGGING:
        draft.isDragging = action.payload.isDragging;
        draft.dragStartX = action.payload.dragStartX;
        draft.dragStartY = action.payload.dragStartY;
        break;

      case ActionTypes.SET_ERROR:
        draft.error = action.payload;
        break;

      case ActionTypes.ADD_TRACK:
        draft.tracks.push(action.payload.track);
        break;

      case ActionTypes.UPDATE_TRACK:
        {
          const trackIndex = draft.tracks.findIndex(t => t.id === action.payload.trackId);
          if (trackIndex !== -1) {
            draft.tracks[trackIndex] = {
              ...draft.tracks[trackIndex],
              ...action.payload.track
            };
          }
        }
        break;

      case ActionTypes.REMOVE_TRACK:
        draft.tracks = draft.tracks.filter(t => t.id !== action.payload.trackId);
        break;

      case ActionTypes.ADD_CLIP:
        {
          const trackToAddClip = draft.tracks.find(t => t.id === action.payload.trackId);
          if (trackToAddClip) {
            // Remove any existing clip with the same ID
            trackToAddClip.clips = trackToAddClip.clips.filter(c => c.id !== action.payload.clip.id);
            
            // Create new clip with provided values
            // Here we ensure that if initialBounds isn't already provided, we set it.
            const newClip = {
              ...action.payload.clip,
              startTime: action.payload.clip.startTime ?? 0,
              endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
              // Preserve or create the reference to the source media
              initialBounds: action.payload.clip.initialBounds || {
                startTime: action.payload.clip.startTime ?? 0,
                endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
                mediaOffset: action.payload.clip.mediaOffset ?? 0,
                mediaDuration: action.payload.clip.mediaDuration ?? ((action.payload.clip.endTime ?? 0) - (action.payload.clip.startTime ?? 0))
              }
            };
            
            if (!trackToAddClip.clips.some(c => c.id === newClip.id)) {
              trackToAddClip.clips.push(newClip);
              trackToAddClip.clips.sort((a, b) => a.startTime - b.startTime);
            }
          }
        }
        break;

      case ActionTypes.UPDATE_CLIP:
        {
          const trackWithClip = draft.tracks.find(t => t.id === action.payload.trackId);
          if (trackWithClip) {
            const clipIndex = trackWithClip.clips.findIndex(c => c.id === action.payload.clipId);
            if (clipIndex !== -1) {
              trackWithClip.clips[clipIndex] = {
                ...trackWithClip.clips[clipIndex],
                ...action.payload.clip
              };
            }
          }
        }
        break;

      case ActionTypes.REMOVE_CLIP:
        {
          const trackToRemoveClip = draft.tracks.find(t => t.id === action.payload.trackId);
          if (trackToRemoveClip) {
            trackToRemoveClip.clips = trackToRemoveClip.clips.filter(c => c.id !== action.payload.clipId);
          }
        }
        break;

      case ActionTypes.MOVE_CLIP:
        {
          const sourceTrack = draft.tracks.find(t => t.id === action.payload.sourceTrackId);
          const targetTrack = draft.tracks.find(t => t.id === action.payload.targetTrackId);
          if (sourceTrack && targetTrack) {
            const clipToMove = sourceTrack.clips.find(c => c.id === action.payload.clipId);
            if (clipToMove) {
              const desiredStart = Math.max(0, action.payload.newTime);
              const delta = desiredStart - clipToMove.startTime;
              const newStartTime = clipToMove.startTime + delta;
              const newEndTime = clipToMove.endTime + delta;
              const updatedClip = {
                ...clipToMove,
                startTime: newStartTime,
                endTime: newEndTime,
                mediaOffset: clipToMove.mediaOffset + delta
              };

              if (sourceTrack.id === targetTrack.id) {
                const clipIndex = sourceTrack.clips.findIndex(c => c.id === clipToMove.id);
                if (clipIndex !== -1) {
                  sourceTrack.clips[clipIndex] = updatedClip;
                }
              } else {
                sourceTrack.clips = sourceTrack.clips.filter(c => c.id !== clipToMove.id);
                targetTrack.clips.push(updatedClip);
              }
            }
          }
        }
        break;

      case ActionTypes.TRIM_CLIP:
        {
          for (const track of draft.tracks) {
            const clipToTrim = track.clips.find(c => c.id === action.payload.clipId);
            if (clipToTrim) {
              const oldEndTime = clipToTrim.endTime;
              // Determine new end time.
              // Use full available duration from the reference media:
              const maxEndTime = clipToTrim.startTime + clipToTrim.mediaDuration;
              let newEndTime = action.payload.endTime !== undefined
                ? Math.min(action.payload.endTime, maxEndTime)
                : clipToTrim.endTime;

              logger.debug('TRIM_CLIP action:', {
                clipId: clipToTrim.id,
                oldEndTime,
                newEndTime,
                maxEndTime,
                ripple: action.payload.ripple,
                mediaDuration: clipToTrim.mediaDuration,
                startTime: clipToTrim.startTime
              });

              const clipIndex = track.clips.findIndex(c => c.id === clipToTrim.id);

              // Update the clip being trimmed.
              // Preserve the reference media in initialBounds.
              track.clips[clipIndex] = {
                ...clipToTrim,
                endTime: newEndTime,
                // If new handle positions are provided, use them; otherwise, default to the full range based on the reference.
                handles: action.payload.handles || {
                  startPosition: clipToTrim.mediaOffset,
                  endPosition: clipToTrim.mediaOffset + clipToTrim.mediaDuration
                }
              };

              // If ripple mode is enabled, shift subsequent clips accordingly.
              if (action.payload.ripple) {
                const deltaTime = newEndTime - oldEndTime;
                const subsequentClips = track.clips
                  .slice(clipIndex + 1)
                  .filter(c => c.startTime >= oldEndTime);
                subsequentClips.forEach((clipToMove) => {
                  const idx = track.clips.findIndex(c => c.id === clipToMove.id);
                  if (idx !== -1) {
                    const duration = clipToMove.endTime - clipToMove.startTime;
                    const newStart = clipToMove.startTime + deltaTime;
                    track.clips[idx] = {
                      ...clipToMove,
                      startTime: newStart,
                      endTime: newStart + duration,
                      mediaOffset: clipToMove.mediaOffset + deltaTime
                    };
                  }
                });
                track.clips.sort((a, b) => a.startTime - b.startTime);
              }
            }
          }
        }
        break;

      case ActionTypes.SPLIT_CLIP:
        {
          const trackToSplit = draft.tracks.find(t => t.id === action.payload.trackId);
          if (trackToSplit) {
            const clipToSplit = trackToSplit.clips.find(c => c.id === action.payload.clipId);
            if (clipToSplit && action.payload.time > clipToSplit.startTime && action.payload.time < clipToSplit.endTime) {
              const splitPoint = action.payload.time;
              const firstDuration = splitPoint - clipToSplit.startTime;
              const secondDuration = clipToSplit.endTime - splitPoint;

              // Use initialBounds as the reference for the source media.
              const originalMediaOffset = clipToSplit.initialBounds?.mediaOffset ?? clipToSplit.mediaOffset;
              const originalMediaDuration = clipToSplit.initialBounds?.mediaDuration ?? clipToSplit.mediaDuration;

              // Create first clip.
              const firstClip = {
                ...clipToSplit,
                id: `${clipToSplit.id}-1`,
                endTime: splitPoint,
                mediaDuration: firstDuration,
                // Keep the original mediaOffset for the first clip.
                handles: {
                  startPosition: originalMediaOffset,
                  endPosition: originalMediaOffset + firstDuration
                },
                // Preserve the reference media in initialBounds.
                initialBounds: clipToSplit.initialBounds
              };

              // Create second clip.
              const secondClip = {
                ...clipToSplit,
                id: `${clipToSplit.id}-2`,
                startTime: splitPoint,
                mediaOffset: originalMediaOffset + firstDuration,
                mediaDuration: originalMediaDuration - firstDuration,
                handles: {
                  startPosition: originalMediaOffset + firstDuration,
                  endPosition: originalMediaOffset + originalMediaDuration
                },
                initialBounds: clipToSplit.initialBounds
              };

              trackToSplit.clips = trackToSplit.clips.filter(c => c.id !== clipToSplit.id);
              trackToSplit.clips.push(firstClip, secondClip);
              trackToSplit.clips.sort((a, b) => a.startTime - b.startTime);
              draft.selectedClipIds = [firstClip.id, secondClip.id];
            }
          }
        }
        break;

      case ActionTypes.SELECT_CLIPS:
        draft.selectedClipIds = action.payload.clipIds;
        break;

      case ActionTypes.SET_SELECTED_CLIP_IDS:
        draft.selectedClipIds = action.payload;
        break;

      case ActionTypes.SET_SELECTED_TRACK_ID:
        draft.selectedTrackId = action.payload;
        break;
    }

    if (shouldCreateHistoryEntry) {
      const diff = createStateDiff(beforeState, draft as TimelineState, historyDescription, isCheckpoint);
      draft.history.entries.push(diff);
      if (draft.history.entries.length > TimelineConstants.History.MAX_HISTORY_SIZE) {
        draft.history.entries = draft.history.entries.slice(-TimelineConstants.History.MAX_HISTORY_SIZE);
      }
      draft.history.currentIndex = draft.history.entries.length - 1;
    }
  });
};

const getHistoryDescription = (action: TimelineAction): string => {
  switch (action.type) {
    case ActionTypes.ADD_TRACK:
      return 'Add track';
    case ActionTypes.REMOVE_TRACK:
      return 'Remove track';
    case ActionTypes.ADD_CLIP:
      return 'Add clip';
    case ActionTypes.REMOVE_CLIP:
      return 'Remove clip';
    case ActionTypes.MOVE_CLIP:
      return 'Move clip';
    case ActionTypes.SPLIT_CLIP:
      return 'Split clip';
    case ActionTypes.TRIM_CLIP:
      return 'Trim clip';
    case ActionTypes.SET_ZOOM:
      return 'Change zoom';
    case ActionTypes.SET_FPS:
      return 'Change FPS';
    default:
      return action.type;
  }
};

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialTimelineState);
  const [isInitialized, setIsInitialized] = React.useState(false);
  const { rippleTrim } = useRippleEdit();

  useEffect(() => {
    try {
      console.log('[DEBUG] TimelineContext initializing...', {
        isTest: process.env.IS_TEST,
        nodeEnv: process.env.NODE_ENV
      });
      const validationErrors = validateTimelineState(state);
      console.log('[DEBUG] Timeline state validation:', {
        errors: validationErrors,
        state
      });
      (window as any).timelineState = { 
        ...state,
        dispatch 
      };
      (window as any).timelineDispatch = dispatch;
      (window as any).timelineFunctions = {
        rippleTrim
      };
      setIsInitialized(true);
      (window as any).timelineReady = true;
      console.log('[DEBUG] Timeline ready');
      const detail = {
        state,
        dispatch,
        isValid: validationErrors.length === 0,
        errors: validationErrors
      };
      window.dispatchEvent(new CustomEvent('timeline:initializing', { detail }));
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('timeline:initialized', { detail }));
      });
      logger.debug('[Timeline] Initialization complete:', detail);
      return () => {
        (window as any).timelineReady = false;
        (window as any).timelineState = undefined;
        (window as any).timelineDispatch = undefined;
        (window as any).timelineFunctions = undefined;
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('[Timeline] Initialization failed:', new Error(errorMessage));
      window.dispatchEvent(new CustomEvent('timeline:error', { 
        detail: { error: new Error(errorMessage), state } 
      }));
    }
  }, [state, dispatch, rippleTrim]);

  return (
    <TimelineContext.Provider value={{ state, dispatch }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimelineContext = () => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
};
