import { renderHook, act } from '@testing-library/react-hooks';
import { useEditHistory } from '../useEditHistory';
import { createEditOperation, createBatchOperation, createMultiOperation } from '../../types/edit-history';

describe('useEditHistory Stress Tests', () => {
  describe('Performance', () => {
    it('handles large number of operations', () => {
      const { result } = renderHook(() => useEditHistory());
      const numOperations = 10000;

      const startTime = Date.now();

      // Add many operations
      act(() => {
        for (let i = 0; i < numOperations; i++) {
          const operation = createEditOperation(
            'keyframe',
            'add',
            `Add keyframe ${i}`,
            { id: i },
            { id: i, value: Math.random() }
          );
          result.current.addOperation(operation);
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const operationsPerSecond = numOperations / (duration / 1000);

      // Should handle at least 1,000 operations per second
      expect(operationsPerSecond).toBeGreaterThan(1000);
      expect(result.current.history.operations).toHaveLength(numOperations);
    });

    it('maintains performance during rapid undo/redo', () => {
      const { result } = renderHook(() => useEditHistory());
      const numOperations = 1000;

      // Add operations
      act(() => {
        for (let i = 0; i < numOperations; i++) {
          const operation = createEditOperation(
            'keyframe',
            'add',
            `Add keyframe ${i}`,
            { id: i },
            { id: i, value: Math.random() }
          );
          result.current.addOperation(operation);
        }
      });

      const startTime = Date.now();

      // Perform rapid undo/redo operations
      act(() => {
        // Undo all operations
        for (let i = 0; i < numOperations; i++) {
          result.current.undo();
        }

        // Redo all operations
        for (let i = 0; i < numOperations; i++) {
          result.current.redo();
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const operationsPerSecond = (numOperations * 2) / (duration / 1000);

      // Should handle at least 1,000 undo/redo operations per second
      expect(operationsPerSecond).toBeGreaterThan(1000);
    });

    it('handles large batch operations', () => {
      const { result } = renderHook(() => useEditHistory());
      const batchSize = 1000;
      const numBatches = 100;

      const startTime = Date.now();

      // Create and add many batch operations
      act(() => {
        for (let i = 0; i < numBatches; i++) {
          const operations = Array.from({ length: batchSize }, (_, j) => 
            createEditOperation(
              'keyframe',
              'add',
              `Add keyframe ${i}-${j}`,
              { id: `${i}-${j}` },
              { id: `${i}-${j}`, value: Math.random() }
            )
          );

          const batchOp = createBatchOperation(
            'keyframe',
            `Batch ${i}`,
            operations
          );

          result.current.addOperation(batchOp);
        }
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const operationsPerSecond = (numBatches * batchSize) / (duration / 1000);

      // Should handle at least 10,000 operations per second in batch mode
      expect(operationsPerSecond).toBeGreaterThan(10000);
    });
  });

  describe('Complex Operations', () => {
    it('handles nested batch operations', () => {
      const { result } = renderHook(() => useEditHistory());
      const depth = 5; // Nesting depth
      const operationsPerLevel = 10;

      // Create deeply nested batch operations
      const createNestedBatch = (level: number, prefix: string): any[] => {
        if (level === 0) {
          return Array.from({ length: operationsPerLevel }, (_, i) =>
            createEditOperation(
              'keyframe',
              'add',
              `Add keyframe ${prefix}-${i}`,
              { id: `${prefix}-${i}` },
              { id: `${prefix}-${i}`, value: Math.random() }
            )
          );
        }

        return Array.from({ length: operationsPerLevel }, (_, i) =>
          createBatchOperation(
            'keyframe',
            `Batch ${prefix}-${i}`,
            createNestedBatch(level - 1, `${prefix}-${i}`)
          )
        );
      };

      act(() => {
        const nestedOperations = createNestedBatch(depth, 'root');
        const rootBatch = createBatchOperation('keyframe', 'Root Batch', nestedOperations);
        result.current.addOperation(rootBatch);
      });

      // Verify the operation was added
      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.canUndo).toBe(true);

      // Perform undo/redo
      act(() => {
        result.current.undo();
      });
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      act(() => {
        result.current.redo();
      });
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('handles complex multi-operations', () => {
      const { result } = renderHook(() => useEditHistory());
      const numOperations = 1000;

      // Create operations of different types
      const operations = Array.from({ length: numOperations }, (_, i) => {
        const type = i % 3 === 0 ? 'keyframe' : i % 3 === 1 ? 'transition' : 'effect';
        return createEditOperation(
          type,
          'add',
          `Add ${type} ${i}`,
          { id: i },
          { id: i, value: Math.random() }
        );
      });

      act(() => {
        const multiOp = createMultiOperation(
          'composite',
          'Complex multi-operation',
          operations
        );
        result.current.addOperation(multiOp);
      });

      // Verify operation state
      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.history.operations[0].action).toBe('multi');
      expect(result.current.history.operations[0].data.before).toHaveLength(numOperations);
      expect(result.current.history.operations[0].data.after).toHaveLength(numOperations);
    });
  });

  describe('Memory Management', () => {
    it('handles memory cleanup after large operations', () => {
      const { result } = renderHook(() => useEditHistory());
      const numOperations = 10000;

      // Add many operations
      act(() => {
        for (let i = 0; i < numOperations; i++) {
          const operation = createEditOperation(
            'keyframe',
            'add',
            `Add keyframe ${i}`,
            { id: i },
            { id: i, value: Math.random() }
          );
          result.current.addOperation(operation);
        }
      });

      // Clear history
      act(() => {
        result.current.clear();
      });

      // Verify cleanup
      expect(result.current.history.operations).toHaveLength(0);
      expect(result.current.currentIndex).toBe(-1);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);

      // Add new operations after cleanup
      act(() => {
        const operation = createEditOperation(
          'keyframe',
          'add',
          'Add keyframe',
          { id: 'new' },
          { id: 'new', value: 1 }
        );
        result.current.addOperation(operation);
      });

      // Verify normal operation after cleanup
      expect(result.current.history.operations).toHaveLength(1);
      expect(result.current.currentIndex).toBe(0);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });
  });
});
