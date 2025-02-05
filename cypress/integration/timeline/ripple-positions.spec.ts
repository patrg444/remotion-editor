import { timeToPixels } from '../../../src/renderer/utils/timelineScale';
import { ActionTypes } from '../../../src/renderer/types/timeline';

describe('Timeline Ripple Position Tracking', () => {
  beforeEach(() => {
    // Wait for timeline functions to be ready
    cy.window().should('have.property', 'timelineFunctions').should('have.property', 'rippleTrim');

    // Add track and wait for it to be fully rendered
    cy.addTrack('Video Track', 'video');
    cy.get('[data-testid="timeline-track"]').should('exist');
    cy.get('[data-testid="track-content"]').should('exist');

    // Add first clip with specific media bounds
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
        duration: 10, // Long source media
        width: 1920,
        height: 1080,
        fps: 30,
        frames: 300
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
      mediaOffset: 3, // Start at 3 seconds in source
      mediaDuration: 10,
      initialDuration: 2,
      initialBounds: {
        startTime: 0,
        endTime: 2,
        mediaOffset: 3,
        mediaDuration: 10
      },
      handles: {
        startPosition: 3, // Match mediaOffset
        endPosition: 5  // mediaOffset + duration
      }
    }).then(() => {
      // Log initial state
      cy.window().then((win: any) => {
        cy.log('Initial timeline state:', {
          tracks: win.timelineState.tracks,
          clips: win.timelineState.tracks[0].clips
        });
      });
    });

    // Wait for clip to be fully rendered
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .should('have.length', 1)
      .and('be.visible')
      .wait(1000); // Extra wait to ensure clip is stable
  });

  const startTrimming = (trimType: 'in' | 'out' = 'in') => {
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
        // For in-trim use left edge; for out-trim use right edge
        const handleX = trimType === 'in' ?
          rect.left + 5 : // 5px from left edge for in-trim
          rect.right - 5; // 5px from right edge for out-trim
        const handleY = rect.top + (rect.height / 2);

        // Find handle and simulate events
        cy.get('[data-testid="timeline-track"]')
          .find('.timeline-clip')
          .first()
          .find(`.clip-handle.${trimType === 'in' ? 'left' : 'right'}`)
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

          // Store handle position for later use
          cy.wrap<{ handleX: number; handleY: number }>({ handleX, handleY }).as('handlePos');
      });

    // Wait for trimming to start
    cy.get('@clip', { timeout: 10000 }).should('have.attr', 'data-trimming');
    cy.wait(1000); // Wait longer for trim mode to be set
  };

  const checkTrimMode = (mode: string) => {
    cy.get('@clip').then($clip => {
      cy.log('Current trim mode:', $clip.attr('data-trim-mode'));
      cy.log('Current data attributes:', Object.keys($clip[0].dataset).join(' '));
    });
    cy.get('@clip', { timeout: 10000 }).should('have.attr', 'data-trim-mode', mode);
  };

  const endTrimming = () => {
    // End trim operation with both pointerup and mouseup on document
    cy.document().then($doc => {
      cy.wrap($doc).trigger('pointerup', {
        button: 0,
        force: true,
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true
      });

      cy.wrap($doc).trigger('mouseup', {
        button: 0,
        force: true,
        bubbles: true,
        cancelable: true
      });
    });

    // Wait for trimming to end
    cy.get('@clip').should('not.have.attr', 'data-trimming');
  };

  it('should maintain handle positions during ripple in-trim', () => {
    // Verify initial positions
    cy.window().should((win: any) => {
      const clip = win.timelineState.tracks[0].clips[0];
      expect(clip.startTime, 'initial start time').to.equal(0);
      expect(clip.endTime, 'initial end time').to.equal(2);
      expect(clip.mediaOffset, 'initial media offset').to.equal(3);
      expect(clip.handles.startPosition, 'initial start handle').to.equal(3);
      expect(clip.handles.endPosition, 'initial end handle').to.equal(5);
    });

    // Start in-trimming
    startTrimming('in');
    cy.wait(500);

    // Force ripple mode through custom event
    cy.window().then((win: any) => {
      win.dispatchEvent(new CustomEvent('trimModeChange', {
        detail: { mode: 'ripple' }
      }));
    });
    cy.wait(500);

    // Verify ripple mode is set
    checkTrimMode('ripple');
    cy.get('.trim-mode-tooltip').should('contain', 'Ripple trim');

    // Perform ripple trim
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];
      const track = win.timelineState.tracks[0];

      // Calculate new start time
      const currentStartTime = firstClip.startTime;
      const newStartTime = currentStartTime + 1; // Move right by 1 second
      const newDuration = firstClip.endTime - newStartTime;

      // Log trim parameters
      cy.log('Trim parameters:', {
        clipId: firstClip.id,
        trackId: track.id,
        currentStartTime,
        newStartTime,
        newDuration
      });

      // Log state before dispatch
      cy.log('State before dispatch:', {
        clips: win.timelineState.tracks[0].clips,
        firstClip,
        newStartTime,
        newDuration
      });

      // Log available functions
      cy.log('Available timeline functions:', Object.keys(win.timelineFunctions || {}));

      // Get rippleTrim function
      const { rippleTrim } = win.timelineFunctions || {};
      if (!rippleTrim) {
        throw new Error('rippleTrim function not found in window.timelineFunctions');
      }

      // Use rippleTrim function
      rippleTrim(firstClip, track, 'in', newStartTime);

      // Wait for state update
      cy.wait(500);

      // Log state after dispatch
      cy.window().then((win: any) => {
        cy.log('State after dispatch:', {
          clips: win.timelineState.tracks[0].clips
        });
      });
    });
    cy.wait(500);
    checkTrimMode('ripple');
    cy.get('.trim-mode-tooltip').should('contain', 'Ripple trim');

    // Perform ripple in-trim
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];

      // Calculate pixels to move based on desired trim
      const currentStartTime = firstClip.startTime;
      const targetStartTime = currentStartTime + 1; // Move right by 1 second
      const currentStartPixels = timeToPixels(currentStartTime, win.timelineState.zoom);
      const targetStartPixels = timeToPixels(targetStartTime, win.timelineState.zoom);
      const movePixels = targetStartPixels - currentStartPixels;

      // Get handle position and perform trim
      cy.get<{ handleX: number; handleY: number }>('@handlePos').then(({ handleX, handleY }) => {
        const newX = handleX + movePixels;
        // Log state before trim
        cy.window().then((win: any) => {
          cy.log('State before trim:', {
            clips: win.timelineState.tracks[0].clips,
            zoom: win.timelineState.zoom,
            movePixels,
            handleX,
            newX,
            handleY
          });
        });

        // Trigger move on document
        cy.document()
          .trigger('pointermove', {
            clientX: newX,
            clientY: handleY,
            force: true,
            bubbles: true,
            cancelable: true,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true
          })
          .wait(1000); // Wait longer for state update

        // Log state after trim
        cy.window().then((win: any) => {
          cy.log('State after trim:', {
            clips: win.timelineState.tracks[0].clips
          });
        });

        // Verify positions during trim with retries
        cy.window().should((win: any) => {
          const updatedClip = win.timelineState.tracks[0].clips[0];
          expect(updatedClip.startTime, 'trimmed start time').to.equal(1);
          expect(updatedClip.endTime, 'trimmed end time').to.equal(2);
          expect(updatedClip.mediaOffset, 'trimmed media offset').to.equal(4);
          expect(updatedClip.handles.startPosition, 'trimmed start handle').to.equal(4);
          expect(updatedClip.handles.endPosition, 'trimmed end handle').to.equal(5);
        });
      });
    });

    // End trim operation and verify final state
    endTrimming();
    cy.wait(500); // Wait for state to settle
    cy.window().should((win: any) => {
      const clip = win.timelineState.tracks[0].clips[0];
      expect(clip.startTime, 'final start time').to.equal(1);
      expect(clip.endTime, 'final end time').to.equal(2);
      expect(clip.mediaOffset, 'final media offset').to.equal(4);
      expect(clip.handles.startPosition, 'final start handle').to.equal(4);
      expect(clip.handles.endPosition, 'final end handle').to.equal(5);
    });
  });
});
