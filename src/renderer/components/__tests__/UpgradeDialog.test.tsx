import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpgradeDialog } from '../UpgradeDialog';

describe('UpgradeDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onUpgrade: jest.fn(),
    features: ['4K Export', 'Advanced Effects', 'Cloud Storage'],
  };

  it('renders nothing when not open', () => {
    render(
      <UpgradeDialog {...defaultProps} isOpen={false} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(<UpgradeDialog {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
  });

  describe('feature list', () => {
    it('renders all provided features', () => {
      render(<UpgradeDialog {...defaultProps} />);
      
      const list = screen.getByLabelText('Pro features');
      defaultProps.features.forEach(feature => {
        expect(list).toHaveTextContent(feature);
      });
    });

    it('renders checkmark for each feature', () => {
      const { container } = render(<UpgradeDialog {...defaultProps} />);
      
      const checkmarks = container.querySelectorAll('.feature-check');
      expect(checkmarks).toHaveLength(defaultProps.features.length);
      checkmarks.forEach(checkmark => {
        expect(checkmark).toHaveTextContent('✓');
        expect(checkmark).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('applies correct CSS classes to feature items', () => {
      const { container } = render(<UpgradeDialog {...defaultProps} />);
      
      const items = container.querySelectorAll('.feature-item');
      expect(items).toHaveLength(defaultProps.features.length);
    });
  });

  describe('buttons', () => {
    it('calls onClose when "Maybe Later" is clicked', () => {
      const onClose = jest.fn();
      render(
        <UpgradeDialog {...defaultProps} onClose={onClose} />
      );
      
      fireEvent.click(screen.getByText('Maybe Later'));
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onUpgrade when "Upgrade Now" is clicked', () => {
      const onUpgrade = jest.fn();
      render(
        <UpgradeDialog {...defaultProps} onUpgrade={onUpgrade} />
      );
      
      fireEvent.click(screen.getByText('Upgrade Now'));
      expect(onUpgrade).toHaveBeenCalled();
    });

    it('applies correct CSS classes to buttons', () => {
      render(<UpgradeDialog {...defaultProps} />);
      
      expect(screen.getByText('Maybe Later')).toHaveClass('secondary-button');
      expect(screen.getByText('Upgrade Now')).toHaveClass('primary-button');
    });

    it('has correct ARIA labels on buttons', () => {
      render(<UpgradeDialog {...defaultProps} />);
      
      expect(screen.getByLabelText('Close upgrade dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Upgrade to pro version')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('uses correct ARIA attributes on dialog', () => {
      render(<UpgradeDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper heading structure', () => {
      render(<UpgradeDialog {...defaultProps} />);
      
      const heading = screen.getByText('Upgrade to Pro');
      expect(heading.tagName).toBe('H2');
      expect(heading.id).toBe('dialog-title');
    });

    it('labels feature list for screen readers', () => {
      render(<UpgradeDialog {...defaultProps} />);
      
      expect(screen.getByLabelText('Pro features')).toBeInTheDocument();
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<UpgradeDialog {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('upgrade-dialog-overlay');
    expect(container.querySelector('.upgrade-dialog')).toBeInTheDocument();
    expect(container.querySelector('.feature-list')).toBeInTheDocument();
    expect(container.querySelector('.dialog-buttons')).toBeInTheDocument();
  });
});
