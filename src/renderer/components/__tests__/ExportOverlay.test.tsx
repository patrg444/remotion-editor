import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExportOverlay } from '../ExportOverlay';

describe('ExportOverlay', () => {
  const defaultProps = {
    isVisible: true,
    isExporting: true,
    progress: 0.5,
    filename: 'test-video.mp4',
    onCancel: jest.fn(),
  };

  it('renders nothing when not visible', () => {
    render(
      <ExportOverlay {...defaultProps} isVisible={false} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when not exporting', () => {
    render(
      <ExportOverlay {...defaultProps} isExporting={false} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when both visible and exporting', () => {
    render(<ExportOverlay {...defaultProps} />);
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Exporting Video')).toBeInTheDocument();
  });

  it('displays filename in export message', () => {
    render(<ExportOverlay {...defaultProps} />);
    
    expect(screen.getByText(`Exporting ${defaultProps.filename}...`)).toBeInTheDocument();
  });

  describe('progress display', () => {
    it('shows correct progress percentage', () => {
      render(<ExportOverlay {...defaultProps} progress={0.75} />);
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('clamps progress values to between 0 and 1', () => {
      const { rerender } = render(
        <ExportOverlay {...defaultProps} progress={1.5} />
      );
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      
      rerender(
        <ExportOverlay {...defaultProps} progress={-0.5} />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('sets correct width style on progress fill', () => {
      render(<ExportOverlay {...defaultProps} progress={0.6} />);
      
      const progressFill = screen.getByRole('progressbar', { name: 'export progress' })
        .querySelector('.progress-fill');
      expect(progressFill).toHaveStyle({ width: '60%' });
    });
  });

  describe('cancel button', () => {
    it('calls onCancel when clicked', () => {
      const onCancel = jest.fn();
      render(<ExportOverlay {...defaultProps} onCancel={onCancel} />);
      
      fireEvent.click(screen.getByRole('button'));
      expect(onCancel).toHaveBeenCalled();
    });

    it('is disabled when progress is 100%', () => {
      render(<ExportOverlay {...defaultProps} progress={1} />);
      
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('changes aria-label based on progress', () => {
      const { rerender } = render(
        <ExportOverlay {...defaultProps} progress={0.5} />
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Cancel export');
      
      rerender(
        <ExportOverlay {...defaultProps} progress={1} />
      );
      
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Export complete');
    });
  });

  describe('accessibility', () => {
    it('uses correct ARIA roles', () => {
      render(<ExportOverlay {...defaultProps} />);
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'export progress');
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-label', 'export progress');
    });

    it('sets correct ARIA attributes on progress bar', () => {
      render(<ExportOverlay {...defaultProps} progress={0.3} />);
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    });

    it('uses aria-live for dynamic content', () => {
      render(<ExportOverlay {...defaultProps} />);
      
      expect(screen.getByText(`Exporting ${defaultProps.filename}...`))
        .toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('50%'))
        .toHaveAttribute('aria-live', 'polite');
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<ExportOverlay {...defaultProps} />);
    
    expect(container.firstChild).toHaveClass('export-overlay');
    expect(container.querySelector('.export-content')).toBeInTheDocument();
    expect(container.querySelector('.export-progress')).toBeInTheDocument();
    expect(container.querySelector('.progress-bar')).toBeInTheDocument();
    expect(container.querySelector('.progress-fill')).toBeInTheDocument();
    expect(container.querySelector('.progress-text')).toBeInTheDocument();
    expect(container.querySelector('.cancel-button')).toBeInTheDocument();
  });
});
