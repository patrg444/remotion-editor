import { TimelineConstants } from '../../../src/renderer/utils/timelineConstants';

describe('Timeline Clip Operations', () => {
  beforeEach(() => {
    // Visit app and wait for it to load
    cy.visit('http://localhost:8083');
    cy.get('[data-testid="app-root"]').should('exist');

    // Wait for timeline to be ready
    cy.waitForTimeline();

    // Set zoom level for better visibility
    cy.window().then((win: any) => {
      win.timelineDispatch({
        type: 'SET_ZOOM',
        payload: 2
      });
    });

    // Add track and wait for it to be fully rendered
    cy.addTrack('Video Track', 'video');
    cy.get('[data-testid="timeline-track"]').should('exist');
    cy.get('[data-testid="track-content"]').should('exist');

    // Add clip with 5 second media duration
    cy.addClip(0, {
      id: 'test-clip',
      type: 'video',
      name: 'test.webm',
      path: '/test.webm',
      duration: 5,
      startTime: 0,
      endTime: 2,
      mediaOffset: 0,
      mediaDuration: 5,
      handles: {
        startPosition: 0,
        endPosition: 2
      }
    });

    // Wait for clip to be rendered
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .should('exist')
      .and('be.visible');
  });

  it('should trim clip by dragging right handle', () => {
    // Get the clip and its right trim handle
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .first()
      .as('clip')
      .find('.clip-handle.right')
      .as('handle');

    // Start trim with proper event sequence
    cy.get('@handle')
      .trigger('mouseover', { force: true })
      .wait(100)
      .trigger('mouseenter', { force: true })
      .wait(100)
      .trigger('mousedown', { 
        button: 0,
        force: true,
        bubbles: true,
        cancelable: true
      })
      .wait(100)
      .trigger('pointerdown', { 
        button: 0,
        force: true,
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse',
        isPrimary: true
      });

    // Verify trim mode is active
    cy.get('@clip').should('have.attr', 'data-trimming', 'end');

    // Get initial handle position
    cy.get('@handle').then(($handle) => {
      const handleRect = $handle[0].getBoundingClientRect();
      const initialX = handleRect.right;
      
      // Calculate new position (extend by 2 seconds at zoom level 2)
      const pixelsPerSecond = TimelineConstants.Scale.getScale(2); // Zoom level 2
      const moveDistance = pixelsPerSecond * 2; // Move 2 seconds worth
      const newX = initialX + moveDistance;

      // Perform trim by moving pointer
      cy.window().trigger('pointermove', {
        clientX: newX,
        force: true,
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse'
      });

      // End trim operation
      cy.window().trigger('pointerup', {
        button: 0,
        force: true,
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: 'mouse'
      });

      // Wait for state to update and verify clip was extended
      cy.window().should((win: any) => {
        const clip = win.timelineState.tracks[0].clips[0];
        expect(clip.endTime).to.be.greaterThan(2);
      });
    });
  });

  it('should split clip at playhead position', () => {
    // Wait for timeline state and functions to be ready
    cy.window().should((win: any) => {
      expect(win.timelineState).to.exist;
      expect(win.timelineState.tracks[0].clips[0].id).to.equal('test-clip');
      expect(win.timelineFunctions).to.exist;
      expect(win.timelineFunctions.handleSelectClip).to.exist;
      expect(win.timelineFunctions.handleSplitClip).to.exist;
    });

    // Get clip and verify initial state
    cy.get('[data-testid="timeline-track"]')
      .find('.timeline-clip')
      .first()
      .as('clip')
      .then($clip => {
        const clipId = $clip.attr('data-clip-id');
        if (!clipId) throw new Error('Clip ID not found');

        // Log initial state
        cy.window().then(win => {
          cy.log('Initial state:', {
            selectedClipIds: win.timelineState.selectedClipIds,
            clipId
          });
        });

        // Select clip by dispatching action directly
        cy.window().then(win => {
          // Log current state
          cy.log('Before dispatch:', {
            state: win.timelineState,
            clipId
          });

          // Dispatch selection action directly
          win.timelineDispatch({
            type: 'SELECT_CLIPS',
            payload: { clipIds: [clipId] }
          });

          // Also dispatch SET_SELECTED_CLIP_IDS for redundancy
          win.timelineDispatch({
            type: 'SET_SELECTED_CLIP_IDS',
            payload: [clipId]
          });

          // Log state immediately after dispatch
          cy.log('After dispatch:', {
            state: win.timelineState,
            clipId
          });
        });

        // Log state before checking
        cy.window().then(win => {
          cy.log('Current state:', {
            selectedClipIds: win.timelineState.selectedClipIds,
            clipId,
            tracks: win.timelineState.tracks
          });
        });

        // Wait for state update with retries and longer timeout
        cy.window({ timeout: 10000 }).should((win: any) => {
          expect(win.timelineState.selectedClipIds).to.deep.equal([clipId]);
        });

        // Log state after selection retry
        cy.window().then((win: any) => {
          cy.log('State after selection retry:', {
            selectedClipIds: win.timelineState.selectedClipIds,
            clipId,
            tracks: win.timelineState.tracks,
            timelineFunctions: Object.keys((win as any).timelineFunctions || {})
          });
        });

        // Wait for DOM update with retries
        cy.get('@clip')
          .should('have.class', 'selected')
          .should('have.attr', 'data-clip-id', clipId)
          .then($clip => {
            // Log DOM state
            cy.log('DOM state:', {
              hasSelectedClass: $clip.hasClass('selected'),
              clipId: $clip.attr('data-clip-id')
            });
          });

        // Log state after selection
        cy.window().then(win => {
          cy.log('State after selection:', {
            selectedClipIds: win.timelineState.selectedClipIds,
            clipId
          });
        });

        // Move playhead to 1 second
        cy.window().then(win => {
          win.timelineDispatch({
            type: 'SET_CURRENT_TIME',
            payload: { time: 1 }
          });
        });

        // Wait for playhead position to update
        cy.window().should(win => {
          expect(win.timelineState.currentTime).to.equal(1);
        });

        // Wait for timeline functions to be exposed
        cy.window().should(win => {
          expect((win as any).timelineFunctions).to.exist;
          expect((win as any).timelineFunctions.handleSplitClip).to.exist;
        });

        // Log state before split
        cy.window().then(win => {
          cy.log('State before split:', {
            selectedClipIds: win.timelineState.selectedClipIds,
            currentTime: win.timelineState.currentTime,
            clips: win.timelineState.tracks[0].clips,
            clipId
          });
        });

        // Call handleSplitClip using exposed function
        cy.window().then(win => {
          (win as any).timelineFunctions.handleSplitClip(clipId, 1);

          // Log state immediately after split
          cy.log('State immediately after split:', {
            selectedClipIds: win.timelineState.selectedClipIds,
            currentTime: win.timelineState.currentTime,
            clips: win.timelineState.tracks[0].clips,
            clipId
          });
        });

        // Wait for state update
        cy.window().should(win => {
          const clips = win.timelineState.tracks[0].clips;
          expect(clips).to.have.length(2);
        });

        // Wait for split to complete
        cy.get('[data-testid="timeline-track"]')
          .find('.timeline-clip')
          .should('have.length', 2);

        // Verify clip properties and handle positions
        cy.window().then(win => {
          const clips = win.timelineState.tracks[0].clips;
          expect(clips).to.have.length(2);
          expect(clips[0].startTime).to.equal(0);
          expect(clips[0].endTime).to.equal(1);
          expect(clips[1].startTime).to.equal(1);
          expect(clips[1].endTime).to.equal(2);
        });

        // Get both clips and verify their handles
        cy.get('[data-testid="timeline-track"]')
          .find('.timeline-clip')
          .should('have.length', 2)
          .then($clips => {
            // First clip's right handle should be at split point
            cy.wrap($clips[0])
              .find('.clip-handle.right')
              .invoke('css', 'right')
              .should('equal', '-8px'); // Handle is positioned 8px outside clip

            // Second clip's left handle should be at split point
            cy.wrap($clips[1])
              .find('.clip-handle.left')
              .invoke('css', 'left')
              .should('equal', '-8px'); // Handle is positioned 8px outside clip

            // Verify clip positions
            const pixelsPerSecond = TimelineConstants.Scale.getScale(2); // Zoom level 2
            
            // First clip should be at 0 seconds with width of 1 second
            cy.wrap($clips[0]).then($firstClip => {
              const firstLeft = parseInt($firstClip.css('left'));
              const firstWidth = parseInt($firstClip.css('width'));
              expect(firstLeft).to.equal(0);
              expect(firstWidth).to.be.closeTo(pixelsPerSecond * 1, 1); // 1 second width

              // Verify first clip is visible and interactive
              cy.wrap($firstClip)
                .should('be.visible')
                .and('have.css', 'pointer-events', 'auto')
                .and('have.css', 'z-index')
                .and('not.equal', '-1');
            });

            // Second clip should be at 1 second with width of 1 second
            cy.wrap($clips[1]).then($secondClip => {
              const secondLeft = parseInt($secondClip.css('left'));
              const secondWidth = parseInt($secondClip.css('width'));
              expect(secondLeft).to.be.closeTo(pixelsPerSecond * 1, 1); // Start at 1 second
              expect(secondWidth).to.be.closeTo(pixelsPerSecond * 1, 1); // 1 second width

              // Verify second clip is visible and interactive
              cy.wrap($secondClip)
                .should('be.visible')
                .and('have.css', 'pointer-events', 'auto')
                .and('have.css', 'z-index')
                .and('not.equal', '-1');
            });

            // Log clip positions for debugging
            cy.log('Clip positions:', {
              firstClip: {
                left: $clips[0].style.left,
                width: $clips[0].style.width,
                expectedWidth: `${pixelsPerSecond}px`,
                zIndex: window.getComputedStyle($clips[0]).zIndex,
                pointerEvents: window.getComputedStyle($clips[0]).pointerEvents,
                visibility: window.getComputedStyle($clips[0]).visibility
              },
              secondClip: {
                left: $clips[1].style.left,
                width: $clips[1].style.width,
                expectedLeft: `${pixelsPerSecond}px`,
                expectedWidth: `${pixelsPerSecond}px`,
                zIndex: window.getComputedStyle($clips[1]).zIndex,
                pointerEvents: window.getComputedStyle($clips[1]).pointerEvents,
                visibility: window.getComputedStyle($clips[1]).visibility
              }
            });

            // Wait for original clip to be removed
            cy.get('[data-testid="timeline-track"]')
              .find('.timeline-clip')
              .should('have.length', 2)
              .and(($clips) => {
                // Ensure no clip has the original ID
                const hasOriginalClip = Array.from($clips).some(
                  clip => clip.getAttribute('data-clip-id') === 'test-clip'
                );
                expect(hasOriginalClip).to.be.false;
              });

            // Try to interact with both clips with force option
            cy.wrap($clips[0])
              .click({ force: true })
              .should('have.class', 'selected');
            
            cy.wrap($clips[1])
              .click({ force: true })
              .should('have.class', 'selected');
          });
      });
  });
});
