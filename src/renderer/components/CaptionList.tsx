import React, { useState, useRef, useEffect } from 'react';
import { useTimelineContext } from '../contexts/TimelineContext';
import { Caption, CaptionClip, ActionTypes } from '../types/timeline';
import { useCaptionSync } from '../hooks/useCaptionSync';
import '../styles/caption-list.css';

interface CaptionListProps {
  clip: CaptionClip;
  onCaptionSelect?: (caption: Caption) => void;
  onCaptionUpdate?: (updatedClip: CaptionClip) => void;
}

const defaultSpeakerColors = [
  '#4CAF50', // Green
  '#2196F3', // Blue
  '#F44336', // Red
  '#9C27B0', // Purple
  '#FF9800', // Orange
];

export const CaptionList: React.FC<CaptionListProps> = ({
  clip,
  onCaptionSelect,
  onCaptionUpdate,
}) => {
  const { state, dispatch } = useTimelineContext();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const { inspectorRef, handleCaptionSelect, selectedCaptionId } = useCaptionSync({
    clip,
    onCaptionSelect: (caption) => {
      if (caption && onCaptionSelect) {
        onCaptionSelect(caption);
        dispatch({
          type: ActionTypes.SET_CURRENT_TIME,
          payload: { time: caption.startTime ?? caption.start },
        });
      }
    },
  });

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const handleDoubleClick = (caption: Caption) => {
    setEditingId(caption.id);
    setEditText(caption.text);
  };

  const handleEditSubmit = (caption: Caption) => {
    if (editText !== caption.text && clip.captions) {
      const updatedCaption = { ...caption, text: editText };
      const updatedClip = {
        ...clip,
        captions: clip.captions.map((c) =>
          c.id === caption.id ? updatedCaption : c
        ),
      };
      onCaptionUpdate?.(updatedClip);
      dispatch({
        type: ActionTypes.UPDATE_CLIP,
        payload: { clip: updatedClip },
      });
    }
    setEditingId(null);
  };

  const handleDelete = (caption: Caption) => {
    if (!clip.captions) return;
    const updatedClip = {
      ...clip,
      captions: clip.captions.filter(c => c.id !== caption.id)
    };
    onCaptionUpdate?.(updatedClip);
    dispatch({
      type: ActionTypes.UPDATE_CLIP,
      payload: { clip: updatedClip }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, caption: Caption) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSubmit(caption);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (!editingId && caption.id === selectedCaptionId) {
        e.preventDefault();
        handleDelete(caption);
      }
    }
  };

  const getSpeakerColor = (speakerId: string | undefined) => {
    if (!speakerId || !clip.captions) return undefined;
    
    const speakerStyle = clip.speakerStyles?.speakers?.[speakerId];
    if (speakerStyle?.color) return speakerStyle.color;

    // If no style defined, assign a default color
    const speakers = Array.from(new Set(clip.captions.map(c => c.speakerId).filter(Boolean)));
    const speakerIndex = speakers.indexOf(speakerId);
    return defaultSpeakerColors[speakerIndex % defaultSpeakerColors.length];
  };

  const isCaptionActive = (caption: Caption) => {
    const startTime = caption.startTime ?? caption.start;
    const endTime = caption.endTime ?? caption.end;
    return state.currentTime >= startTime && state.currentTime < endTime;
  };

  if (!clip.captions) {
    return null;
  }

  const sortedCaptions = [...clip.captions].sort((a, b) => 
    (a.startTime ?? a.start) - (b.startTime ?? b.start)
  );
  const uniqueSpeakers = Array.from(new Set(sortedCaptions.map(c => c.speakerId).filter(Boolean)));

  return (
    <div 
      className="caption-list" 
      ref={inspectorRef}
      data-testid="caption-list"
      onKeyDown={(e) => {
        if (!clip.captions) return;
        const selectedCaption = clip.captions.find(c => c.id === selectedCaptionId);
        if (selectedCaption) {
          handleKeyDown(e, selectedCaption);
        }
      }}
      tabIndex={0}
    >
      {uniqueSpeakers.length > 0 && (
        <div className="speaker-legend">
          {uniqueSpeakers.map(speakerId => (
            <div key={speakerId} className="speaker-item" style={{ color: getSpeakerColor(speakerId) }}>
              {speakerId}
            </div>
          ))}
        </div>
      )}
      {sortedCaptions.map((caption) => {
        const active = isCaptionActive(caption);
        const captionColor = caption.speakerId ? getSpeakerColor(caption.speakerId) : 
                           (active ? 'rgb(255 255 255)' : 'rgb(204 204 204)');
        return (
          <div
            key={caption.id}
            className={`caption-item ${caption.id === selectedCaptionId ? 'selected' : ''} ${
              active ? 'active' : ''
            }`}
            style={{
              fontWeight: active ? 'bold' : 'normal',
              fontSize: active ? '18px' : '16px',
              color: captionColor
            }}
            data-caption-id={caption.id}
            onClick={() => handleCaptionSelect(caption)}
            onDoubleClick={() => handleDoubleClick(caption)}
          >
            <div className="caption-time">
              <input
                type="number"
                step="0.1"
                value={caption.startTime ?? caption.start}
                aria-label={`Start time for caption ${caption.id}`}
                onChange={(e) => {
                  const updatedCaption = { ...caption, startTime: parseFloat(e.target.value) };
                  const updatedClip = {
                    ...clip,
                    captions: clip.captions?.map((c) =>
                      c.id === caption.id ? updatedCaption : c
                    ),
                  };
                  onCaptionUpdate?.(updatedClip);
                  dispatch({
                    type: ActionTypes.UPDATE_CLIP,
                    payload: { clip: updatedClip },
                  });
                }}
              /> s - {(caption.endTime ?? caption.end).toFixed(1)}s
            </div>
            <div className="caption-text-container">
              {editingId === caption.id ? (
                <textarea
                  ref={editInputRef}
                  className="caption-edit"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => handleEditSubmit(caption)}
                  onKeyDown={(e) => handleKeyDown(e, caption)}
                  rows={3}
                />
              ) : (
                <>
                  <div className="caption-text">
                    {caption.speakerId && <span className="speaker-label">{caption.speakerId}: </span>}
                    {caption.text}
                  </div>
                  <div className="caption-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClick(caption);
                      }}
                      aria-label={`Edit caption ${caption.id}`}
                    >
                      Edit
                    </button>
                    {caption.id === selectedCaptionId && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newCaption: Caption = {
                              id: `caption-${Date.now()}`,
                              text: '',
                              start: (caption.endTime ?? caption.end),
                              end: (caption.endTime ?? caption.end) + 0.25,
                              speakerId: caption.speakerId // Inherit speaker from previous caption
                            };
                            const updatedClip = {
                              ...clip,
                              captions: [...(clip.captions ?? []), newCaption]
                            };
                            onCaptionUpdate?.(updatedClip);
                            dispatch({
                              type: ActionTypes.UPDATE_CLIP,
                              payload: { clip: updatedClip }
                            });
                            setEditingId(newCaption.id);
                            setEditText('');
                          }}
                          aria-label={`Add caption after ${caption.id}`}
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(caption);
                          }}
                          aria-label={`Delete caption ${caption.id}`}
                        >
                          -
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            {caption.conf !== undefined && (
              <div className="caption-confidence">
                Confidence: {(caption.conf * 100).toFixed(0)}%
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
