import React, { useState } from 'react';
import { ActivationDialogProps } from '../types/components';

export const ActivationDialog: React.FC<ActivationDialogProps> = ({
  isOpen,
  onClose,
  onActivate,
  error,
}) => {
  const [licenseKey, setLicenseKey] = useState('');
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleActivate = async () => {
    if (!licenseKey.trim() || isActivating) return;

    setIsActivating(true);
    try {
      await onActivate(licenseKey.trim());
      setLicenseKey('');
      onClose();
    } catch (err) {
      // Error handling is managed by the parent through the error prop
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="activation-dialog-overlay" role="dialog" aria-labelledby="dialog-title" aria-modal="true">
      <div className="activation-dialog">
        <h2 id="dialog-title">Activate License</h2>
        <p>Enter your license key to activate the pro features:</p>
        <input
          type="text"
          value={licenseKey}
          onChange={(e) => setLicenseKey(e.target.value)}
          placeholder="Enter your license key"
          className="license-input"
          disabled={isActivating}
          aria-label="License key"
          aria-invalid={!!error}
          aria-describedby={error ? "error-message" : undefined}
        />
        {error && <div id="error-message" className="error-message" role="alert">{error}</div>}
        <div className="dialog-buttons">
          <button
            className="secondary-button"
            onClick={onClose}
            disabled={isActivating}
            aria-label="Cancel activation"
          >
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={handleActivate}
            disabled={isActivating || !licenseKey.trim()}
            aria-label={isActivating ? "Activating license" : "Activate license"}
          >
            {isActivating ? 'Activating...' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );
};
