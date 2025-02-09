import { TimelineState, ActionTypes } from '../../../src/renderer/types/timeline';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
};

const clearTimelineState = () => {
  return cy.window().then((win: any) => {
    // First clear any existing state
    win.timelineState.dispatch({
      type: 'CLEAR_STATE'
    });

    // Wait for state to clear
    return cy.wait(100).then(() => {
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
          },
          rippleState: {}
        }
      });

      // Wait for state to be initialized and verify it's empty
      return cy.window().should((win: any) => {
        expect(win.timelineState.tracks).to.exist;
        expect(win.timelineState.tracks).to.have.length(0);
        expect(win.timelineState.history.entries).to.have.length(0);
        expect(win.timelineState.history.currentIndex).to.equal(-1);
      });
    });
  });
};

describe('Timeline Cross-Track Operations', () => {
  beforeEach(() => {
    // Visit app and wait for it to load
    cy.visit('http://localhost:8083');
    cy.get('[data-testid="app-root"]').should('exist');

    // Wait for timeline UI
    cy.get('[data-testid="timeline"]', { timeout: 10000 })
      .should('exist')
      .and('be.visible');

    // Clear and initialize state
    clearTimelineState();

    // Verify no clips exist
    cy.get('.timeline-clip').should('not.exist');

    // Wait for any animations to complete
    cy.wait(500);

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

      // Wait for first track to be added
      cy.wait(100);

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

    // Wait for tracks to be added and verify history
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks).to.have.length(2);
      expect(win.timelineState.history.entries).to.have.length(2);
      expect(win.timelineState.history.currentIndex).to.equal(1);
    });

    // Verify no clips exist
    cy.get('.timeline-clip').should('not.exist');
  });

  afterEach(() => {
    // Clear state after each test
    clearTimelineState();
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

    // Wait for clip to be rendered and verify history
    cy.get('.timeline-clip')
      .should('exist')
      .and('be.visible')
      .should('have.length', 1);

    cy.window().should((win: any) => {
      expect(win.timelineState.history.entries).to.have.length(3);
      expect(win.timelineState.history.currentIndex).to.equal(2);
    });

    // Store initial clip state
    let initialClipState: any;
    cy.window().then((win: any) => {
      initialClipState = win.timelineState.tracks[0].clips[0];
    });

    // Wait for state to stabilize
    cy.wait(100);

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

    // Wait for split clips to appear and verify history
    cy.get('.timeline-clip')
      .should('have.length', 2)
      .should('be.visible');

    cy.window().should((win: any) => {
      expect(win.timelineState.history.entries).to.have.length(4);
      expect(win.timelineState.history.currentIndex).to.equal(3);
    });

    // Wait for state to stabilize
    cy.wait(100);

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

    // Wait for clips to update after move and verify history
    cy.get('.timeline-clip')
      .should('have.length', 2)
      .should('be.visible');

    cy.window().should((win: any) => {
      expect(win.timelineState.history.entries).to.have.length(5);
      expect(win.timelineState.history.currentIndex).to.equal(4);

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
