import { TimelineState, ActionTypes, Clip, Track, Transition } from '../../../src/renderer/types/timeline';
import { waitForTimelineInit, waitForTimelineReady, waitForTimelineState, debugTimelineState, logTimelineState, waitForHistoryOperation, waitForSplitOperation, waitForClipsToRender, waitForStateAndRender, logClipEvent } from '../../support/utils/timeline';
import { validateTimelineState, validateTimelineDispatch } from '../../support/utils/test-utils';
import { TimelineConstants } from '../../../src/renderer/utils/timelineConstants';

type WindowWithTimeline = Window & {
  timelineState: TimelineState;
  timelineDispatch: (action: { type: string; payload: any }) => void;
  __originalClipId?: string;
};

type TimelineTrack = Track & {
  clips: TimelineClip[];
  transitions?: TimelineTransition[];
};

type TimelineClip = Clip & {
  startTime: number;
  endTime: number;
  layer?: number;
  mediaOffset?: number;
  mediaDuration?: number;
};

type TimelineTransition = Transition & {
  clipAId: string;
  clipBId: string;
  type: string;
  duration: number;
};

type ClipValidationProps = {
  id: string;
  startTime: number;
  endTime: number;
};

function createTrackId(id: string): number {
  return parseInt(id.replace(/\D/g, ''), 10);
}

function createClipValidation(id: string, startTime: number, endTime: number): { id: string; startTime: number; endTime: number } {
  return {
    id,
    startTime: startTime,
    endTime: endTime
  };
}

