import { timeToPixels } from '../../../src/renderer/utils/timelineScale';

describe('Timeline Ripple Extension', () => {
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
      id: 'test-clip',
      type: 'video',
      name: 'Test Video',
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
      endTime: 2, // Initially show only 2 seconds
      mediaOffset: 0,
      mediaDuration: 5, // But have 5 seconds available
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
    cy.wait(1000); // Wait for first clip to be fully initialized
    cy.addClip(0, {
      id: 'test-clip-2',
      type: 'video',
      name: 'Test Video 2',
      path: '/test.mp4',
      duration: 2,
      startTime: 3, // Start at 3 to maintain 1-second gap
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

    // Add third clip with a 1-second gap
    cy.wait(500);
    cy.addClip(0, {
      id: 'test-clip-3',
      type: 'video',
      name: 'Test Video 3',
      path: '/test.mp4',
      duration: 2,
      startTime: 6, // Start at 6 to maintain 1-second gap
      endTime: 8,
      mediaOffset: 0,
      mediaDuration: 5,
      initialDuration: 2,
      initialBounds: {
        startTime: 6,
        endTime: 8,
        mediaOffset: 0,
        mediaDuration: 5
      },
      handles: {
        startPosition: 0,
        endPosition: 2
      }
    });

    // Wait for all clips to be added and verify their positions
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .should('have.length', 3)
      .should('be.visible');

    // Verify initial clip positions
    cy.window().should((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      expect(clips, 'should have 3 clips').to.have.length(3);
      expect(clips[0].startTime, 'first clip start time').to.equal(0);
      expect(clips[0].endTime, 'first clip end time').to.equal(2);
      expect(clips[1].startTime, 'second clip start time').to.equal(3);
      expect(clips[1].endTime, 'second clip end time').to.equal(5);
      expect(clips[2].startTime, 'third clip start time').to.equal(6);
      expect(clips[2].endTime, 'third clip end time').to.equal(8);
    });
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
      cy.log('Current data attributes:', Object.keys($clip[0].dataset).join(', '));
    });
    cy.get('@clip', { timeout: 10000 }).should('have.attr', 'data-trim-mode', mode);
  };

  const endTrimming = () => {
    // End trim operation with both pointerup and mouseup on window
    cy.window().trigger('pointerup', {
      button: 0,
      force: true,
      bubbles: true,
      cancelable: true,
      pointerId: 1,
      pointerType: 'mouse'
    });

    cy.window().trigger('mouseup', {
      button: 0,
      force: true,
      bubbles: true,
      cancelable: true
    });

    // Wait for trimming to end
    cy.get('@clip').should('not.have.attr', 'data-trimming');
  };

  it('should shift subsequent clips in ripple mode based on available extension', () => {
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
    checkTrimMode('ripple');
    cy.get('.trim-mode-tooltip').should('contain', 'Ripple trim');

    // Perform ripple trim to extend back to full available media
    cy.window().then((win: any) => {
      const clips = win.timelineState.tracks[0].clips;
      const firstClip = clips[0];
      const availableExtension = firstClip.mediaDuration - (firstClip.endTime - firstClip.startTime);
      
      // Calculate pixels to move based on available extension
      const currentEndTime = firstClip.endTime;
      const targetEndTime = currentEndTime + availableExtension;
      const currentEndPixels = timeToPixels(currentEndTime, win.timelineState.zoom);
      const targetEndPixels = timeToPixels(targetEndTime, win.timelineState.zoom);
      const movePixels = targetEndPixels - currentEndPixels;

      // Get handle position and perform trim
      cy.get<{ handleX: number }>('@handlePos').then(({ handleX }) => {
        const newX = handleX + movePixels;
        cy.window().trigger('pointermove', {
          clientX: newX,
          force: true,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse'
        });

        // Verify first clip extends to its full available media
        cy.window().should((win: any) => {
          const clips = win.timelineState.tracks[0].clips;
          expect(clips[0].startTime).to.equal(0);
          expect(clips[0].endTime).to.equal(5); // Extended to full 5 seconds
        });

        // Verify subsequent clips shift by the extension amount while maintaining gaps
        cy.window().should((win: any) => {
          const clips = win.timelineState.tracks[0].clips;
          expect(clips[1].startTime).to.equal(6); // Shifted by 3 seconds (original gap maintained)
          expect(clips[1].endTime).to.equal(8);
          expect(clips[2].startTime).to.equal(9); // Shifted by 3 seconds (original gap maintained)
          expect(clips[2].endTime).to.equal(11);
        });
      });
    });

    endTrimming();
  });
});
