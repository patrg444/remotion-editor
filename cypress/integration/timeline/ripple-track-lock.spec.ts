import { TimelineState, ActionTypes } from '../../../src/renderer/types/timeline';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
};

describe('Timeline Ripple Track Lock', () => {
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

    // Add two tracks
    cy.window().then((win: any) => {
      // Add first track
      const track1Id = `track-1-${Date.now()}`;
      win.timelineState.dispatch({
        type: 'ADD_TRACK',
        payload: {
          track: {
            id: track1Id,
            name: 'Video Track 1',
            type: 'video',
            clips: [],
            locked: false
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
            name: 'Video Track 2',
            type: 'video',
            clips: [],
            locked: true // This track will be locked
          }
        }
      });
    });

    // Wait for tracks to be added
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks).to.have.length(2);
      expect(win.timelineState.tracks[1].locked).to.be.true;
    });

    // Add clip to first track
    cy.window().then((win: any) => {
      const track1Id = win.timelineState.tracks[0].id;
      win.timelineState.dispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId: track1Id,
          clip: {
            id: 'test-clip-1',
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

    // Add clip to second (locked) track
    cy.window().then((win: any) => {
      const track2Id = win.timelineState.tracks[1].id;
      win.timelineState.dispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId: track2Id,
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

    // Wait for clips to be rendered
    cy.get('.timeline-clip')
      .should('have.length', 2)
      .should('be.visible');

    // Initialize ripple state
    cy.window().then((win: any) => {
      win.timelineState.rippleState = {};
    });

    // Wait for state to stabilize
    cy.wait(1000);
  });

  it('should not affect clips on locked tracks during ripple operations', () => {
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];
      
      // Initialize ripple state
      win.timelineState.rippleState = {
        [firstClip.id]: { initialExtensionDone: false }
      };

      // Record initial position of clip on locked track
      const lockedClipInitialStart = win.timelineState.tracks[1].clips[0].startTime;
      const lockedClipInitialEnd = win.timelineState.tracks[1].clips[0].endTime;

      // Extend first clip to 4 seconds
      win.timelineState.dispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          clipId: firstClip.id,
          endTime: 4,
          ripple: true
        }
      });

      // Verify extension and locked track state
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        const lockedClip = win.timelineState.tracks[1].clips[0];
        
        // First clip should extend
        expect(clips[0].endTime - clips[0].startTime).to.be.within(3.9, 4.1);
        
        // Locked track clip should not move
        expect(lockedClip.startTime).to.equal(lockedClipInitialStart);
        expect(lockedClip.endTime).to.equal(lockedClipInitialEnd);
      });
    });
  });

  it('should maintain locked track clip positions during ripple trim operations', () => {
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];
      
      // Record initial positions
      const lockedClipInitialStart = win.timelineState.tracks[1].clips[0].startTime;
      const lockedClipInitialEnd = win.timelineState.tracks[1].clips[0].endTime;

      // Try to trim below minimum duration
      win.timelineState.dispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          clipId: firstClip.id,
          endTime: 0.5,
          ripple: true
        }
      });

      // Verify trim results and locked track state
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        const lockedClip = win.timelineState.tracks[1].clips[0];
        
        // First clip should trim
        expect(clips[0].endTime - clips[0].startTime).to.be.within(0.4, 0.6);
        
        // Locked track clip should not move
        expect(lockedClip.startTime).to.equal(lockedClipInitialStart);
        expect(lockedClip.endTime).to.equal(lockedClipInitialEnd);
      });
    });
  });
});