describe('Timeline Advanced Undo/Redo Operations', () => {
  beforeEach(() => {
    // Set longer timeout for all commands in this suite
    Cypress.config('defaultCommandTimeout', 30000);

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
    cy.window().should('have.property', 'timelineDispatch');
    cy.log('Timeline dispatch ready');
    
    cy.log('Waiting for timeline ready flag...');
    cy.window().should('have.property', 'timelineReady', true);
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
    cy.window().should(win => {
      const state = win.timelineState;
      console.log('Current state after clear:', state);
      expect(state.tracks).to.have.length(0);
      expect(state.history.entries).to.have.length(0);
      expect(state.history.currentIndex).to.equal(-1);
    });
    cy.log('State cleared');

    // Wait for DOM to clear with logging
    cy.log('Waiting for clips to be removed...');
    cy.get('[data-testid="timeline-clip"]').should('not.exist');
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
    cy.window().should(win => {
      const state = win.timelineState;
      console.log('Current state after track add:', state);
      expect(state.tracks).to.have.length(1);
    });
    cy.log('Track added to state');

    cy.log('Waiting for track to be rendered...');
    cy.get('[data-testid="timeline-track"]')
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

  describe('Multiple Selected Clips', () => {
    let trackId: string;
    let clipIds: string[];
    const zoom = 1;

    beforeEach(() => {
      // Add multiple clips
      cy.window().then(win => {
        // Get the track ID from the state
        trackId = win.timelineState.tracks[0].id;
        clipIds = Array.from({ length: 3 }, (_, i) => `clip-${Date.now()}-${i}`);

        // Wait for track to be rendered
        cy.get('[data-testid="timeline-track"]')
          .should('exist')
          .and('be.visible')
          .then(() => {
            // Add event listeners for debugging
            cy.window().then(win => {
              // Set up event logging using console.log instead of cy.log
              ['clip:rendered', 'clip:positioned', 'timeline:state-changed', 'track:ready'].forEach(eventType => {
                win.addEventListener(eventType, ((e: CustomEvent) => {
                  console.log(`${eventType} event:`, e.detail);
                }) as EventListener);
              });
            });

            // Add clips with proper chaining and verification
            cy.log('Adding first clip...');
            cy.window().then(win => {
              win.timelineDispatch({
                type: ActionTypes.ADD_CLIP,
                payload: {
                  trackId,
                  clip: {
                    id: clipIds[0],
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
            });

            // Wait for first clip with enhanced verification
            cy.log('Waiting for first clip to be fully rendered...');
            waitForStateAndRender((state: TimelineState) => {
              const track = state.tracks.find((t: Track): t is TimelineTrack => 
                t.id === trackId && 'clips' in t && Array.isArray(t.clips)
              );
              if (!track) return false;

              // Verify clip count and ID
              return track.clips.length === 1 && track.clips[0].id === clipIds[0];
            }).then(() => {
              cy.get('[data-testid="timeline-clip"]')
                .should('have.length', 1)
                .should('be.visible')
                .and('have.attr', 'data-clip-id', clipIds[0]);

              cy.wait(10000); // Increased wait time
            });

            // Add second clip
            cy.log('Adding second clip...');
            cy.window().then(win => {
              win.timelineDispatch({
                type: ActionTypes.ADD_CLIP,
                payload: {
                  trackId,
                  clip: {
                    id: clipIds[1],
                    type: 'video',
                    name: 'test.webm',
                    path: 'test.mp4',
                    duration: 2,
                    width: 1920,
                    height: 1080,
                    fps: 30,
                    frames: 150,
                    startTime: 2,
                    endTime: 4,
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
                      startTime: 2,
                      endTime: 4,
                      mediaOffset: 0,
                      mediaDuration: 5
                    }
                  }
                }
              });
            });

            // Wait for second clip with enhanced verification
            cy.log('Waiting for second clip to be fully rendered...');
            waitForStateAndRender((state: TimelineState) => {
              const track = state.tracks.find((t: Track): t is TimelineTrack => 
                t.id === trackId && 'clips' in t && Array.isArray(t.clips)
              );
              if (!track) return false;

              // Verify clip count and IDs
              return track.clips.length === 2 && 
                track.clips[0].id === clipIds[0] && 
                track.clips[1].id === clipIds[1];
            }).then(() => {
              cy.get('[data-testid="timeline-clip"]')
                .should('have.length', 2)
                .should('be.visible')
                .then($clips => {
                  expect($clips.eq(0).attr('data-clip-id')).to.equal(clipIds[0]);
                  expect($clips.eq(1).attr('data-clip-id')).to.equal(clipIds[1]);
                });

              cy.wait(10000); // Increased wait time
            });

            // Add third clip
            cy.log('Adding third clip...');
            cy.window().then(win => {
              win.timelineDispatch({
                type: ActionTypes.ADD_CLIP,
                payload: {
                  trackId,
                  clip: {
                    id: clipIds[2],
                    type: 'video',
                    name: 'test.webm',
                    path: 'test.mp4',
                    duration: 2,
                    width: 1920,
                    height: 1080,
                    fps: 30,
                    frames: 150,
                    startTime: 4,
                    endTime: 6,
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
                      startTime: 4,
                      endTime: 6,
                      mediaOffset: 0,
                      mediaDuration: 5
                    }
                  }
                }
              });
            });

            // Wait for third clip with enhanced verification and force render
            cy.log('Waiting for third clip to be fully rendered...');
            
            // First verify state
            cy.window().should(win => {
              const state = win.timelineState;
              const track = state.tracks.find((t: Track): t is TimelineTrack => 
                t.id === trackId && 'clips' in t && Array.isArray(t.clips)
              );
              if (!track) throw new Error('Track not found');
              
              // Log current state for debugging
              console.log('Current track state:', {
                trackId,
                clipCount: track.clips.length,
                clipIds: track.clips.map((c: TimelineClip) => c.id),
                expectedClipIds: clipIds
              });

              expect(track.clips.length).to.equal(3);
              expect(track.clips.map((c: TimelineClip) => c.id)).to.deep.equal(clipIds);
            });

            // Force a re-render by updating track state
            cy.window().then(win => {
              const track = win.timelineState.tracks.find((t: Track): t is TimelineTrack => 
                t.id === trackId && 'clips' in t && Array.isArray(t.clips)
              );
              if (!track) throw new Error('Track not found');

              // Update track to force re-render
              win.timelineDispatch({
                type: ActionTypes.UPDATE_TRACK,
                payload: {
                  trackId,
                  track: {
                    ...track,
                    isVisible: false
                  }
                }
              });

              cy.wait(1000);

              win.timelineDispatch({
                type: ActionTypes.UPDATE_TRACK,
                payload: {
                  trackId,
                  track: {
                    ...track,
                    isVisible: true
                  }
                }
              });

              cy.wait(5000);
            });

            // Then verify DOM with retries
            cy.get('[data-testid="timeline-clip"]', { timeout: 30000 })
              .should('have.length', 3)
              .should('be.visible')
              .then(() => {
              cy.log('Clips rendered, verifying state...');
              cy.window().should(win => {
                const state = win.timelineState;
                const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
                if (!track) throw new Error('Track not found');
                
                const missingClips = clipIds.filter(id => !track.clips.some((c: TimelineClip) => c.id === id));
                if (missingClips.length > 0) {
                  throw new Error(`Missing clips in state: ${missingClips.join(', ')}`);
                }

                expect(track.clips.length).to.equal(3);
                expect(track.clips.map((c: TimelineClip) => c.id)).to.deep.equal(clipIds);
              });

              cy.log('Verifying DOM elements...');
              cy.get('[data-testid="timeline-clip"]', { timeout: 20000 })
                .should('have.length', 3)
                .should('be.visible')
                .then($clips => {
                  const foundClipIds = Array.from($clips).map(clip => 
                    Cypress.$(clip).attr('data-clip-id')
                  );
                  const missingClips = clipIds.filter(id => !foundClipIds.includes(id));
                  if (missingClips.length > 0) {
                    throw new Error(`Missing clips in DOM: ${missingClips.join(', ')}`);
                  }

                  $clips.each((i, clip) => {
                    const $clip = Cypress.$(clip);
                    const clipId = $clip.attr('data-clip-id');
                    const rect = clip.getBoundingClientRect();
                    cy.log(`Clip ${i + 1} verification:`, {
                      clipId,
                      left: rect.left,
                      width: rect.width,
                      expectedId: clipIds[i]
                    });
                    expect(clipId).to.equal(clipIds[i]);
                    expect(rect.left).to.be.greaterThan(0);
                    expect(rect.width).to.be.greaterThan(0);
                  });
                });
            });

            cy.log('Waiting for final rendering...');
            cy.wait(5000);

            // Final verification
            cy.log('Performing final verification...');
            cy.window().should(win => {
              const state = win.timelineState;
              const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
              expect(track?.clips.length).to.equal(3);
              clipIds.forEach((id, i) => {
                const clip = track?.clips[i];
                expect(clip?.id).to.equal(id);
                expect(clip?.startTime).to.equal(i * 2);
                expect(clip?.endTime).to.equal((i * 2) + 2);
              });
            });

            cy.get('[data-testid="timeline-clip"]')
              .should('have.length', 3)
              .should('be.visible');
          });
      });
    });

    it('undoes and redoes operations on multiple selected clips', () => {
      cy.window().then(win => {
        // Select all clips
        win.timelineDispatch({
          type: ActionTypes.SELECT_CLIPS,
          payload: {
            clipIds
          }
        });

        // Wait for selection to be reflected in state first
        cy.window().should(win => {
          const state = win.timelineState;
          const selectedClips = state.selectedClipIds || [];
          return clipIds.every(id => selectedClips.includes(id));
        });

        // Then verify DOM reflects selection
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 3)
          .and($clips => {
            const selectedCount = $clips.filter('.selected').length;
            expect(selectedCount, 'all clips should be selected').to.equal(3);
          });

        // Move all selected clips
        win.timelineDispatch({
          type: ActionTypes.MOVE_CLIP,
          payload: {
            trackId,
            clipIds,
            startTimes: clipIds.map((_, i) => i * 2 + 4),
            endTimes: clipIds.map((_, i) => (i * 2 + 6))
          }
        });

        // Wait for move to complete
        cy.window().should(win => {
          const state = win.timelineState;
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 3) return false;
          
          return clipIds.every((clipId, i) => {
            const clip = track.clips.find((c: TimelineClip) => c.id === clipId);
            return clip?.startTime === (i * 2 + 4) && clip?.endTime === (i * 2 + 6);
          });
        });

        // Undo move
        win.timelineDispatch({
          type: ActionTypes.UNDO
        });

        // Wait for undo to complete
        cy.window().should(win => {
          const state = win.timelineState;
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 3) return false;
          
          return clipIds.every((clipId, i) => {
            const clip = track.clips.find((c: TimelineClip) => c.id === clipId);
            return clip?.startTime === (i * 2) && clip?.endTime === (i * 2 + 2);
          });
        });

        // Redo move
        win.timelineDispatch({
          type: ActionTypes.REDO
        });

        // Wait for redo to complete
        cy.window().should(win => {
          const state = win.timelineState;
          const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
          if (!track || track.clips.length !== 3) return false;
          
          return clipIds.every((clipId, i) => {
            const clip = track.clips.find((c: TimelineClip) => c.id === clipId);
            return clip?.startTime === (i * 2 + 4) && clip?.endTime === (i * 2 + 6);
          });
        });
      });
    });
  });
});
