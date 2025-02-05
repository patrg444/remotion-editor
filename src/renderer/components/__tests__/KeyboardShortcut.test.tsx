import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import KeyboardShortcut from '../KeyboardShortcut';

describe('KeyboardShortcut', () => {
  const defaultProps = {
    shortcut: 'Ctrl+S',
    description: 'Save project',
  };

  describe('rendering', () => {
    it('renders shortcut and description', () => {
      render(<KeyboardShortcut {...defaultProps} />);
      expect(screen.getByText('Ctrl+S')).toBeInTheDocument();
      expect(screen.getByText('Save project')).toBeInTheDocument();
    });

    it('wraps shortcut in kbd element', () => {
      render(<KeyboardShortcut {...defaultProps} />);
      const kbdElement = screen.getByText('Ctrl+S');
      expect(kbdElement.tagName).toBe('KBD');
    });

    it('wraps description in span element', () => {
      render(<KeyboardShortcut {...defaultProps} />);
      const spanElement = screen.getByText('Save project');
      expect(spanElement.tagName).toBe('SPAN');
    });
  });

  describe('styling', () => {
    it('applies keyboard-shortcut class to container', () => {
      const { container } = render(<KeyboardShortcut {...defaultProps} />);
      expect(container.firstChild).toHaveClass('keyboard-shortcut');
    });
  });

  describe('content handling', () => {
    it('handles multi-key shortcuts', () => {
      render(
        <KeyboardShortcut
          shortcut="Ctrl+Shift+A"
          description="Select all items"
        />
      );
      expect(screen.getByText('Ctrl+Shift+A')).toBeInTheDocument();
    });

    it('handles long descriptions', () => {
      const longDescription = 'This is a very long description that explains what this keyboard shortcut does in detail';
      render(
        <KeyboardShortcut
          shortcut="Ctrl+L"
          description={longDescription}
        />
      );
      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });

    it('handles special characters in shortcuts', () => {
      render(
        <KeyboardShortcut
          shortcut="Alt+→"
          description="Move right"
        />
      );
      expect(screen.getByText('Alt+→')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('preserves whitespace in shortcuts', () => {
      render(
        <KeyboardShortcut
          shortcut="Cmd + Space"
          description="Open spotlight"
        />
      );
      expect(screen.getByText('Cmd + Space')).toBeInTheDocument();
    });

    it('handles function keys', () => {
      render(
        <KeyboardShortcut
          shortcut="F11"
          description="Toggle fullscreen"
        />
      );
      expect(screen.getByText('F11')).toBeInTheDocument();
    });

    it('handles modifier key combinations', () => {
      render(
        <KeyboardShortcut
          shortcut="Ctrl+Alt+Del"
          description="Task manager"
        />
      );
      expect(screen.getByText('Ctrl+Alt+Del')).toBeInTheDocument();
    });
  });
});
