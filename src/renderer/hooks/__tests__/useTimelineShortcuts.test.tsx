import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimelineShortcuts } from '../useTimelineShortcuts';
import { useTimelineContext } from '../useTimelineContext';

describe('useTimelineShortcuts', () => {
  const ShortcutsTestComponent: React.FC = () => {
    const { state, dispatch } = useTimelineContext();
    const [lastAction, setLastAction] = React.useState('');

    const onPlayPause = React.useCallback(() => {
      dispatch({ type: 'SET_IS_PLAYING', payload: !state.isPlaying });
      setLastAction('play/pause');
    }, [dispatch, state.isPlaying]);

    const onStepForward = React.useCallback(() => {
      setLastAction('step-forward');
    }, []);

    const onStepBackward = React.useCallback(() => {
      setLastAction('step-backward');
    }, []);

    const { shortcutGroups } = useTimelineShortcuts(
      onPlayPause,
      onStepForward,
      onStepBackward
    );

    return (
      <div>
        <div data-testid="is-playing">{state.isPlaying.toString()}</div>
        <div data-testid="last-action">{lastAction}</div>
        <div data-testid="shortcut-groups">{JSON.stringify(shortcutGroups)}</div>
      </div>
    );
  };

  it('provides shortcut groups', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ShortcutsTestComponent />
      </TimelineProvider>
    );

    const groups = JSON.parse(getByTestId('shortcut-groups').textContent || '[]');
    expect(groups).toHaveLength(3); // Global, Clip, Timeline groups
    expect(groups[0].name).toBe('Playback');
    expect(groups[1].name).toBe('Clip Operations');
    expect(groups[2].name).toBe('Timeline');
  });

  it('handles playback shortcuts', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <ShortcutsTestComponent />
      </TimelineProvider>
    );

    // Initial state
    expect(getByTestId('is-playing').textContent).toBe('false');

    // Press space
    act(() => {
      fireEvent.keyDown(window, { key: 'Space' });
    });

    // Should toggle play state
    expect(getByTestId('is-playing').textContent).toBe('true');
    expect(getByTestId('last-action').textContent).toBe('play/pause');

    // Press right arrow
    act(() => {
      fireEvent.keyDown(window, { key: 'Right' });
    });

    expect(getByTestId('last-action').textContent).toBe('step-forward');

    // Press left arrow
    act(() => {
      fireEvent.keyDown(window, { key: 'Left' });
    });

    expect(getByTestId('last-action').textContent).toBe('step-backward');
  });

  describe('shortcut context', () => {
    const ContextTestComponent: React.FC = () => {
      const { state, dispatch } = useTimelineContext();
      const [lastAction, setLastAction] = React.useState('');

      const { shortcutGroups } = useTimelineShortcuts(
        () => {},
        () => {},
        () => {}
      );

      // Find delete shortcut
      const deleteShortcut = shortcutGroups
        .find(g => g.name === 'Clip Operations')
        ?.shortcuts.find(s => s.key === 'Delete');

      return (
        <div>
          <div data-testid="is-playing">{state.isPlaying.toString()}</div>
          <div data-testid="has-selection">{(state.selectedClipIds.length > 0).toString()}</div>
          <button
            data-testid="select-clip"
            onClick={() => dispatch({ type: 'SET_SELECTED_CLIP_IDS', payload: ['clip1'] })}
          >
            Select Clip
          </button>
          <button
            data-testid="delete"
            onClick={() => deleteShortcut?.action()}
          >
            Delete
          </button>
        </div>
      );
    };

    it('respects shortcut requirements', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ContextTestComponent />
        </TimelineProvider>
      );

      // Try delete without selection
      act(() => {
        fireEvent.keyDown(window, { key: 'Delete' });
      });

      expect(getByTestId('has-selection').textContent).toBe('false');

      // Select clip and try delete
      act(() => {
        getByTestId('select-clip').click();
      });

      expect(getByTestId('has-selection').textContent).toBe('true');

      act(() => {
        fireEvent.keyDown(window, { key: 'Delete' });
      });

      // Selection should be cleared after delete
      expect(getByTestId('has-selection').textContent).toBe('false');
    });
  });

  describe('modifier keys', () => {
    it('handles ctrl key combinations', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <ShortcutsTestComponent />
        </TimelineProvider>
      );

      // Press Ctrl+A to select all
      act(() => {
        fireEvent.keyDown(window, { key: 'a', ctrlKey: true });
      });

      // Selection state should be updated
      const groups = JSON.parse(getByTestId('shortcut-groups').textContent || '[]');
      const selectAllShortcut = groups
        .find((g: any) => g.name === 'Clip Operations')
        ?.shortcuts.find((s: any) => s.key === 'Ctrl+A');

      expect(selectAllShortcut).toBeDefined();
    });
  });

  describe('shortcut disabling', () => {
    it('disables shortcuts when editing', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const { getByTestId } = render(
        <TimelineProvider>
          <ShortcutsTestComponent />
        </TimelineProvider>
      );

      // Space should not trigger play when editing
      act(() => {
        fireEvent.keyDown(window, { key: 'Space' });
      });

      expect(getByTestId('is-playing').textContent).toBe('false');

      document.body.removeChild(input);
    });

    it('disables shortcuts when modal is open', () => {
      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      document.body.appendChild(modal);

      const { getByTestId } = render(
        <TimelineProvider>
          <ShortcutsTestComponent />
        </TimelineProvider>
      );

      // Space should not trigger play when modal is open
      act(() => {
        fireEvent.keyDown(window, { key: 'Space' });
      });

      expect(getByTestId('is-playing').textContent).toBe('false');

      document.body.removeChild(modal);
    });
  });
});
