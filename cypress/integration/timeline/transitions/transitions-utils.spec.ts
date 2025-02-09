/// <reference types="cypress" />

import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { TransitionType } from '../../../../src/renderer/types/transition';
import {
  verifyTransitionDuration,
  verifyTransitionDefaults,
  verifyTransitionParameters,
  verifyTransitionState,
  createTestTransition,
  setupTransitionContainer
} from '../../../support/utils/transition-test-utils';

describe('Timeline Transition Utils', { testIsolation: true }, () => {
  beforeEach(() => {
    // Initialize test environment and setup transition container
    return setupTransitionTest().then(() => {
      cy.document().then(doc => {
        setupTransitionContainer(doc);
      });
    });
  });

  afterEach(() => {
    // Clean up
    cy.window().then(win => {
      win.timelineDispatch({ type: 'CLEAR_STATE' });
      if (win.gc) win.gc();
    });
  });

  const getClipIds = () => {
    return cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .should('be.visible')
      .should('have.attr', 'data-clip-id')
      .then(() => {
        return cy.get('[data-testid="timeline-clip"]').first().invoke('attr', 'data-clip-id').then(fromClipId => {
          return cy.get('[data-testid="timeline-clip"]').last().invoke('attr', 'data-clip-id').then(toClipId => {
            return { fromClipId, toClipId };
          });
        });
      });
  };

  it('should verify transition duration constraints', () => {
    getClipIds().then(({ fromClipId, toClipId }) => {
      cy.window().then(win => {
        // Create transition with minimum duration
        const transition = createTestTransition(fromClipId!, toClipId!, TransitionType.Dissolve, { duration: 0.01 });
        
        // Add transition to state
        win.timelineDispatch({
          type: 'ADD_TRANSITION',
          payload: { transition }
        });

        // Wait for state to be updated
        cy.wrap(null, { timeout: 10000 }).should(() => {
          const track = win.timelineState.tracks[0];
          const addedTransition = track.transitions[0];
          expect(addedTransition).to.exist;
          expect(addedTransition.duration).to.equal(0.1);
          return true;
        });

        // Verify DOM reflects the state
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
          .should('exist')
          .should('be.visible')
          .should('have.attr', 'data-duration', '0.1');
      });
    });
  });

  it('should verify transition defaults', () => {
    getClipIds().then(({ fromClipId, toClipId }) => {
      // Create test transition with defaults
      const transition = createTestTransition(fromClipId!, toClipId!, TransitionType.Dissolve);
      
      cy.window().then(win => {
        win.timelineDispatch({
          type: 'ADD_TRANSITION',
          payload: { transition }
        });

        // Verify state before checking DOM
        verifyTransitionState(win, transition.id, TransitionType.Dissolve);
        
        // Verify defaults in DOM
        verifyTransitionDefaults(transition.id, TransitionType.Dissolve);
      });
    });
  });

  it('should verify transition parameters', () => {
    getClipIds().then(({ fromClipId, toClipId }) => {
      const params = {
        duration: 0.5,
        easing: 'linear',
        direction: 'right'
      };
      
      // Create test transition with custom parameters
      const transition = createTestTransition(fromClipId!, toClipId!, TransitionType.Wipe, params);
      
      cy.window().then(win => {
        win.timelineDispatch({
          type: 'ADD_TRANSITION',
          payload: { transition }
        });

        // Verify state before checking DOM
        verifyTransitionState(win, transition.id, TransitionType.Wipe);
        
        // Verify parameters in DOM
        verifyTransitionParameters(transition.id, params);
      });
    });
  });
});
