import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { TransitionType } from '../../../../src/renderer/types/transition';

describe('Timeline Transition Performance', { testIsolation: true }, () => {
  beforeEach(() => {
    // Initialize test environment and wait for it to complete
    return setupTransitionTest().then(() => {
      // Clear any existing state first
      cy.window().then(win => {
        win.timelineDispatch({ type: 'CLEAR_STATE' });
        win.timelineDispatch({ type: 'CLEAR_MEDIA_BIN' });
        win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
        cy.wait(500);

        // Set empty state explicitly
        win.timelineDispatch({
          type: 'SET_STATE',
          payload: {
            ...win.timelineState,
            tracks: [],
            mediaBin: { items: [] }
          }
        });
        win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
      });

      // Verify initial state
      cy.window().should(win => {
        expect(win.timelineState.tracks).to.have.length(0);
        expect(win.timelineState.mediaBin.items).to.have.length(0);
      });

      cy.get('[data-testid="timeline-clip"]').should('have.length', 0);
      cy.get('[data-testid="timeline-transition"]').should('have.length', 0);
    });
  });

  afterEach(() => {
    // Clean up state
    cy.window().then(win => {
      // Remove all transitions first
      const state = win.timelineState;
      if (state?.tracks) {
        state.tracks.forEach((track: any) => {
          if (track.transitions) {
            track.transitions.forEach((transition: any) => {
              win.timelineDispatch({
                type: 'REMOVE_TRANSITION',
                payload: { transitionId: transition.id }
              });
            });
          }
        });
      }

      // Clear state and wait for it to be cleared
      win.timelineDispatch({ type: 'CLEAR_STATE' });
      win.timelineDispatch({ type: 'CLEAR_MEDIA_BIN' });
      win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

      // Wait for cleanup
      cy.wait(500);

      // Set empty state explicitly
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          tracks: [],
          mediaBin: { items: [] }
        }
      });
      win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

      // Verify cleanup
      cy.window().should(win => {
        expect(win.timelineState.tracks).to.have.length(0);
        expect(win.timelineState.mediaBin.items).to.have.length(0);
      });

      cy.get('[data-testid="timeline-clip"]').should('have.length', 0);
      cy.get('[data-testid="timeline-transition"]').should('have.length', 0);
    });
  });

  it('should handle multiple simultaneous transitions', () => {
    // Create track first
    cy.window().then(win => {
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          tracks: [
            {
              id: 'track-1',
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
      cy.wait(500);
    });

    // Verify track was created
    cy.window().should(win => {
      expect(win.timelineState.tracks).to.have.length(1);
      expect(win.timelineState.tracks[0].clips).to.have.length(0);
    });

    // Add clips sequentially
    const clipCount = 6;
    for (let i = 0; i < clipCount; i++) {
      cy.addVideoClipToTrack(0, i * 1.0); // Each clip 1s long
      cy.wait(200); // Wait for each clip to be added
    }

    // Verify all clips were added
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', clipCount)
      .should('be.visible');

    // Add transitions between clips
    cy.then(() => {
      cy.get('[data-testid="timeline-clip"]')
        .should('have.length', clipCount)
        .then($clips => {
          // Create array of clip IDs
          const clipIds = $clips.toArray()
            .map(clip => clip.getAttribute('data-clip-id'))
            .filter((id): id is string => id !== null);

          // Start performance monitoring
          cy.monitorGPU();
          let startMemory: number;

          // Measure initial memory
          cy.checkMemoryUsage().then(initialMemory => {
            startMemory = initialMemory.jsHeapSize;
            cy.log(`Initial memory usage: ${startMemory / 1024 / 1024} MB`);
          });

          // Add transitions between each pair of clips
          cy.measurePerformance(() => {
            for (let i = 0; i < clipIds.length - 1; i++) {
              cy.addTransition(clipIds[i], clipIds[i + 1], TransitionType.Dissolve, {
                duration: 0.5
              });
            }
          }).then(metrics => {
            cy.log(`Performance metrics for adding transitions:`, metrics);
            expect(metrics.frameDrops).to.be.below(10); // Allow some frame drops but not too many
          });

          // Verify all transitions were created
          cy.get('[data-testid="timeline-transition"]')
            .should('have.length', clipCount - 1)
            .should('be.visible');

          // Check final memory usage
          cy.checkMemoryUsage().then(finalMemory => {
            cy.log(`Final memory usage: ${finalMemory.jsHeapSize / 1024 / 1024} MB`);
            // Memory increase should be reasonable
            expect(finalMemory.jsHeapSize - startMemory)
              .to.be.below(100 * 1024 * 1024); // Less than 100MB increase
          });
        });
    });
  });

  it('should maintain performance during playback with transitions', { defaultCommandTimeout: 60000 }, () => {
    // Create track first
    cy.window().then(win => {
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          tracks: [
            {
              id: 'track-1',
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
      cy.wait(500);
    });

    // Add clips sequentially
    cy.addVideoClipToTrack(0, 0);
    cy.wait(200);
    cy.addVideoClipToTrack(0, 1);
    cy.wait(200);

    // Verify clips were added
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .should('be.visible')
      .then(() => {
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 2)
          .then($clips => {
            const fromClipId = $clips[0].getAttribute('data-clip-id');
            const toClipId = $clips[1].getAttribute('data-clip-id');

            if (!fromClipId || !toClipId) {
              throw new Error('Failed to get clip IDs');
            }

            // Add transition
            cy.addTransition(fromClipId, toClipId, TransitionType.Dissolve, {
              duration: 0.5
            });

            // Start playback and measure performance
            cy.measurePerformance(() => {
              cy.window().then(win => {
                win.timelineDispatch({
                  type: 'SET_PLAYING',
                  payload: true
                });
              });

              // Let it play for a few seconds
              cy.wait(3000);

              cy.window().then(win => {
                win.timelineDispatch({
                  type: 'SET_PLAYING',
                  payload: false
                });
              });
            }).then(metrics => {
              cy.log('Playback performance metrics:', metrics);
              expect(metrics.frameDrops).to.be.below(5); // Stricter limit during playback
            });
          });
      });
  });

  it('should handle rapid transition creation/deletion', { defaultCommandTimeout: 60000 }, () => {
    // Create track first
    cy.window().then(win => {
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          tracks: [
            {
              id: 'track-1',
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
      cy.wait(500);
    });

    // Add clips sequentially
    cy.addVideoClipToTrack(0, 0);
    cy.wait(200);
    cy.addVideoClipToTrack(0, 1);
    cy.wait(200);

    // Verify clips were added
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .should('be.visible')
      .then(() => {
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 2)
          .then($clips => {
            const fromClipId = $clips[0].getAttribute('data-clip-id');
            const toClipId = $clips[1].getAttribute('data-clip-id');

            if (!fromClipId || !toClipId) {
              throw new Error('Failed to get clip IDs');
            }

            // Monitor memory before operations
            let startMemory: number;
            cy.checkMemoryUsage().then(initialMemory => {
              startMemory = initialMemory.jsHeapSize;
              cy.log(`Initial memory: ${startMemory / 1024 / 1024} MB`);

              // Rapidly create and delete transitions
              cy.measurePerformance(() => {
                for (let i = 0; i < 10; i++) {
                  // Add transition
                  cy.addTransition(fromClipId, toClipId, TransitionType.Dissolve, {
                    duration: 0.5
                  }).then(transitionId => {
                    // Immediately remove it
                    cy.window().then(win => {
                      win.timelineDispatch({
                        type: 'REMOVE_TRANSITION',
                        payload: { transitionId }
                      });
                    });
                  });
                }
              }).then(metrics => {
                cy.log('Rapid operation metrics:', metrics);
                expect(metrics.frameDrops).to.be.below(15);
              });

              // Check for memory leaks
              cy.checkMemoryUsage().then(finalMemory => {
                cy.log(`Final memory: ${finalMemory.jsHeapSize / 1024 / 1024} MB`);
                // Memory should be relatively stable
                expect(finalMemory.jsHeapSize - initialMemory.jsHeapSize)
                  .to.be.below(50 * 1024 * 1024); // Less than 50MB increase
              });
            });
          });
      });
  });

  it('should handle transitions during timeline zoom/scroll', () => {
    // Create track first
    cy.window().then(win => {
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          tracks: [
            {
              id: 'track-1',
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
      cy.wait(500);
    });

    // Add clips sequentially
    const clipCount = 4;
    for (let i = 0; i < clipCount; i++) {
      cy.addVideoClipToTrack(0, i * 1.0); // Each clip 1s long
      cy.wait(200); // Wait for each clip to be added
    }

    // Verify all clips were added
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', clipCount)
      .should('be.visible')
      .then(() => {
      cy.get('[data-testid="timeline-clip"]')
        .should('have.length', 4)
        .then($clips => {
          const clipIds = $clips.toArray()
            .map(clip => clip.getAttribute('data-clip-id'))
            .filter((id): id is string => id !== null);

          if (clipIds.length < 2) {
            throw new Error('Not enough clips found');
          }

          // Add a transition
          cy.addTransition(clipIds[0], clipIds[1], TransitionType.Dissolve, {
            duration: 0.5
          });

          // Measure performance while zooming and scrolling
          cy.measurePerformance(() => {
            // Zoom operations
            cy.window().then(win => {
              for (let zoom = 50; zoom <= 200; zoom += 25) {
                win.timelineDispatch({
                  type: 'SET_ZOOM',
                  payload: zoom
                });
              }
            });

            // Scroll operations
            cy.window().then(win => {
              for (let scroll = 0; scroll <= 1000; scroll += 100) {
                win.timelineDispatch({
                  type: 'SET_SCROLL_LEFT',
                  payload: scroll
                });
              }
            });
          }).then(metrics => {
            cy.log('Zoom/scroll performance metrics:', metrics);
            expect(metrics.frameDrops).to.be.below(20);
          });

          // Verify transition remained stable
          cy.get('[data-testid="timeline-transition"]')
            .should('have.length', 1)
            .should('be.visible')
            .should('have.attr', 'data-type', TransitionType.Dissolve);
        });
    });
  });
});
