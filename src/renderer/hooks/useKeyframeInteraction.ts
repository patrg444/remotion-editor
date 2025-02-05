import { Logger } from '../../main/utils/logger';
import { useCallback, useRef, useState } from 'react';
import { 
  Keyframe, 
  KeyframePoint, 
  BatchKeyframeOperation,
  KeyframeInterpolation,
  KeyframeOperation,
  BaseKeyframeInterpolation
} from '../keyframes/types';
import {
  getSelectionBounds,
  isPointInSelectionBox,
  validateTime,
  isValidValue,
  clampTime,
  clampValue
} from '../keyframes/utils';
import {
  DRAG,
  VIEWPORT,
  KEYBOARD
} from '../keyframes/constants';

const logger = new Logger('useKeyframeInteraction');

class KeyframeInteractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyframeInteractionError';
  }
}

interface DragState<T extends number | string = number> {
  time: number;
  value: T;
  interpolation: KeyframeInterpolation;
}

interface SelectionBounds {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface UseKeyframeInteractionProps<T extends number | string = number> {
  duration: number;
  onDragStart?: (keyframe: Keyframe<T>) => void;
  onDragUpdate?: (operations: BatchKeyframeOperation<T>[]) => void;
  onDragEnd?: () => void;
  minValue?: T;
  maxValue?: T;
  step?: number;
  onError?: (error: string) => void;
}

export function useKeyframeInteraction<T extends number | string = number>({
  duration,
  onDragStart,
  onDragUpdate,
  onDragEnd,
  minValue = 0 as T,
  maxValue = 1 as T,
  step = DRAG.FINE_CONTROL_STEP,
  onError = () => {}
}: UseKeyframeInteractionProps<T>) {
  const [error, setError] = useState<string | null>(null);
  
  // Drag state
  const [dragKeyframeIndex, setDragKeyframeIndex] = useState<number>(-1);
  const [isDragging, setIsDragging] = useState(false);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartValuesRef = useRef<DragState<T>[]>([]);

  // Selection state
  const [selectedKeyframes, setSelectedKeyframes] = useState<number[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBounds | null>(null);
  const [isDrawingSelection, setIsDrawingSelection] = useState(false);

  // Validation functions
  const validateCoordinates = (x: number, y: number): void => {
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      throw new KeyframeInteractionError(`Invalid coordinates: x=${x}, y=${y}`);
    }
  };

  const validateKeyframeIndex = (index: number, keyframes: Keyframe<T>[]): void => {
    if (index < 0 || index >= keyframes.length) {
      throw new KeyframeInteractionError(`Invalid keyframe index: ${index}`);
    }
  };

  const validateSVGDimensions = (width: number, height: number): void => {
    if (width <= 0 || height <= 0) {
      throw new KeyframeInteractionError(`Invalid SVG dimensions: width=${width}, height=${height}`);
    }
  };

  // Drag handlers
  const startDrag = useCallback((index: number, x: number, y: number, keyframes: Keyframe<T>[]) => {
    try {
      validateCoordinates(x, y);
      validateKeyframeIndex(index, keyframes);

      setDragKeyframeIndex(index);
      setIsDragging(true);
      pointerDownPosRef.current = { x, y };

      // Store initial values for all selected keyframes
      const indices = selectedKeyframes.includes(index) ? selectedKeyframes : [index];
      dragStartValuesRef.current = indices.map(i => {
        const keyframe = keyframes[i];
        if (!keyframe) {
          throw new KeyframeInteractionError(`Invalid keyframe at index ${i}`);
        }
        return {
          time: keyframe.time,
          value: keyframe.value,
          interpolation: keyframe.interpolation
        };
      });

      const keyframe = keyframes[index];
      if (keyframe) {
        onDragStart?.(keyframe);
      }
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start drag';
      logger.error('Drag start error:', error);
      setError(errorMessage);
      onError(errorMessage);
      // Reset drag state on error
      setDragKeyframeIndex(-1);
      setIsDragging(false);
      pointerDownPosRef.current = null;
      dragStartValuesRef.current = [];
    }
  }, [selectedKeyframes, onDragStart, onError]);

  const updateDrag = useCallback((
    svgWidth: number,
    svgHeight: number,
    x: number,
    y: number,
    shiftKey: boolean,
    keyframes: Keyframe<T>[],
    trackId: string
  ) => {
    try {
      if (!isDragging || dragKeyframeIndex < 0 || !pointerDownPosRef.current) return;

      validateSVGDimensions(svgWidth, svgHeight);
      validateCoordinates(x, y);

      if (!Array.isArray(keyframes)) {
        throw new KeyframeInteractionError('Invalid keyframes array');
      }
      if (!trackId) {
        throw new KeyframeInteractionError('Invalid track ID');
      }

      // Calculate new time with optional fine control
      const resolution = shiftKey ? VIEWPORT.FINE_RESOLUTION : VIEWPORT.NORMAL_RESOLUTION;
      const rawTime = (x / svgWidth) * duration;
      const time = clampTime(
        Math.round(rawTime * resolution) / resolution,
        duration
      );

      // Calculate new value (normalized 0-1)
      const normalizedValue = Math.max(0, Math.min(1, 1 - (y / svgHeight)));
      const value = typeof minValue === 'number' && typeof maxValue === 'number'
        ? clampValue(minValue + (normalizedValue * (maxValue - minValue)) as T, minValue, maxValue)
        : minValue;

      // Validate new values
      if (!validateTime(time, duration)) {
        throw new KeyframeInteractionError(`Invalid time: ${time}`);
      }
      if (typeof value === 'number' && typeof minValue === 'number' && typeof maxValue === 'number') {
        if (!isValidValue(value, minValue, maxValue)) {
          throw new KeyframeInteractionError(`Invalid value: ${value}`);
        }
      }

      // Calculate time and value deltas from drag start
      const dragStartValues = dragStartValuesRef.current[0];
      if (!dragStartValues) {
        throw new KeyframeInteractionError('Missing drag start values');
      }
      const timeDelta = time - dragStartValues.time;
      const valueDelta = typeof value === 'number' && typeof dragStartValues.value === 'number'
        ? value - dragStartValues.value
        : 0;

      // Create batch operations for all selected keyframes
      const operations: BatchKeyframeOperation<T>[] = [{
        trackId,
        operations: selectedKeyframes.map((index, i) => {
          const startValues = dragStartValuesRef.current[i];
          if (!startValues) {
            throw new KeyframeInteractionError(`Missing start values for keyframe ${index}`);
          }

          const newTime = clampTime(startValues.time + timeDelta, duration);
          const newValue = typeof startValues.value === 'number' && typeof minValue === 'number' && typeof maxValue === 'number'
            ? clampValue(startValues.value + valueDelta as T, minValue, maxValue)
            : startValues.value;
          
          const currentKeyframe = keyframes[index];
          if (!currentKeyframe) {
            throw new KeyframeInteractionError(`Missing keyframe at index ${index}`);
          }

          const operation: KeyframeOperation<T> = {
            type: 'update',
            time: newTime,
            value: newValue,
            interpolation: currentKeyframe.interpolation
          };
          return operation;
        })
      }];

      onDragUpdate?.(operations);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update drag';
      logger.error('Drag update error:', error);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [isDragging, dragKeyframeIndex, duration, minValue, maxValue, selectedKeyframes, onDragUpdate, onError]);

  const endDrag = useCallback(() => {
    try {
      if (!isDragging) return;

      setIsDragging(false);
      setDragKeyframeIndex(-1);
      pointerDownPosRef.current = null;
      dragStartValuesRef.current = [];
      onDragEnd?.();
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end drag';
      logger.error('Drag end error:', error);
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      // Ensure drag state is reset even if there's an error
      setIsDragging(false);
      setDragKeyframeIndex(-1);
      pointerDownPosRef.current = null;
      dragStartValuesRef.current = [];
    }
  }, [isDragging, onDragEnd, onError]);

  // Selection handlers
  const startSelection = useCallback((x: number, y: number) => {
    try {
      validateCoordinates(x, y);

      setIsDrawingSelection(true);
      setSelectionBox({
        startX: x,
        startY: y,
        endX: x,
        endY: y
      });
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start selection';
      logger.error('Selection start error:', error);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [onError]);

  const updateSelection = useCallback((
    x: number, 
    y: number, 
    keyframePoints: KeyframePoint[]
  ) => {
    if (!isDrawingSelection || !selectionBox) return;

    try {
      validateCoordinates(x, y);

      if (!Array.isArray(keyframePoints)) {
        throw new KeyframeInteractionError('Invalid keyframe points array');
      }

      setSelectionBox({
        ...selectionBox,
        endX: x,
        endY: y
      });

      // Get selection bounds
      const bounds = getSelectionBounds(selectionBox.startX, selectionBox.startY, x, y);

      // Select keyframes within box
      const selectedIndices = keyframePoints.reduce((indices: number[], point, index) => {
        if (isPointInSelectionBox(point, bounds)) {
          indices.push(index);
        }
        return indices;
      }, []);

      setSelectedKeyframes(selectedIndices);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update selection';
      logger.error('Selection update error:', error);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [isDrawingSelection, selectionBox, onError]);

  const endSelection = useCallback(() => {
    try {
      setIsDrawingSelection(false);
      setSelectionBox(null);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to end selection';
      logger.error('Selection end error:', error);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [onError]);

  const clearSelection = useCallback(() => {
    try {
      setSelectedKeyframes([]);
      setSelectionBox(null);
      setIsDrawingSelection(false);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to clear selection';
      logger.error('Selection clear error:', error);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [onError]);

  const shouldStartSelection = useCallback((
    startX: number,
    startY: number,
    currentX: number,
    currentY: number,
    isDraggingKeyframe: boolean,
    isCtrlPressed: boolean
  ): boolean => {
    try {
      if (isDraggingKeyframe || isCtrlPressed) return false;

      validateCoordinates(startX, startY);
      validateCoordinates(currentX, currentY);

      const dx = currentX - startX;
      const dy = currentY - startY;
      const dragDistance = Math.sqrt(dx * dx + dy * dy);

      return dragDistance >= DRAG.MIN_DISTANCE;
    } catch (error) {
      logger.error('Selection start check error:', error);
      return false;
    }
  }, []);

  return {
    // Drag state
    isDragging,
    dragKeyframeIndex,
    startDrag,
    updateDrag,
    endDrag,

    // Selection state
    selectedKeyframes,
    selectionBox,
    isDrawingSelection,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    shouldStartSelection,
    error
  };
}
