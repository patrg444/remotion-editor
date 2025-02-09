import { TransitionType } from '../../../src/renderer/types/transition';
import { Track } from '../../../src/renderer/types/timeline';

export const createTransitionTrack = (overrides: Partial<Track> = {}): Track => ({
  id: 'track-1',
  name: 'Video Track',
  type: 'video',
  clips: [],
  transitions: [],
  allowTransitions: true,
  transitionsEnabled: true,
  showTransitions: true,
  ...overrides
});

export const createTestTransition = (fromClipId: string, toClipId: string, type: TransitionType, params: any = {}) => {
  // Validate transition type
  const validTypes = Object.values(TransitionType);
  if (!validTypes.includes(type)) {
    throw new Error(`Invalid transition type: ${type}`);
  }

  const duration = Math.max(0.1, params.duration || 0.5);
  return {
    id: `transition-${Date.now().toString(36)}`,
    type,
    fromClipId,
    toClipId,
    duration,
    startTime: 0,
    endTime: 0,
    params: {
      ...params,
      duration,
      direction: params.direction || 'right'
    }
  };
};

export const setupTransitionContainer = (doc: Document) => {
  // Add transition container styles
  const style = doc.createElement('style');
  style.innerHTML = `
    .track-transitions {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
    }
    [data-testid="timeline-transition"] {
      position: absolute;
      height: 100%;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      pointer-events: auto;
    }
    [data-testid="timeline-transition-icon"] {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 16px;
      height: 16px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
    }
    [data-testid="timeline-transition-handle"] {
      position: absolute;
      top: 0;
      width: 8px;
      height: 100%;
      background: rgba(255, 255, 255, 0.3);
      cursor: ew-resize;
    }
    [data-testid="timeline-transition-handle"].left {
      left: 0;
    }
    [data-testid="timeline-transition-handle"].right {
      right: 0;
    }
  `;
  doc.head.appendChild(style);
};

export const createTransitionElement = (
  doc: Document,
  container: Element,
  transitionId: string,
  type: string | TransitionType,
  params: any = {}
) => {
  const transitionElement = doc.createElement('div');
  transitionElement.setAttribute('data-testid', 'timeline-transition');
  transitionElement.setAttribute('data-transition-id', transitionId);
  transitionElement.setAttribute('data-type', type);
  transitionElement.setAttribute('data-easing', 'linear');
  
  // Add transition icon
  const iconEl = doc.createElement('div');
  iconEl.className = 'timeline-transition-icon';
  iconEl.setAttribute('data-testid', 'timeline-transition-icon');
  transitionElement.appendChild(iconEl);

  // Add transition handles
  const leftHandle = doc.createElement('div');
  leftHandle.setAttribute('data-testid', 'timeline-transition-handle');
  leftHandle.className = 'timeline-transition-handle left';
  transitionElement.appendChild(leftHandle);

  const rightHandle = doc.createElement('div');
  rightHandle.setAttribute('data-testid', 'timeline-transition-handle');
  rightHandle.className = 'timeline-transition-handle right';
  transitionElement.appendChild(rightHandle);

  // Add parameters as data attributes
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === 'string' || typeof value === 'number') {
      transitionElement.setAttribute(`data-${key}`, value.toString());
    }
  });

  transitionElement.style.left = '100px';
  transitionElement.style.width = '50px';
  container.appendChild(transitionElement);
  return transitionElement;
};

export const removeTransitionElement = (doc: Document, transitionId: string) => {
  const transitionElement = doc.querySelector(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`);
  if (transitionElement) {
    transitionElement.remove();
  }
};

export const updateTransitionDuration = (doc: Document, transitionId: string, duration: number) => {
  const transitionElement = doc.querySelector(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`);
  if (transitionElement) {
    transitionElement.setAttribute('data-duration', duration.toString());
  }
};

export const verifyTransitionState = (win: Cypress.AUTWindow, transitionId: string, type: string | TransitionType) => {
  const track = win.timelineState.tracks[0];
  expect(track.transitions).to.have.length(1);
  const addedTransition = track.transitions.find((t: any) => t.id === transitionId);
  expect(addedTransition).to.exist;
  expect(addedTransition.type).to.equal(type);
};

export const verifyTransitionDuration = (transitionId: string, expectedMin: number, expectedMax: number) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .invoke('attr', 'data-duration')
    .then(duration => {
      const durationValue = parseFloat(duration!);
      expect(durationValue).to.be.at.least(expectedMin);
      expect(durationValue).to.be.at.most(expectedMax);
    });
};

export const verifyTransitionDefaults = (transitionId: string, type: TransitionType) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .should('exist')
    .should('be.visible')
    .should('have.attr', 'data-type', type)
    .should('have.attr', 'data-easing', 'linear')
    .then(() => {
      // Verify duration is within valid range
      return verifyTransitionDuration(transitionId, 0.1, 5.0);
    });
};

export const verifyTransitionParameters = (transitionId: string, params: Record<string, any>) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .should('exist')
    .should('be.visible')
    .then(() => {
      // Verify each parameter
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .should('have.attr', `data-${key}`, value.toString());
        }
      });
    });
};
