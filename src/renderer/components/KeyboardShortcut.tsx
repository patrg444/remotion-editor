import React from 'react';

interface KeyboardShortcutProps {
  shortcut: string;
  description: string;
}

export default function KeyboardShortcut({ shortcut, description }: KeyboardShortcutProps) {
  return (
    <div className="keyboard-shortcut">
      <kbd>{shortcut}</kbd>
      <span>{description}</span>
    </div>
  );
}
