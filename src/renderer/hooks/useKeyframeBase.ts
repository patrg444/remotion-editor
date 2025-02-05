import { Logger } from '../../main/utils/logger';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { 
  InterpolationType, 
  KeyframeTrack, 
  BatchKeyframeOperation, 
  BaseKeyframeInterpolation,
  Keyframe,
  KeyframeOperation
} from '../keyframes/types';
import { 
  clampTime, 
  validateTime, 
  isValidValue, 
  createKeyframeInterpolation, 
  getTrackValue 
} from '../keyframes/utils';
import { DRAG, KEYBOARD } from '../keyframes/constants';
import { useKeyframes } from './useKeyframes';

const logger = new Logger('useKeyframeBase');

class KeyframeBaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyframeBaseError';
  }
}

interface KeyframeValidationResult {
  isValid: boolean;
  error?: string;
}

export interface UseKeyframeBaseProps<T extends number | string = number> {
  clipId: string;
  duration: number;
  defaultValue?: T;
  minValue?: T;
  maxValue?: T;
  step?: number;
  isSelected?: boolean;
  onError?: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

export const useKeyframeBase = <T extends number | string = number>({
  clipId,
  duration,
  defaultValue = 1 as T,
  minValue = 0 as T,
  maxValue = 1 as T,
  step = KEYBOARD.FINE_CONTROL_STEP,
  isSelected = false,
  onError = () => {},
  onProcessingChange = () => {},
}: UseKeyframeBaseProps<T>) => {
  const { getTrack, createTrack, batchOperations } = useKeyframes();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [track, setTrack] = useState<KeyframeTrack<T> | null>(null);

  // Validation functions
  const validateKeyframeOperation = useCallback((
    time: number,
    value?: T,
    interpolation?: InterpolationType | BaseKeyframeInterpolation
  ): KeyframeValidationResult => {
    try {
      if (!validateTime(time, duration)) {
        return {
          isValid: false,
          error: `Invalid time: ${time}. Must be between 0 and ${duration}`
        };
      }

      if (value !== undefined) {
        if (typeof value === 'number' && typeof minValue === 'number' && typeof maxValue === 'number') {
          if (!isValidValue(value, minValue, maxValue)) {
            return {
              isValid: false,
              error: `Invalid value: ${value}. Must be between ${minValue} and ${maxValue}`
            };
          }
        }
      }

      if (interpolation !== undefined && typeof interpolation === 'object') {
        if (!('type' in interpolation)) {
          return {
            isValid: false,
            error: 'Invalid interpolation object: missing type'
          };
        }
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }, [duration, minValue, maxValue]);

  // Memoize track validation
  const validateTrackState = useMemo(() => () => {
    if (!track) {
      throw new KeyframeBaseError('Track not initialized');
    }
    // Only warn if not selected, don't throw
    if (!isSelected) {
      logger.warn('Operating on unselected track');
    }
  }, [track, isSelected]);

  // Initialize track if it doesn't exist
  const trackId = `${clipId}-value` as const;
  useEffect(() => {
    try {
      const existingTrack = getTrack<T>(trackId);
      if (existingTrack) {
        setTrack(existingTrack);
      } else {
        // Use midpoint as default value if numeric
        const initialValue = typeof defaultValue === 'number' && typeof minValue === 'number' && typeof maxValue === 'number'
          ? (minValue + (maxValue - minValue) / 2) as T
          : defaultValue;

        createTrack<T>(
          clipId,
          'value',
          initialValue,
          typeof minValue === 'number' ? minValue : undefined,
          typeof maxValue === 'number' ? maxValue : undefined,
          step
        );
        const newTrack = getTrack<T>(trackId);
        if (!newTrack) {
          throw new KeyframeBaseError(`Failed to create track: ${trackId}`);
        }
        setTrack(newTrack);
      }
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize track';
      logger.error('Track initialization error:', error);
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [
    trackId,
    clipId,
    defaultValue,
    minValue,
    maxValue,
    step,
    getTrack,
    createTrack,
    onError,
  ]);

  // Add keyframe with history
  const addKeyframe = useCallback(
    (
      time: number,
      value: T,
      interpolation: InterpolationType | BaseKeyframeInterpolation = InterpolationType.Linear
    ) => {
      try {
        validateTrackState();

        const validation = validateKeyframeOperation(time, value, interpolation);
        if (!validation.isValid) {
          throw new KeyframeBaseError(validation.error || 'Invalid keyframe operation');
        }

        setIsProcessing(true);
        onProcessingChange(true);

        const clampedTime = clampTime(time, duration);
        const clampedValue = typeof value === 'number' && typeof minValue === 'number' && typeof maxValue === 'number'
          ? Math.max(minValue, Math.min(maxValue, value)) as T
          : typeof value === 'string'
          ? value
          : value;

        const operation: KeyframeOperation<T> = {
          type: 'add',
          time: clampedTime,
          value: clampedValue,
          interpolation: typeof interpolation === 'string' 
            ? createKeyframeInterpolation(interpolation)
            : interpolation,
        };

        const operations: BatchKeyframeOperation<T>[] = [{
          trackId,
          operations: [operation],
        }];

        batchOperations(
          operations,
          `Add keyframe at ${clampedTime.toFixed(2)}s`,
          clipId
        );
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add keyframe';
        logger.error('Add keyframe error:', error);
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsProcessing(false);
        onProcessingChange(false);
      }
    },
    [
      validateTrackState,
      validateKeyframeOperation,
      duration,
      minValue,
      maxValue,
      trackId,
      clipId,
      batchOperations,
      onProcessingChange,
      onError,
    ]
  );

  // Remove keyframe with history
  const removeKeyframe = useCallback(
    (time: number) => {
      try {
        validateTrackState();

        const validation = validateKeyframeOperation(time);
        if (!validation.isValid) {
          throw new KeyframeBaseError(validation.error || 'Invalid keyframe operation');
        }

        setIsProcessing(true);
        onProcessingChange(true);

        const clampedTime = clampTime(time, duration);
        const operation: KeyframeOperation<T> = {
          type: 'remove',
          time: clampedTime,
        };

        const operations: BatchKeyframeOperation<T>[] = [{
          trackId,
          operations: [operation],
        }];

        batchOperations(
          operations,
          `Remove keyframe at ${clampedTime.toFixed(2)}s`,
          clipId
        );
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove keyframe';
        logger.error('Remove keyframe error:', error);
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsProcessing(false);
        onProcessingChange(false);
      }
    },
    [
      validateTrackState,
      validateKeyframeOperation,
      duration,
      trackId,
      clipId,
      batchOperations,
      onProcessingChange,
      onError,
    ]
  );

  // Update keyframe with history
  const updateKeyframe = useCallback(
    (
      oldTime: number,
      newTime: number,
      value: T,
      interpolation: InterpolationType | BaseKeyframeInterpolation = InterpolationType.Linear
    ) => {
      try {
        validateTrackState();

        const oldValidation = validateKeyframeOperation(oldTime);
        if (!oldValidation.isValid) {
          throw new KeyframeBaseError(oldValidation.error || 'Invalid old time');
        }

        const newValidation = validateKeyframeOperation(newTime, value, interpolation);
        if (!newValidation.isValid) {
          throw new KeyframeBaseError(newValidation.error || 'Invalid new keyframe data');
        }

        setIsProcessing(true);
        onProcessingChange(true);

        const clampedOldTime = clampTime(oldTime, duration);
        const clampedNewTime = clampTime(newTime, duration);
        const clampedValue = typeof value === 'number' && typeof minValue === 'number' && typeof maxValue === 'number'
          ? Math.max(minValue, Math.min(maxValue, value)) as T
          : typeof value === 'string'
          ? value
          : value;

        const operations: BatchKeyframeOperation<T>[] = [{
          trackId,
          operations: oldTime !== newTime
            ? [
                {
                  type: 'remove',
                  time: clampedOldTime,
                },
                {
                  type: 'add',
                  time: clampedNewTime,
                  value: clampedValue,
                  interpolation: typeof interpolation === 'string'
                    ? createKeyframeInterpolation(interpolation)
                    : interpolation,
                },
              ]
            : [
                {
                  type: 'update',
                  time: clampedOldTime,
                  value: clampedValue,
                  interpolation: typeof interpolation === 'string'
                    ? createKeyframeInterpolation(interpolation)
                    : interpolation,
                },
              ],
        }];

        const description = oldTime !== newTime
          ? `Move keyframe from ${clampedOldTime.toFixed(2)}s to ${clampedNewTime.toFixed(2)}s`
          : `Update keyframe at ${clampedOldTime.toFixed(2)}s`;

        batchOperations(operations, description, clipId);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update keyframe';
        logger.error('Update keyframe error:', error);
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsProcessing(false);
        onProcessingChange(false);
      }
    },
    [
      validateTrackState,
      validateKeyframeOperation,
      duration,
      minValue,
      maxValue,
      trackId,
      clipId,
      batchOperations,
      onProcessingChange,
      onError,
    ]
  );

  // Get value at time with error handling
  const getValueAtTime = useCallback(
    (time: number): T | undefined => {
      if (!track) return undefined;
      try {
        const validation = validateKeyframeOperation(time);
        if (!validation.isValid) {
          throw new KeyframeBaseError(validation.error || 'Invalid time');
        }

        const clampedTime = clampTime(time, duration);
        return getTrackValue(track, clampedTime);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to get value at time';
        logger.error('Get value error:', error);
        setError(errorMessage);
        onError(errorMessage);
        return undefined;
      }
    },
    [track, validateKeyframeOperation, duration, onError]
  );

  return {
    track,
    keyframes: track?.keyframes || [],
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    getValueAtTime,
    isProcessing,
    error,
  };
};
