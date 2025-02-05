import React, { createContext, useReducer, useMemo } from 'react';
import { 
  KeyframeState, 
  createInitialKeyframeState,
  validateKeyframeUpdate,
  isValidTimeRange,
  isValidValue
} from '../keyframes';
import { keyframeReducer, KeyframeAction } from '../keyframes/reducer';
import { TIMELINE } from '../keyframes/constants';
import { Logger } from '../../main/utils/logger';

const logger = new Logger('KeyframesContext');

// Base context type
type KeyframesContextValue<T extends number | string> = {
  state: KeyframeState<T>;
  dispatch: React.Dispatch<KeyframeAction<T>>;
}

// Create separate contexts for number and string values
const NumberKeyframesContext = createContext<KeyframesContextValue<number> | null>(null);
const StringKeyframesContext = createContext<KeyframesContextValue<string> | null>(null);

// Export contexts
export { NumberKeyframesContext, StringKeyframesContext };

// Type guards
function isNumberKeyframeState(state: KeyframeState<any>): state is KeyframeState<number> {
  const firstTrack = Object.values(state.tracks)[0];
  return !firstTrack || typeof firstTrack.defaultValue === 'number';
}

function isStringKeyframeState(state: KeyframeState<any>): state is KeyframeState<string> {
  const firstTrack = Object.values(state.tracks)[0];
  return !firstTrack || typeof firstTrack.defaultValue === 'string';
}

// Hook for accessing the context with proper typing
export function useKeyframesContext<T extends number | string>(): KeyframesContextValue<T> {
  const numberContext = React.useContext(NumberKeyframesContext);
  const stringContext = React.useContext(StringKeyframesContext);

  if (!numberContext && !stringContext) {
    throw new Error('useKeyframesContext must be used within a KeyframesProvider');
  }

  // For number type
  if (numberContext && isNumberKeyframeState(numberContext.state)) {
    return {
      state: numberContext.state,
      dispatch: numberContext.dispatch
    } as KeyframesContextValue<T>;
  }

  // For string type
  if (stringContext && isStringKeyframeState(stringContext.state)) {
    return {
      state: stringContext.state,
      dispatch: stringContext.dispatch
    } as KeyframesContextValue<T>;
  }

  throw new Error('Invalid context type');
}

class KeyframeValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyframeValidationError';
  }
}

// Create initial context with validation
const validateInitialState = (state: KeyframeState<number>): boolean => {
  try {
    // Validate all tracks and their keyframes
    for (const trackId in state.tracks) {
      const track = state.tracks[trackId];
      
      // Calculate max duration from all keyframes
      const duration = Math.max(
        ...Object.values(state.tracks)
          .flatMap(t => t.keyframes)
          .map(k => k.time)
          .concat([0])
      ) + TIMELINE.DURATION_BUFFER;

      // Validate each keyframe in the track
      for (const keyframe of track.keyframes) {
        // Validate time range
        if (!isValidTimeRange(keyframe.time, duration)) {
          throw new KeyframeValidationError(
            `Invalid time range in track ${trackId}: ${keyframe.time}. ` +
            `Must be between 0 and ${duration}`
          );
        }

        // Validate numeric value if track has bounds
        if (track.min !== undefined && track.max !== undefined) {
          if (!isValidValue(keyframe.value, track.min, track.max)) {
            throw new KeyframeValidationError(
              `Invalid value in track ${trackId}: ${keyframe.value}. ` +
              `Must be between ${track.min} and ${track.max}`
            );
          }
        }

        // Validate interpolation
        if (!keyframe.interpolation) {
          throw new KeyframeValidationError(
            `Missing interpolation in track ${trackId} at time ${keyframe.time}`
          );
        }
      }
    }

    // Validate all group references
    for (const groupId in state.groups) {
      const group = state.groups[groupId];
      for (const ref of group.tracks) {
        if (!state.tracks[ref.trackId]) {
          throw new KeyframeValidationError(
            `Invalid track reference in group ${groupId}: ${ref.trackId}. ` +
            'Track does not exist'
          );
        }
      }
    }

    return true;
  } catch (error) {
    if (error instanceof KeyframeValidationError) {
      logger.error('State validation error:', error.message);
    } else {
      logger.error('Unexpected error validating state:', error);
    }
    return false;
  }
};

// Base provider props
interface KeyframesProviderBaseProps<T extends number | string> {
  children: React.ReactNode;
  initialState?: KeyframeState<T>;
}

// Create a typed reducer
function createTypedReducer<T extends number | string>(
  reducer: typeof keyframeReducer
): React.Reducer<KeyframeState<T>, KeyframeAction<T>> {
  return (state: KeyframeState<T>, action: KeyframeAction<T>) => {
    return reducer(state as any, action as any) as KeyframeState<T>;
  };
}

// Number provider
export const NumberKeyframesProvider = ({ 
  children, 
  initialState = createInitialKeyframeState()
}: KeyframesProviderBaseProps<number>) => {
  // Validate initial state
  if (!validateInitialState(initialState)) {
    logger.error('Invalid initial state provided, using default state');
    initialState = createInitialKeyframeState();
  }

  // Create reducer with error handling
  const [state, baseDispatch] = useReducer(createTypedReducer<number>(keyframeReducer), initialState);

  // Wrap dispatch with error handling and logging
  const dispatch = useMemo(() => {
    return (action: KeyframeAction<number>) => {
      try {
        logger.debug('Dispatching action:', {
          type: action.type,
          trackId: 'trackId' in action ? action.trackId : undefined,
          time: 'time' in action ? action.time : undefined
        });
        baseDispatch(action);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error dispatching action';
        logger.error(`Error dispatching ${action.type}:`, errorMessage);
        // Re-throw to maintain error boundary behavior
        throw error;
      }
    };
  }, [baseDispatch]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<KeyframesContextValue<number>>(() => ({
    state,
    dispatch
  }), [state, dispatch]);

  return (
    <NumberKeyframesContext.Provider value={contextValue}>
      {children}
    </NumberKeyframesContext.Provider>
  );
};

// String provider
export const StringKeyframesProvider = ({ 
  children, 
  initialState = createInitialKeyframeState() as unknown as KeyframeState<string>
}: KeyframesProviderBaseProps<string>) => {
  // Create reducer with error handling
  const [state, baseDispatch] = useReducer(
    createTypedReducer<string>(keyframeReducer),
    initialState
  );

  // Wrap dispatch with error handling and logging
  const dispatch = useMemo(() => {
    return (action: KeyframeAction<string>) => {
      try {
        logger.debug('Dispatching action:', {
          type: action.type,
          trackId: 'trackId' in action ? action.trackId : undefined,
          time: 'time' in action ? action.time : undefined
        });
        baseDispatch(action);
      } catch (error) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Unknown error dispatching action';
        logger.error(`Error dispatching ${action.type}:`, errorMessage);
        // Re-throw to maintain error boundary behavior
        throw error;
      }
    };
  }, [baseDispatch]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<KeyframesContextValue<string>>(() => ({
    state,
    dispatch
  }), [state, dispatch]);

  return (
    <StringKeyframesContext.Provider value={contextValue}>
      {children}
    </StringKeyframesContext.Provider>
  );
};
