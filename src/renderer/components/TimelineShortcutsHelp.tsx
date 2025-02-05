import React from 'react';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { useTimelineShortcuts, ShortcutGroup, Shortcut } from '../hooks/useTimelineShortcuts';

interface TimelineShortcutsHelpProps {
  onClose: () => void;
}

export const TimelineShortcutsHelp: React.FC<TimelineShortcutsHelpProps> = ({
  onClose
}) => {
  const { state } = useTimelineContext();
  const { shortcutGroups } = useTimelineShortcuts(
    () => {},  // Empty handlers since this is just for display
    () => {},
    () => {}
  );

  const getShortcutStatus = (shortcut: Shortcut): string => {
    if (shortcut.disabledWhenPlaying && state.isPlaying) {
      return '(Disabled while playing)';
    }
    if (shortcut.requiresSelection && !state.selectedClipIds.length) {
      return '(Requires clip selection)';
    }
    if (shortcut.disabledWhenEditing) {
      return '(Disabled while editing text)';
    }
    return '';
  };

  return (
    <div className="shortcuts-help-overlay" onClick={onClose}>
      <div className="shortcuts-help-content" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-help-header">
          <h2>Keyboard Shortcuts</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Close shortcuts help"
          >
            ×
          </button>
        </div>
        <div className="shortcuts-help-body">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="shortcut-group">
              <h3>{group.name}</h3>
              <table>
                <tbody>
                  {group.shortcuts.map((shortcut, shortcutIndex) => (
                    <tr key={shortcutIndex}>
                      <td className="shortcut-key">
                        <kbd>{shortcut.key}</kbd>
                      </td>
                      <td className="shortcut-description">
                        {shortcut.description}
                      </td>
                      <td className="shortcut-status">
                        <span className="status-text">
                          {getShortcutStatus(shortcut)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
        <div className="shortcuts-help-footer">
          <p className="note">
            Note: Some shortcuts may be disabled based on the current context 
            (e.g., when playing, editing text, or when no clips are selected).
          </p>
        </div>
      </div>
    </div>
  );
};
