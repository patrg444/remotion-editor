import React, { useEffect, useRef } from 'react';
import { Transition, TransitionPreviewData } from '../types/transition';
import { useTransition } from '../hooks/useTransition';

interface TransitionPreviewProps {
  transition: Transition;
  width: number;
  height: number;
  clipAUrl?: string;
  clipBUrl?: string;
  currentTime?: number;
  onProgress?: (progress: number) => void;
  onFrameRendered?: (frameData: ImageData) => void;
}

export function TransitionPreview({
  transition,
  width,
  height,
  clipAUrl,
  clipBUrl,
  currentTime,
  onProgress,
  onFrameRendered,
}: TransitionPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    previewData,
    isRendering,
    renderProgress,
    error,
    generatePreview,
  } = useTransition({
    ...transition,
    clipAId: transition.clipAId || '',
    clipBId: transition.clipBId || '',
    startTime: currentTime || 0,
    progress: transition.progress || 0,
    isActive: true,
  });

  useEffect(() => {
    if (!canvasRef.current || !previewData) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Draw the preview
    if (previewData.fromFrame) {
      const fromImageData = new ImageData(
        previewData.fromFrame.data,
        previewData.fromFrame.width,
        previewData.fromFrame.height,
        { colorSpace: previewData.fromFrame.colorSpace || 'srgb' }
      );
      ctx.putImageData(fromImageData, 0, 0);
      onFrameRendered?.(fromImageData);
    }

    if (previewData.toFrame) {
      const toImageData = new ImageData(
        previewData.toFrame.data,
        previewData.toFrame.width,
        previewData.toFrame.height,
        { colorSpace: previewData.toFrame.colorSpace || 'srgb' }
      );
      ctx.putImageData(toImageData, 0, 0);
      onFrameRendered?.(toImageData);
    }

    onProgress?.(previewData.progress);
  }, [previewData, onProgress, onFrameRendered]);

  useEffect(() => {
    generatePreview(transition.progress || 0);
  }, [transition.progress, generatePreview]);

  if (error) {
    return <div className="transition-preview-error">{error.message}</div>;
  }

  return (
    <div className="transition-preview">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={isRendering ? 'rendering' : ''}
      />
      {isRendering && (
        <div className="transition-preview-progress">
          {Math.round(renderProgress * 100)}%
        </div>
      )}
    </div>
  );
}
