import React, { useEffect, useRef } from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import { ActionTypes } from '../types/timeline';
import '../styles/selection-box.css';

export const SelectionBox: React.FC = () => {
  const { state, dispatch } = useTimelineContext();
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!state.isDragging || !state.dragStartX || !state.dragStartY) return;

      const box = boxRef.current;
      if (!box) return;

      const left = Math.min(state.dragStartX, e.clientX);
      const top = Math.min(state.dragStartY, e.clientY);
      const width = Math.abs(e.clientX - state.dragStartX);
      const height = Math.abs(e.clientY - state.dragStartY);

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
      box.style.display = 'block';
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!state.isDragging) return;

      const box = boxRef.current;
      if (!box) return;

      // Get all clips and captions that intersect with the selection box
      const boxRect = box.getBoundingClientRect();
      const clips = document.querySelectorAll('.clip-item');
      const captions = document.querySelectorAll('.caption-item');

      const selectedClipIds: string[] = [];
      const selectedCaptionIds: string[] = [];

      clips.forEach(clip => {
        const rect = clip.getBoundingClientRect();
        if (intersects(boxRect, rect)) {
          const clipId = clip.getAttribute('data-clip-id');
          if (clipId) selectedClipIds.push(clipId);
        }
      });

      captions.forEach(caption => {
        const rect = caption.getBoundingClientRect();
        if (intersects(boxRect, rect)) {
          const captionId = caption.getAttribute('data-caption-id');
          if (captionId) selectedCaptionIds.push(captionId);
        }
      });

      // Update selections
      if (selectedClipIds.length > 0) {
        dispatch({
          type: ActionTypes.SELECT_CLIPS,
          payload: { clipIds: selectedClipIds }
        });
      }

      if (selectedCaptionIds.length > 0) {
        dispatch({
          type: ActionTypes.SELECT_CAPTIONS,
          payload: { captionIds: selectedCaptionIds }
        });
      }

      // Reset drag state
      dispatch({
        type: ActionTypes.SET_DRAGGING,
        payload: { isDragging: false }
      });

      box.style.display = 'none';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [state.isDragging, state.dragStartX, state.dragStartY, dispatch]);

  return (
    <div
      ref={boxRef}
      className="selection-box"
      style={{ display: 'none' }}
    />
  );
};

function intersects(rect1: DOMRect, rect2: DOMRect): boolean {
  return !(rect2.left > rect1.right || 
           rect2.right < rect1.left || 
           rect2.top > rect1.bottom ||
           rect2.bottom < rect1.top);
}
