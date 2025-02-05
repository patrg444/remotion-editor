import { Logger } from '../../main/utils/logger';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useKeyframes } from '../hooks/useKeyframes';
import { useKeyframeInteraction } from '../hooks/useKeyframeInteraction';
import { 
  InterpolationType, 
  BaseKeyframeInterpolation, 
  BezierPresets,
  BatchKeyframeOperation,
  KeyframeTrack,
  KeyframeOperation
} from '../keyframes';
import { isValidValue, clampValue } from '../keyframes/utils';
import { INTERPOLATION_SHORTCUTS } from '../keyframes/constants';
import { BezierCurveEditor } from './BezierCurveEditor';
import '../styles/keyframe-editor.css';

const logger = new Logger('KeyframeEditor');

class KeyframeEditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KeyframeEditorError';
  }
}

interface KeyframeEditorProps {
  effectId: string;
  paramId: string;
  min?: number;
  max?: number;
  step?: number;
}

export function KeyframeEditor({ 
  effectId, 
  paramId, 
  min = 0, 
  max = 1, 
  step = 0.01 
}: KeyframeEditorProps) {
  const { keyframeState, createTrack, batchOperations } = useKeyframes({
    onError: (error) => setStatusMessage(error)
  });
  const trackId = `${effectId}-${paramId}`;
  const [showBezierEditor, setShowBezierEditor] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Use keyframe interaction hook with global duration
  const { selectedKeyframes } = useKeyframeInteraction({
    duration: keyframeState.duration,
    minValue: min,
    maxValue: max,
    onError: (error) => setStatusMessage(error)
  });

  // Initialize track if it doesn't exist
  useEffect(() => {
    try {
      if (!keyframeState.tracks[trackId]) {
        // Use midpoint as default value
        const defaultValue = min + (max - min) / 2;
        createTrack(effectId, paramId, defaultValue, min, max, step);
        setStatusMessage('Track created successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create track';
      logger.error('Track creation error:', error);
      setStatusMessage(errorMessage);
    }
  }, [trackId, effectId, paramId, min, max, step, createTrack, keyframeState.tracks]);

  const track = keyframeState.tracks[trackId] as KeyframeTrack<number>;
  if (!track) return null;

  const handleInterpolationChange = useCallback((type: InterpolationType) => {
    if (selectedKeyframes.length === 0) {
      setStatusMessage('No keyframes selected');
      return;
    }

    try {
      // If switching to Bezier, show the editor and apply default preset
      if (type === InterpolationType.Bezier) {
        const interpolation: BaseKeyframeInterpolation = {
          type,
          controlPoints: BezierPresets.EASE
        };

        // Update all selected keyframes
        const operations: BatchKeyframeOperation[] = [{
          trackId,
          operations: selectedKeyframes.map(index => {
            const keyframe = track.keyframes[index];
            if (!keyframe) {
              throw new KeyframeEditorError(`Keyframe not found at index ${index}`);
            }

            const operation: KeyframeOperation = {
              type: 'update',
              time: keyframe.time,
              value: keyframe.value,
              interpolation
            };
            return operation;
          })
        }];

        batchOperations(operations);
        previousFocusRef.current = document.activeElement as HTMLElement;
        setShowBezierEditor(true);
        setStatusMessage(`Changed interpolation to Bezier curve for ${selectedKeyframes.length} keyframes`);
        return;
      }

      // Otherwise, update with the new type
      const operations: BatchKeyframeOperation[] = [{
        trackId,
        operations: selectedKeyframes.map(index => {
          const keyframe = track.keyframes[index];
          if (!keyframe) {
            throw new KeyframeEditorError(`Keyframe not found at index ${index}`);
          }

          const operation: KeyframeOperation = {
            type: 'update',
            time: keyframe.time,
            value: keyframe.value,
            interpolation: { type }
          };
          return operation;
        })
      }];

      batchOperations(operations);
      setStatusMessage(`Changed interpolation to ${type} for ${selectedKeyframes.length} keyframes`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change interpolation';
      logger.error('Interpolation change error:', error);
      setStatusMessage(errorMessage);
    }
  }, [selectedKeyframes, track, batchOperations, trackId, setStatusMessage]);

  const handleValueChange = useCallback((value: number) => {
    if (selectedKeyframes.length === 0) {
      setStatusMessage('No keyframes selected');
      return;
    }

    try {
      if (isNaN(value)) {
        throw new KeyframeEditorError('Invalid value: not a number');
      }

      // Clamp value to valid range
      const clampedValue = clampValue(value, min, max);
      if (clampedValue !== value) {
        logger.warn(`Value ${value} clamped to ${clampedValue}`);
      }

      // Update all selected keyframes
      const operations: BatchKeyframeOperation[] = [{
        trackId,
        operations: selectedKeyframes.map(index => {
          const keyframe = track.keyframes[index];
          if (!keyframe) {
            throw new KeyframeEditorError(`Keyframe not found at index ${index}`);
          }

          const operation: KeyframeOperation = {
            type: 'update',
            time: keyframe.time,
            value: clampedValue,
            interpolation: keyframe.interpolation
          };
          return operation;
        })
      }];

      batchOperations(operations);
      setStatusMessage(`Updated value to ${clampedValue} for ${selectedKeyframes.length} keyframes`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update value';
      logger.error('Value update error:', error);
      setStatusMessage(errorMessage);
    }
  }, [selectedKeyframes, track, min, max, batchOperations, trackId, setStatusMessage]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedKeyframes.length === 0 || e.metaKey || e.ctrlKey || e.altKey) return;

    const key = e.key.toLowerCase();
    if (key in INTERPOLATION_SHORTCUTS) {
      e.preventDefault();
      e.stopPropagation();
      handleInterpolationChange(INTERPOLATION_SHORTCUTS[key as keyof typeof INTERPOLATION_SHORTCUTS]);
    }
  }, [selectedKeyframes, handleInterpolationChange]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowBezierEditor(false);
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    setStatusMessage('Closed Bezier editor');
  }, []);

  // Add keyboard event listener
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.addEventListener('keydown', handleKeyDown);
    return () => editor.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const currentInterpolationType = selectedKeyframes.length === 1
    ? track.keyframes[selectedKeyframes[0]]?.interpolation.type
    : null;

  const getButtonLabel = useCallback((type: InterpolationType): string => {
    const shortcut = Object.entries(INTERPOLATION_SHORTCUTS).find(([_, t]) => t === type)?.[0];
    return shortcut ? `${type} (${shortcut.toUpperCase()})` : type;
  }, []);

  return (
    <div 
      ref={editorRef}
      className="keyframe-editor" 
      role="region" 
      aria-label="Keyframe editor"
      tabIndex={-1}
    >
      <div 
        id="keyframe-status" 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>

      <div className="keyframe-controls">
        <div 
          className="interpolation-buttons" 
          role="group" 
          aria-label="Interpolation type"
        >
          {Object.entries(InterpolationType).map(([key, type]) => (
            <button
              key={key}
              className={`interpolation-button ${type.toLowerCase()} ${currentInterpolationType === type ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleInterpolationChange(type);
              }}
              disabled={selectedKeyframes.length === 0}
              aria-pressed={currentInterpolationType === type}
              aria-label={`${type} interpolation ${getButtonLabel(type)}`}
              title={getButtonLabel(type)}
            >
              {type}
            </button>
          ))}
        </div>

        {selectedKeyframes.length === 1 && (
          <div 
            className="keyframe-value-editor"
            role="group"
            aria-label="Keyframe value"
          >
            <label htmlFor="keyframe-value">Value:</label>
            <input
              id="keyframe-value"
              type="number"
              value={track.keyframes[selectedKeyframes[0]]?.value ?? 0}
              onChange={(e) => {
                e.preventDefault();
                handleValueChange(parseFloat(e.target.value));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              min={min}
              max={max}
              step={step}
              aria-label={`Keyframe value between ${min} and ${max}`}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={track.keyframes[selectedKeyframes[0]]?.value ?? 0}
            />
          </div>
        )}
      </div>

      {/* Keyboard shortcuts help */}
      <div 
        className="keyboard-shortcuts-help" 
        role="complementary" 
        aria-label="Keyboard shortcuts"
      >
        <p>Keyboard shortcuts:</p>
        <ul>
          {(Object.entries(INTERPOLATION_SHORTCUTS) as [string, InterpolationType][]).map(([key, type]) => (
            <li key={key}>
              <kbd>{key.toUpperCase()}</kbd>: {type}
            </li>
          ))}
        </ul>
      </div>

      {/* Bezier editor modal */}
      {showBezierEditor && selectedKeyframes.length === 1 && (
        <div 
          className="bezier-editor-overlay"
          role="dialog"
          aria-label="Bezier curve editor"
          aria-modal="true"
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              handleModalClose();
            }
          }}
        >
          <div 
            className="bezier-editor-container"
            role="document"
          >
            <BezierCurveEditor
              effectId={effectId}
              paramId={`${paramId}-${selectedKeyframes[0]}`}
            />
            <button
              className="close-bezier-editor"
              onClick={(e) => {
                e.preventDefault();
                handleModalClose();
              }}
              aria-label="Close Bezier editor"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
