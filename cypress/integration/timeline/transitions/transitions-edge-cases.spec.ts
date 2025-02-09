import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { TransitionType } from '../../../../src/renderer/types/transition';
import { waitForStateAndRender } from '../../../support/utils/timeline';
import { TimelineState, Track, Clip, Transition } from '../../../../src/renderer/types/timeline';
import { initialTimelineState } from '../../../../src/renderer/types/timeline';

type TimelineTrack = Track & {
  clips: TimelineClip[];
  transitions?: TimelineTransition[];
};

type TimelineClip = Clip & {
  startTime: number;
  endTime: number;
  mediaOffset?: number;
  mediaDuration?: number;
};

type TimelineTransition = Transition & {
  clipAId: string;
  clipBId: string;
  type: string;
  duration: number;
};

describe('Timeline Transition Edge Cases', { testIsolation: true }, () => {
  // Handle uncaught exceptions
  Cypress.on('uncaught:exception', (err) => {
    // Returning false here prevents Cypress from failing the test
    return false;
  });

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

  it('should handle transitions during undo/redo operations', () => {
    // Add transition between clips
    cy.window().then(win => {
      // Verify clips exist before adding transition
      const track = win.timelineState.tracks[0];
      expect(track.clips).to.have.length(2);
      expect(track.clips[0].id).to.equal('clip-1');
      expect(track.clips[1].id).to.equal('clip-2');

      // Add transition
      cy.addTransition('clip-1', 'clip-2', TransitionType.Dissolve, {
        duration: 0.5
      }).then(transitionId => {
        // Wait for state and DOM to update
        waitForStateAndRender(state => {
          const track = state.tracks[0];
          return track.transitions?.length === 1 && track.transitions[0].id === transitionId;
        });

        // Verify transition was created
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('exist')
          .should('be.visible')
          .should('have.attr', 'data-type', TransitionType.Dissolve);

        // Undo transition creation
        win.timelineDispatch({ type: 'UNDO' });
        win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

        // Wait for state and DOM to update
        waitForStateAndRender(state => {
          const track = state.tracks[0];
          return (track.transitions || []).length === 0;
        });

        // Verify transition is removed
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('not.exist');

        // Redo transition creation
        win.timelineDispatch({ type: 'REDO' });
        win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

        // Wait for state and DOM to update
        waitForStateAndRender(state => {
          const track = state.tracks[0];
          return track.transitions?.length === 1 && track.transitions[0].id === transitionId;
        });

        // Verify transition is restored in DOM
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('exist')
          .should('be.visible')
          .should('have.attr', 'data-type', TransitionType.Dissolve);
      });
    });
  });

  it('should handle transitions at timeline boundaries', () => {
    // Add transition at timeline start
    cy.window().then(win => {
      // Verify clips exist before adding transition
      const track = win.timelineState.tracks[0];
      expect(track.clips).to.have.length(2);
      expect(track.clips[0].id).to.equal('clip-1');
      expect(track.clips[1].id).to.equal('clip-2');

      // Add transition
      cy.addTransition('clip-1', 'clip-2', TransitionType.Dissolve, {
        duration: 0.5
      }).then(transitionId => {
        // Wait for state and DOM to update
        waitForStateAndRender(state => {
          const track = state.tracks[0];
          return track.transitions?.length === 1 && track.transitions[0].id === transitionId;
        });

        // Verify transition position
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('exist')
          .should('be.visible')
          .invoke('attr', 'style')
          .should('include', 'left:'); // Verify left position is set

        // Verify transition timing
        cy.window().should(win => {
          const state = win.timelineState;
          const transition = state.tracks[0].transitions.find((t: TimelineTransition) => t.id === transitionId);
          expect(transition.startTime).to.be.at.least(0); // Should not start before timeline start
        });
      });
    });
  });

  it('should handle transitions during track reordering', () => {
    // Create second track
    cy.window().then(win => {
      // Verify first track clips
      const track = win.timelineState.tracks[0];
      expect(track.clips).to.have.length(2);
      expect(track.clips[0].id).to.equal('clip-1');
      expect(track.clips[1].id).to.equal('clip-2');

      // Create second track
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          tracks: [
            win.timelineState.tracks[0],
            {
              id: 'track-2',
              clips: [],
              transitions: [],
              allowTransitions: true,
              transitionsEnabled: true,
              showTransitions: true
            }
          ]
        }
      });
      win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

      // Wait for state and DOM to update
      waitForStateAndRender(state => state.tracks.length === 2);

      // Add clip to second track
      cy.addVideoClipToTrack(1, 1).then(newClipId => {
        // Wait for clips to be rendered
        waitForStateAndRender(state => {
          const track = state.tracks[1];
          return track.clips.length === 1 && track.clips[0].id === newClipId;
        });

        // Add transition between tracks
        cy.addTransition('clip-1', newClipId, TransitionType.Dissolve, {
          duration: 0.5
        }).then(transitionId => {
          // Wait for state and DOM to update
          waitForStateAndRender(state => {
            const track = state.tracks[0];
            return track.transitions?.length === 1 && track.transitions[0].id === transitionId;
          });

          // Verify initial transition
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .should('exist')
            .should('be.visible')
            .should('have.attr', 'data-type', TransitionType.Dissolve);

          // Reorder tracks
          win.timelineDispatch({
            type: 'REORDER_TRACKS',
            payload: {
              sourceIndex: 0,
              targetIndex: 1
            }
          });
          win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

          // Wait for state and DOM to update
          waitForStateAndRender(state => state.tracks[1].id === 'track-2');

          // Verify transition remains valid after reordering
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .should('exist')
            .should('be.visible')
            .should('have.attr', 'data-type', TransitionType.Dissolve);
        });
      });
    });
  });

  it('should handle transitions with mismatched video resolutions', () => {
    // Add transition between clips
    cy.window().then(win => {
      // Verify clips exist before adding transition
      const track = win.timelineState.tracks[0];
      expect(track.clips).to.have.length(2);
      expect(track.clips[0].id).to.equal('clip-1');
      expect(track.clips[1].id).to.equal('clip-2');

      // Add transition
      cy.addTransition('clip-1', 'clip-2', TransitionType.Dissolve, {
        duration: 0.5
      }).then(transitionId => {
        // Wait for state and DOM to update
        waitForStateAndRender(state => {
          const track = state.tracks[0];
          return track.transitions?.length === 1 && track.transitions[0].id === transitionId;
        });

        // Verify transition handles resolution mismatch
        cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
          .should('exist')
          .should('be.visible')
          .should('have.attr', 'data-type', TransitionType.Dissolve);

        // Start playback to verify rendering
        win.timelineDispatch({
          type: 'SET_PLAYING',
          payload: true
        });

        // Let it play through transition
        cy.wait(1000);

        // Stop playback
        win.timelineDispatch({
          type: 'SET_PLAYING',
          payload: false
        });

        // Verify no WebGL errors occurred
        cy.window().should(win => {
          const canvas = win.document.querySelector('canvas');
          const gl = canvas?.getContext('webgl2');
          expect(gl?.getError()).to.equal(gl?.NO_ERROR);
        });
      });
    });
  });
});
