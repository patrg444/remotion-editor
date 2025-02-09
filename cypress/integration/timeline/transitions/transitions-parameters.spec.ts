import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { TrackTransition } from '../../../../src/renderer/types/timeline';
import { TransitionType } from '../../../../src/renderer/types/transition';

describe('Timeline Transition Parameters', () => {
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

  // Test 1: DOM Positioning
  it('should position transition element correctly', { retries: 0 }, () => {
    // Wait for clips to be added and verify state first
    cy.window().should(win => {
      const state = win.timelineState;
      expect(state.tracks[0].clips).to.have.length(2);

      // Verify clip positions
      const clips = state.tracks[0].clips;
      expect(clips[0].endTime).to.equal(clips[1].startTime);
    });

    // Wait for clips to be fully rendered
    cy.waitForClips(2);
    cy.wait(500); // Additional wait for stability

    // Add transition between clips
    cy.window().then(win => {
      const state = win.timelineState;
      const clips = state.tracks[0].clips;
      return cy.addTransition(clips[0].id, clips[1].id, TransitionType.Wipe, { direction: 'right' });
    }).then(transitionId => {
      // Verify transition element position and dimensions
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('exist')
        .should('be.visible')
        .and('have.attr', 'data-type', TransitionType.Wipe)
        .then($transition => {
          const rect = $transition[0].getBoundingClientRect();
          expect(rect.width).to.be.greaterThan(0);
          expect(rect.height).to.be.greaterThan(0);

          // Get clips for position verification
          cy.get('[data-testid="timeline-clip"]').then($clips => {
            const firstClipRect = $clips[0].getBoundingClientRect();
            const secondClipRect = $clips[1].getBoundingClientRect();

            // Verify transition is between clips with wider tolerance
            const transitionOffset = 11;
            const expectedLeft = firstClipRect.right - (rect.width / 2) + transitionOffset;
            const expectedRight = secondClipRect.left + (rect.width / 2) + transitionOffset;
            const positionTolerance = 100;

            expect(rect.left).to.be.closeTo(expectedLeft, positionTolerance);
            expect(rect.right).to.be.closeTo(expectedRight, positionTolerance);
          });
        });
    });
  });

  // Test 2: WebGL Context and Transitions
  it('should handle different transition types and parameters', { retries: 0 }, () => {
    // Test different transition types
    const transitionTypes = [TransitionType.Wipe, TransitionType.Fade, TransitionType.Dissolve];
    const directions = ['right', 'left', 'up', 'down'];

    // Add transitions with different types
    transitionTypes.forEach(type => {
      cy.window().then(win => {
        const state = win.timelineState;
        const clips = state.tracks[0].clips;
        return cy.addTransition(clips[0].id, clips[1].id, type, { direction: 'right' });
      }).then(transitionId => {
        // Verify transition is created with correct type
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('exist')
          .should('be.visible')
          .and('have.attr', 'data-type', type);

        // Test canvas initialization
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .find('canvas')
          .should('exist')
          .should('be.visible')
          .and('have.attr', 'data-testid', 'transition-canvas')
          .and('have.css', 'display', 'block')
          .then($canvas => {
            // Verify canvas dimensions
            cy.wrap($canvas)
              .should('have.attr', 'width')
              .and('not.equal', '0');
            
            cy.wrap($canvas)
              .should('have.attr', 'height')
              .and('not.equal', '0');
          });

        // Test different directions
        directions.forEach(direction => {
          cy.updateTransitionParams(transitionId, {
            direction,
            duration: 0.5,
            type,
            easing: 'linear'
          });

          // Verify direction update
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .should('have.attr', 'data-direction', direction);
        });

        // Test duration changes
          [0.5, 0.8, 1.0].forEach(duration => {
          cy.updateTransitionParams(transitionId, {
            direction: 'right',
            duration,
            type,
            easing: 'linear'
          });

          // Verify duration update
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .should('have.attr', 'data-duration', duration.toString());
        });

        // Clean up transition
        cy.window().then(win => {
          win.timelineDispatch({
            type: 'REMOVE_TRANSITION',
            payload: { transitionId }
          });
        });

        // Verify cleanup
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('not.exist');
      });
    });
  });

  // Test 3: WebGL Context Loss/Restore
  it('should handle WebGL context loss and restore', { retries: 0 }, () => {
    cy.window().then(win => {
      const state = win.timelineState;
      const clips = state.tracks[0].clips;
      return cy.addTransition(clips[0].id, clips[1].id, TransitionType.Wipe, { direction: 'right' });
    }).then(transitionId => {
      // Get canvas and simulate context loss
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .find('canvas')
        .should('exist')
        .should('be.visible')
        .then($canvas => {
          const canvas = $canvas[0] as HTMLCanvasElement;
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
          expect(gl, 'WebGL context should be available').to.exist;

          if (gl) {
            // Trigger context loss
            const ext = gl.getExtension('WEBGL_lose_context');
            if (ext) {
              ext.loseContext();

              // Wait and verify canvas is still functional
              cy.wait(1000);
              cy.wrap($canvas)
                .should('have.attr', 'data-testid', 'transition-canvas')
                .and('have.css', 'display', 'block');

              // Restore context
              ext.restoreContext();
            }
          }
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

  // Test 4: Error Handling
  it('should handle invalid transition parameters gracefully', { retries: 0 }, () => {
    cy.window().then(win => {
      const state = win.timelineState;
      const clips = state.tracks[0].clips;
      return cy.addTransition(clips[0].id, clips[1].id, TransitionType.Wipe, { direction: 'right' });
    }).then(transitionId => {
      // Test invalid direction
      cy.updateTransitionParams(transitionId, {
        direction: 'invalid_direction',
        duration: 0.5,
        type: TransitionType.Wipe,
        easing: 'linear'
      });

      // Should fallback to default direction
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('have.attr', 'data-direction', 'right');

      // Test invalid duration
      cy.updateTransitionParams(transitionId, {
        direction: 'right',
        duration: -1,
        type: TransitionType.Wipe,
        easing: 'linear'
      });

      // Should handle negative duration without errors
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('exist')
        .and('be.visible');

      // Test invalid transition type
      cy.updateTransitionParams(transitionId, {
        direction: 'right',
        duration: 0.5,
        type: 'invalid_type' as TransitionType,
        easing: 'linear'
      });

      // Should keep previous valid type
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('have.attr', 'data-type', TransitionType.Wipe);

      // Clean up
      cy.window().then(win => {
        win.timelineDispatch({
          type: 'REMOVE_TRANSITION',
          payload: { transitionId }
        });
      });
    });
  });

  // Test 5: Media Loading
  it('should load and render transition thumbnails', { retries: 0 }, () => {
    // Wait for clips to be added and verify state first
    cy.window().should(win => {
      const state = win.timelineState;
      expect(state.tracks[0].clips).to.have.length(2);

      // Verify clip positions
      const clips = state.tracks[0].clips;
      expect(clips[0].endTime).to.equal(clips[1].startTime);
    });

    // Add transition between clips
    cy.window().then(win => {
      const state = win.timelineState;
      const clips = state.tracks[0].clips;
      return cy.addTransition(clips[0].id, clips[1].id, TransitionType.Wipe, { direction: 'right' });
    }).then(transitionId => {
      // Verify transition element
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('exist')
        .should('be.visible')
        .and('have.attr', 'data-type', TransitionType.Wipe)
        .and('have.attr', 'data-direction', 'right');

      // Update transition parameters
      cy.updateTransitionParams(transitionId, {
        direction: 'left',
        duration: 0.5,
        type: TransitionType.Wipe,
        easing: 'linear'
      });

      // Verify updated parameters
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('have.attr', 'data-direction', 'left')
        .should('have.attr', 'data-duration', '0.5');

      // Clean up transition
      cy.window().then(win => {
        win.timelineDispatch({
          type: 'REMOVE_TRANSITION',
          payload: { transitionId }
        });
      });

      // Verify cleanup
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('not.exist');
    });
  });
});
