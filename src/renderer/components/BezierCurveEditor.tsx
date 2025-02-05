import { Logger } from '../../main/utils/logger';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useKeyframes } from '../hooks/useKeyframes';
import { 
  InterpolationType, 
  BezierControlPoints, 
  ControlPointDragState,
  BezierCurveConfig,
  KeyframeOperation,
  BatchKeyframeOperation
} from '../keyframes/types';
import {
  BEZIER,
  KEYBOARD,
  INDICATOR,
  MODIFIERS,
  BezierPresetKey
} from '../keyframes/constants';

const logger = new Logger('BezierCurveEditor');

class BezierEditorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BezierEditorError';
  }
}

export interface BezierCurveEditorProps {
  effectId: string;
  paramId: string;
  config?: Partial<BezierCurveConfig>;
  selectedKeyframes?: number[];
}

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

// Constants for normalized coordinate snapping
const NORMALIZED_GRID_SIZE = 0.05; // 5% increments for 0..1 range
const NORMALIZED_FINE_STEP = 0.01; // 1% increments for fine control

export function BezierCurveEditor({ 
  effectId, 
  paramId, 
  config = BEZIER.CONFIG,
  selectedKeyframes = []
}: BezierCurveEditorProps) {
  const { keyframeState, batchOperations } = useKeyframes();
  const trackId = `${effectId}-${paramId}`;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [controlPoints, setControlPoints] = useState<BezierControlPoints>({
    in: [0.25, 0.25],
    out: [0.75, 0.75],
  });
  const [dragState, setDragState] = useState<ControlPointDragState | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  // Merge default and custom config
  const finalConfig = { 
    ...BEZIER.CONFIG,
    ...config 
  };

  // Load initial control points from keyframe
  useEffect(() => {
    try {
      const track = keyframeState.tracks[trackId];
      if (!track) {
        throw new BezierEditorError(`Track not found: ${trackId}`);
      }

      if (track.keyframes.length === 0) {
        throw new BezierEditorError('No keyframes found');
      }

      const kf = track.keyframes[selectedKeyframes[0] || 0];
      if (!kf) {
        throw new BezierEditorError('Selected keyframe not found');
      }

      if (kf.interpolation.type === InterpolationType.Bezier && 'controlPoints' in kf.interpolation) {
        const points = kf.interpolation.controlPoints;
        setControlPoints({
          in: [...points.in] as [number, number],
          out: [...points.out] as [number, number]
        });
        setStatusMessage('Loaded control points from keyframe');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load control points';
      logger.error('Control points loading error:', error);
      setStatusMessage(errorMessage);
    }
  }, [trackId, keyframeState.tracks, selectedKeyframes]);

  // Apply preset curve
  const applyPreset = useCallback((presetKey: BezierPresetKey) => {
    try {
      const preset = BEZIER.PRESETS[presetKey];
      if (!preset) {
        throw new BezierEditorError(`Invalid preset: ${presetKey}`);
      }

      const mutablePreset: BezierControlPoints = {
        in: [...preset.in] as [number, number],
        out: [...preset.out] as [number, number]
      };

      setControlPoints(mutablePreset);
      
      // Update all selected keyframes
      const track = keyframeState.tracks[trackId];
      if (!track) {
        throw new BezierEditorError(`Track not found: ${trackId}`);
      }

      if (selectedKeyframes.length === 0) {
        throw new BezierEditorError('No keyframes selected');
      }

      const operations: BatchKeyframeOperation<number>[] = [{
        trackId,
        operations: selectedKeyframes.map(index => {
          const keyframe = track.keyframes[index];
          if (!keyframe) {
            throw new BezierEditorError(`Keyframe not found at index ${index}`);
          }

          // Ensure value is a number
          const value = typeof keyframe.value === 'string' ? parseFloat(keyframe.value) : keyframe.value;
          if (isNaN(value)) {
            throw new BezierEditorError(`Invalid keyframe value: ${keyframe.value}`);
          }

          const operation: KeyframeOperation<number> = {
            type: 'update',
            time: keyframe.time,
            value,
            interpolation: {
              type: InterpolationType.Bezier,
              controlPoints: mutablePreset
            }
          };
          return operation;
        })
      }];

      batchOperations(operations);
      setStatusMessage(`Applied ${presetKey.toLowerCase()} preset to ${selectedKeyframes.length} keyframes`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply preset';
      logger.error('Preset application error:', error);
      setStatusMessage(errorMessage);
    }
  }, [trackId, keyframeState.tracks, selectedKeyframes, batchOperations]);

  // Snap value to grid in normalized 0..1 space
  const snapToGrid = useCallback((value: number, useSnapping: boolean): number => {
    if (!useSnapping) return value;
    const step = useSnapping ? NORMALIZED_GRID_SIZE : NORMALIZED_FINE_STEP;
    return Math.round(value / step) * step;
  }, []);

  // Draw bezier curve
  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      logger.error('Canvas context not found');
      return;
    }

    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = BEZIER.CONFIG.lineColor;
      ctx.lineWidth = INDICATOR.STROKE_WIDTH / BEZIER.CONFIG.strokeWidthDivisor;
      for (let i = 0; i <= finalConfig.gridDivisions; i++) {
        const pos = (i / finalConfig.gridDivisions) * canvas.width;
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(canvas.width, pos);
        ctx.stroke();
      }

      // Draw curve
      ctx.strokeStyle = BEZIER.CONFIG.curveColor;
      ctx.lineWidth = INDICATOR.STROKE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);

      // Draw bezier curve with high resolution
      const { in: inPoint, out: outPoint } = controlPoints;
      ctx.bezierCurveTo(
        inPoint[0] * canvas.width,
        (1 - inPoint[1]) * canvas.height,
        outPoint[0] * canvas.width,
        (1 - outPoint[1]) * canvas.height,
        canvas.width,
        0
      );
      ctx.stroke();

      // Draw control points and handles
      ctx.fillStyle = BEZIER.CONFIG.pointColor;
      ctx.strokeStyle = BEZIER.CONFIG.handleColor;
      ctx.lineWidth = INDICATOR.STROKE_WIDTH;

      // Draw lines to control points
      ctx.setLineDash(BEZIER.CONFIG.dashPattern);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height);
      ctx.lineTo(inPoint[0] * canvas.width, (1 - inPoint[1]) * canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(canvas.width, 0);
      ctx.lineTo(outPoint[0] * canvas.width, (1 - outPoint[1]) * canvas.height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw control points
      const drawPoint = (x: number, y: number, isActive: boolean) => {
        ctx.beginPath();
        ctx.arc(
          x * canvas.width,
          (1 - y) * canvas.height,
          isActive ? finalConfig.pointRadius + finalConfig.activePointBonus : finalConfig.pointRadius,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = isActive ? BEZIER.CONFIG.activePointColor : BEZIER.CONFIG.pointColor;
        ctx.fill();
        ctx.stroke();
      };

      drawPoint(inPoint[0], inPoint[1], dragState?.point === 'in');
      drawPoint(outPoint[0], outPoint[1], dragState?.point === 'out');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to draw curve';
      logger.error('Curve drawing error:', error);
      setStatusMessage(errorMessage);
    }
  }, [controlPoints, dragState, finalConfig]);

  // Update curve when control points change
  useEffect(() => {
    drawCurve();
  }, [drawCurve]);

  // Handle mouse events
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error('Canvas not found');
      return;
    }

    try {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / canvas.width;
      const y = 1 - (e.clientY - rect.top) / canvas.height;

      // Check if clicking near control points
      const isNearPoint = (px: number, py: number) => {
        const distance = Math.sqrt(Math.pow(x - px, 2) + Math.pow(y - py, 2));
        return distance < finalConfig.hitTestRadius / canvas.width;
      };

      if (isNearPoint(controlPoints.in[0], controlPoints.in[1])) {
        setDragState({
          point: 'in',
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
          isSnapping: true,
          isFineControl: false
        });
        setStatusMessage('Input control point selected');
      } else if (isNearPoint(controlPoints.out[0], controlPoints.out[1])) {
        setDragState({
          point: 'out',
          startX: x,
          startY: y,
          currentX: x,
          currentY: y,
          isSnapping: true,
          isFineControl: false
        });
        setStatusMessage('Output control point selected');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle mouse down';
      logger.error('Mouse down error:', error);
      setStatusMessage(errorMessage);
    }
  }, [controlPoints, finalConfig]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      logger.error('Canvas not found');
      return;
    }

    try {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / canvas.width;
      const y = 1 - (e.clientY - rect.top) / canvas.height;

      // Update tooltip
      if (dragState) {
        setTooltip({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          text: `x: ${(x * 100).toFixed(1)}%, y: ${(y * 100).toFixed(1)}%`
        });
      } else {
        setTooltip(null);
      }

      if (!dragState) return;

      // Handle fine control
      const useSnapping = !e.getModifierState(MODIFIERS.FINE_CONTROL);

      const newX = Math.max(0, Math.min(1, snapToGrid(x, useSnapping)));
      const newY = Math.max(0, Math.min(1, snapToGrid(y, useSnapping)));

      setControlPoints(prev => ({
        ...prev,
        [dragState.point]: [newX, newY] as [number, number],
      }));

      setDragState(prev => prev ? {
        ...prev,
        currentX: newX,
        currentY: newY,
        isSnapping: !e.getModifierState(MODIFIERS.FINE_CONTROL),
        isFineControl: e.getModifierState(MODIFIERS.FINE_CONTROL)
      } : null);

      setStatusMessage(`${dragState.point} control point at x: ${(newX * 100).toFixed(1)}%, y: ${(newY * 100).toFixed(1)}%`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle mouse move';
      logger.error('Mouse move error:', error);
      setStatusMessage(errorMessage);
    }
  }, [dragState, snapToGrid]);

  const handleMouseUp = useCallback(() => {
    if (!dragState) return;

    try {
      // Update all selected keyframes
      const track = keyframeState.tracks[trackId];
      if (!track) {
        throw new BezierEditorError(`Track not found: ${trackId}`);
      }

      if (selectedKeyframes.length === 0) {
        throw new BezierEditorError('No keyframes selected');
      }

      const operations: BatchKeyframeOperation<number>[] = [{
        trackId,
        operations: selectedKeyframes.map(index => {
          const keyframe = track.keyframes[index];
          if (!keyframe) {
            throw new BezierEditorError(`Keyframe not found at index ${index}`);
          }

          // Ensure value is a number
          const value = typeof keyframe.value === 'string' ? parseFloat(keyframe.value) : keyframe.value;
          if (isNaN(value)) {
            throw new BezierEditorError(`Invalid keyframe value: ${keyframe.value}`);
          }

          const operation: KeyframeOperation<number> = {
            type: 'update',
            time: keyframe.time,
            value,
            interpolation: {
              type: InterpolationType.Bezier,
              controlPoints
            }
          };
          return operation;
        })
      }];

      batchOperations(operations);
      setStatusMessage(`Updated ${selectedKeyframes.length} keyframes`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle mouse up';
      logger.error('Mouse up error:', error);
      setStatusMessage(errorMessage);
    } finally {
      setDragState(null);
      setTooltip(null);
    }
  }, [dragState, keyframeState.tracks, trackId, controlPoints, selectedKeyframes, batchOperations]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!dragState) return;

    try {
      const step = e.getModifierState(MODIFIERS.FINE_CONTROL) ? NORMALIZED_FINE_STEP : NORMALIZED_GRID_SIZE;
      const delta = e.getModifierState(MODIFIERS.LARGE_STEP) ? step * KEYBOARD.SHIFT_MULTIPLIER : step;

      setControlPoints(prev => {
        const point = prev[dragState.point];
        let newX = point[0];
        let newY = point[1];

        switch (e.key) {
          case 'ArrowLeft':
            newX = Math.max(0, point[0] - delta);
            break;
          case 'ArrowRight':
            newX = Math.min(1, point[0] + delta);
            break;
          case 'ArrowUp':
            newY = Math.min(1, point[1] + delta);
            break;
          case 'ArrowDown':
            newY = Math.max(0, point[1] - delta);
            break;
          case 'Escape':
            setDragState(null);
            setTooltip(null);
            setStatusMessage('Editing cancelled');
            return prev;
          default:
            return prev;
        }

        setStatusMessage(`${dragState.point} control point at x: ${(newX * 100).toFixed(1)}%, y: ${(newY * 100).toFixed(1)}%`);

        return {
          ...prev,
          [dragState.point]: [newX, newY] as [number, number]
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to handle key down';
      logger.error('Key down error:', error);
      setStatusMessage(errorMessage);
    }
  }, [dragState]);

  // Add event listeners
  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dragState, handleMouseMove, handleMouseUp, handleKeyDown]);

  return (
    <div 
      className="bezier-curve-editor" 
      role="region" 
      aria-label="Bezier curve editor"
    >
      <div 
        id="bezier-live-region" 
        className="sr-only" 
        aria-live="polite"
        aria-atomic="true"
      >
        {statusMessage}
      </div>
      <canvas
        ref={canvasRef}
        className="curve-canvas"
        width={finalConfig.canvasSize}
        height={finalConfig.canvasSize}
        onMouseDown={handleMouseDown}
        tabIndex={0}
        aria-label="Bezier curve canvas"
        role="application"
        aria-describedby="bezier-live-region"
        aria-grabbed={dragState !== null}
      />
      {tooltip && (
        <div
          className="control-point-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y - finalConfig.tooltipYOffset
          }}
          role="tooltip"
          aria-hidden="true"
        >
          {tooltip.text}
        </div>
      )}
      <div 
        className="bezier-presets" 
        role="toolbar" 
        aria-label="Bezier curve presets"
      >
        {(Object.keys(BEZIER.PRESETS) as BezierPresetKey[]).map(key => (
          <button
            key={key}
            className="preset-button"
            onClick={() => applyPreset(key)}
            aria-label={`Apply ${key.toLowerCase().replace('_', ' ')} preset`}
            aria-pressed={false}
          >
            {key.toLowerCase().replace('_', ' ')}
          </button>
        ))}
      </div>
      <div 
        className="bezier-controls-help" 
        role="complementary" 
        aria-label="Keyboard controls"
      >
        <p>Hold {MODIFIERS.FINE_CONTROL} for fine control</p>
        <p>Hold {MODIFIERS.LARGE_STEP} for larger steps</p>
        <p>Use arrow keys to adjust selected point</p>
        <p>Press Escape to cancel editing</p>
      </div>
    </div>
  );
}
