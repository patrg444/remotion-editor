import { useCallback, useEffect } from 'react';
import { useTimelineContext } from './useTimelineContext';
import { ActionTypes } from '../types/timeline';
import { logger } from '../utils/logger';

interface ShortcutContext {
  isPlaying: boolean;
  hasSelectedClips: boolean;
  isEditing: boolean;
  isModalOpen: boolean;
}

export interface ShortcutGroup {
  name: string;
  shortcuts: Shortcut[];
}

export interface Shortcut {
  key: string;
  description: string;
  action: () => void;
  requiresSelection?: boolean;
  disabledWhenPlaying?: boolean;
  disabledWhenEditing?: boolean;
}

export const useTimelineShortcuts = (
  onPlayPause: () => void,
  onStepForward: () => void,
  onStepBackward: () => void
) => {
  const { state, dispatch } = useTimelineContext();

  const getContext = useCallback((): ShortcutContext => ({
    isPlaying: state.isPlaying,
    hasSelectedClips: state.selectedClipIds.length > 0,
    isEditing: document.activeElement instanceof HTMLInputElement || 
               document.activeElement instanceof HTMLTextAreaElement,
    isModalOpen: document.querySelector('[role="dialog"]') !== null
  }), [state.isPlaying, state.selectedClipIds]);

  const isShortcutEnabled = useCallback((shortcut: Shortcut, context: ShortcutContext): boolean => {
    if (context.isModalOpen) return false;
    if (context.isEditing && shortcut.disabledWhenEditing) return false;
    if (context.isPlaying && shortcut.disabledWhenPlaying) return false;
    if (shortcut.requiresSelection && !context.hasSelectedClips) return false;
    return true;
  }, []);

  // Global shortcuts (always available unless editing/modal)
  const globalShortcuts: ShortcutGroup = {
    name: 'Playback',
    shortcuts: [
      {
        key: 'Space',
        description: 'Play/Pause',
        action: onPlayPause,
        disabledWhenEditing: true
      },
      {
        key: 'Right',
        description: 'Step Forward',
        action: onStepForward,
        disabledWhenPlaying: true
      },
      {
        key: 'Left',
        description: 'Step Backward',
        action: onStepBackward,
        disabledWhenPlaying: true
      },
      {
        key: 'Home',
        description: 'Jump to Start',
        action: () => dispatch({
          type: ActionTypes.SET_CURRENT_TIME,
          payload: 0
        }),
        disabledWhenPlaying: true
      },
      {
        key: 'End',
        description: 'Jump to End',
        action: () => dispatch({
          type: ActionTypes.SET_CURRENT_TIME,
          payload: state.duration
        }),
        disabledWhenPlaying: true
      }
    ]
  };

  // Clip shortcuts (require clip selection)
  const clipShortcuts: ShortcutGroup = {
    name: 'Clip Operations',
    shortcuts: [
      {
        key: 'Delete',
        description: 'Delete Selected Clips',
        action: () => {
          const clipsToRemove = state.selectedClipIds.map((clipId: string) => {
            const track = state.tracks.find((t: { clips: { id: string }[] }) => 
              t.clips.some((c: { id: string }) => c.id === clipId)
            );
            return track ? { trackId: track.id, clipId } : null;
          }).filter((item: { trackId: string; clipId: string } | null): item is { trackId: string; clipId: string } => item !== null);

          clipsToRemove.forEach(({ trackId, clipId }: { trackId: string; clipId: string }) => {
            dispatch({
              type: ActionTypes.REMOVE_CLIP,
              payload: { trackId, clipId }
            });
          });
          logger.debug('Deleted clips:', state.selectedClipIds);
        },
        requiresSelection: true,
        disabledWhenPlaying: true
      },
      {
        key: 'Ctrl+A',
        description: 'Select All Clips',
        action: () => {
          const allClipIds = state.tracks.flatMap((t: { clips: { id: string }[] }) => t.clips.map((c: { id: string }) => c.id));
          dispatch({
            type: ActionTypes.SELECT_CLIPS,
            payload: { clipIds: allClipIds }
          });
          logger.debug('Selected all clips');
        }
      },
      {
        key: 'Ctrl+D',
        description: 'Deselect All',
        action: () => {
          dispatch({
            type: ActionTypes.SELECT_CLIPS,
            payload: { clipIds: [] }
          });
          logger.debug('Deselected all clips');
        },
        requiresSelection: true
      }
    ]
  };

  // Timeline shortcuts
  const timelineShortcuts: ShortcutGroup = {
    name: 'Timeline',
    shortcuts: [
      {
        key: '+',
        description: 'Zoom In',
        action: () => {
          const newZoom = Math.min(state.zoom * 1.2, 10);
          dispatch({
            type: ActionTypes.SET_ZOOM,
            payload: newZoom
          });
          logger.debug('Zoom in:', newZoom);
        }
      },
      {
        key: '-',
        description: 'Zoom Out',
        action: () => {
          const newZoom = Math.max(state.zoom / 1.2, 0.1);
          dispatch({
            type: ActionTypes.SET_ZOOM,
            payload: newZoom
          });
          logger.debug('Zoom out:', newZoom);
        }
      }
    ]
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const context = getContext();

    // Handle other shortcuts
    const allShortcuts = [
      ...globalShortcuts.shortcuts,
      ...clipShortcuts.shortcuts,
      ...timelineShortcuts.shortcuts
    ];

    for (const shortcut of allShortcuts) {
      const key = shortcut.key.toLowerCase();
      const pressedKey = e.key.toLowerCase();
      const ctrlKey = key.startsWith('ctrl+') === e.ctrlKey;
      const matchesKey = ctrlKey ? 
        key.endsWith(pressedKey) : 
        key === pressedKey;

      if (matchesKey && isShortcutEnabled(shortcut, context)) {
        e.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [getContext, isShortcutEnabled, globalShortcuts, clipShortcuts, timelineShortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcutGroups: [globalShortcuts, clipShortcuts, timelineShortcuts]
  };
};
