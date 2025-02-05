import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from '../LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders nothing when not visible', () => {
    render(
      <LoadingOverlay isVisible={false} isLoading={true} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders nothing when not loading', () => {
    render(
      <LoadingOverlay isVisible={true} isLoading={false} />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders when both visible and loading', () => {
    render(
      <LoadingOverlay isVisible={true} isLoading={true} />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays default loading message when no message provided', () => {
    render(
      <LoadingOverlay isVisible={true} isLoading={true} />
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays custom message when provided', () => {
    const customMessage = 'Processing video...';
    render(
      <LoadingOverlay isVisible={true} isLoading={true} message={customMessage} />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  describe('progress bar', () => {
    it('does not render progress bar when progress is undefined', () => {
      render(
        <LoadingOverlay isVisible={true} isLoading={true} />
      );
      
      expect(screen.queryByRole('progressbar', { name: 'progress' })).not.toBeInTheDocument();
    });

    it('renders progress bar with correct percentage', () => {
      render(
        <LoadingOverlay isVisible={true} isLoading={true} progress={0.75} />
      );
      
      const progressBar = screen.getByRole('progressbar', { name: 'progress' });
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('clamps progress values to between 0 and 1', () => {
      const { rerender } = render(
        <LoadingOverlay isVisible={true} isLoading={true} progress={1.5} />
      );
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      
      rerender(
        <LoadingOverlay isVisible={true} isLoading={true} progress={-0.5} />
      );
      
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('sets correct width style on progress fill', () => {
      render(
        <LoadingOverlay isVisible={true} isLoading={true} progress={0.6} />
      );
      
      const progressFill = screen.getByRole('progressbar', { name: 'progress' })
        .querySelector('.progress-fill');
      expect(progressFill).toHaveStyle({ width: '60%' });
    });
  });

  describe('accessibility', () => {
    it('uses correct ARIA roles', () => {
      render(
        <LoadingOverlay isVisible={true} isLoading={true} progress={0.5} />
      );
      
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'loading overlay');
      expect(screen.getByRole('progressbar', { name: 'loading' })).toBeInTheDocument();
      expect(screen.getByRole('progressbar', { name: 'progress' })).toBeInTheDocument();
    });

    it('sets correct ARIA attributes on progress bar', () => {
      render(
        <LoadingOverlay isVisible={true} isLoading={true} progress={0.3} />
      );
      
      const progressBar = screen.getByRole('progressbar', { name: 'progress' });
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
      expect(progressBar).toHaveAttribute('aria-valuenow', '30');
    });

    it('uses aria-live for dynamic content', () => {
      render(
        <LoadingOverlay isVisible={true} isLoading={true} progress={0.5} />
      );
      
      expect(screen.getByText('Loading...')).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText('50%').parentElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <LoadingOverlay isVisible={true} isLoading={true} progress={0.5} />
    );
    
    expect(container.firstChild).toHaveClass('loading-overlay');
    expect(container.querySelector('.loading-content')).toBeInTheDocument();
    expect(container.querySelector('.loading-spinner')).toBeInTheDocument();
    expect(container.querySelector('.loading-message')).toBeInTheDocument();
    expect(container.querySelector('.loading-progress')).toBeInTheDocument();
    expect(container.querySelector('.progress-bar')).toBeInTheDocument();
    expect(container.querySelector('.progress-fill')).toBeInTheDocument();
    expect(container.querySelector('.progress-text')).toBeInTheDocument();
  });
});
