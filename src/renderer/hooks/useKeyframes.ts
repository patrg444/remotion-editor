import { Logger } from '../../main/utils/logger';
import { useCallback, useReducer, useState } from 'react';
import {
  KeyframeState,
  KeyframeTrack,
  KeyframeGroup,
  KeyframeTrackReference,
  InterpolationType,
  Keyframe,
  BaseKeyframeInterpolation,
  BatchKeyframeOperation
} from '../keyframes/types';
import {
  validateKeyframeUpdate,
  sortKeyframes
} from '../keyframes/utils';
import { keyframeReducer, createInitialKeyframeState } from '../keyframes/reducer';
import { useEditHistory } from './useEditHistory';

const logger = new Logger('useKeyframes');

interface UseKeyframesProps {
  onError?: (error: string) => void;
}

export function useKeyframes({ onError = () => {} }: UseKeyframesProps = {}) {
  const [keyframeState, dispatch] = useReducer(
    keyframeReducer,
    undefined,
    createInitialKeyframeState
  );
  const [error, setError] = useState<string | null>(null);
  const editHistory = useEditHistory();

  // Validate track existence
  const validateTrack = useCallback(
    <T extends number | string>(trackId: string): KeyframeTrack<T> | undefined => {
      try {
        const track = keyframeState.tracks[trackId];
        if (!track) {
          throw new Error(`Track ${trackId} does not exist`);
        }
        return track as KeyframeTrack<T>;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Failed to validate track ${trackId}`;
        logger.error('Track validation error:', error);
        setError(errorMessage);
        onError(errorMessage);
        return undefined;
      }
    },
    [keyframeState.tracks, onError, setError]
  );

  // Create a new track
  const createTrack = useCallback(
    <T extends number | string>(
      effectId: string,
      paramId: string,
      defaultValue: T,
      min?: number,
      max?: number,
      step?: number
    ): string => {
      try {
        const trackId = `${effectId}-${paramId}`;
        
        // Check if track already exists
        if (keyframeState.tracks[trackId]) {
          logger.debug(`Track ${trackId} already exists, skipping creation`);
          return trackId;
        }

        // Validate parameters
        if (min !== undefined && max !== undefined && min > max) {
          throw new Error(`Invalid min/max values: min=${min}, max=${max}`);
        }

        if (typeof defaultValue === 'number' && min !== undefined && max !== undefined) {
          if (defaultValue < min || defaultValue > max) {
            throw new Error(`Default value ${defaultValue} outside range [${min}, ${max}]`);
          }
        }

        dispatch({
          type: 'ADD_TRACK',
          trackId,
          paramId,
          defaultValue,
          min,
          max,
          step,
        });
        return trackId;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create track';
        logger.error('Create track error:', error);
        setError(errorMessage);
        onError(errorMessage);
        return `${effectId}-${paramId}`;
      }
    },
    [keyframeState.tracks, onError, setError]
  );

  // Remove a track
  const removeTrack = useCallback(
    <T extends number | string>(trackId: string) => {
      try {
        const track = validateTrack<T>(trackId);
        if (!track) {
          throw new Error(`Track ${trackId} does not exist`);
        }
        dispatch({ type: 'REMOVE_TRACK', trackId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove track';
        logger.error('Remove track error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [validateTrack, onError, setError]
  );

  // Add a keyframe
  const addKeyframe = useCallback(
    <T extends number | string>(
      trackId: string,
      time: number,
      value: T,
      interpolation:
        | InterpolationType
        | BaseKeyframeInterpolation = InterpolationType.Linear
    ) => {
      try {
        const track = validateTrack<T>(trackId);
        if (!track) {
          throw new Error(`Track ${trackId} does not exist`);
        }

        if (!validateKeyframeUpdate(time, value, track, keyframeState)) {
          throw new Error(`Invalid keyframe: time=${time}, value=${value}`);
        }

        dispatch({ type: 'ADD_KEYFRAME', trackId, time, value, interpolation });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add keyframe';
        logger.error('Add keyframe error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [validateTrack, keyframeState, onError, setError]
  );

  // Remove a keyframe
  const removeKeyframe = useCallback(
    <T extends number | string>(trackId: string, time: number) => {
      try {
        const track = validateTrack<T>(trackId);
        if (!track) {
          throw new Error(`Track ${trackId} does not exist`);
        }
        dispatch({ type: 'REMOVE_KEYFRAME', trackId, time });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove keyframe';
        logger.error('Remove keyframe error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [validateTrack, onError, setError]
  );

  // Update a keyframe
  const updateKeyframe = useCallback(
    <T extends number | string>(
      trackId: string,
      time: number,
      value: T,
      interpolation:
        | InterpolationType
        | BaseKeyframeInterpolation = InterpolationType.Linear
    ) => {
      try {
        const track = validateTrack<T>(trackId);
        if (!track) {
          throw new Error(`Track ${trackId} does not exist`);
        }

        if (!validateKeyframeUpdate(time, value, track, keyframeState)) {
          throw new Error(`Invalid keyframe update: time=${time}, value=${value}`);
        }

        dispatch({
          type: 'UPDATE_KEYFRAME',
          trackId,
          time,
          value,
          interpolation,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update keyframe';
        logger.error('Update keyframe error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [validateTrack, keyframeState, onError, setError]
  );

  // Batch operations
  const batchOperations = useCallback(
    <T extends number | string>(
      operations: BatchKeyframeOperation[],
      historyDescription?: string,
      clipId?: string
    ) => {
      try {
        // Validate all operations first
        for (const { trackId, operations: ops } of operations) {
          const track = validateTrack<T>(trackId);
          if (!track) {
            throw new Error(`Track ${trackId} does not exist`);
          }

          for (const op of ops) {
            if (
              op.type !== 'remove' &&
              !validateKeyframeUpdate(op.time, op.value, track, keyframeState)
            ) {
              throw new Error(`Invalid batch operation: ${op.type} at time=${op.time}`);
            }
          }
        }

        // Save state before change if needed for history
        const prevState = clipId
          ? {
              tracks: Object.fromEntries(
                operations.map((op) => [op.trackId, keyframeState.tracks[op.trackId]])
              ),
            }
          : undefined;

        // Dispatch batch action
        dispatch({ type: 'BATCH_OPERATIONS', operations });

        // Add to history if description provided
        if (historyDescription && clipId && prevState) {
          const nextState = {
            tracks: Object.fromEntries(
              operations.map((op) => [op.trackId, keyframeState.tracks[op.trackId]])
            ),
          };

          editHistory.addOperation({
            type: 'effect',
            description: historyDescription,
            data: {
              clipId,
              before: prevState,
              after: nextState,
            },
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to execute batch operations';
        logger.error('Batch operations error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [validateTrack, keyframeState, editHistory, onError, setError]
  );

  // Get a track
  const getTrack = useCallback(
    <T extends number | string>(trackId: string): KeyframeTrack<T> | undefined => {
      try {
        const trackData = keyframeState.tracks[trackId];
        if (!trackData) {
          throw new Error(`Track ${trackId} does not exist`);
        }

        const sortedKeyframes = sortKeyframes(trackData.keyframes) as Keyframe<T>[];
        return {
          id: trackData.id,
          paramId: trackData.paramId,
          property: trackData.paramId,
          defaultValue: trackData.defaultValue as T,
          min: trackData.min,
          max: trackData.max,
          step: trackData.step,
          keyframes: sortedKeyframes,
          getValue: (time: number) => {
            // Find the keyframe at or before the given time
            const keyframe = sortedKeyframes.find(k => k.time <= time);
            return keyframe ? keyframe.value : trackData.defaultValue as T;
          }
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : `Failed to get track ${trackId}`;
        logger.error('Get track error:', error);
        setError(errorMessage);
        onError(errorMessage);
        return undefined;
      }
    },
    [keyframeState, onError, setError]
  );

  // Group management
  const addKeyframeGroup = useCallback(
    (groupId: string, name: string, trackRefs: KeyframeTrackReference[]) => {
      try {
        // Validate all track references
        for (const ref of trackRefs) {
          if (!keyframeState.tracks[ref.trackId]) {
            throw new Error(`Referenced track ${ref.trackId} does not exist`);
          }
        }

        const group: KeyframeGroup = {
          id: groupId,
          name,
          tracks: trackRefs,
          isExpanded: false,
        };
        dispatch({ type: 'ADD_GROUP', group });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add keyframe group';
        logger.error('Add keyframe group error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [keyframeState.tracks, onError, setError]
  );

  const removeKeyframeGroup = useCallback(
    (groupId: string) => {
      try {
        if (!keyframeState.groups[groupId]) {
          throw new Error(`Group ${groupId} does not exist`);
        }
        dispatch({ type: 'REMOVE_GROUP', groupId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to remove keyframe group';
        logger.error('Remove keyframe group error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [keyframeState.groups, onError, setError]
  );

  const toggleGroupExpansion = useCallback(
    (groupId: string) => {
      try {
        if (!keyframeState.groups[groupId]) {
          throw new Error(`Group ${groupId} does not exist`);
        }
        dispatch({ type: 'TOGGLE_GROUP_EXPANSION', groupId });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to toggle group expansion';
        logger.error('Toggle group expansion error:', error);
        setError(errorMessage);
        onError(errorMessage);
      }
    },
    [keyframeState.groups, onError, setError]
  );

  return {
    keyframeState,
    createTrack,
    removeTrack,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    batchOperations,
    getTrack,
    addKeyframeGroup,
    removeKeyframeGroup,
    toggleGroupExpansion,
    error,
  };
}
