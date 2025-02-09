import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { Transition } from '../../../../src/renderer/types/timeline';
import { TransitionType } from '../../../../src/renderer/types/transition';

describe('Timeline Transition Creation', { testIsolation: true }, () => {
  beforeEach(() => {
    // Initialize test environment and wait for it to complete
    return setupTransitionTest().then(() => {
      // Wait for media bin items to be rendered
      return cy.get('[data-testid="media-bin-item"]', { timeout: 60000 })
        .should('exist')
        .should('be.visible')
        .should('have.length', 1)
        .invoke('attr', 'data-clip-id')
        .should('match', /^media-\d+-[a-z0-9]+$/);
    });
  });

  afterEach(() => {
    // Clean up after each test
    cy.window().then(win => {
      // Clear state
      win.timelineDispatch({ type: 'CLEAR_STATE' });
      
      // Force garbage collection
      if (win.gc) win.gc();
    });

    // Wait for cleanup
    cy.wait(500);
  });

  // Test basic transition creation
  it('should create transitions of different types', () => {
    // Add clips and verify they exist
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .should('be.visible')
      .then($clips => {
        const fromClipId = $clips[0].getAttribute('data-clip-id');
        const toClipId = $clips[1].getAttribute('data-clip-id');
        
        // Test each transition type
        [TransitionType.Dissolve, TransitionType.Fade, TransitionType.Wipe].forEach(type => {
          cy.addTransition(fromClipId!, toClipId!, type, { duration: 0.5 })
            .then(transitionId => {
              // Verify transition exists with correct type
              cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
                .should('exist')
                .should('be.visible')
                .should('have.attr', 'data-type', type)
                .and('have.attr', 'data-duration', '0.5')
                .and('have.attr', 'data-easing', 'linear');

              // Clean up immediately after verification
              cy.window().then(win => {
                win.timelineDispatch({
                  type: 'REMOVE_TRANSITION',
                  payload: { transitionId }
                });
              });
            });
        });
      });
  });

  // Test minimum duration enforcement
  it('should enforce minimum transition duration', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then($clips => {
        const fromClipId = $clips[0].getAttribute('data-clip-id');
        const toClipId = $clips[1].getAttribute('data-clip-id');
        
        // Try to add transition with duration below minimum
        cy.addTransition(fromClipId!, toClipId!, TransitionType.Dissolve, { duration: 0.01 })
          .then(transitionId => {
            // Verify minimum duration is enforced
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
              .invoke('attr', 'data-duration')
              .then(duration => {
                expect(parseFloat(duration!)).to.be.at.least(0.1);
              });

            // Clean up
            cy.window().then(win => {
              win.timelineDispatch({
                type: 'REMOVE_TRANSITION',
                payload: { transitionId }
              });
            });
          });
      });
  });

  // Test maximum duration enforcement
  it('should enforce maximum transition duration', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then($clips => {
        const fromClipId = $clips[0].getAttribute('data-clip-id');
        const toClipId = $clips[1].getAttribute('data-clip-id');
        
        // Try to add transition with duration above maximum
        cy.addTransition(fromClipId!, toClipId!, TransitionType.Dissolve, { duration: 10 })
          .then(transitionId => {
            // Verify maximum duration is enforced
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
              .invoke('attr', 'data-duration')
              .then(duration => {
                expect(parseFloat(duration!)).to.be.at.most(5.0);
              });

            // Clean up
            cy.window().then(win => {
              win.timelineDispatch({
                type: 'REMOVE_TRANSITION',
                payload: { transitionId }
              });
            });
          });
      });
  });

  // Test invalid transition creation
  it('should handle invalid transition parameters gracefully', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then($clips => {
        const fromClipId = $clips[0].getAttribute('data-clip-id');
        const toClipId = $clips[1].getAttribute('data-clip-id');
        
          // Try to add transition with invalid parameters and verify fallback to defaults
          cy.addTransition(fromClipId!, toClipId!, TransitionType.Wipe, { 
            direction: 'invalid',
            duration: -1,
            easing: 'invalid'
          }).then(transitionId => {
            // First verify the transition state
            cy.window().then(win => {
              const state = win.timelineState;
              const track = state.tracks[0];
              const transition = track.transitions.find((t: any) => t.id === transitionId);
              
              // Verify state has correct defaults
              expect(transition.params.direction).to.equal('right');
              expect(transition.params.easing).to.equal('linear');
              expect(transition.duration).to.be.at.least(0.1);

              // Force layout update
              win.timelineDispatch({
                type: 'UPDATE_LAYOUT'
              });
            });

            // Then verify DOM attributes
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`, { timeout: 10000 })
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-type', TransitionType.Wipe)
              .and('have.attr', 'data-direction', 'right')
              .and('have.attr', 'data-easing', 'linear')
              .invoke('attr', 'data-duration')
              .then(duration => {
                expect(parseFloat(duration!)).to.be.at.least(0.1);
              });

          // Clean up
          cy.window().then(win => {
            win.timelineDispatch({
              type: 'REMOVE_TRANSITION',
              payload: { transitionId }
            });
          });
        });
      });
  });
});
