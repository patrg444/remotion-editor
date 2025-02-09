import { timeToPixels } from '../../../src/renderer/utils/timelineScale';
import { TimelineState, ActionTypes } from '../../../src/renderer/types/timeline';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
};

describe('Timeline Ripple Extension', () => {
  beforeEach(() => {
    // Visit app and wait for it to load
    cy.visit('http://localhost:8083');
    cy.get('[data-testid="app-root"]').should('exist');

    // Wait for timeline UI
    cy.get('[data-testid="timeline"]', { timeout: 10000 })
      .should('exist')
      .and('be.visible');

    // Initialize empty timeline state
    cy.window().then((win: any) => {
      win.timelineState.dispatch({
        type: 'SET_STATE',
        payload: {
          tracks: [],
          currentTime: 0,
          duration: 0,
          zoom: 1,
          fps: 30,
          isPlaying: false,
          isDragging: false,
          scrollX: 0,
          scrollY: 0,
          scrollLeft: 0,
          selectedClipIds: [],
          selectedCaptionIds: [],
          markers: [],
          history: {
            entries: [],
            currentIndex: -1
          }
        }
      });
    });

    // Wait for state to be initialized
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks).to.exist;
      expect(win.timelineState.tracks).to.have.length(0);
    });

    // Add track
    cy.window().then((win: any) => {
      const trackId = `track-${Date.now()}`;
      win.timelineState.dispatch({
        type: 'ADD_TRACK',
        payload: {
          track: {
            id: trackId,
            name: 'Video Track',
            type: 'video',
            clips: []
          }
        }
      });
    });

    // Wait for track to be added
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks).to.have.length(1);
    });

    // Add first clip with longer media duration than initial duration
    cy.window().then((win: any) => {
      const trackId = win.timelineState.tracks[0].id;
      win.timelineState.dispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId,
          clip: {
            id: 'test-clip',
            type: 'video',
            name: 'test.webm',
            path: '/test.webm',
            duration: 2,
            width: 1920,
            height: 1080,
            fps: 30,
            frames: 150,
            startTime: 0,
            endTime: 2,
            mediaOffset: 0,
            mediaDuration: 5,
            transform: {
              scale: 1,
              rotation: 0,
              position: { x: 0, y: 0 },
              opacity: 1
            },
            content: {
              frames: Array.from({ length: 60 }, (_, i) => ({
                index: i,
                timestamp: i / 30
              })),
              currentFrame: 0,
              isPlaying: false
            },
            effects: [],
            handles: {
              startPosition: 0,
              endPosition: 2
            },
            initialBounds: {
              startTime: 0,
              endTime: 2,
              mediaOffset: 0,
              mediaDuration: 5
            }
          }
        }
      });
    });

    // Wait for clip to be rendered
    cy.get('.timeline-clip')
      .should('exist')
      .and('be.visible');

    // Wait for clip to be added
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks[0].clips).to.have.length(1);
    });

    // Add second clip with a 1-second gap
    cy.window().then((win: any) => {
      const trackId = win.timelineState.tracks[0].id;
      win.timelineState.dispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId,
          clip: {
            id: 'test-clip-2',
            type: 'video',
            name: 'test.webm',
            path: '/test.webm',
            duration: 2,
            width: 1920,
            height: 1080,
            fps: 30,
            frames: 150,
            startTime: 3,
            endTime: 5,
            mediaOffset: 0,
            mediaDuration: 5,
            transform: {
              scale: 1,
              rotation: 0,
              position: { x: 0, y: 0 },
              opacity: 1
            },
            content: {
              frames: Array.from({ length: 60 }, (_, i) => ({
                index: i,
                timestamp: i / 30
              })),
              currentFrame: 0,
              isPlaying: false
            },
            effects: [],
            handles: {
              startPosition: 0,
              endPosition: 2
            },
            initialBounds: {
              startTime: 3,
              endTime: 5,
              mediaOffset: 0,
              mediaDuration: 5
            }
          }
        }
      });
    });

    // Add third clip with a 1-second gap
    cy.window().then((win: any) => {
      const trackId = win.timelineState.tracks[0].id;
      win.timelineState.dispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId,
          clip: {
            id: 'test-clip-3',
            type: 'video',
            name: 'test.webm',
            path: '/test.webm',
            duration: 2,
            width: 1920,
            height: 1080,
            fps: 30,
            frames: 150,
            startTime: 6,
            endTime: 8,
            mediaOffset: 0,
            mediaDuration: 5,
            transform: {
              scale: 1,
              rotation: 0,
              position: { x: 0, y: 0 },
              opacity: 1
            },
            content: {
              frames: Array.from({ length: 60 }, (_, i) => ({
                index: i,
                timestamp: i / 30
              })),
              currentFrame: 0,
              isPlaying: false
            },
            effects: [],
            handles: {
              startPosition: 0,
              endPosition: 2
            },
            initialBounds: {
              startTime: 6,
              endTime: 8,
              mediaOffset: 0,
              mediaDuration: 5
            }
          }
        }
      });
    });

    // Wait for all clips to be rendered
    cy.get('.timeline-clip')
      .should('have.length', 3)
      .should('be.visible');

    // Initialize ripple state
    cy.window().then((win: any) => {
      win.timelineState.rippleState = {};
    });

    // Wait for state to stabilize
    cy.wait(1000);
  });

  describe('Ripple Mode Operations', () => {
    it('should shift subsequent clips in ripple mode based on available extension', () => {
      cy.window().then((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        const firstClip = clips[0];
        
        // Initialize ripple state
        win.timelineState.rippleState = {
          [firstClip.id]: { initialExtensionDone: false }
        };

        // Extend to 4 seconds
        win.timelineState.dispatch({
          type: ActionTypes.TRIM_CLIP,
          payload: {
            clipId: firstClip.id,
            endTime: 4,
            ripple: true
          }
        });

        // Verify extension
        cy.window().should((win: any) => {
          const clips = win.timelineState.tracks[0].clips;
          expect(clips[0].endTime - clips[0].startTime).to.be.within(3.9, 4.1);
          expect(clips[1].startTime).to.equal(5); // 1-second gap maintained
          expect(clips[2].startTime).to.equal(8); // 1-second gap maintained
        });
      });
    });

    it('should maintain minimum duration when trimming', () => {
      cy.window().then((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        const firstClip = clips[0];
        
        // Try to trim below minimum duration
        win.timelineState.dispatch({
          type: ActionTypes.TRIM_CLIP,
          payload: {
            clipId: firstClip.id,
            endTime: 0.05, // Try very short duration
            ripple: true
          }
        });

        // Verify minimum duration is maintained
        cy.window().should((win: any) => {
          const clips = win.timelineState.tracks[0].clips;
          const duration = clips[0].endTime - clips[0].startTime;
          expect(duration).to.be.at.least(0.1);
        });
      });
    });

    it('should maintain proper extension boundaries after splitting a clip', () => {
      cy.window().then((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        const firstClip = clips[0];
        
        // Split the first clip at 1 second
        win.timelineState.dispatch({
          type: ActionTypes.SPLIT_CLIP,
          payload: {
            trackId: win.timelineState.tracks[0].id,
            clipId: firstClip.id,
            time: 1
          }
        });

        // Wait for split to complete
        cy.get('.timeline-clip').should('have.length', 4);

        // Verify split results
        cy.window().should((win: any) => {
          const clips = win.timelineState.tracks[0].clips;
          const firstHalf = clips[0];
          const secondHalf = clips[1];
          
          // Both clips should have full media duration reference
          expect(firstHalf.initialBounds.mediaDuration).to.equal(5);
          expect(secondHalf.initialBounds.mediaDuration).to.equal(5);
          
          // Initialize ripple state for extension test
          win.timelineState.rippleState = {
            [firstHalf.id]: { initialExtensionDone: false }
          };

          // Try extending the first half
          win.timelineState.dispatch({
            type: ActionTypes.TRIM_CLIP,
            payload: {
              clipId: firstHalf.id,
              endTime: firstHalf.startTime + 3,
              ripple: true
            }
          });
        });

        // Verify extension
        cy.window().should((win: any) => {
          const clips = win.timelineState.tracks[0].clips;
          const firstHalf = clips[0];
          const duration = firstHalf.endTime - firstHalf.startTime;
          expect(duration).to.be.within(2.9, 3.1);
        });
      });
    });
  });
});
