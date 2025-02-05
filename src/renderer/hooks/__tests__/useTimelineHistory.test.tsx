import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useTimelineHistory } from '../useTimelineHistory';
import { TimelineState, ActionTypes } from '../../types/timeline';
import { TimelineContext } from '../../contexts/TimelineContext';
import { useTimelineContext } from '../../hooks/useTimelineContext';
import { TimelineConstants } from '../../utils/timelineConstants';

// Mock the useTimelineContext hook
jest.mock('../../hooks/useTimelineContext', () => ({
  useTimelineContext: jest.fn()
}));

describe('useTimelineHistory', () => {
  let mockState: TimelineState;
  let mockDispatch: jest.Mock;

  beforeEach(() => {
    mockState = {
      tracks: [],
      currentTime: 0,
      duration: 0,
      zoom: 1,
      fps: 30,
      isPlaying: false,
      isDragging: false,
      scrollX: 0,
      scrollY: 0,
      selectedClipIds: [],
      markers: [],
      history: {
        entries: [],
        currentIndex: -1
      }
    };

    mockDispatch = jest.fn((action) => {
      if (action.type === ActionTypes.PUSH_HISTORY) {
        let entries = [...mockState.history.entries];
        
        // Clear future entries if pushing after undo
        if (mockState.history.currentIndex < entries.length - 1) {
          entries = entries.slice(0, mockState.history.currentIndex + 1);
        }
        
        // Add new entry
        entries.push(action.payload.entry);
        
        // Remove oldest entries if exceeding maxSize
        if (action.payload.maxSize && entries.length > action.payload.maxSize) {
          entries = entries.slice(-action.payload.maxSize);
        }
        
        mockState.history.entries = entries;
        mockState.history.currentIndex = mockState.history.entries.length - 1;
      } else if (action.type === ActionTypes.SET_HISTORY_INDEX) {
        mockState.history.currentIndex = action.payload;
      } else if (action.type === ActionTypes.CLEAR_HISTORY) {
        mockState.history.entries = [];
        mockState.history.currentIndex = -1;
      }
    });

    (useTimelineContext as jest.Mock).mockReturnValue({
      state: mockState,
      dispatch: mockDispatch
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty history', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });
    const status = result.current.getHistoryStatus();
    expect(status.totalEntries).to.be.equal(0);
    expect(status.currentIndex).to.be.equal(-1);
    expect(status.canUndo).to.be.false;
    expect(status.canRedo).to.be.false;
  });

  it('pushes history entries correctly', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    // First call initializes previousState
    act(() => {
      result.current.pushHistory('Initialize');
    });

    // Second call actually pushes to history
    act(() => {
      result.current.pushHistory('Add track');
    });

    const status = result.current.getHistoryStatus();
    expect(status.totalEntries).to.be.equal(1);
    expect(status.currentIndex).to.be.equal(0);
    expect(result.current.getHistoryDescription(0)).to.be.equal('Add track');
  });

  it('handles undo correctly', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    // First call initializes previousState
    act(() => {
      result.current.pushHistory('Initialize');
    });

    // Push two entries
    act(() => {
      result.current.pushHistory('Initial');
      result.current.pushHistory('Add track');
    });

    // Undo
    act(() => {
      result.current.undo();
    });

    const status = result.current.getHistoryStatus();
    expect(status.currentIndex).to.be.equal(0);
    expect(result.current.getHistoryDescription(status.currentIndex)).to.be.equal('Initial');
    expect(status.canUndo).to.be.true;
    expect(status.canRedo).to.be.true;
  });

  it('handles redo correctly', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    // First call initializes previousState
    act(() => {
      result.current.pushHistory('Initialize');
    });

    // Push entries and undo
    act(() => {
      result.current.pushHistory('Initial');
      result.current.pushHistory('Add track');
      result.current.undo();
    });

    // Redo
    act(() => {
      result.current.redo();
    });

    const status = result.current.getHistoryStatus();
    expect(status.currentIndex).to.be.equal(1);
    expect(result.current.getHistoryDescription(status.currentIndex)).to.be.equal('Add track');
    expect(status.canUndo).to.be.true;
    expect(status.canRedo).to.be.false;
  });

  it('clears future history when pushing after undo', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    // First call initializes previousState
    act(() => {
      result.current.pushHistory('Initialize');
    });

    // Push entries and undo
    act(() => {
      result.current.pushHistory('Initial');
      result.current.pushHistory('Add track');
      result.current.undo();
    });

    // Push new entry after undo
    act(() => {
      result.current.pushHistory('Add different track');
    });

    const status = result.current.getHistoryStatus();
    expect(status.totalEntries).to.be.equal(2);
    expect(status.currentIndex).to.be.equal(1);
    expect(result.current.getHistoryDescription(status.currentIndex)).to.be.equal('Add different track');
  });

  it('maintains history size limit', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    const maxSize = TimelineConstants.History.MAX_HISTORY_SIZE;

    // First call initializes previousState
    act(() => {
      result.current.pushHistory('Initialize');
    });

    // Push maxSize + 1 entries after initialization
    for (let i = 0; i <= maxSize; i++) {
      act(() => {
        result.current.pushHistory(`Add track ${i}`);
      });
    }

    const status = result.current.getHistoryStatus();
    expect(status.totalEntries).to.be.equal(maxSize);
    expect(result.current.getHistoryDescription(status.totalEntries - 1)).to.be.equal(`Add track ${maxSize}`);
  });

  it('handles empty history operations gracefully', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    act(() => {
      result.current.undo();
      result.current.redo();
    });

    const status = result.current.getHistoryStatus();
    expect(status.totalEntries).to.be.equal(0);
    expect(status.currentIndex).to.be.equal(-1);
    expect(status.canUndo).to.be.false;
    expect(status.canRedo).to.be.false;
  });

  it('clears history correctly', () => {
    const { result } = renderHook(() => useTimelineHistory(), {
      wrapper: ({ children }) => (
        <TimelineContext.Provider value={{ state: mockState, dispatch: mockDispatch }}>
          {children}
        </TimelineContext.Provider>
      )
    });

    // First call initializes previousState
    act(() => {
      result.current.pushHistory('Initialize');
    });

    act(() => {
      result.current.pushHistory('Entry 1');
      result.current.pushHistory('Entry 2');
      result.current.clearHistory();
    });

    const status = result.current.getHistoryStatus();
    expect(status.totalEntries).to.be.equal(0);
    expect(status.currentIndex).to.be.equal(-1);
    expect(status.canUndo).to.be.false;
    expect(status.canRedo).to.be.false;
  });
});
