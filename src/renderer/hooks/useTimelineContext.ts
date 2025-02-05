import { useContext } from 'react';
import { TimelineContext, TimelineContextValue } from '../contexts/TimelineContext';

export const useTimelineContext = (): TimelineContextValue => {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error('useTimelineContext must be used within a TimelineProvider');
  }
  return context;
};
