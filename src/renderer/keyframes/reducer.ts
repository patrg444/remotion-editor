import { Logger } from '../../main/utils/logger';
import {
  KeyframeState,
  KeyframeGroup,
  KeyframeTrackReference,
  InterpolationType,
  BaseKeyframeInterpolation,
  BatchKeyframeOperation,
  KeyframeTrack
} from './types';
import { TIMELINE } from './constants';
import {
  createKeyframeTrack,
  createKeyframe,
  validateKeyframeUpdate,
  sortKeyframes,
  updateDurationCache,
  getTrackValue
} from './utils';

type BatchOperation<T extends number | string = number | string> = {
  type: 'add' | 'update';
  time: number;
  value: T;
  interpolation: InterpolationType | BaseKeyframeInterpolation;
} | {
  type: 'remove';
  time: number;
};

const logger = new Logger('keyframeReducer');

function isValidBatchOperation<T extends number | string>(op: unknown): op is BatchOperation<T> {
  try {
    if (typeof op !== 'object' || op === null) {
      throw new Error('Operation must be an object');
    }

    const { type, time } = op as { type: string; time: unknown };
    if (!['add', 'remove', 'update'].includes(type)) {
      throw new Error(`Invalid operation type: ${type}`);
    }
    if (typeof time !== 'number' || isNaN(time)) {
      throw new Error(`Invalid time value: ${time}`);
    }

    if (type === 'add' || type === 'update') {
      const { value, interpolation } = op as { value: unknown; interpolation: unknown };
      if (value === undefined) {
        throw new Error('Missing value in operation');
      }
      if (interpolation === undefined) {
        throw new Error('Missing interpolation in operation');
      }
    }

    return true;
  } catch (error) {
    logger.error('Batch operation validation failed:', error);
    return false;
  }
}

function validateBatchOperation<T extends number | string>(
  op: BatchOperation<T>,
  track: KeyframeTrack<T>,
  state: KeyframeState<T>
): boolean {
  try {
    if (op.type === 'add' || op.type === 'update') {
      if (!validateKeyframeUpdate(op.time, op.value, track, state)) {
        throw new Error(`Invalid keyframe update: time=${op.time}, value=${op.value}`);
      }
    }
    return true;
  } catch (error) {
    logger.error('Batch operation validation failed:', error);
    return false;
  }
}

function processBatchOperation<T extends number | string>(
  state: KeyframeState<T>,
  trackId: string,
  op: BatchOperation<T>
): KeyframeState<T> {
  try {
    if (op.type === 'add' || op.type === 'update') {
      return keyframeReducer(state, {
        type: op.type === 'add' ? 'ADD_KEYFRAME' : 'UPDATE_KEYFRAME',
        trackId,
        time: op.time,
        value: op.value,
        interpolation: op.interpolation
      });
    }
    if (op.type === 'remove') {
      return keyframeReducer(state, {
        type: 'REMOVE_KEYFRAME',
        trackId,
        time: op.time
      });
    }
    return state;
  } catch (error) {
    logger.error('Failed to process batch operation:', error);
    return state;
  }
}

export type KeyframeAction<T extends number | string = number | string> =
  | { type: 'ADD_TRACK'; trackId: string; paramId: string; defaultValue: T; min?: number; max?: number; step?: number }
  | { type: 'REMOVE_TRACK'; trackId: string }
  | { type: 'ADD_KEYFRAME'; trackId: string; time: number; value: T; interpolation: InterpolationType | BaseKeyframeInterpolation }
  | { type: 'REMOVE_KEYFRAME'; trackId: string; time: number }
  | { type: 'UPDATE_KEYFRAME'; trackId: string; time: number; value: T; interpolation: InterpolationType | BaseKeyframeInterpolation }
  | { type: 'ADD_GROUP'; group: KeyframeGroup }
  | { type: 'REMOVE_GROUP'; groupId: string }
  | { type: 'TOGGLE_GROUP_EXPANSION'; groupId: string }
  | { type: 'SET_STATE'; state: KeyframeState<T> }
  | { type: 'BATCH_OPERATIONS'; operations: ReadonlyArray<BatchKeyframeOperation<T>> };

