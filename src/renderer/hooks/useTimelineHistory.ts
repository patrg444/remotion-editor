import { useCallback, useRef } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { createStateDiff, applyStateDiff, StateDiff } from '../utils/historyDiff';
import { TimelineState, ActionTypes } from '../types/timeline';
import { TimelineConstants } from '../utils/timelineConstants';
import { logger } from '../utils/logger';

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

    const isCheckpoint = actionType && CHECKPOINT_ACTIONS.has(actionType);
    const diff = createStateDiff(previousState.current, state, description, isCheckpoint);
    previousState.current = state;
    lastAction.current = actionType || null;

    logger.debug('Pushing history entry:', {
      description,
      actionType,
      isCheckpoint,
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

    let targetIndex = history.currentIndex - 1;
    const currentDiff = history.entries[history.currentIndex];

    // If current entry is not a checkpoint, keep going until we hit one
    if (currentDiff.type !== 'full') {
      while (targetIndex > 0 && history.entries[targetIndex].type !== 'full') {
        targetIndex--;
      }
    }

    logger.debug('Undoing to index:', {
      from: history.currentIndex,
      to: targetIndex,
      isCheckpoint: history.entries[targetIndex]?.type === 'full'
    });

    // Apply all diffs in reverse
    let newState = state;
    for (let i = history.currentIndex; i > targetIndex; i--) {
      newState = applyStateDiff(newState, history.entries[i], true);
    }

    dispatch({
      type: ActionTypes.SET_STATE,
      payload: newState
    });

    dispatch({
      type: ActionTypes.SET_HISTORY_INDEX,
      payload: targetIndex
    });

    previousState.current = newState;
  }, [state, dispatch]);

  const redo = useCallback(() => {
    const { history } = state;
    if (history.currentIndex >= history.entries.length - 1) return;

    let targetIndex = history.currentIndex + 1;
    const nextDiff = history.entries[targetIndex];

    // If next entry is not a checkpoint, keep going until we hit one
    if (nextDiff.type !== 'full') {
      while (
        targetIndex < history.entries.length - 1 &&
        history.entries[targetIndex + 1].type !== 'full'
      ) {
        targetIndex++;
      }
    }

    logger.debug('Redoing to index:', {
      from: history.currentIndex,
      to: targetIndex,
      isCheckpoint: history.entries[targetIndex]?.type === 'full'
    });

    // Apply all diffs forward
    let newState = state;
    for (let i = history.currentIndex + 1; i <= targetIndex; i++) {
      newState = applyStateDiff(newState, history.entries[i]);
    }

    dispatch({
      type: ActionTypes.SET_STATE,
      payload: newState
    });

    dispatch({
      type: ActionTypes.SET_HISTORY_INDEX,
      payload: targetIndex
    });

    previousState.current = newState;
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
      // Find nearest previous checkpoint
      let checkpointIndex = index;
      while (checkpointIndex > 0 && history.entries[checkpointIndex].type !== 'full') {
        checkpointIndex--;
      }

      // Start from checkpoint if found
      if (history.entries[checkpointIndex].type === 'full') {
        currentState = { ...history.entries[checkpointIndex].snapshot! };
        // Apply diffs from checkpoint to target
        for (let i = checkpointIndex + 1; i <= index; i++) {
          currentState = applyStateDiff(currentState, history.entries[i]);
        }
      } else {
        // No checkpoint found, apply reverse diffs
        for (let i = history.currentIndex; i > index; i--) {
          currentState = applyStateDiff(currentState, history.entries[i], true);
        }
      }
    } else if (index > history.currentIndex) {
      // Apply forward diffs
      for (let i = history.currentIndex + 1; i <= index; i++) {
        currentState = applyStateDiff(currentState, history.entries[i]);
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
