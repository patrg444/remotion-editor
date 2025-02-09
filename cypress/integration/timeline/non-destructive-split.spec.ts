import { TimelineState, ActionTypes } from '../../../src/renderer/types/timeline';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
};

describe('Non-Destructive Split and Trim', () => {
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

    // Initialize ripple state
    cy.window().then((win: any) => {
      win.timelineState.rippleState = {};
    });

    // Wait for state to stabilize
    cy.wait(1000);
  });

  it('should split a clip non-destructively and clamp trimming correctly', () => {
    // Add clip with 5 second media duration
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

    // Get initial state
    cy.window().then((win: any) => {
      expect(win.timelineState.tracks).to.have.length(1);
      expect(win.timelineState.tracks[0].clips).to.have.length(1);
      
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];
      
      cy.log('Initial clip state:', {
        id: firstClip.id,
        startTime: firstClip.startTime,
        endTime: firstClip.endTime,
        mediaDuration: firstClip.mediaDuration,
        initialBounds: firstClip.initialBounds
      });
      
      // Split the first clip at 1 second
      win.timelineState.dispatch({
        type: ActionTypes.SPLIT_CLIP,
        payload: {
          trackId: win.timelineState.tracks[0].id,
          clipId: firstClip.id,
          time: 1
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
      expect(clips).to.have.length(2);
      const firstChild = clips.find((c: any) => c.id === 'test-clip-1');
      const secondChild = clips.find((c: any) => c.id === 'test-clip-2');
      
      // Validate timeline boundaries
      expect(firstChild.startTime).to.equal(0);
      expect(firstChild.endTime).to.equal(1);
      expect(secondChild.startTime).to.equal(1);
      expect(secondChild.endTime).to.equal(2);
      
      // Validate media offsets and full media durations
      expect(firstChild.mediaOffset).to.equal(0);
      expect(secondChild.mediaOffset).to.equal(1);
      expect(firstChild.mediaDuration).to.equal(5);
      expect(secondChild.mediaDuration).to.equal(5);
      
      // Validate initialBounds remain with full mediaDuration
      expect(firstChild.initialBounds.mediaDuration).to.equal(5);
      expect(secondChild.initialBounds.mediaDuration).to.equal(5);
    });
    
    // Extend first child clip to 3 seconds
    cy.window().then((win: WindowWithTimeline) => {
      win.timelineState.dispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          clipId: 'test-clip-1',
          endTime: 3,
          ripple: false
        }
      });
    });
    
    // Verify trim results
    cy.window().should((win: any) => {
      const firstChild = win.timelineState.tracks[0].clips.find((c: any) => c.id === 'test-clip-1');
      
      // The new endTime should be 3 (within the allowed range)
      expect(firstChild.endTime).to.equal(3);
      
      // initialBounds should remain unchanged
      expect(firstChild.initialBounds.startTime).to.equal(0);
      expect(firstChild.initialBounds.endTime).to.equal(1);
      expect(firstChild.initialBounds.mediaDuration).to.equal(5);
    });
  });

  it('should split a clip that is partially trimmed in the middle of the source', () => {
    // Clear any existing clips
    cy.window().then((win: any) => {
      const trackId = win.timelineState.tracks[0].id;
      win.timelineState.dispatch({
        type: 'SET_TRACK_CLIPS',
        payload: {
          trackId,
          clips: []
        }
      });
    });

    // Wait for clips to be cleared
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks[0].clips).to.have.length(0);
    });

    // Add a clip representing only a middle portion of the source media
    cy.window().then((win: any) => {
      const trackId = win.timelineState.tracks[0].id;
      win.timelineState.dispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId,
          clip: {
            id: 'trimmed-clip',
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
            mediaOffset: 1,    // we start 1s into the source
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
      .and('be.visible');

    // Verify initial state of the trimmed clip
    cy.window().should((win: any) => {
      const clip = win.timelineState.tracks[0].clips.find((c: any) => c.id === 'trimmed-clip');
      expect(clip).to.exist;
      expect(clip.startTime).to.equal(1);
      expect(clip.endTime).to.equal(3);
      expect(clip.mediaOffset).to.equal(1);
      expect(clip.mediaDuration).to.equal(5);
    });

    // Split the clip at timeline time = 2 (which is within 1..3)
    cy.window().then((win: any) => {
      win.timelineState.dispatch({
        type: ActionTypes.SPLIT_CLIP,
        payload: {
          trackId: win.timelineState.tracks[0].id,
          clipId: 'trimmed-clip',
          time: 2
        }
      });
    });

    // Wait for split clips to appear
    cy.get('.timeline-clip')
      .should('have.length', 2)
      .should('be.visible');

    // Check that we now have two child clips
    cy.window().should((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      expect(clips.length).to.equal(2);

      const firstChild = clips.find((c: any) => c.id === 'trimmed-clip-1');
      const secondChild = clips.find((c: any) => c.id === 'trimmed-clip-2');

      // First child: timeline 1->2
      expect(firstChild.startTime).to.equal(1);
      expect(firstChild.endTime).to.equal(2);
      // The offset shouldn't change for the first child—still offset=1
      expect(firstChild.mediaOffset).to.equal(1);
      // Full media reference
      expect(firstChild.mediaDuration).to.equal(5);
      expect(firstChild.initialBounds.mediaDuration).to.equal(5);

      // Second child: timeline 2->3
      expect(secondChild.startTime).to.equal(2);
      expect(secondChild.endTime).to.equal(3);
      // The offset should now be parentOffset + (2 - 1) = 1 + 1 = 2
      expect(secondChild.mediaOffset).to.equal(2);
      // Full media reference
      expect(secondChild.mediaDuration).to.equal(5);
      expect(secondChild.initialBounds.mediaDuration).to.equal(5);
    });
  });
});
