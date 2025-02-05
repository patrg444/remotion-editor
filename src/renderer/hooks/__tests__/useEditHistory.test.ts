import { renderHook, act } from '@testing-library/react-hooks';
import { useEditHistory } from '../useEditHistory';
import { EditOperation, createEditOperation, createBatchOperation, createMultiOperation } from '../../types/edit-history';

describe('useEditHistory', () => {
  describe('Basic Operations', () => {
    it('initializes with empty history', () => {
      const { result } = renderHook(() => useEditHistory());

      expect(result.current.history.operations).toHaveLength(0);
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('adds operations to history', () => {
      const { result } = renderHook(() => useEditHistory());

      const operation = createEditOperation(
        'keyframe',
        'add',
        'Add keyframe',
        { time: 0 },
        { time: 1 }
      );

      act(() => {
        result.current.addOperation(operation);
      });

      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('performs undo/redo operations', () => {
      const { result } = renderHook(() => useEditHistory());

      const operation = createEditOperation(
        'keyframe',
        'add',
        'Add keyframe',
        { time: 0 },
        { time: 1 }
      );

      act(() => {
        result.current.addOperation(operation);
      });

      // Undo
      act(() => {
        const undoneOp = result.current.undo();
        expect(undoneOp).toEqual(operation);
      });

      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // Redo
      act(() => {
        const redoneOp = result.current.redo();
        expect(redoneOp).toEqual(operation);
      });

      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });

  describe('Operation Merging', () => {
    it('merges compatible operations within time window', () => {
      const { result } = renderHook(() => useEditHistory());

      // Create two operations close in time
      const op1 = createEditOperation(
        'keyframe',
        'update',
        'Update keyframe value',
        { value: 0 },
        { value: 0.5 }
      );

      const op2 = {
        ...createEditOperation(
          'keyframe',
          'update',
          'Update keyframe value',
          { value: 0.5 },
          { value: 1 }
        ),
        timestamp: op1.timestamp + 500 // Within 1 second
      };

      act(() => {
        result.current.addOperation(op1);
        result.current.addOperation(op2);
      });

      // Should be merged into a single operation
      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.history.operations[0].data).toEqual({
        before: { value: 0 },
        after: { value: 1 }
      });
    });

    it('does not merge operations outside time window', () => {
      const { result } = renderHook(() => useEditHistory());

      // Create two operations far apart in time
      const op1 = createEditOperation(
        'keyframe',
        'update',
        'Update keyframe value',
        { value: 0 },
        { value: 0.5 }
      );

      const op2 = {
        ...createEditOperation(
          'keyframe',
          'update',
          'Update keyframe value',
          { value: 0.5 },
          { value: 1 }
        ),
        timestamp: op1.timestamp + 2000 // More than 1 second
      };

      act(() => {
        result.current.addOperation(op1);
        result.current.addOperation(op2);
      });

      // Should remain as separate operations
      expect(result.current.history.operations).toHaveLength(2);
    });
  });

  describe('Batch Operations', () => {
    it('handles batch operations', () => {
      const { result } = renderHook(() => useEditHistory());

      const operations = [
        createEditOperation('keyframe', 'add', 'Add keyframe 1', { id: 1 }, { id: 1, value: 0 }),
        createEditOperation('keyframe', 'add', 'Add keyframe 2', { id: 2 }, { id: 2, value: 1 })
      ];

      const batchOp = createBatchOperation('keyframe', 'Add multiple keyframes', operations);

      act(() => {
        result.current.addOperation(batchOp);
      });

      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.history.operations[0].action).toBe('batch');
      expect(result.current.history.operations[0].data.before).toHaveLength(2);
      expect(result.current.history.operations[0].data.after).toHaveLength(2);
    });

    it('does not merge batch operations', () => {
      const { result } = renderHook(() => useEditHistory());

      const operations1 = [
        createEditOperation('keyframe', 'add', 'Add keyframe 1', { id: 1 }, { id: 1, value: 0 })
      ];

      const operations2 = [
        createEditOperation('keyframe', 'add', 'Add keyframe 2', { id: 2 }, { id: 2, value: 1 })
      ];

      const batchOp1 = createBatchOperation('keyframe', 'Batch 1', operations1);
      const batchOp2 = {
        ...createBatchOperation('keyframe', 'Batch 2', operations2),
        timestamp: batchOp1.timestamp + 500 // Within merge window, but should not merge
      };

      act(() => {
        result.current.addOperation(batchOp1);
        result.current.addOperation(batchOp2);
      });

      expect(result.current.history.operations).toHaveLength(2);
    });
  });

  describe('Multi Operations', () => {
    it('handles multi operations', () => {
      const { result } = renderHook(() => useEditHistory());

      const operations = [
        createEditOperation('keyframe', 'add', 'Add keyframe', { id: 1 }, { id: 1, value: 0 }),
        createEditOperation('transition', 'add', 'Add transition', { id: 2 }, { id: 2, type: 'fade' })
      ];

      const multiOp = createMultiOperation('composite', 'Add keyframe and transition', operations);

      act(() => {
        result.current.addOperation(multiOp);
      });

      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.history.operations[0].action).toBe('multi');
      expect(result.current.history.operations[0].data.before).toHaveLength(2);
      expect(result.current.history.operations[0].data.after).toHaveLength(2);
    });
  });

  describe('Edge Cases', () => {
    it('handles undo with empty history', () => {
      const { result } = renderHook(() => useEditHistory());

      act(() => {
        const undoneOp = result.current.undo();
        expect(undoneOp).toBeNull();
      });

      expect(result.current.currentIndex).toBe(-1);
    });

    it('handles redo with no undone operations', () => {
      const { result } = renderHook(() => useEditHistory());

      act(() => {
        const redoneOp = result.current.redo();
        expect(redoneOp).toBeNull();
      });

      expect(result.current.currentIndex).toBe(-1);
    });

    it('clears history', () => {
      const { result } = renderHook(() => useEditHistory());

      const operation = createEditOperation(
        'keyframe',
        'add',
        'Add keyframe',
        { time: 0 },
        { time: 1 }
      );

      act(() => {
        result.current.addOperation(operation);
        result.current.clear();
      });

      expect(result.current.history.operations).toHaveLength(0);
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('truncates future history when adding new operation after undo', () => {
      const { result } = renderHook(() => useEditHistory());

      // Create operations with different timestamps to prevent merging
      const baseTime = Date.now();
      const op1 = {
        ...createEditOperation('keyframe', 'add', 'Op 1', { id: 1 }, { id: 1, value: 0 }),
        timestamp: baseTime
      };
      const op2 = {
        ...createEditOperation('keyframe', 'add', 'Op 2', { id: 2 }, { id: 2, value: 1 }),
        timestamp: baseTime + 2000 // 2 seconds later
      };
      const op3 = {
        ...createEditOperation('keyframe', 'add', 'Op 3', { id: 3 }, { id: 3, value: 2 }),
        timestamp: baseTime + 4000 // 4 seconds later
      };

      // Add first operation
      act(() => {
        result.current.addOperation(op1);
      });
      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.currentIndex).toBe(0);

      // Add second operation
      act(() => {
        result.current.addOperation(op2);
      });
      expect(result.current.history.operations).toHaveLength(2);
      expect(result.current.currentIndex).toBe(1);

      // Undo second operation
      act(() => {
        result.current.undo();
      });
      expect(result.current.history.operations).toHaveLength(2);
      expect(result.current.currentIndex).toBe(0);

      // Add third operation (should replace second)
      act(() => {
        result.current.addOperation(op3);
      });

      // Verify final state
      expect(result.current.history.operations).toHaveLength(2);
      expect(result.current.history.operations[0]).toEqual(op1);
      expect(result.current.history.operations[1]).toEqual(op3);
      expect(result.current.currentIndex).toBe(1);
      expect(result.current.canRedo).toBe(false);
    });
  });
});
