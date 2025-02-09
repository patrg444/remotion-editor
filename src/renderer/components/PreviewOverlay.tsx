import React, { useRef, useEffect, useState, useCallback } from 'react';
import '../styles/preview-overlay.css';
import { ProductionClip, VideoClip, CaptionClip } from '../types/timeline';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { createUpdateClipTransformAction } from '../types/timeline';

interface PreviewOverlayProps {
  selectedClip: ProductionClip | undefined;
  previewWidth: number;
  previewHeight: number;
}

type DragMode = 'move' | 'resize' | 'rotate' | null;

interface DragState {
  mode: DragMode;
  startX: number;
  startY: number;
  startRotation?: number;
  startScale?: number;
  resizeHandle?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  initialTransform: Required<VideoClip['transform']>;
}

const hasTransform = (clip: ProductionClip): clip is VideoClip => {
  return clip.type === 'video' && clip.transform !== undefined;
};

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
  selectedClip,
  previewWidth,
  previewHeight,
}) => {
  const { state, dispatch } = useTimelineContext();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [overlayClass, setOverlayClass] = useState('preview-overlay');

  // Default transform values if none exist
  const defaultTransform: Required<VideoClip['transform']> = {
    scale: 1,
    rotation: 0,
    position: { x: previewWidth / 2, y: previewHeight / 2 },
    opacity: 1
  };

  if (!selectedClip || !hasTransform(selectedClip)) return null;

  const transform = selectedClip.transform || defaultTransform;

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState?.mode || !selectedClip || !dragState.initialTransform) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const deltaX = e.clientX - dragState.startX;
    const deltaY = e.clientY - dragState.startY;

    const newTransform: Required<VideoClip['transform']> = {
      ...dragState.initialTransform,
      scale: dragState.initialTransform.scale,
      rotation: dragState.initialTransform.rotation,
      position: { ...dragState.initialTransform.position },
      opacity: dragState.initialTransform.opacity
    };

    switch (dragState.mode) {
      case 'move':
        newTransform.position = {
          x: dragState.initialTransform.position.x + deltaX,
          y: dragState.initialTransform.position.y + deltaY,
        };
        break;

      case 'rotate':
        if (dragState.startRotation !== undefined) {
          const center = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
          const startAngle = Math.atan2(
            dragState.startY - center.y,
            dragState.startX - center.x
          );
          const currentAngle = Math.atan2(
            e.clientY - center.y,
            e.clientX - center.x
          );
          const deltaAngle = (currentAngle - startAngle) * (180 / Math.PI);
          newTransform.rotation = dragState.startRotation + deltaAngle;
        }
        break;

      case 'resize':
        if (dragState.startScale !== undefined && dragState.resizeHandle) {
          const scale = dragState.startScale * (1 + deltaX / rect.width);
          newTransform.scale = Math.max(0.1, scale);
        }
        break;
    }

    // Find the track containing this clip
    const track = state.tracks.find(track => 
      track.clips.some(clip => clip.id === selectedClip.id)
    );
    if (!track) return;
    dispatch(createUpdateClipTransformAction(track.id, selectedClip.id, newTransform));
  }, [dragState, selectedClip, dispatch]);

  const handleMouseUp = useCallback(() => {
    setDragState(null);
    setOverlayClass('preview-overlay');
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent, mode: DragMode = 'move', handle?: string) => {
    if (!selectedClip || !transform) return;

    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;

    const startRotation = mode === 'rotate' ? transform.rotation : undefined;
    const startScale = mode === 'resize' ? transform.scale : undefined;

    setDragState({
      mode,
      startX,
      startY,
      startRotation,
      startScale,
      resizeHandle: handle as DragState['resizeHandle'],
      initialTransform: {
        ...transform,
        scale: transform.scale ?? 1,
        rotation: transform.rotation ?? 0,
        position: transform.position ?? { x: previewWidth / 2, y: previewHeight / 2 },
        opacity: transform.opacity ?? 1
      }
    });

    setOverlayClass(`preview-overlay ${mode === 'resize' ? 'resizing' : mode === 'rotate' ? 'rotating' : ''}`);
  }, [selectedClip, transform, previewWidth, previewHeight]);

  useEffect(() => {
    if (dragState?.mode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  const { position, scale, rotation, opacity } = transform;

  const style: React.CSSProperties = {
    position: 'absolute',
    left: position.x,
    top: position.y,
    transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
    border: '2px solid #00a0ff',
    borderRadius: '4px',
    cursor: 'move',
    width: '100px', // Default size, should be based on clip content
    height: '100px',
    opacity
  };

  return (
    <div
      ref={overlayRef}
      className={overlayClass}
      style={style}
      role="presentation"
      onMouseDown={(e) => handleMouseDown(e, 'move')}
    >
      {/* Resize handles */}
      <button 
        type="button"
        className="resize-handle top-left"
        aria-label="Resize from top-left"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'resize', 'top-left');
        }}
      ></button>
      <button 
        type="button"
        className="resize-handle top-right"
        aria-label="Resize from top-right"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'resize', 'top-right');
        }}
      ></button>
      <button 
        type="button"
        className="resize-handle bottom-left"
        aria-label="Resize from bottom-left"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'resize', 'bottom-left');
        }}
      ></button>
      <button 
        type="button"
        className="resize-handle bottom-right"
        aria-label="Resize from bottom-right"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'resize', 'bottom-right');
        }}
      ></button>
      
      {/* Rotation handle */}
      <button 
        type="button"
        className="rotation-handle"
        aria-label="Rotate clip"
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, 'rotate');
        }}
      ></button>
    </div>
  );
};
