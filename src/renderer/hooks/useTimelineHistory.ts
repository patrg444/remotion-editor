import { useCallback, useRef } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { produceWithPatches, Patch, enablePatches, applyPatches } from 'immer';
import { TimelineState, ActionTypes, Track, ClipWithLayer } from '../types/timeline';
import { TimelineConstants } from '../utils/timelineConstants';
import { logger } from '../utils/logger';
import { StateDiff } from '../types/history';

// Enable patches for Immer
enablePatches();

// Helper function to safely apply patches
const applyPatchesToState = <T extends object>(state: T, patches: Patch[]): T => {
  return applyPatches(state, patches) as T;
};

// Checkpoint actions that store full state snapshots
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

export const useTimelineHistory = () => {
  const { state, dispatch } = useTimelineContext();
  const previousState = useRef<TimelineState | null>(null);
  const lastAction = useRef<ActionTypes | null>(null);

  const pushHistory = useCallback((description: string, actionType?: ActionTypes) => {
    if (!previousState.current) {
      previousState.current = state;
      return;
    }

    const [nextState, patches, inversePatches] = produceWithPatches(previousState.current, (draft: TimelineState) => {
      Object.assign(draft, state);
    });

    const diff: StateDiff = {
      type: actionType && CHECKPOINT_ACTIONS.has(actionType) ? 'full' : 'partial',
      timestamp: Date.now(),
      patches,
      inversePatches,
      description,
      snapshot: actionType && CHECKPOINT_ACTIONS.has(actionType) ? state : undefined
    };

    previousState.current = nextState;
    lastAction.current = actionType || null;

    logger.debug('Pushing history entry:', {
      description,
      actionType,
      type: diff.type,
      historySize: state.history.entries.length
    });

    dispatch({
      type: ActionTypes.PUSH_HISTORY,
      payload: {
        entry: diff,
        maxSize: TimelineConstants.History.MAX_HISTORY_SIZE
      }
    });
  }, [state, dispatch]);

  const undo = useCallback(() => {
    const { history } = state;
    if (history.currentIndex < 0) return;

    const currentDiff = history.entries[history.currentIndex];
    const targetIndex = history.currentIndex - 1;

    logger.debug('[History] Starting undo operation:', {
      currentIndex: history.currentIndex,
      targetIndex,
      currentDiffType: currentDiff.type,
      currentDiffDescription: currentDiff.description
    });

    // Apply inverse patches
    let newState = state;
    const entry = history.entries[history.currentIndex];
    
    logger.debug('[History] Applying inverse patches:', {
      description: entry.description,
      patchCount: entry.inversePatches.length
    });

    newState = applyPatchesToState(newState, entry.inversePatches);

    // Log state transition
    logger.debug('[History] State transition:', {
      fromTracks: state.tracks.map((t: Track) => ({
        id: t.id,
        clips: t.clips.map((c: ClipWithLayer) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          layer: c.layer,
          mediaOffset: c.mediaOffset,
          mediaDuration: c.mediaDuration
        }))
      })),
      toTracks: newState.tracks.map((t: Track) => ({
        id: t.id,
        clips: t.clips.map((c: ClipWithLayer) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          layer: c.layer,
          mediaOffset: c.mediaOffset,
          mediaDuration: c.mediaDuration
        }))
      }))
    });

    // Update state and history index
    dispatch({
      type: ActionTypes.SET_STATE,
      payload: {
        ...newState,
        history: {
          ...history,
          currentIndex: targetIndex
        }
      }
    });

    // Update previous state
    previousState.current = newState;

    // Wait for next frame to ensure state is updated
    requestAnimationFrame(() => {
      // Notify of undo completion
      window.dispatchEvent(new CustomEvent('history:undo-complete', {
        detail: {
          fromIndex: history.currentIndex,
          toIndex: targetIndex,
          description: currentDiff.description
        }
      }));

      // Force state update to ensure all components re-render
      dispatch({
        type: ActionTypes.SET_CURRENT_TIME,
        payload: state.currentTime
      });
    });
  }, [state, dispatch]);

  const redo = useCallback(() => {
    const { history } = state;
    if (history.currentIndex >= history.entries.length - 1) return;

    const targetIndex = history.currentIndex + 1;
    const nextDiff = history.entries[targetIndex];

    logger.debug('[History] Starting redo operation:', {
      currentIndex: history.currentIndex,
      targetIndex,
      nextDiffType: nextDiff.type,
      nextDiffDescription: nextDiff.description
    });

    // Apply patches
    let newState = state;
    const entry = history.entries[targetIndex];
    
    logger.debug('[History] Applying patches:', {
      description: entry.description,
      patchCount: entry.patches.length
    });

    newState = applyPatchesToState(newState, entry.patches);

    // Log state transition
    logger.debug('[History] State transition:', {
      fromTracks: state.tracks.map((t: Track) => ({
        id: t.id,
        clips: t.clips.map((c: ClipWithLayer) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          layer: c.layer,
          mediaOffset: c.mediaOffset,
          mediaDuration: c.mediaDuration
        }))
      })),
      toTracks: newState.tracks.map((t: Track) => ({
        id: t.id,
        clips: t.clips.map((c: ClipWithLayer) => ({
          id: c.id,
          startTime: c.startTime,
          endTime: c.endTime,
          layer: c.layer,
          mediaOffset: c.mediaOffset,
          mediaDuration: c.mediaDuration
        }))
      }))
    });

    // Update state and history index
    dispatch({
      type: ActionTypes.SET_STATE,
      payload: {
        ...newState,
        history: {
          ...history,
          currentIndex: targetIndex
        }
      }
    });

    // Update previous state
    previousState.current = newState;

    // Wait for next frame to ensure state is updated
    requestAnimationFrame(() => {
      // Notify of redo completion
      window.dispatchEvent(new CustomEvent('history:redo-complete', {
        detail: {
          fromIndex: history.currentIndex,
          toIndex: targetIndex,
          description: nextDiff.description
        }
      }));

      // Force state update to ensure all components re-render
      dispatch({
        type: ActionTypes.SET_CURRENT_TIME,
        payload: state.currentTime
      });
    });
  }, [state, dispatch]);

  const clearHistory = useCallback(() => {
    dispatch({
      type: ActionTypes.CLEAR_HISTORY
    });
    previousState.current = state;
    lastAction.current = null;
  }, [state, dispatch]);

  const getHistoryStatus = useCallback(() => {
    const { history } = state;
    return {
      canUndo: history.currentIndex >= 0,
      canRedo: history.currentIndex < history.entries.length - 1,
      currentIndex: history.currentIndex,
      totalEntries: history.entries.length,
      lastAction: lastAction.current
    };
  }, [state]);

  const getHistoryDescription = useCallback((index: number): string | null => {
    const { history } = state;
    if (index < 0 || index >= history.entries.length) return null;
    return history.entries[index].description;
  }, [state]);

  const getHistoryDiff = useCallback((index: number): StateDiff | null => {
    const { history } = state;
    if (index < 0 || index >= history.entries.length) return null;
    return history.entries[index];
  }, [state]);

  const getHistoryState = useCallback((index: number): TimelineState | null => {
    const { history } = state;
    if (index < 0 || index >= history.entries.length) return null;

    // If target state is a checkpoint, use its snapshot
    const targetDiff = history.entries[index];
    if (targetDiff.type === 'full' && targetDiff.snapshot) {
      return { ...targetDiff.snapshot };
    }

    // Otherwise, replay diffs to reach target state
    let currentState = state;
    if (index < history.currentIndex) {
      // Apply inverse patches
      for (let i = history.currentIndex; i > index; i--) {
        currentState = applyPatchesToState(currentState, history.entries[i].inversePatches);
      }
    } else if (index > history.currentIndex) {
      // Apply forward patches
      for (let i = history.currentIndex + 1; i <= index; i++) {
        currentState = applyPatchesToState(currentState, history.entries[i].patches);
      }
    }

    return currentState;
  }, [state]);

  return {
    pushHistory,
    undo,
    redo,
    clearHistory,
    getHistoryStatus,
    getHistoryDescription,
    getHistoryDiff,
    getHistoryState
  };
};
