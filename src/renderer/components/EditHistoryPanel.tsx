import React from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import { ActionTypes } from '../types/timeline';
import { StateDiff } from '../utils/historyDiff';
import '../styles/edit-history.css';

export const EditHistoryPanel: React.FC = () => {
  const { state, dispatch } = useTimelineContext();
  const { history } = state;

  const handleUndo = () => {
    dispatch({ type: ActionTypes.UNDO });
  };

  const handleRedo = () => {
    dispatch({ type: ActionTypes.REDO });
  };

  const canUndo = history.currentIndex > 0;
  const canRedo = history.currentIndex < history.entries.length - 1;

  // Get the current entries to display
  const currentEntries = history.entries.slice(0, history.currentIndex + 1);

  return (
    <div className="edit-history-panel">
      <div className="edit-history-controls">
        <button
          className="history-button undo"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo"
        >
          Undo
        </button>
        <button
          className="history-button redo"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo"
        >
          Redo
        </button>
      </div>
      <div className="history-list">
        {currentEntries.map((entry: StateDiff, index: number) => (
          <div 
            key={`${entry.timestamp}-${index}`} 
            className={`history-item ${index === history.currentIndex ? 'current' : ''}`}
          >
            <span className="timestamp">
              {new Date(entry.timestamp).toLocaleTimeString()}
            </span>
            <span className="description">{entry.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
