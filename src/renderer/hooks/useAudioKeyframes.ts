import { Logger } from '../../main/utils/logger';
import { useCallback, useMemo } from 'react';
import { 
  InterpolationType,
  BatchKeyframeOperation,
  KeyframeOperation
} from '../keyframes/types';
import { volumeTodB, dBToVolume, formatdB } from '../keyframes/utils';
import { KEYBOARD, VOLUME } from '../keyframes/constants';
import { useKeyframeBase } from './useKeyframeBase';
import { useKeyframeInteraction } from './useKeyframeInteraction';

const logger = new Logger('useAudioKeyframes');

class AudioKeyframesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AudioKeyframesError';
  }
}

interface UseAudioKeyframesProps {
  clipId: string;
  duration: number;
  defaultVolume?: number;
  minVolume?: number;
  maxVolume?: number;
  isSelected?: boolean;
  onError?: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
  onTooltipChange?: (text: string | null) => void;
}

interface VolumeValidationResult {
  isValid: boolean;
  error?: string;
}

export function useAudioKeyframes({
  clipId,
  duration,
  defaultVolume = VOLUME.DEFAULT,
  minVolume = VOLUME.MIN,
  maxVolume = VOLUME.MAX,
  isSelected = false,
  onError = () => {},
  onProcessingChange = () => {},
  onTooltipChange = () => {},
}: UseAudioKeyframesProps) {
  // Validation functions
  const validateVolume = useCallback((volume: number): VolumeValidationResult => {
    try {
      if (volume <= VOLUME.MUTE_THRESHOLD) {
        return {
          isValid: false,
          error: `Invalid volume value: ${volume}. Must be greater than ${VOLUME.MUTE_THRESHOLD}`
        };
      }

      if (volume < minVolume || volume > maxVolume) {
        return {
          isValid: false,
          error: `Volume out of range: ${volume}. Must be between ${minVolume} and ${maxVolume}`
        };
      }

      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Volume validation failed'
      };
    }
  }, [minVolume, maxVolume]);

  // Use base keyframe functionality
  const {
    track,
    keyframes,
    addKeyframe: baseAddKeyframe,
    removeKeyframe,
    updateKeyframe: baseUpdateKeyframe,
    getValueAtTime,
    isProcessing,
    error,
  } = useKeyframeBase<number>({
    clipId,
    duration,
    defaultValue: defaultVolume,
    minValue: minVolume,
    maxValue: maxVolume,
    step: KEYBOARD.FINE_CONTROL_STEP,
    isSelected,
    onError,
    onProcessingChange,
  });

  // Memoize drag callbacks
  const dragCallbacks = useMemo(() => ({
    onDragStart: (keyframe: { value: number }) => {
      try {
        const validation = validateVolume(keyframe.value);
        if (!validation.isValid) {
          throw new AudioKeyframesError(validation.error || 'Invalid volume value');
        }
        onTooltipChange(formatdB(volumeTodB(keyframe.value)));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to format volume value';
        logger.error('Tooltip update error:', error);
        onError(errorMessage);
        onTooltipChange(null);
      }
    },
    onDragUpdate: (operations: BatchKeyframeOperation<number>[]) => {
      try {
        operations.forEach((op) => {
          op.operations.forEach((action: KeyframeOperation<number>) => {
            if (action.type === 'update' && action.interpolation && action.value !== undefined) {
              const validation = validateVolume(action.value);
              if (!validation.isValid) {
                throw new AudioKeyframesError(validation.error || 'Invalid volume value');
              }
              baseUpdateKeyframe(
                action.time,
                action.time,
                action.value,
                action.interpolation
              );
            }
          });
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update keyframes during drag';
        logger.error('Drag update error:', error);
        onError(errorMessage);
      }
    },
    onDragEnd: () => {
      onTooltipChange(null);
    }
  }), [validateVolume, onTooltipChange, onError, baseUpdateKeyframe]);

  // Use interaction functionality
  const {
    isDragging,
    dragKeyframeIndex,
    startDrag,
    updateDrag,
    endDrag,
    selectedKeyframes,
    selectionBox,
    isDrawingSelection,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    shouldStartSelection,
  } = useKeyframeInteraction<number>({
    duration,
    onDragStart: dragCallbacks.onDragStart,
    onDragUpdate: dragCallbacks.onDragUpdate,
    onDragEnd: dragCallbacks.onDragEnd,
    minValue: minVolume,
    maxValue: maxVolume,
  });

  // Add keyframe with dB snapping
  const addKeyframe = useCallback(
    (
      time: number,
      volume: number,
      interpolationType: InterpolationType = InterpolationType.Linear
    ) => {
      try {
        const validation = validateVolume(volume);
        if (!validation.isValid) {
          throw new AudioKeyframesError(validation.error || 'Invalid volume value');
        }

        // Convert to dB for snapping
        const db = volumeTodB(volume);

        // Find closest common dB value
        const snappedDb = VOLUME.DB_VALUES.reduce(
          (prev, curr) => (Math.abs(curr - db) < Math.abs(prev - db) ? curr : prev),
          db
        );

        // Convert back to volume
        const snappedVolume = dBToVolume(snappedDb);

        return baseAddKeyframe(time, snappedVolume, interpolationType);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to add keyframe';
        logger.error('Add keyframe error:', error);
        onError(errorMessage);
        return;
      }
    },
    [baseAddKeyframe, validateVolume, onError]
  );

  // Update keyframe with dB snapping
  const updateKeyframe = useCallback(
    (
      oldTime: number,
      newTime: number,
      volume: number,
      interpolationType: InterpolationType = InterpolationType.Linear
    ) => {
      try {
        const validation = validateVolume(volume);
        if (!validation.isValid) {
          throw new AudioKeyframesError(validation.error || 'Invalid volume value');
        }

        // Convert to dB for snapping
        const db = volumeTodB(volume);

        // Find closest common dB value
        const snappedDb = VOLUME.DB_VALUES.reduce(
          (prev, curr) => (Math.abs(curr - db) < Math.abs(prev - db) ? curr : prev),
          db
        );

        // Convert back to volume
        const snappedVolume = dBToVolume(snappedDb);

        return baseUpdateKeyframe(oldTime, newTime, snappedVolume, interpolationType);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update keyframe';
        logger.error('Update keyframe error:', error);
        onError(errorMessage);
        return;
      }
    },
    [baseUpdateKeyframe, validateVolume, onError]
  );

  // Get automation curves for visualization
  const getAutomationCurves = useCallback(
    (resolution: number): { volumeCurve: number[] } => {
      try {
        if (resolution <= 0) {
          throw new AudioKeyframesError(`Invalid resolution: ${resolution}. Must be greater than 0`);
        }

        const volumeCurve: number[] = [];
        const step = duration / resolution;

        for (let i = 0; i <= resolution; i++) {
          const time = i * step;
          const value = getValueAtTime(time);
          
          if (value === undefined) {
            throw new AudioKeyframesError(`Failed to get volume value at time ${time}`);
          }
          
          const validation = validateVolume(value);
          if (!validation.isValid) {
            throw new AudioKeyframesError(validation.error || 'Invalid volume value');
          }

          volumeCurve.push(value);
        }

        return { volumeCurve };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate automation curves';
        logger.error('Automation curves error:', error);
        onError(errorMessage);
        return { volumeCurve: [] };
      }
    },
    [duration, getValueAtTime, validateVolume, onError]
  );

  return {
    // Base functionality
    track,
    keyframes,
    addKeyframe,
    removeKeyframe,
    updateKeyframe,
    getValueAtTime,
    isProcessing,
    error,

    // Interaction state
    isDragging,
    dragKeyframeIndex,
    startDrag,
    updateDrag,
    endDrag,
    selectedKeyframes,
    selectionBox,
    isDrawingSelection,
    startSelection,
    updateSelection,
    endSelection,
    clearSelection,
    shouldStartSelection,

    // Audio-specific
    getAutomationCurves,
    volumeTodB,
    dBToVolume,
    formatdB,
  };
}
