import { TransitionType } from '../../../src/renderer/types/transition';

declare global {
  namespace Cypress {
    interface Chainable {
      waitForClips(): Chainable<void>;
      addVideoClipToTrack(trackId: string, clipData: any): Chainable<string>;
      addTransition(fromClipId: string, toClipId: string, type: TransitionType, params?: any): Chainable<string>;
      updateTransitionParams(transitionId: string, params: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('waitForClips', () => {
  return cy.get('[data-testid="timeline-clip"]')
    .should('exist')
    .should('be.visible')
    .then(() => undefined) as unknown as Cypress.Chainable<void>;
});

Cypress.Commands.add('addVideoClipToTrack', (trackId: string, clipData: any) => {
  const clipId = `clip-${Date.now().toString(36)}`;
  const clip = {
    id: clipId,
    type: 'video',
    ...clipData
  };

  return cy.window().then(win => {
    win.timelineDispatch({
      type: 'ADD_CLIP',
      payload: {
        trackId,
        clip
      }
    });
  }).then(() => {
    return cy.get(`[data-testid="timeline-clip"][data-clip-id="${clipId}"]`)
      .should('exist')
      .should('be.visible')
      .then(() => clipId);
  });
});

Cypress.Commands.add('addTransition', (fromClipId: string, toClipId: string, type: TransitionType, params: any = {}): Cypress.Chainable<string> => {
  const transitionId = `transition-${Date.now().toString(36)}`;
  
  return cy.window().then((win) => {
    return new Promise<void>((resolve) => {
      // First dispatch the transition action
      win.timelineDispatch({
        type: 'ADD_TRANSITION',
        payload: {
          transition: {
            id: transitionId,
            type,
            clipAId: fromClipId,
            clipBId: toClipId,
            duration: params.duration || 0.5,
            startTime: params.startTime || 0,
            endTime: params.endTime || 0,
            params
          }
        }
      });

      // Wait for next tick to ensure state is updated
      setTimeout(() => {
        // Force a layout update to trigger the transition ready event
        win.dispatchEvent(new CustomEvent('timeline:transition:ready', {
          detail: { transitionId }
        }));
        resolve();
      }, 0);
    });
  }).then(() => {
    // Wait for transition element to be rendered
    return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`, { timeout: 60000 })
      .should('exist')
      .should('be.visible')
      .then(() => transitionId);
  }) as unknown as Cypress.Chainable<string>;
});

Cypress.Commands.add('updateTransitionParams', (transitionId: string, params: any) => {
  return cy.window().then(win => {
    win.timelineDispatch({
      type: 'UPDATE_TRANSITION',
      payload: {
        transitionId,
        params
      }
    });
  }).then(() => {
    // Wait for transition update to be applied
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
  }) as unknown as Cypress.Chainable<void>;
});
