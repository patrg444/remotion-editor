import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivationDialog } from '../ActivationDialog';

describe('ActivationDialog', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onActivate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    render(
      <ActivationDialog {...defaultProps} isOpen={false} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders dialog when open', () => {
    render(<ActivationDialog {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Activate License')).toBeInTheDocument();
  });

  describe('license key input', () => {
    it('updates input value when typing', async () => {
      const user = userEvent.setup();
      render(<ActivationDialog {...defaultProps} />);
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'test-key');
      
      expect(input).toHaveValue('test-key');
    });

    it('disables input during activation', async () => {
      const user = userEvent.setup();
      const activatePromise = new Promise<void>(resolve => setTimeout(resolve, 100));
      render(
        <ActivationDialog 
          {...defaultProps} 
          onActivate={() => activatePromise}
        />
      );
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'test-key');
      await act(async () => {
        fireEvent.click(screen.getByText('Activate'));
      });
      
      expect(input).toBeDisabled();
      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('activation button', () => {
    it('is disabled when license key is empty', () => {
      render(<ActivationDialog {...defaultProps} />);
      
      expect(screen.getByText('Activate')).toBeDisabled();
    });

    it('is disabled when license key contains only whitespace', async () => {
      const user = userEvent.setup();
      render(<ActivationDialog {...defaultProps} />);
      
      const input = screen.getByLabelText('License key');
      await user.type(input, '   ');
      
      expect(screen.getByText('Activate')).toBeDisabled();
    });

    it('is enabled when license key is valid', async () => {
      const user = userEvent.setup();
      render(<ActivationDialog {...defaultProps} />);
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'valid-key');
      
      expect(screen.getByText('Activate')).not.toBeDisabled();
    });

    it('shows loading state during activation', async () => {
      const user = userEvent.setup();
      const activatePromise = new Promise<void>(resolve => setTimeout(resolve, 100));
      render(
        <ActivationDialog 
          {...defaultProps} 
          onActivate={() => activatePromise}
        />
      );
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'test-key');
      await act(async () => {
        fireEvent.click(screen.getByText('Activate'));
      });
      
      expect(screen.getByText('Activating...')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText('Activate')).toBeInTheDocument();
      });
    });

    it('calls onActivate with trimmed license key', async () => {
      const user = userEvent.setup();
      render(<ActivationDialog {...defaultProps} />);
      
      const input = screen.getByLabelText('License key');
      await user.type(input, '  test-key  ');
      await act(async () => {
        fireEvent.click(screen.getByText('Activate'));
      });
      
      expect(defaultProps.onActivate).toHaveBeenCalledWith('test-key');
    });

    it('clears input and closes dialog on successful activation', async () => {
      const user = userEvent.setup();
      render(<ActivationDialog {...defaultProps} />);
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'test-key');
      await act(async () => {
        fireEvent.click(screen.getByText('Activate'));
        // Wait for state updates to complete
        await Promise.resolve();
      });
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('displays error message when provided', () => {
      const error = 'Invalid license key';
      render(<ActivationDialog {...defaultProps} error={error} />);
      
      expect(screen.getByRole('alert')).toHaveTextContent(error);
    });

    it('sets aria-invalid on input when error exists', () => {
      render(<ActivationDialog {...defaultProps} error="Invalid key" />);
      
      expect(screen.getByLabelText('License key')).toHaveAttribute('aria-invalid', 'true');
    });

    it('associates error message with input via aria-describedby', () => {
      render(<ActivationDialog {...defaultProps} error="Invalid key" />);
      
      const input = screen.getByLabelText('License key');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('cancel button', () => {
    it('calls onClose when clicked', () => {
      render(<ActivationDialog {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Cancel'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('is disabled during activation', async () => {
      const user = userEvent.setup();
      const activatePromise = new Promise<void>(resolve => setTimeout(resolve, 100));
      render(
        <ActivationDialog 
          {...defaultProps} 
          onActivate={() => activatePromise}
        />
      );
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'test-key');
      await act(async () => {
        fireEvent.click(screen.getByText('Activate'));
      });
      
      expect(screen.getByText('Cancel')).toBeDisabled();
      await waitFor(() => {
        expect(screen.getByText('Cancel')).not.toBeDisabled();
      });
    });
  });

  describe('accessibility', () => {
    it('uses correct ARIA attributes on dialog', () => {
      render(<ActivationDialog {...defaultProps} />);
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has proper heading structure', () => {
      render(<ActivationDialog {...defaultProps} />);
      
      const heading = screen.getByText('Activate License');
      expect(heading.tagName).toBe('H2');
      expect(heading.id).toBe('dialog-title');
    });

    it('updates button aria-label based on activation state', async () => {
      const user = userEvent.setup();
      const activatePromise = new Promise<void>(resolve => setTimeout(resolve, 100));
      render(
        <ActivationDialog 
          {...defaultProps} 
          onActivate={() => activatePromise}
        />
      );
      
      const input = screen.getByLabelText('License key');
      await user.type(input, 'test-key');
      
      const button = screen.getByText('Activate');
      expect(button).toHaveAttribute('aria-label', 'Activate license');
      
      await act(async () => {
        fireEvent.click(button);
      });
      expect(screen.getByText('Activating...')).toHaveAttribute('aria-label', 'Activating license');
      
      await waitFor(() => {
        expect(screen.getByText('Activate')).toHaveAttribute('aria-label', 'Activate license');
      });
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ActivationDialog {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('activation-dialog-overlay');
    expect(container.querySelector('.activation-dialog')).toBeInTheDocument();
    expect(container.querySelector('.license-input')).toBeInTheDocument();
    expect(container.querySelector('.dialog-buttons')).toBeInTheDocument();
    expect(container.querySelector('.primary-button')).toBeInTheDocument();
    expect(container.querySelector('.secondary-button')).toBeInTheDocument();
  });
});
