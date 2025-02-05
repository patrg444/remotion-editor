import React from 'react';
import { logger } from '../utils/logger';

const transitions = [
  {
    id: 'cross-dissolve',
    name: 'Cross Dissolve',
    type: 'cross-dissolve',
    icon: '↔️',
    duration: 1.0
  },
  {
    id: 'fade',
    name: 'Fade',
    type: 'fade',
    icon: '🌅',
    duration: 1.0
  },
  {
    id: 'wipe',
    name: 'Wipe',
    type: 'wipe',
    icon: '➡️',
    duration: 1.0
  }
];

export const TransitionsPanel: React.FC = () => {
  const handleDragStart = (e: React.DragEvent, transition: typeof transitions[0]) => {
    logger.debug('Starting transition drag:', transition);

    const data = {
      type: 'transition',
      transitionType: transition.type,
      name: transition.name,
      duration: transition.duration
    };

    logger.debug('Setting drag data:', data);

    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copy';

    // Skip drag image in test environment
    if (process.env.NODE_ENV !== 'test') {
      const dragImage = document.createElement('div');
      dragImage.className = 'transition-drag-preview';
      dragImage.innerHTML = transition.icon;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      document.body.appendChild(dragImage);

      e.dataTransfer.setDragImage(dragImage, 12, 12);

      requestAnimationFrame(() => {
        document.body.removeChild(dragImage);
      });
    }
  };

  return (
    <div className="transitions-panel">
      <div className="transitions-header">
        <h3>Available Transitions</h3>
        <p className="transitions-help">Drag a transition between two clips to add it</p>
      </div>
      <div className="transitions-grid">
        {transitions.map(transition => (
          <div
            key={transition.id}
            className="transition-item"
            data-testid={`${transition.type}-transition`}
            draggable
            onDragStart={e => handleDragStart(e, transition)}
          >
            <div className="transition-icon">{transition.icon}</div>
            <div className="transition-info">
              <div className="transition-name">{transition.name}</div>
              <div className="transition-duration">Default: {transition.duration}s</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
