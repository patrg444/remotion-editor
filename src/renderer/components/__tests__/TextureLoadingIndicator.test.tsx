import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextureLoadingIndicator } from '../TextureLoadingIndicator';

describe('TextureLoadingIndicator', () => {
  it('renders nothing when not loading and no error', () => {
    render(
      <TextureLoadingIndicator isLoading={false} />
    );
    
    expect(screen.queryByLabelText('texture loading indicator')).not.toBeInTheDocument();
  });

  describe('loading state', () => {
    it('renders loading spinner when isLoading is true', () => {
      render(
        <TextureLoadingIndicator isLoading={true} />
      );
      
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Loading texture...')).toBeInTheDocument();
    });

    it('applies correct CSS classes for loading state', () => {
      const { container } = render(
        <TextureLoadingIndicator isLoading={true} />
      );
      
      expect(container.firstChild).toHaveClass('texture-loading-overlay');
      expect(container.querySelector('.texture-loading-spinner')).toBeInTheDocument();
      expect(container.querySelector('.spinner-ring')).toBeInTheDocument();
      expect(container.querySelector('.spinner-text')).toBeInTheDocument();
    });

    it('uses correct ARIA attributes for loading state', () => {
      render(
        <TextureLoadingIndicator isLoading={true} />
      );
      
      expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'loading');
      expect(screen.getByText('Loading texture...')).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('error state', () => {
    const testError = new Error('Failed to load texture');

    it('renders error message when error is provided', () => {
      render(
        <TextureLoadingIndicator isLoading={false} error={testError} />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(testError.message)).toBeInTheDocument();
    });

    it('applies correct CSS classes for error state', () => {
      const { container } = render(
        <TextureLoadingIndicator isLoading={false} error={testError} />
      );
      
      expect(container.firstChild).toHaveClass('texture-loading-overlay');
      expect(container.querySelector('.texture-loading-error')).toBeInTheDocument();
      expect(container.querySelector('.error-icon')).toBeInTheDocument();
      expect(container.querySelector('.error-message')).toBeInTheDocument();
    });

    it('renders retry button when onRetry is provided', () => {
      const onRetry = jest.fn();
      render(
        <TextureLoadingIndicator 
          isLoading={false} 
          error={testError} 
          onRetry={onRetry} 
        />
      );
      
      const retryButton = screen.getByRole('button', { name: 'retry loading' });
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveClass('retry-button');
    });

    it('does not render retry button when onRetry is not provided', () => {
      render(
        <TextureLoadingIndicator isLoading={false} error={testError} />
      );
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = jest.fn();
      render(
        <TextureLoadingIndicator 
          isLoading={false} 
          error={testError} 
          onRetry={onRetry} 
        />
      );
      
      fireEvent.click(screen.getByRole('button', { name: 'retry loading' }));
      expect(onRetry).toHaveBeenCalled();
    });

    it('uses correct ARIA attributes for error state', () => {
      render(
        <TextureLoadingIndicator isLoading={false} error={testError} />
      );
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('prioritizes loading state over error state', () => {
    render(
      <TextureLoadingIndicator 
        isLoading={true} 
        error={new Error('Test error')} 
      />
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('applies base CSS class consistently', () => {
    const { rerender, container } = render(
      <TextureLoadingIndicator isLoading={true} />
    );
    
    expect(container.firstChild).toHaveClass('texture-loading-overlay');
    
    rerender(
      <TextureLoadingIndicator 
        isLoading={false} 
        error={new Error('Test error')} 
      />
    );
    
    expect(container.firstChild).toHaveClass('texture-loading-overlay');
  });
});
