import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EditHistoryPanel } from '../EditHistoryPanel';
import { useTimelineContext } from '../../hooks/useTimelineContext';
import { useTimelineShortcuts } from '../../hooks/useTimelineShortcuts';

// Mock the hooks
jest.mock('../../hooks/useTimelineContext');
jest.mock('../../hooks/useTimelineShortcuts');

const mockUseTimelineContext = useTimelineContext as jest.Mock;
const mockUseTimelineShortcuts = useTimelineShortcuts as jest.Mock;

describe('EditHistoryPanel', () => {
  const mockDispatch = jest.fn();
  const defaultHistory = {
    past: [
      { tracks: [1, 2], selectedClipIds: ['clip1'] },
      { markers: ['marker1', 'marker2'] },
    ],
    present: { tracks: [3], selectedClipIds: ['clip2'], inPoint: 5, outPoint: 10 },
    future: [
      { tracks: [4], markers: ['marker3'] },
    ],
  };

  beforeEach(() => {
    mockUseTimelineContext.mockReturnValue({
      state: { history: defaultHistory },
      dispatch: mockDispatch,
    });
    mockUseTimelineShortcuts.mockReturnValue(jest.fn());
    jest.clearAllMocks();
  });

  it('renders history items', () => {
    render(<EditHistoryPanel />);
    
    // Past items
    expect(screen.getByText('2 tracks 1 selected clips')).toBeInTheDocument();
    expect(screen.getByText('2 markers')).toBeInTheDocument();
    
    // Present item
    expect(screen.getByText('1 tracks 1 selected clips')).toBeInTheDocument();
    expect(screen.getByText(/In: 5s/)).toBeInTheDocument();
    expect(screen.getByText(/Out: 10s/)).toBeInTheDocument();
    
    // Future items
    expect(screen.getByText('1 tracks 0 selected clips')).toBeInTheDocument();
    expect(screen.getByText('1 markers')).toBeInTheDocument();
  });

  describe('undo/redo buttons', () => {
    it('enables undo when past items exist', () => {
      render(<EditHistoryPanel />);
      
      const undoButton = screen.getByText('Undo');
      expect(undoButton).not.toBeDisabled();
    });

    it('disables undo when no past items exist', () => {
      mockUseTimelineContext.mockReturnValue({
        state: { history: { ...defaultHistory, past: [] } },
        dispatch: mockDispatch,
      });

      render(<EditHistoryPanel />);
      
      const undoButton = screen.getByText('Undo');
      expect(undoButton).toBeDisabled();
    });

    it('enables redo when future items exist', () => {
      render(<EditHistoryPanel />);
      
      const redoButton = screen.getByText('Redo');
      expect(redoButton).not.toBeDisabled();
    });

    it('disables redo when no future items exist', () => {
      mockUseTimelineContext.mockReturnValue({
        state: { history: { ...defaultHistory, future: [] } },
        dispatch: mockDispatch,
      });

      render(<EditHistoryPanel />);
      
      const redoButton = screen.getByText('Redo');
      expect(redoButton).toBeDisabled();
    });

    it('dispatches UNDO action when undo button clicked', () => {
      render(<EditHistoryPanel />);
      
      fireEvent.click(screen.getByText('Undo'));
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'UNDO' });
    });

    it('dispatches REDO action when redo button clicked', () => {
      render(<EditHistoryPanel />);
      
      fireEvent.click(screen.getByText('Redo'));
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'REDO' });
    });
  });

  describe('keyboard shortcuts', () => {
    const mockHandleKeyDown = jest.fn();

    beforeEach(() => {
      mockUseTimelineShortcuts.mockReturnValue(mockHandleKeyDown);
    });

    it('adds keydown event listener on mount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      
      render(<EditHistoryPanel />);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', mockHandleKeyDown);
      addEventListenerSpy.mockRestore();
    });

    it('removes keydown event listener on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      
      const { unmount } = render(<EditHistoryPanel />);
      unmount();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', mockHandleKeyDown);
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('component structure', () => {
    it('applies custom className', () => {
      const { container } = render(<EditHistoryPanel className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('edit-history-panel custom-class');
    });

    it('has correct class names and structure', () => {
      const { container } = render(<EditHistoryPanel />);
      
      // Main containers
      expect(container.querySelector('.edit-history-panel')).toBeInTheDocument();
      expect(container.querySelector('.history-controls')).toBeInTheDocument();
      expect(container.querySelector('.history-list')).toBeInTheDocument();
      
      // History items
      const currentState = container.querySelector('.current-state');
      const pastItems = Array.from(container.querySelectorAll('.history-item'))
        .filter(item => {
          // Get all items before current-state
          const itemPosition = item.compareDocumentPosition(currentState!);
          return (itemPosition & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
        });
      expect(pastItems).toHaveLength(2); // Past items
      expect(currentState).toBeInTheDocument(); // Present item
      expect(container.querySelectorAll('.history-item-tracks')).toHaveLength(4); // All items with tracks
    });

    it('renders history list with correct test id', () => {
      render(<EditHistoryPanel />);
      
      expect(screen.getByTestId('history-list')).toBeInTheDocument();
    });
  });

  describe('history item rendering', () => {
    it('renders track and clip counts', () => {
      render(<EditHistoryPanel />);
      
      expect(screen.getByText('2 tracks 1 selected clips')).toBeInTheDocument();
    });

    it('renders marker counts', () => {
      render(<EditHistoryPanel />);
      
      expect(screen.getByText('2 markers')).toBeInTheDocument();
    });

    it('renders in/out points', () => {
      render(<EditHistoryPanel />);
      
      const pointsElement = screen.getByText(/In: 5s.*Out: 10s/);
      expect(pointsElement).toBeInTheDocument();
    });

    it('handles items with no tracks or clips', () => {
      mockUseTimelineContext.mockReturnValue({
        state: {
          history: {
            past: [{ markers: ['marker1'] }],
            present: null,
            future: [],
          },
        },
        dispatch: mockDispatch,
      });

      render(<EditHistoryPanel />);
      
      expect(screen.getByText('0 tracks 0 selected clips')).toBeInTheDocument();
    });
  });
});
