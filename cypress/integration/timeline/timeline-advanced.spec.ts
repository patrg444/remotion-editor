import { TimelineState, ActionTypes } from '../../../src/renderer/types/timeline';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
};

describe('Timeline Advanced Operations', () => {
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
      // First clear any existing state
      win.timelineState.dispatch({
        type: 'CLEAR_STATE'
      });

      // Then initialize with empty state
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

      // Also clear any ripple state
      win.timelineState.rippleState = {};
    });

    // Wait for state to be initialized and verify it's empty
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks).to.exist;
      expect(win.timelineState.tracks).to.have.length(0);
    });

    // Verify no clips exist
    cy.get('.timeline-clip').should('not.exist');

    // Wait for any animations to complete
    cy.wait(500);
  });

  afterEach(() => {
    // Clear state after each test
    cy.window().then((win: any) => {
      win.timelineState.dispatch({
        type: 'CLEAR_STATE'
      });
    });
  });

  describe('Edge Cases with Partial Media Usage', () => {
    beforeEach(() => {
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

      // Verify no clips exist
      cy.get('.timeline-clip').should('not.exist');
    });

    it('should correctly split a clip that uses only a middle portion of its source', () => {
      // Add a clip that represents only the middle portion (1s to 3s) of a 5s source
      cy.window().then((win: any) => {
        const trackId = win.timelineState.tracks[0].id;
        win.timelineState.dispatch({
          type: 'ADD_CLIP',
          payload: {
            trackId,
            clip: {
              id: 'partial-clip',
              type: 'video',
              name: 'test.webm',
              path: '/test.webm',
              duration: 2,
              width: 1920,
              height: 1080,
              fps: 30,
              frames: 150,
              startTime: 1,      // on timeline
              endTime: 3,        // on timeline
              mediaOffset: 1,    // start 1s into source
              mediaDuration: 5,  // total source length is 5s
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
                startPosition: 1,
                endPosition: 3
              },
              initialBounds: {
                startTime: 1,
                endTime: 3,
                mediaOffset: 1,
                mediaDuration: 5
              }
            }
          }
        });
      });

      // Wait for clip to be rendered
      cy.get('.timeline-clip')
        .should('exist')
        .and('be.visible')
        .should('have.length', 1);

      // Verify initial state of the partial clip
      cy.window().should((win: any) => {
        const clip = win.timelineState.tracks[0].clips.find((c: any) => c.id === 'partial-clip');
        expect(clip).to.exist;
        expect(clip.startTime).to.equal(1);
        expect(clip.endTime).to.equal(3);
        expect(clip.mediaOffset).to.equal(1);
        expect(clip.mediaDuration).to.equal(5);
      });

      // Split the clip at timeline time = 1.5 (0.5s into the clip)
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.SPLIT_CLIP,
          payload: {
            trackId: win.timelineState.tracks[0].id,
            clipId: 'partial-clip',
            time: 1.5
          }
        });
      });

      // Wait for split clips to appear
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify split results
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(2);

        const firstChild = clips.find((c: any) => c.id === 'partial-clip-1');
        const secondChild = clips.find((c: any) => c.id === 'partial-clip-2');

        // First child: timeline 1->1.5
        expect(firstChild.startTime).to.equal(1);
        expect(firstChild.endTime).to.equal(1.5);
        // The offset shouldn't change for the first child—still offset=1
        expect(firstChild.mediaOffset).to.equal(1);
        // Full media reference
        expect(firstChild.mediaDuration).to.equal(5);
        expect(firstChild.initialBounds.mediaDuration).to.equal(5);

        // Second child: timeline 1.5->3
        expect(secondChild.startTime).to.equal(1.5);
        expect(secondChild.endTime).to.equal(3);
        // The offset should now be parentOffset + (1.5 - 1) = 1 + 0.5 = 1.5
        expect(secondChild.mediaOffset).to.equal(1.5);
        // Full media reference
        expect(secondChild.mediaDuration).to.equal(5);
        expect(secondChild.initialBounds.mediaDuration).to.equal(5);
      });
    });
  });

  describe('Undo/Redo Operations', () => {
    beforeEach(() => {
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

      // Verify no clips exist
      cy.get('.timeline-clip').should('not.exist');
    });

    it('should correctly undo/redo a split operation', () => {
      // Add initial clip
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
        .and('be.visible')
        .should('have.length', 1);

      // Store initial clip state
      let initialClipState: any;
      cy.window().then((win: any) => {
        initialClipState = win.timelineState.tracks[0].clips[0];
      });

      // Split the clip
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.SPLIT_CLIP,
          payload: {
            trackId: win.timelineState.tracks[0].id,
            clipId: 'test-clip',
            time: 1
          }
        });
      });

      // Wait for split clips to appear
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify split state
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(2);
      });

      // Undo the split
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.UNDO
        });
      });

      // Wait for clips to update after undo
      cy.get('.timeline-clip')
        .should('have.length', 1)
        .should('be.visible');

      // Verify state is restored to pre-split
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(1);
        const restoredClip = clips[0];
        expect(restoredClip.id).to.equal(initialClipState.id);
        expect(restoredClip.startTime).to.equal(initialClipState.startTime);
        expect(restoredClip.endTime).to.equal(initialClipState.endTime);
        expect(restoredClip.mediaOffset).to.equal(initialClipState.mediaOffset);
        expect(restoredClip.mediaDuration).to.equal(initialClipState.mediaDuration);
        expect(restoredClip.initialBounds).to.deep.equal(initialClipState.initialBounds);
      });

      // Redo the split
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.REDO
        });
      });

      // Wait for clips to update after redo
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify split is reapplied
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(2);
        const firstChild = clips.find((c: any) => c.id === 'test-clip-1');
        const secondChild = clips.find((c: any) => c.id === 'test-clip-2');
        expect(firstChild.startTime).to.equal(0);
        expect(firstChild.endTime).to.equal(1);
        expect(secondChild.startTime).to.equal(1);
        expect(secondChild.endTime).to.equal(2);
      });
    });

    it('should correctly undo/redo a trim operation', () => {
      // Add initial clip
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
        .and('be.visible')
        .should('have.length', 1);

      // Store initial clip state
      let initialClipState: any;
      cy.window().then((win: any) => {
        initialClipState = win.timelineState.tracks[0].clips[0];
      });

      // Trim the clip
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.TRIM_CLIP,
          payload: {
            clipId: 'test-clip',
            endTime: 3,
            ripple: false
          }
        });
      });

      // Wait for clip to update after trim
      cy.get('.timeline-clip')
        .should('have.length', 1)
        .should('be.visible');

      // Verify trim state
      cy.window().should((win: any) => {
        const clip = win.timelineState.tracks[0].clips[0];
        expect(clip.endTime).to.equal(3);
      });

      // Undo the trim
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.UNDO
        });
      });

      // Wait for clip to update after undo
      cy.get('.timeline-clip')
        .should('have.length', 1)
        .should('be.visible');

      // Verify state is restored to pre-trim
      cy.window().should((win: any) => {
        const clip = win.timelineState.tracks[0].clips[0];
        expect(clip.id).to.equal(initialClipState.id);
        expect(clip.startTime).to.equal(initialClipState.startTime);
        expect(clip.endTime).to.equal(initialClipState.endTime);
        expect(clip.mediaOffset).to.equal(initialClipState.mediaOffset);
        expect(clip.mediaDuration).to.equal(initialClipState.mediaDuration);
        expect(clip.initialBounds).to.deep.equal(initialClipState.initialBounds);
      });

      // Redo the trim
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.REDO
        });
      });

      // Wait for clip to update after redo
      cy.get('.timeline-clip')
        .should('have.length', 1)
        .should('be.visible');

      // Verify trim is reapplied
      cy.window().should((win: any) => {
        const clip = win.timelineState.tracks[0].clips[0];
        expect(clip.endTime).to.equal(3);
      });
    });

    it('should correctly handle multiple undo/redo operations (split followed by trim)', () => {
      // Add initial clip
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
        .and('be.visible')
        .should('have.length', 1);

      // Store initial clip state
      let initialClipState: any;
      cy.window().then((win: any) => {
        initialClipState = win.timelineState.tracks[0].clips[0];
      });

      // Split the clip
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.SPLIT_CLIP,
          payload: {
            trackId: win.timelineState.tracks[0].id,
            clipId: 'test-clip',
            time: 1
          }
        });
      });

      // Wait for split clips to appear
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Store split state
      let splitState: any;
      cy.window().then((win: any) => {
        splitState = {
          clips: win.timelineState.tracks[0].clips,
          history: win.timelineState.history
        };
      });

      // Trim the first child clip
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.TRIM_CLIP,
          payload: {
            clipId: 'test-clip-1',
            endTime: 1.5,
            ripple: false
          }
        });
      });

      // Wait for clips to update after trim
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Store trimmed state
      let trimmedState: any;
      cy.window().then((win: any) => {
        trimmedState = {
          clips: win.timelineState.tracks[0].clips,
          history: win.timelineState.history
        };
      });

      // Undo trim
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.UNDO
        });
      });

      // Wait for clips to update after undo
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify state matches post-split state
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(2);
        const firstChild = clips.find((c: any) => c.id === 'test-clip-1');
        expect(firstChild.endTime).to.equal(1);
      });

      // Undo split
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.UNDO
        });
      });

      // Wait for clips to update after undo
      cy.get('.timeline-clip')
        .should('have.length', 1)
        .should('be.visible');

      // Verify state matches initial state
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(1);
        const clip = clips[0];
        expect(clip.id).to.equal(initialClipState.id);
        expect(clip.startTime).to.equal(initialClipState.startTime);
        expect(clip.endTime).to.equal(initialClipState.endTime);
      });

      // Redo split
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.REDO
        });
      });

      // Wait for clips to update after redo
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify split is reapplied
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips.length).to.equal(2);
        const firstChild = clips.find((c: any) => c.id === 'test-clip-1');
        const secondChild = clips.find((c: any) => c.id === 'test-clip-2');
        expect(firstChild.endTime).to.equal(1);
        expect(secondChild.startTime).to.equal(1);
      });

      // Redo trim
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.REDO
        });
      });

      // Wait for clips to update after redo
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify trim is reapplied
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        const firstChild = clips.find((c: any) => c.id === 'test-clip-1');
        expect(firstChild.endTime).to.equal(1.5);
      });
    });
  });

  describe('Cross-Track Operations', () => {
    beforeEach(() => {
      // Add two tracks
      cy.window().then((win: any) => {
        // Add first track
        const track1Id = `track-1-${Date.now()}`;
        win.timelineState.dispatch({
          type: 'ADD_TRACK',
          payload: {
            track: {
              id: track1Id,
              name: 'Video Track A',
              type: 'video',
              clips: []
            }
          }
        });

        // Add second track
        const track2Id = `track-2-${Date.now()}`;
        win.timelineState.dispatch({
          type: 'ADD_TRACK',
          payload: {
            track: {
              id: track2Id,
              name: 'Video Track B',
              type: 'video',
              clips: []
            }
          }
        });
      });

      // Wait for tracks to be added
      cy.window().should((win: any) => {
        expect(win.timelineState.tracks).to.have.length(2);
      });

      // Verify no clips exist
      cy.get('.timeline-clip').should('not.exist');
    });

    it('should maintain clip properties when moving between tracks', () => {
      // Add clip to first track
      cy.window().then((win: any) => {
        const track1Id = win.timelineState.tracks[0].id;
        win.timelineState.dispatch({
          type: 'ADD_CLIP',
          payload: {
            trackId: track1Id,
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
        .and('be.visible')
        .should('have.length', 1);

      // Store initial clip state
      let initialClipState: any;
      cy.window().then((win: any) => {
        initialClipState = win.timelineState.tracks[0].clips[0];
      });

      // Split the clip
      cy.window().then((win: any) => {
        win.timelineState.dispatch({
          type: ActionTypes.SPLIT_CLIP,
          payload: {
            trackId: win.timelineState.tracks[0].id,
            clipId: 'test-clip',
            time: 1
          }
        });
      });

      // Wait for split clips to appear
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Move second child to Track B at timeline position 5
      cy.window().then((win: any) => {
        const track2Id = win.timelineState.tracks[1].id;
        win.timelineState.dispatch({
          type: ActionTypes.MOVE_CLIP,
          payload: {
            clipId: 'test-clip-2',
            fromTrackId: win.timelineState.tracks[0].id,
            toTrackId: track2Id,
            newStartTime: 5
          }
        });
      });

      // Wait for clips to update after move
      cy.get('.timeline-clip')
        .should('have.length', 2)
        .should('be.visible');

      // Verify clip properties after move
      cy.window().should((win: any) => {
        // First track should have only the first child
        const track1Clips = win.timelineState.tracks[0].clips;
        expect(track1Clips.length).to.equal(1);
        const firstChild = track1Clips[0];
        expect(firstChild.id).to.equal('test-clip-1');
        expect(firstChild.startTime).to.equal(0);
        expect(firstChild.endTime).to.equal(1);
        expect(firstChild.mediaOffset).to.equal(0);
        expect(firstChild.mediaDuration).to.equal(5);

        // Second track should have the moved clip
        const track2Clips = win.timelineState.tracks[1].clips;
        expect(track2Clips.length).to.equal(1);
        const movedClip = track2Clips[0];
        expect(movedClip.id).to.equal('test-clip-2');
        expect(movedClip.startTime).to.equal(5);
        expect(movedClip.endTime).to.equal(6);
        expect(movedClip.mediaOffset).to.equal(1);
        expect(movedClip.mediaDuration).to.equal(5);
        expect(movedClip.initialBounds.mediaDuration).to.equal(5);
      });
    });
  });
});
