import { Logger } from '../../main/utils/logger';
import React, { useCallback, useRef, useState } from 'react';
import { InterpolationType, KeyframePoint } from '../keyframes/types';
import { clampValue } from '../keyframes/utils';
import { KEYBOARD, MODIFIERS, VOLUME } from '../keyframes/constants';
import { useAudioKeyframes } from '../hooks/useAudioKeyframes';

const logger = new Logger('VolumeEnvelope');

// Constants for normalized coordinate snapping
const NORMALIZED_GRID_SIZE = 0.05; // 5% increments for 0..1 range
const NORMALIZED_FINE_STEP = 0.01; // 1% increments for fine control

interface VolumeEnvelopeProps {
  clipId: string;
  duration: number;
  width: number;
  height: number;
  defaultVolume?: number;
  minVolume?: number;
  maxVolume?: number;
  isSelected?: boolean;
  onError?: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

interface ViewportDimensions {
  width: number;
  height: number;
}

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

export function VolumeEnvelope({
  clipId,
  duration,
  width,
  height,
  defaultVolume = VOLUME.DEFAULT,
  minVolume = VOLUME.MIN,
  maxVolume = VOLUME.MAX,
  isSelected = false,
  onError = () => {},
  onProcessingChange = () => {},
}: VolumeEnvelopeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const viewport = { width, height };

  const {
    keyframes,
    addKeyframe,
    removeKeyframe,
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
    error,
  } = useAudioKeyframes({
    clipId,
    duration,
    defaultVolume,
    minVolume,
    maxVolume,
    isSelected,
    onError,
    onProcessingChange,
    onTooltipChange: (text: string | null) => {
      if (text && pointerDownPosRef.current) {
        setTooltip({
          x: pointerDownPosRef.current.x,
          y: pointerDownPosRef.current.y,
          text
        });
      } else {
        setTooltip(null);
      }
    },
  });

  // Find keyframe at position
  const findKeyframeAtPosition = useCallback((
    x: number,
    y: number,
    keyframes: { time: number; value: number }[],
    duration: number,
    viewport: ViewportDimensions,
    hitRadius = 5
  ): number => {
    const time = (x / viewport.width) * duration;
    const value = 1 - (y / viewport.height);

    return keyframes.findIndex(kf => {
      const kfX = (kf.time / duration) * viewport.width;
      const kfY = (1 - kf.value) * viewport.height;
      const distance = Math.sqrt(Math.pow(x - kfX, 2) + Math.pow(y - kfY, 2));
      return distance <= hitRadius;
    });
  }, []);

  // Handle pointer events
  const handlePointerDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error('Canvas not found');
      return;
    }

    try {
      e.preventDefault();
      e.stopPropagation();

      const rect = canvas.getBoundingClientRect();
      const x = clampValue(e.clientX - rect.left, 0, viewport.width);
      const y = clampValue(e.clientY - rect.top, 0, viewport.height);

      pointerDownPosRef.current = { x, y };

      const keyframeIndex = findKeyframeAtPosition(x, y, keyframes, duration, viewport);

      if (keyframeIndex >= 0) {
        startDrag(keyframeIndex, x, y, keyframes);
      } else if (e.getModifierState(MODIFIERS.ADD_KEYFRAME)) {
        // Add new keyframe at pointer position
        const time = (x / viewport.width) * duration;
        const value = 1 - y / viewport.height;
        addKeyframe(time, value, InterpolationType.Linear);
      } else {
        startSelection(x, y);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle pointer down';
      logger.error('Pointer down error:', error);
      setStatusMessage(errorMessage);
    }
  }, [keyframes, duration, viewport, startDrag, addKeyframe, startSelection, findKeyframeAtPosition]);

  const handlePointerMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      e.preventDefault();
      e.stopPropagation();

      const rect = canvas.getBoundingClientRect();
      const x = clampValue(e.clientX - rect.left, 0, viewport.width);
      const y = clampValue(e.clientY - rect.top, 0, viewport.height);

      if (isDragging) {
        updateDrag(viewport.width, viewport.height, x, y, e.getModifierState(MODIFIERS.LARGE_STEP), keyframes, clipId);
      } else if (isDrawingSelection) {
        const points: KeyframePoint[] = keyframes.map((kf, index) => ({
          x: (kf.time / duration) * viewport.width,
          y: (1 - kf.value) * viewport.height,
          time: kf.time,
          value: kf.value,
          interpolation: kf.interpolation,
        }));
        updateSelection(x, y, points);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle pointer move';
      logger.error('Pointer move error:', error);
      setStatusMessage(errorMessage);
    }
  }, [isDragging, isDrawingSelection, viewport, keyframes, clipId, duration, updateDrag, updateSelection]);

  const handlePointerUp = useCallback(() => {
    try {
      if (isDragging) {
        endDrag();
      } else if (isDrawingSelection) {
        endSelection();
      }
      pointerDownPosRef.current = null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle pointer up';
      logger.error('Pointer up error:', error);
      setStatusMessage(errorMessage);
    }
  }, [isDragging, isDrawingSelection, endDrag, endSelection]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    try {
      const step = e.getModifierState(MODIFIERS.FINE_CONTROL) ? NORMALIZED_FINE_STEP : NORMALIZED_GRID_SIZE;
      const delta = e.getModifierState(MODIFIERS.LARGE_STEP) ? step * KEYBOARD.SHIFT_MULTIPLIER : step;

      if ((e.key === 'Delete' || e.key === 'Backspace') && isSelected) {
        e.preventDefault();
        e.stopPropagation();

        // Handle keyframe deletion
        const deletedCount = selectedKeyframes.length;
        if (deletedCount > 0) {
          // Sort in reverse order to avoid index shifting
          const sortedIndices = [...selectedKeyframes].sort((a, b) => b - a);
          sortedIndices.forEach(index => {
            const keyframe = keyframes[index];
            if (keyframe) {
              removeKeyframe(keyframe.time);
            }
          });
          setStatusMessage(`Deleted ${deletedCount} keyframe${deletedCount > 1 ? 's' : ''}`);
          clearSelection();
        }
      } else if (e.key === 'Escape') {
        // Cancel drag or selection
        e.preventDefault();
        e.stopPropagation();
        if (isDragging) {
          endDrag();
        } else if (isDrawingSelection) {
          endSelection();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle key press';
      logger.error('Keyboard event error:', error);
      setStatusMessage(errorMessage);
    }
  }, [selectedKeyframes, keyframes, removeKeyframe, clearSelection, isDragging, isDrawingSelection, endDrag, endSelection]);

  // Add event listeners
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div 
      className="volume-envelope" 
      role="region" 
      aria-label="Volume envelope editor"
    >
      <div 
        id="volume-live-region" 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>
      <canvas
        ref={canvasRef}
        className="envelope-canvas"
        width={width}
        height={height}
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={handlePointerUp}
        onMouseLeave={handlePointerUp}
        tabIndex={0}
        aria-label="Volume envelope canvas"
        role="application"
        aria-describedby="volume-live-region"
      />
      {tooltip && (
        <div
          className="volume-tooltip"
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
          }}
          role="tooltip"
          aria-hidden="true"
        >
          {tooltip.text}
        </div>
      )}
      <div 
        className="volume-controls-help" 
        role="complementary" 
        aria-label="Keyboard controls"
      >
        <p>Hold {MODIFIERS.FINE_CONTROL} for fine control</p>
        <p>Hold {MODIFIERS.LARGE_STEP} for larger steps</p>
        <p>Press Delete to remove selected keyframes</p>
        <p>Press Escape to cancel editing</p>
      </div>
    </div>
  );
}
