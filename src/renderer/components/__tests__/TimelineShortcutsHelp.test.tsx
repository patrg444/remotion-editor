import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineShortcutsHelp } from '../TimelineShortcutsHelp';

describe('TimelineShortcutsHelp', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders nothing when isVisible is false', () => {
    render(<TimelineShortcutsHelp isVisible={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Keyboard Shortcuts')).not.toBeInTheDocument();
  });

  it('renders shortcuts when isVisible is true', () => {
    render(<TimelineShortcutsHelp isVisible={true} onClose={mockOnClose} />);
    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TimelineShortcutsHelp isVisible={true} onClose={mockOnClose} />);
    fireEvent.click(screen.getByText('Close'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders all keyboard shortcuts with correct formatting', () => {
    render(<TimelineShortcutsHelp isVisible={true} onClose={mockOnClose} />);

    // Test a few key shortcuts
    const expectedShortcuts = [
      { key: 'Space', description: 'Play/Pause' },
      { key: 'Left Arrow', description: 'Previous Frame' },
      { key: 'Cmd/Ctrl + Z', description: 'Undo' },
      { key: 'M', description: 'Add Marker' }
    ];

    expectedShortcuts.forEach(shortcut => {
      const keyElement = screen.getByText(shortcut.key);
      expect(keyElement.tagName).toBe('KBD');
      expect(screen.getByText(shortcut.description)).toBeInTheDocument();
    });
  });

  it('renders shortcuts in a list format', () => {
    render(<TimelineShortcutsHelp isVisible={true} onClose={mockOnClose} />);
    const shortcutsList = screen.getByRole('heading', { name: 'Keyboard Shortcuts' })
      .parentElement?.querySelector('.shortcuts-list');
    expect(shortcutsList).toBeInTheDocument();
    expect(shortcutsList?.children.length).toBe(16); // Total number of shortcuts
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<TimelineShortcutsHelp isVisible={true} onClose={mockOnClose} />);
    expect(container.firstChild).toHaveClass('timeline-shortcuts-help');
    expect(container.querySelector('.shortcuts-content')).toBeInTheDocument();
    expect(container.querySelector('.shortcuts-list')).toBeInTheDocument();
    expect(container.querySelector('.shortcut-item')).toBeInTheDocument();
    expect(container.querySelector('.close-button')).toBeInTheDocument();
  });
});
