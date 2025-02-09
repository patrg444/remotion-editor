import { TimelineState, ActionTypes } from '../../../src/renderer/types/timeline';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
};

describe('Timeline Partial Media Usage', () => {
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

  afterEach(() => {
    // Clear state after each test
    cy.window().then((win: any) => {
      win.timelineState.dispatch({
        type: 'CLEAR_STATE'
      });
    });
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
