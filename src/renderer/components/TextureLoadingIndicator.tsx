import React from 'react';
import '../styles/texture-loading.css';

interface TextureLoadingIndicatorProps {
  isLoading: boolean;
  error?: Error;
  onRetry?: () => void;
}

export const TextureLoadingIndicator: React.FC<TextureLoadingIndicatorProps> = ({
  isLoading,
  error,
  onRetry,
}) => {
  if (!isLoading && !error) return null;

  return (
    <div className="texture-loading-overlay" aria-label="texture loading indicator">
      {isLoading ? (
        <div className="texture-loading-spinner" role="status" aria-label="loading">
          <div className="spinner-ring"></div>
          <div className="spinner-text" aria-live="polite">Loading texture...</div>
        </div>
      ) : error && (
        <div className="texture-loading-error" role="alert">
          <div className="error-icon" aria-hidden="true">⚠️</div>
          <div className="error-message">{error.message}</div>
          {onRetry && (
            <button className="retry-button" onClick={onRetry} aria-label="retry loading">
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TextureLoadingIndicator;
