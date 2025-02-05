import { timeToPixels } from '../../../src/renderer/utils/timelineScale';
import { ActionTypes } from '../../../src/renderer/types/timeline';

describe('Timeline Ripple Operations with Track Locking', () => {
  beforeEach(() => {
    // Visit app and wait for it to load
    cy.visit('http://localhost:8083');
    cy.get('[data-testid="app-root"]').should('exist');

    // Wait for timeline to be ready
    cy.waitForTimeline();

    // Add track and wait for it to be fully rendered
    cy.addTrack('Video Track', 'video');
    cy.get('[data-testid="timeline-track"]').should('exist');
    cy.get('[data-testid="track-content"]').should('exist');

    // Add first clip with longer media duration than initial duration
    cy.addClip(0, {
      id: 'test-clip-1',
      type: 'video',
      name: 'Test Video 1',
      path: '/test.mp4',
      duration: 2,
      width: 1920,
      height: 1080,
      fps: 30,
      frames: 60,
      metadata: {
        duration: 5,
        width: 1920,
        height: 1080,
        fps: 30,
        frames: 150
      },
      content: {
        frames: Array.from({ length: 60 }, (_, i) => ({
          index: i,
          timestamp: i / 30
        })),
        currentFrame: 0,
        isPlaying: false
      },
      startTime: 0,
      endTime: 2,
      mediaOffset: 0,
      mediaDuration: 5,
      initialDuration: 2,
      initialBounds: {
        startTime: 0,
        endTime: 2,
        mediaOffset: 0,
        mediaDuration: 5
      },
      handles: {
        startPosition: 0,
        endPosition: 2
      }
    });

    // Add second clip with a 1-second gap
    cy.wait(1000); // Wait longer for first clip to be fully initialized
    cy.addClip(0, {
      id: 'test-clip-2',
      type: 'video',
      name: 'Test Video 2',
      path: '/test.mp4',
      duration: 2,
      width: 1920,
      height: 1080,
      fps: 30,
      frames: 60,
      metadata: {
        duration: 5,
        width: 1920,
        height: 1080,
        fps: 30,
        frames: 150
      },
      content: {
        frames: Array.from({ length: 60 }, (_, i) => ({
          index: i,
          timestamp: i / 30
        })),
        currentFrame: 0,
        isPlaying: false
      },
      startTime: 3,
      endTime: 5,
      mediaOffset: 0,
      mediaDuration: 5,
      initialDuration: 2,
      initialBounds: {
        startTime: 3,
        endTime: 5,
        mediaOffset: 0,
        mediaDuration: 5
      },
      handles: {
        startPosition: 0,
        endPosition: 2
      }
    });

    // Verify initial clip positions
    cy.window().should((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      expect(clips).to.have.length(2);
      expect(clips[0].startTime).to.equal(0);
      expect(clips[0].endTime).to.equal(2);
      expect(clips[1].startTime).to.equal(3);
      expect(clips[1].endTime).to.equal(5);
    });
  });

  it('should prevent ripple operations on locked tracks', () => {
    // Lock the track
    cy.window().then((win: any) => {
      win.timelineDispatch({
        type: 'UPDATE_TRACK',
        payload: {
          trackId: win.timelineState.tracks[0].id,
          track: { isLocked: true }
        }
      });
    });

    // Verify track is locked
    cy.window().should((win: any) => {
      expect(win.timelineState.tracks[0].isLocked).to.be.true;
    });

    // Try to ripple delete first clip
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .first()
      .click()
      .trigger('keydown', { key: 'Delete' });

    // Verify clips remain unchanged
    cy.window().should((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      expect(clips).to.have.length(2);
      expect(clips[0].startTime).to.equal(0);
      expect(clips[0].endTime).to.equal(2);
      expect(clips[1].startTime).to.equal(3);
      expect(clips[1].endTime).to.equal(5);
    });

    // Try to ripple trim first clip
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .first()
      .find('.clip-handle.right')
      .trigger('mousedown', { button: 0 })
      .trigger('keydown', { key: 'r' })
      .trigger('mousemove', { clientX: 300 })
      .trigger('mouseup');

    // Verify clips remain unchanged
    cy.window().should((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      expect(clips).to.have.length(2);
      expect(clips[0].startTime).to.equal(0);
      expect(clips[0].endTime).to.equal(2);
      expect(clips[1].startTime).to.equal(3);
      expect(clips[1].endTime).to.equal(5);
    });
  });

  it('should allow ripple operations on unlocked tracks', () => {
    // Verify track is unlocked (either undefined or false is acceptable)
    cy.window().should((win: any) => {
      const track = win.timelineState.tracks[0];
      expect(track.isLocked || false).to.be.false;
    });

    // Ripple delete first clip
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .first()
      .click()
      .trigger('keydown', { key: 'Delete' });

    // Verify second clip shifted left
    cy.window().should((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      expect(clips).to.have.length(1);
      expect(clips[0].startTime).to.equal(1); // Shifted left by 2 seconds
      expect(clips[0].endTime).to.equal(3);
    });

    // Add new clip for ripple trim test
    cy.addClip(0, {
      id: 'test-clip-3',
      type: 'video',
      name: 'Test Video 3',
      path: '/test.mp4',
      duration: 2,
      width: 1920,
      height: 1080,
      fps: 30,
      frames: 60,
      metadata: {
        duration: 5,
        width: 1920,
        height: 1080,
        fps: 30,
        frames: 150
      },
      content: {
        frames: Array.from({ length: 60 }, (_, i) => ({
          index: i,
          timestamp: i / 30
        })),
        currentFrame: 0,
        isPlaying: false
      },
      startTime: 4,
      endTime: 6,
      mediaOffset: 0,
      mediaDuration: 5,
      initialDuration: 2,
      initialBounds: {
        startTime: 4,
        endTime: 6,
        mediaOffset: 0,
        mediaDuration: 5
      },
      handles: {
        startPosition: 0,
        endPosition: 2
      }
    });

    const startTrimming = () => {
      // Wait for clip and handle to be ready
      cy.get('[data-testid="timeline-track"]')
        .find('.timeline-clip')
        .first()
        .should('exist')
        .and('be.visible')
        .should('have.class', 'video')
        .as('clip')
        .then($clip => {
          // Get clip position
          const rect = $clip[0].getBoundingClientRect();
          const handleX = rect.right - 5; // 5px from right edge
          const handleY = rect.top + (rect.height / 2);

          // Find handle and simulate events
          cy.get('[data-testid="timeline-track"]')
            .find('.timeline-clip')
            .first()
            .find('.clip-handle.right')
            .should('exist')
            .invoke('css', 'opacity', '1')
            .should('have.css', 'opacity', '1')
            .as('handle')
            .trigger('mouseover', { 
              clientX: handleX,
              clientY: handleY,
              force: true,
              bubbles: true,
              cancelable: true
            })
            .wait(100)
            .trigger('mouseenter', { 
              clientX: handleX,
              clientY: handleY,
              force: true,
              bubbles: true,
              cancelable: true
            })
            .wait(100)
            .trigger('mousedown', { 
              button: 0,
              clientX: handleX,
              clientY: handleY,
              force: true,
              bubbles: true,
              cancelable: true
            })
            .wait(100)
            .trigger('pointerdown', { 
              button: 0,
              clientX: handleX,
              clientY: handleY,
              force: true,
              bubbles: true,
              cancelable: true,
              pointerId: 1,
              pointerType: 'mouse',
              isPrimary: true
            });
        });

      // Wait for trimming to start
      cy.get('@clip', { timeout: 10000 }).should('have.attr', 'data-trimming');
      cy.wait(1000); // Wait longer for trim mode to be set
    };

    // Start trimming first clip
    startTrimming();

    // Enter ripple mode
    cy.get('@clip').trigger('keydown', {
      key: 'r',
      code: 'KeyR',
      keyCode: 82,
      which: 82,
      bubbles: true,
      cancelable: true
    });
    cy.wait(500);
    cy.get('@clip').should('have.attr', 'data-trim-mode', 'ripple');
    cy.get('.trim-mode-tooltip').should('contain', 'Ripple trim');
    cy.wait(500);

    // Log initial state
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      cy.log('Initial state before trim:', {
        clip0: {
          startTime: clips[0].startTime,
          endTime: clips[0].endTime
        },
        clip1: clips[1] ? {
          startTime: clips[1].startTime,
          endTime: clips[1].endTime
        } : 'none'
      });
    });

    // Directly dispatch ripple trim action
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];
      const track = win.timelineState.tracks[0];
      
      // Calculate new end time based on available media
      const currentEndTime = firstClip.endTime;
      const newEndTime = currentEndTime + 1; // Extend by 1 second
      const newDuration = newEndTime - firstClip.startTime;

      // Log trim parameters
      cy.log('Trim parameters:', {
        clipId: firstClip.id,
        trackId: track.id,
        startTime: firstClip.startTime,
        currentEndTime,
        newEndTime,
        newDuration
      });

      // Dispatch trim action
      win.timelineDispatch({
        type: ActionTypes.TRIM_CLIP,
        payload: {
          trackId: track.id,
          clipId: firstClip.id,
          startTime: firstClip.startTime,
          endTime: newEndTime,
          speed: 1.0,
          handles: {
            startPosition: firstClip.mediaOffset,
            endPosition: firstClip.mediaOffset + newDuration
          },
          ripple: true
        }
      });

      // Wait for state update
      cy.wait(1000);

      // Log final state
      cy.window().then((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        cy.log('Final state after trim:', {
          clip0: clips[0] ? {
            startTime: clips[0].startTime,
            endTime: clips[0].endTime
          } : 'none',
          clip1: clips[1] ? {
            startTime: clips[1].startTime,
            endTime: clips[1].endTime
          } : 'none'
        });
      });

      // Verify final state with retries
      cy.window().should((win: any) => {
        const clips = win.timelineState.tracks[0].clips;
        expect(clips[0].endTime).to.be.closeTo(4, 0.2);
        expect(clips[1].startTime).to.be.closeTo(5, 0.2);
        expect(clips[1].endTime).to.be.closeTo(7, 0.2);
      });
    });
  });
});
