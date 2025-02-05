import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { EditOperation, EditHistoryState, EditHistoryAction } from '../types/edit-history';

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

      return {
        ...state,
        operations: [
          ...state.operations.slice(0, Math.max(0, state.currentIndex + 1)),
          action.operation
        ],
        currentIndex: state.currentIndex + 1,
        lastOperation: action.operation
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

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        lastOperation: null
      };
    }

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

interface EditHistoryContextValue {
  history: EditHistoryState;
  addOperation: (operation: EditOperation) => void;
  undo: () => EditOperation | null;
  redo: () => EditOperation | null;
  clear: () => void;
}

const EditHistoryContext = createContext<EditHistoryContextValue | null>(null);

export const EditHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, dispatch] = useReducer(editHistoryReducer, initialState);

  const addOperation = useCallback((operation: EditOperation) => {
    dispatch({ type: 'ADD_OPERATION', operation });
  }, []);

  const undo = useCallback(() => {
    if (history.currentIndex < 0) return null;
    const operation = history.operations[history.currentIndex];
    dispatch({ type: 'UNDO' });
    return operation;
  }, [history]);

  const redo = useCallback(() => {
    if (history.currentIndex >= history.operations.length - 1) return null;
    const operation = history.operations[history.currentIndex + 1];
    dispatch({ type: 'REDO' });
    return operation;
  }, [history]);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const value = {
    history,
    addOperation,
    undo,
    redo,
    clear
  };

  return (
    <EditHistoryContext.Provider value={value}>
      {children}
    </EditHistoryContext.Provider>
  );
};

export const useEditHistory = () => {
  const context = useContext(EditHistoryContext);
  if (!context) {
    throw new Error('useEditHistory must be used within an EditHistoryProvider');
  }
  return context;
};

export default EditHistoryContext;