export function keyframeReducer<T extends number | string>(
  state: KeyframeState<T>,
  action: KeyframeAction<T>
): KeyframeState<T> {
  try {
    let newState: KeyframeState<T>;

    switch (action.type) {
      case 'ADD_TRACK': {
        const { trackId, paramId, defaultValue, min, max, step } = action;
        const track = createKeyframeTrack(trackId, paramId, defaultValue, min, max, step);
        // No need to update duration cache for new empty track
        return {
          ...state,
          tracks: {
            ...state.tracks,
            [trackId]: {
              ...track,
              getValue: (time: number) => getTrackValue(track, time)
            }
          },
        };
      }
      case 'REMOVE_TRACK': {
        const { [action.trackId]: removedTrack, ...remainingTracks } = state.tracks;
        // Only update duration if removed track had keyframes
        const needsDurationUpdate = removedTrack && removedTrack.keyframes.length > 0;
        newState = {
          ...state,
          tracks: remainingTracks,
        };
        return needsDurationUpdate ? updateDurationCache<T>(newState) : newState;
      }
      case 'ADD_KEYFRAME': {
        const track = state.tracks[action.trackId] as KeyframeTrack<T>;
        if (!track) {
          throw new Error(`Track not found: ${action.trackId}`);
        }

        if (!validateKeyframeUpdate(action.time, action.value, track, state)) {
          throw new Error(`Invalid keyframe: time=${action.time}, value=${action.value}`);
        }

        const newKeyframe = createKeyframe(action.time, action.value, action.interpolation);
        const sortedKeyframes = sortKeyframes([...track.keyframes, newKeyframe]);
        newState = {
          ...state,
          tracks: {
            ...state.tracks,
            [action.trackId]: {
              ...track,
              keyframes: sortedKeyframes,
            },
          },
        };
        return updateDurationCache<T>(newState);
      }
      case 'REMOVE_KEYFRAME': {
        const track = state.tracks[action.trackId] as KeyframeTrack<T>;
        if (!track) {
          throw new Error(`Track not found: ${action.trackId}`);
        }
        const updatedKeyframes = track.keyframes.filter(k => k.time !== action.time);
        newState = {
          ...state,
          tracks: {
            ...state.tracks,
            [action.trackId]: {
              ...track,
              keyframes: updatedKeyframes,
            },
          },
        };
        return updateDurationCache<T>(newState);
      }
      case 'UPDATE_KEYFRAME': {
        const track = state.tracks[action.trackId] as KeyframeTrack<T>;
        if (!track) {
          throw new Error(`Track not found: ${action.trackId}`);
        }

        if (!validateKeyframeUpdate(action.time, action.value, track, state)) {
          throw new Error(`Invalid keyframe update: time=${action.time}, value=${action.value}`);
        }

        newState = {
          ...state,
          tracks: {
            ...state.tracks,
            [action.trackId]: {
              ...track,
              keyframes: track.keyframes.map(k =>
                k.time === action.time
                  ? createKeyframe(action.time, action.value, action.interpolation)
                  : k
              ),
            },
          },
        };
        return updateDurationCache<T>(newState);
      }
      case 'ADD_GROUP':
        return {
          ...state,
          groups: {
            ...state.groups,
            [action.group.id]: action.group,
          },
        };
      case 'REMOVE_GROUP': {
        const { [action.groupId]: removedGroup, ...remainingGroups } = state.groups;
        return {
          ...state,
          groups: remainingGroups,
        };
      }
      case 'TOGGLE_GROUP_EXPANSION': {
        const group = state.groups[action.groupId];
        if (!group) {
          throw new Error(`Group not found: ${action.groupId}`);
        }
        return {
          ...state,
          groups: {
            ...state.groups,
            [action.groupId]: {
              ...group,
              isExpanded: !group.isExpanded,
            },
          },
        };
      }
      case 'SET_STATE':
        return updateDurationCache(action.state as KeyframeState<T>);
      case 'BATCH_OPERATIONS': {
        // First validate all operations before applying any changes
        const validationErrors: string[] = [];

        for (const { trackId, operations } of action.operations) {
          const track = state.tracks[trackId];
          if (!track) {
            validationErrors.push(`Track not found: ${trackId}`);
            continue;
          }

          for (const op of operations) {
            try {
              if (!isValidBatchOperation<T>(op)) {
                validationErrors.push(`Invalid batch operation format: ${JSON.stringify(op)}`);
                continue;
              }

              if (!validateBatchOperation(op, track, state)) {
                validationErrors.push(`Invalid batch operation values: ${JSON.stringify(op)}`);
                continue;
              }
            } catch (error) {
              validationErrors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }

        // If any validation failed, return current state and log errors
        if (validationErrors.length > 0) {
          logger.error('Batch operations validation failed:', validationErrors);
          return state;
        }

        // Apply all operations if validation passed
        try {
          let timeValuesChanged = false;
          newState = action.operations.reduce((currentState, { trackId, operations }) => {
            return operations.reduce((state, op) => {
              // Track if any operation affects timing
              if (op.type === 'add' || op.type === 'remove' || 
                  (op.type === 'update' && op.time !== (op as any).originalTime)) {
                timeValuesChanged = true;
              }
              return processBatchOperation(state, trackId, op as BatchOperation<T>);
            }, currentState);
          }, state);
          // Only update duration cache if time values changed
          return timeValuesChanged ? updateDurationCache<T>(newState) : newState;
        } catch (error) {
          logger.error('Error applying batch operations:', error);
          return state;
        }
      }
      default:
        return state;
    }
  } catch (error) {
    logger.error('Reducer error:', error);
    return state;
  }
}

/**
 * Create initial keyframe state with duration cache
 */
export function createInitialKeyframeState<T extends number | string = number>(): KeyframeState<T> {
  return {
    tracks: {} as Record<string, KeyframeTrack<T>>,
    groups: {},
    snapping: false,
    duration: TIMELINE.DEFAULT_DURATION,
    lastModified: Date.now()
  };
}
