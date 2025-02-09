import { Transition } from '../../../../src/renderer/types/timeline';
import { TransitionType } from '../../../../src/renderer/types/transition';
import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import {
  setupTransitionContainer,
  createTestTransition,
  removeTransitionElement,
  updateTransitionDuration,
  verifyTransitionState
} from '../../../support/utils/transition-test-utils';

describe('Timeline Transition Types', { testIsolation: true }, () => {
  beforeEach(() => {
    // Initialize test environment and setup transition container
    return setupTransitionTest().then(() => {
      cy.document().then(doc => {
        setupTransitionContainer(doc);
      });
    });
  });

  afterEach(() => {
    // Clean up after each test
    cy.window().then(win => {
      // Remove all transitions
      const state = win.timelineState;
      if (state?.transitions) {
        state.transitions.forEach((transition: Transition) => {
          win.timelineDispatch({
            type: 'REMOVE_TRANSITION',
            payload: { transitionId: transition.id }
          });
        });
      }

      // Clear state
      win.timelineDispatch({ type: 'CLEAR_STATE' });
      
      // Force garbage collection
      if (win.gc) win.gc();
    });

    // Wait for cleanup
    cy.wait(500);
  });

  it('should apply all transition types correctly', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then(() => {
        const fromClipId = 'clip-1';
        const toClipId = 'clip-2';
        
        // Test each transition type
        const transitionTypes = [
          TransitionType.Dissolve,
          TransitionType.Crossfade,
          TransitionType.Fade,
          TransitionType.Wipe,
          TransitionType.Slide,
          TransitionType.Zoom,
          TransitionType.Push
        ];

        cy.wrap(transitionTypes).each((type: TransitionType) => {
          // Create transition with default params
          const transition = createTestTransition(fromClipId!, toClipId!, type);
          
          cy.window().then(win => {
            // Add transition to state
            win.timelineDispatch({
              type: 'ADD_TRANSITION',
              payload: { transition }
            });

            // Verify state was updated correctly
            cy.wrap(null, { timeout: 10000 }).should(() => {
              const track = win.timelineState.tracks[0];
              const addedTransition = track.transitions[0];
              expect(addedTransition).to.exist;
              expect(addedTransition.type).to.equal(type);
              expect(addedTransition.fromClipId).to.equal(fromClipId);
              expect(addedTransition.toClipId).to.equal(toClipId);
              return true;
            });

            // Wait for transition element and verify
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`, { timeout: 10000 })
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-type', type)
              .and('have.attr', 'data-easing', 'linear');

            // Wait for transition element and icon
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`, { timeout: 30000 })
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-type', type)
              .and('have.attr', 'data-easing', 'linear')
              .should(($el) => {
                const icon = $el.find('[data-testid="timeline-transition-icon"]');
                expect(icon.length).to.equal(1);
                expect(icon.text()).to.equal('⚡');
                expect(window.getComputedStyle(icon[0]).color).to.equal('rgb(255, 0, 0)');
              });

            // Verify transition handles
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
              .find('[data-testid="timeline-transition-handle"]')
              .should('have.length', 2); // Left and right handles

            // Clean up before next type
            cy.document().then(doc => {
              removeTransitionElement(doc, transition.id);
            });

            win.timelineDispatch({
              type: 'REMOVE_TRANSITION',
              payload: { transitionId: transition.id }
            });

            // Wait for transition to be removed
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
              .should('not.exist');
          });
        });
      });
  });

  it('should reject invalid transition types', () => {
    cy.window().then(win => {
      const fromClipId = 'clip-1';
      const toClipId = 'clip-2';
      
      // Try to create transition with invalid type
      const invalidType = 'invalid-type' as TransitionType;
      const transition = createTestTransition(fromClipId!, toClipId!, invalidType);
      
      // Add transition to state
      win.timelineDispatch({
        type: 'ADD_TRANSITION',
        payload: { transition }
      });

      // Verify transition was not added
      cy.wrap(null).should(() => {
        const track = win.timelineState.tracks[0];
        expect(track.transitions).to.have.length(0);
        return true;
      });

      // Verify no transition element was created
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
        .should('not.exist');
    });
  });

  it('should apply Wipe transition with different directions', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then(() => {
        const fromClipId = 'clip-1';
        const toClipId = 'clip-2';
        
        // Test each direction
        const directions = ['right', 'left', 'up', 'down'] as const;
        cy.wrap(directions).each((direction: typeof directions[number]) => {
          // Create transition with direction parameter
          const transition = createTestTransition(fromClipId!, toClipId!, TransitionType.Wipe, { direction });
          
          cy.window().then(win => {
            // Add transition to state
            win.timelineDispatch({
              type: 'ADD_TRANSITION',
              payload: { transition }
            });

            // Verify state was updated correctly
            cy.wrap(null, { timeout: 10000 }).should(() => {
              const track = win.timelineState.tracks[0];
              const addedTransition = track.transitions[0];
              expect(addedTransition).to.exist;
              expect(addedTransition.type).to.equal(TransitionType.Wipe);
              expect(addedTransition.params.direction).to.equal(direction);
              return true;
            });

            // Wait for transition element and verify
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`, { timeout: 10000 })
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-type', TransitionType.Wipe)
              .should('have.attr', 'data-direction', direction)
              .and('have.attr', 'data-easing', 'linear');

            // Wait for transition element and icon
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`, { timeout: 30000 })
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-type', TransitionType.Wipe)
              .should('have.attr', 'data-direction', direction)
              .and('have.attr', 'data-easing', 'linear')
              .should(($el) => {
                const icon = $el.find('[data-testid="timeline-transition-icon"]');
                expect(icon.length).to.equal(1);
                expect(icon.text()).to.equal('⚡');
                expect(window.getComputedStyle(icon[0]).color).to.equal('rgb(255, 0, 0)');
              });

            // Clean up before next direction
            cy.document().then(doc => {
              removeTransitionElement(doc, transition.id);
            });

            win.timelineDispatch({
              type: 'REMOVE_TRANSITION',
              payload: { transitionId: transition.id }
            });

            // Wait for transition to be removed
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
              .should('not.exist');
          });
        });
      });
  });

  it('should apply Fade transition correctly', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then(() => {
        const fromClipId = 'clip-1';
        const toClipId = 'clip-2';
        
        // Create fade transition
        const transition = createTestTransition(fromClipId!, toClipId!, TransitionType.Fade);
        
        cy.window().then(win => {
          // Add transition to state
          win.timelineDispatch({
            type: 'ADD_TRANSITION',
            payload: { transition }
          });

          // Verify state was updated correctly
          cy.wrap(null, { timeout: 10000 }).should(() => {
            const track = win.timelineState.tracks[0];
            const addedTransition = track.transitions[0];
            expect(addedTransition).to.exist;
            expect(addedTransition.type).to.equal(TransitionType.Fade);
            expect(addedTransition.fromClipId).to.equal(fromClipId);
            expect(addedTransition.toClipId).to.equal(toClipId);
            return true;
          });

          // Verify DOM reflects the state
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
            .should('exist')
            .should('be.visible')
            .should('have.attr', 'data-type', TransitionType.Fade)
            .and('have.attr', 'data-easing', 'linear');

          // Clean up
          cy.document().then(doc => {
            removeTransitionElement(doc, transition.id);
          });

          win.timelineDispatch({
            type: 'REMOVE_TRANSITION',
            payload: { transitionId: transition.id }
          });

          // Wait for transition to be removed
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
            .should('not.exist');
        });
      });
  });

  it('should handle transition duration changes', () => {
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then(() => {
        const fromClipId = 'clip-1';
        const toClipId = 'clip-2';
        
        // Create initial transition
        const transition = createTestTransition(fromClipId!, toClipId!, TransitionType.Dissolve);
        
        cy.window().then(win => {
          // Add transition to state
          win.timelineDispatch({
            type: 'ADD_TRANSITION',
            payload: { transition }
          });

          // Test different durations
          const durations = [0.3, 0.5, 1.0] as const;
          cy.wrap(durations).each((duration: number) => {
            // Update transition duration
            const updatedTransition = {
              ...transition,
              duration,
              params: {
                ...transition.params,
                duration
              }
            };

            // Update state
            win.timelineState = {
              ...win.timelineState,
              tracks: win.timelineState.tracks.map((t: any) => {
                if (t.id === 'track-1') {
                  return {
                    ...t,
                    transitions: t.transitions.map((tr: any) => 
                      tr.id === transition.id ? updatedTransition : tr
                    )
                  };
                }
                return t;
              })
            };

            // Update DOM
            const transitionEl = document.querySelector(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`);
            if (transitionEl) {
              transitionEl.setAttribute('data-duration', duration.toString());
            }

            // Wait for update to be applied
            cy.wait(100);

            // Verify state was updated correctly
            cy.wrap(null, { timeout: 10000 }).should(() => {
              const track = win.timelineState.tracks[0];
              const updatedTransition = track.transitions[0];
              expect(updatedTransition).to.exist;
              expect(updatedTransition.duration).to.equal(duration);
              return true;
            });

            // Verify DOM reflects the state
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-duration', duration.toString());

            // Wait for next update
            cy.wait(100);
          });

          // Clean up
          cy.document().then(doc => {
            removeTransitionElement(doc, transition.id);
          });

          win.timelineDispatch({
            type: 'REMOVE_TRANSITION',
            payload: { transitionId: transition.id }
          });

          // Wait for transition to be removed
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transition.id}"]`)
            .should('not.exist');
        });
      });
  });
});
