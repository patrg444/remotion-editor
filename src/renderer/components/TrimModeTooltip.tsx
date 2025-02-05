import React from 'react';

interface TrimModeTooltipProps {
  mode: 'normal' | 'ripple' | 'slip';
}

export const TrimModeTooltip: React.FC<TrimModeTooltipProps> = ({ mode }) => {
  const getModeDescription = () => {
    switch (mode) {
      case 'ripple':
        return 'Ripple trim - adjusts clip and shifts subsequent clips (Alt or R)';
      case 'slip':
        return 'Slip trim - adjusts media offset while maintaining duration (Shift or S)';
      default:
        return 'Normal trim - adjusts clip boundaries (N)';
    }
  };

  return (
    <div className="trim-mode-tooltip">
      {getModeDescription()}
    </div>
  );
};
