import React from 'react';
import { UpgradeDialogProps } from '../types/components';

export const UpgradeDialog: React.FC<UpgradeDialogProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  features,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="upgrade-dialog-overlay" role="dialog" aria-labelledby="dialog-title" aria-modal="true">
      <div className="upgrade-dialog">
        <h2 id="dialog-title">Upgrade to Pro</h2>
        <p>Unlock powerful features to enhance your video editing experience:</p>
        <ul className="feature-list" aria-label="Pro features">
          {features.map((feature, index) => (
            <li key={index} className="feature-item">
              <span className="feature-check" aria-hidden="true">✓</span>
              {feature}
            </li>
          ))}
        </ul>
        <div className="dialog-buttons">
          <button 
            className="secondary-button" 
            onClick={onClose}
            aria-label="Close upgrade dialog"
          >
            Maybe Later
          </button>
          <button 
            className="primary-button" 
            onClick={onUpgrade}
            aria-label="Upgrade to pro version"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};
