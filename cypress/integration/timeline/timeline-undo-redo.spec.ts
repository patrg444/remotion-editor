import { TimelineState, ActionTypes, Clip } from '../../../src/renderer/types/timeline';
import { waitForTimelineInit, waitForTimelineReady, waitForTimelineState, debugTimelineState, logTimelineState, waitForHistoryOperation, waitForSplitOperation, waitForClipsToRender, waitForStateAndRender, logClipEvent } from '../../support/utils/timeline';
import { validateTimelineState, validateTimelineDispatch } from '../../support/utils/test-utils';
import { TimelineConstants } from '../../../src/renderer/utils/timelineConstants';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
  __originalClipId?: string;
};

type TimelineTrack = {
  id: string;
  clips: TimelineClip[];
};

type TimelineClip = {
  id: string;
  startTime: number;
  endTime: number;
  layer?: number;
  mediaOffset?: number;
  mediaDuration?: number;
};

describe('Timeline Undo/Redo Operations', () => {
  beforeEach(() => {
    // Fresh page load for each test
    cy.visit('http://localhost:8084', {
      onBeforeLoad(win) {
        // Add logging for timeline events
        const originalAddEventListener = win.addEventListener;
        win.addEventListener = function(
          this: Window,
          type: string,
          listener: EventListenerOrEventListenerObject,
          ...args: any[]
        ): void {
          if (type.startsWith('timeline:')) {
            const wrappedListener = function(this: Window, event: Event): void {
              console.log(`Timeline Event: ${type}`, (event as CustomEvent).detail);
              if (typeof listener === 'function') {
                return listener.apply(this, [event]);
              }
              return listener.handleEvent(event);
            };
            return originalAddEventListener.call(this, type, wrappedListener, ...args);
          }
          return originalAddEventListener.call(this, type, listener, ...args);
        };
      }
    });

    // Wait for MediaBin to be ready with logging
    cy.log('Waiting for MediaBin...');
    cy.waitForMediaBin();
    cy.log('MediaBin ready');

    // Wait for timeline to be ready with increased timeout
    cy.log('Waiting for timeline dispatch...');
    cy.window({ timeout: 30000 }).should('have.property', 'timelineDispatch');
    cy.log('Timeline dispatch ready');
    
    cy.log('Waiting for timeline ready flag...');
    cy.window({ timeout: 30000 }).should('have.property', 'timelineReady', true);
    cy.log('Timeline ready');

    // Clear any existing state with logging
    cy.log('Clearing timeline state...');
    cy.window().then(win => {
      console.log('Current state before clear:', win.timelineState);
      win.timelineDispatch({
        type: ActionTypes.CLEAR_STATE
      });
    });

    // Wait for state to be cleared with logging
    cy.log('Waiting for state to clear...');
    cy.window({ timeout: 30000 }).should(win => {
      const state = win.timelineState;
      console.log('Current state after clear:', state);
      expect(state.tracks).to.have.length(0);
      expect(state.history.entries).to.have.length(0);
      expect(state.history.currentIndex).to.equal(-1);
    });
    cy.log('State cleared');

    // Wait for DOM to clear with logging
    cy.log('Waiting for clips to be removed...');
    cy.get('[data-testid="timeline-clip"]', { timeout: 30000 }).should('not.exist');
    cy.log('Clips removed');

    // Add initial track with logging
    cy.log('Adding initial track...');
    cy.window().then(win => {
      const trackId = `track-${Date.now()}`;
      console.log('Adding track with ID:', trackId);
      win.timelineDispatch({
        type: ActionTypes.ADD_TRACK,
        payload: {
          track: {
            id: trackId,
            name: 'Video Track',
            type: 'video',
            clips: [],
            isLocked: false,
            isVisible: true,
            isMuted: false,
            allowOverlap: false,
            layers: [{ id: 'layer-1', index: 0, visible: true, locked: false }]
          }
        }
      });
    });

    // Wait for track to be added and rendered with logging and retries
    cy.log('Waiting for track to be added...');
    cy.window({ timeout: 30000 }).should(win => {
      const state = win.timelineState;
      console.log('Current state after track add:', state);
      expect(state.tracks).to.have.length(1);
    });
    cy.log('Track added to state');

    cy.log('Waiting for track to be rendered...');
    cy.get('[data-testid="timeline-track"]', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .and(($track) => {
        expect($track).to.have.length(1);
        const height = $track[0].getBoundingClientRect().height;
        console.log('Track rendered with height:', height);
        expect(height).to.be.greaterThan(0);
      });
    cy.log('Track rendered');
  });

  describe('Undo/Redo Actions', () => {
    let trackId: string;
    let clipId: string;
    const zoom = 1;

    beforeEach(() => {
      // Add initial clip
      cy.window().then(win => {
        trackId = win.timelineState.tracks[0].id;
        clipId = `clip-${Date.now()}`;
        (win as WindowWithTimeline).__originalClipId = clipId;

        logClipEvent('Adding Initial Clip', clipId, { trackId });

        win.timelineDispatch({
          type: ActionTypes.ADD_CLIP,
          payload: {
            trackId,
            clip: {
              id: clipId,
              type: 'video',
              name: 'test.webm',
              path: 'test.mp4',
              duration: 2,
              width: 1920,
              height: 1080,
              fps: 30,
              frames: 150,
              startTime: 0,
              endTime: 2,
              mediaOffset: 0,
              mediaDuration: 5,
              layer: 0,
              transform: {
                scale: 1,
                rotation: 0,
                position: { x: 0, y: 0 },
                opacity: 1
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

        // Wait for clip to be added
        waitForTimelineState(state => {
          return state.tracks.find((t: TimelineTrack) => t.id === trackId)?.clips.some((c: TimelineClip) => c.id === clipId) ?? false;
        });
      });
    });

    it('undoes split operation', () => {
      cy.window().then(win => {
        // First select the clip and wait for selection to be applied
        return new Cypress.Promise((resolve) => {
          // Select clip
          win.timelineDispatch({
            type: ActionTypes.SELECT_CLIPS,
            payload: {
              clipIds: [clipId]
            }
          });

          // Wait for selection to be applied
          function checkSelection() {
            const state = (win as any).timelineState;
            try {
              if (state.selectedClipIds?.includes(clipId)) {
                resolve(undefined);
              } else {
                requestAnimationFrame(checkSelection);
              }
            } catch (error) {
              console.error('Selection check error:', error);
              resolve(undefined); // Resolve anyway to prevent hanging
            }
          }

          checkSelection();
        }).then(() => {
          // Wait for DOM to reflect selection
          return cy.get(`[data-clip-id="${clipId}"]`)
            .should('exist')
            .should('be.visible')
            .should('have.attr', 'data-selected', 'true')
            .should('have.class', 'selected');
        }).then(() => {
          // Then split the clip
          win.timelineDispatch({
            type: ActionTypes.SPLIT_CLIP,
            payload: {
              trackId,
              clipId,
              time: 1
            }
          });
        });

        // Wait for split to complete
        waitForTimelineState(state => {
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 2) return false;
          
          const firstClip = track.clips.find((c: TimelineClip) => c.id === `${clipId}-1`);
          const secondClip = track.clips.find((c: TimelineClip) => c.id === `${clipId}-2`);
          
          if (!firstClip || !secondClip) return false;

          return firstClip.startTime === 0 && firstClip.endTime === 1 &&
                 secondClip.startTime === 1 && secondClip.endTime === 2;
        });

        // Wait for clips to be rendered
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 2)
          .then($clips => {
            const clipIds = Array.from($clips).map(clip => clip.getAttribute('data-clip-id'));
            expect(clipIds).to.include(`${clipId}-1`);
            expect(clipIds).to.include(`${clipId}-2`);
          });

        // Then undo
        logClipEvent('Undoing Split', clipId, {});
        win.timelineDispatch({
          type: ActionTypes.UNDO
        });

        // Wait for state to update
        waitForTimelineState(state => {
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 1) return false;
          
          const clip = track.clips[0];
          return clip.id === clipId && clip.startTime === 0 && clip.endTime === 2;
        });

        // Wait for clip to be rendered
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 1)
          .should($clips => {
            const clip = $clips[0];
            const actualClipId = clip.getAttribute('data-clip-id');
            expect(actualClipId).to.equal(clipId);
          });
      });
    });

    it('redoes split operation', () => {
      cy.window().then(win => {
        // First select the clip and wait for selection to be applied
        return new Cypress.Promise((resolve) => {
          // Select clip
          win.timelineDispatch({
            type: ActionTypes.SELECT_CLIPS,
            payload: {
              clipIds: [clipId]
            }
          });

          // Wait for selection to be applied
          function checkSelection() {
            const state = (win as any).timelineState;
            try {
              if (state.selectedClipIds?.includes(clipId)) {
                resolve(undefined);
              } else {
                requestAnimationFrame(checkSelection);
              }
            } catch (error) {
              console.error('Selection check error:', error);
              resolve(undefined); // Resolve anyway to prevent hanging
            }
          }

          checkSelection();
        }).then(() => {
          // Wait for DOM to reflect selection
          return cy.get(`[data-clip-id="${clipId}"]`)
            .should('exist')
            .should('be.visible')
            .should('have.attr', 'data-selected', 'true')
            .should('have.class', 'selected');
        }).then(() => {
          // Then split the clip
          win.timelineDispatch({
            type: ActionTypes.SPLIT_CLIP,
            payload: {
              trackId,
              clipId,
              time: 1
            }
          });
        });

        // Wait for split to complete
        waitForTimelineState(state => {
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 2) return false;
          
          const firstClip = track.clips.find((c: TimelineClip) => c.id === `${clipId}-1`);
          const secondClip = track.clips.find((c: TimelineClip) => c.id === `${clipId}-2`);
          
          if (!firstClip || !secondClip) return false;

          return firstClip.startTime === 0 && firstClip.endTime === 1 &&
                 secondClip.startTime === 1 && secondClip.endTime === 2;
        });

        // Wait for clips to be rendered
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 2)
          .then($clips => {
            const clipIds = Array.from($clips).map(clip => clip.getAttribute('data-clip-id'));
            expect(clipIds).to.include(`${clipId}-1`);
            expect(clipIds).to.include(`${clipId}-2`);
          });

        // Then undo
        win.timelineDispatch({
          type: ActionTypes.UNDO
        });

        // Wait for undo to complete
        waitForTimelineState(state => {
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 1) return false;
          
          const clip = track.clips[0];
          return clip.id === clipId && clip.startTime === 0 && clip.endTime === 2;
        });

        // Then redo
        logClipEvent('Redoing Split', clipId, {});
        win.timelineDispatch({
          type: ActionTypes.REDO
        });

        // Wait for state to update
        waitForTimelineState(state => {
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 2) return false;
          
          const firstClip = track.clips.find((c: TimelineClip) => c.id === `${clipId}-1`);
          const secondClip = track.clips.find((c: TimelineClip) => c.id === `${clipId}-2`);
          
          if (!firstClip || !secondClip) return false;

          return firstClip.startTime === 0 && firstClip.endTime === 1 &&
                 secondClip.startTime === 1 && secondClip.endTime === 2;
        });

        // Wait for clips to be rendered
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 2)
          .then($clips => {
            const clipIds = Array.from($clips).map(clip => clip.getAttribute('data-clip-id'));
            expect(clipIds).to.include(`${clipId}-1`);
            expect(clipIds).to.include(`${clipId}-2`);
          });
      });
    });
  });
});
