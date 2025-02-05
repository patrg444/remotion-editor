import React, { createContext, useReducer, useContext } from 'react';
import { TimelineState, TimelineAction, initialTimelineState } from '../../types/timeline';
import { timelineReducer } from '../TimelineContext';

export interface TimelineContextValue {
  state: TimelineState;
  dispatch: React.Dispatch<TimelineAction>;
}

export const TimelineContext = createContext<TimelineContextValue | undefined>(undefined);

export const TimelineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(timelineReducer, initialTimelineState);

  // Expose state and dispatch for testing without spreading
  (window as any).timelineState = {
    ...state,  // We need the state properties at the top level for compatibility
    state,     // Also include the full state object
    dispatch
  };

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
