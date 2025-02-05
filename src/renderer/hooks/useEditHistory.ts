import { useCallback, useReducer } from 'react';
import {
  EditOperation,
  EditHistoryState,
  EditHistoryAction,
  isUndoable,
  isRedoable,
  canMergeOperations,
  mergeOperations
} from '../types/edit-history';

const initialState: EditHistoryState = {
  operations: [],
  currentIndex: -1,
  lastSavedIndex: -1,
  lastOperation: null
};

function editHistoryReducer(state: EditHistoryState, action: EditHistoryAction): EditHistoryState {
  switch (action.type) {
    case 'ADD_OPERATION': {
      if (!action.operation) return state;

      const { operations, currentIndex, lastOperation } = state;
      const newOperation = action.operation;

      // Try to merge with last operation if possible
      if (lastOperation && canMergeOperations(lastOperation, newOperation)) {
        const mergedOperation = mergeOperations(lastOperation, newOperation);
        return {
          operations: [
            ...operations.slice(0, currentIndex),
            mergedOperation
          ],
          currentIndex,
          lastSavedIndex: state.lastSavedIndex,
          lastOperation: mergedOperation
        };
      }

      // Otherwise add as new operation
      const newOperations = [
        ...operations.slice(0, Math.max(0, currentIndex + 1)),
        newOperation
      ];
      return {
        operations: newOperations,
        currentIndex: newOperations.length - 1,
        lastSavedIndex: state.lastSavedIndex,
        lastOperation: newOperation
      };
    }

    case 'UNDO': {
      if (state.currentIndex < 0) return state;

      return {
        ...state,
        currentIndex: state.currentIndex - 1,
        lastOperation: null
      };
    }

    case 'REDO': {
      if (state.currentIndex >= state.operations.length - 1) return state;

      const nextIndex = state.currentIndex + 1;
      const nextOperation = state.operations[nextIndex];
      return {
        ...state,
        currentIndex: nextIndex,
        lastOperation: nextOperation
      };
    }

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

export function useEditHistory() {
  const [history, dispatch] = useReducer(editHistoryReducer, initialState);

  const addOperation = useCallback((operation: EditOperation) => {
    dispatch({ type: 'ADD_OPERATION', operation });
  }, []);

  const undo = useCallback(() => {
    if (!isUndoable(history)) return null;
    const operation = history.operations[history.currentIndex];

    dispatch({ type: 'UNDO' });
    return operation;
  }, [history]);

  const redo = useCallback(() => {
    if (!isRedoable(history)) return null;
    const operation = history.operations[history.currentIndex + 1];

    dispatch({ type: 'REDO' });
    return operation;
  }, [history]);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const canUndo = isUndoable(history);
  const canRedo = isRedoable(history);

  return {
    history,
    addOperation,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    currentIndex: history.currentIndex,
    operationCount: history.operations.length,
    lastOperation: history.lastOperation
  };
}
