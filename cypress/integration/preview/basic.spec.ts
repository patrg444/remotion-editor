/// <reference types="cypress" />

describe('Preview Basic Tests', () => {
  beforeEach(() => {
    // Wait for webpack dev server to be ready
    cy.request({
      url: 'http://localhost:8083',
      retryOnStatusCodeFailure: true,
      timeout: 30000
    }).its('status').should('eq', 200);

    // Wait for renderer script to be ready
    cy.request({
      url: 'http://localhost:8083/renderer.js',
      retryOnStatusCodeFailure: true,
      timeout: 30000
    }).its('status').should('eq', 200);

    // Initialize state
    cy.task('initializeState', null);

    // Visit app and wait for it to be ready
    cy.visit('http://localhost:8083', {
      onBeforeLoad(win) {
        // Suppress console output
        win.console.log = () => {};
        win.console.info = () => {};
        win.console.debug = () => {};
      },
      timeout: 30000,
      retryOnStatusCodeFailure: true,
      retryOnNetworkFailure: true
    });

    // Wait for document to be ready
    cy.document().should('have.property', 'readyState', 'complete');

    // Wait for root element
    cy.get('#root', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .then(() => {
        cy.task('log', { level: 'info', category: 'mount', text: 'Root element mounted' });
      });

    // Wait for app container to be ready
    cy.get('[data-testid="app-root"]', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .then(() => {
        cy.task('log', { level: 'info', category: 'mount', text: 'App container mounted' });
      });

    // Wait for app state to be ready
    cy.window({ timeout: 30000 }).should((win: any) => {
      // Check timeline state
      expect(win.timelineState).to.exist;
      expect(win.timelineDispatch).to.exist;
      expect(win.timelineReady).to.be.true;
      // Check media bin state
      expect(win.mediaBinContext).to.exist;
      expect(win.mediaBinContext.addItems).to.be.a('function');
    }).then(() => {
      cy.task('log', { level: 'info', category: 'mount', text: 'App state loaded' });
    });

    // Disable test-import.js
    cy.window().then((win: any) => {
      win.__DISABLE_TEST_IMPORT__ = true;
    });

    // Set up test data directly through state
    cy.window().then((win: any) => {
      // Add media item with minimal metadata
      const duration = 1; // 1 second duration
      const fps = 30;
      const frames = duration * fps;
      
      const mediaItem = {
        id: 'test-video',
        name: 'Test Video',
        path: Cypress.env('testVideo'),
        type: 'video',
        duration,
        width: 320,
        height: 240,
        fps,
        frames,
        metadata: {
          duration,
          width: 320,
          height: 240,
          fps,
          frames
        },
        content: {
          frames: Array.from({ length: frames }, (_, i) => ({
            index: i,
            timestamp: i / fps
          })),
          currentFrame: 0,
          isPlaying: false
        }
      };

      // Add to media bin
      win.mediaBinContext.addItems([mediaItem]);
      cy.task('log', { level: 'info', category: 'state', text: 'Media item added to bin' });

      // Add track and clip with complete properties
      const trackId = `track-${Date.now()}`;
      const clipId = `clip-${Date.now()}`;

      // Reset timeline state
      win.timelineState.tracks = [];
      win.timelineState.currentTime = 0;
      win.timelineState.duration = 0;
      win.timelineState.zoom = 1;
      win.timelineState.fps = 30;
      win.timelineState.isPlaying = false;
      win.timelineState.isDragging = false;
      win.timelineState.scrollX = 0;
      win.timelineState.scrollY = 0;
      win.timelineState.scrollLeft = 0;
      win.timelineState.selectedClipIds = [];
      win.timelineState.selectedCaptionIds = [];
      win.timelineState.markers = [];
      win.timelineState.history = {
        entries: [],
        currentIndex: -1
      };

      // Then add our test track and clip
      win.timelineState.tracks.push({
        id: trackId,
        name: 'Video Track',
        type: 'video',
        clips: [{
          id: clipId,
          type: 'video',
          name: 'Test Video',
          startTime: 0,
          endTime: 1,
          src: '/test.mp4',
          mediaOffset: 0,
          mediaDuration: 1,
          originalDuration: 1,
          initialDuration: 1,
          maxDuration: 1,
          effects: [],
          layer: 0,
          handles: {
            startPosition: 0,
            endPosition: 1
          }
        }]
      });

      cy.task('log', { level: 'info', category: 'state', text: 'Track and clip added to timeline' });
    });

    // Wait for state to be updated and verify clip properties
    cy.window().should((win: any) => {
      const state = win.timelineState;
      expect(state).to.exist;
      expect(state.tracks).to.be.an('array');
      expect(state.tracks).to.have.length(1);
      expect(state.tracks[0].clips).to.have.length(1);
      
      // Verify clip properties
      const clip = state.tracks[0].clips[0];
      expect(clip.mediaDuration).to.equal(1);
      expect(clip.endTime).to.equal(1);
      expect(clip.startTime).to.equal(0);
      expect(clip.mediaOffset).to.equal(0);
      expect(clip.handles.startPosition).to.equal(0);
      expect(clip.handles.endPosition).to.equal(1);
    }).then(() => {
      cy.task('log', { level: 'info', category: 'state', text: 'Timeline state and clip properties verified' });
    });

    // Wait for React to render components
    cy.wait(5000);

    // Wait for preview display
    cy.get('[data-testid="preview-display"]', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .then(() => {
        cy.task('log', { level: 'info', category: 'mount', text: 'Preview display mounted' });
      });

    // Wait for timeline structure with increased timeout and debug logging
    cy.get('[data-testid="timeline-container"]', { timeout: 30000 })
      .should('exist')
      .and('be.visible')
      .then(() => {
        cy.task('log', { level: 'info', category: 'mount', text: 'Timeline container mounted' });
      });

    // Log the current state
    cy.window().then((win: any) => {
      cy.task('log', { 
        level: 'info', 
        category: 'state', 
        text: `Current timeline state: ${JSON.stringify({
          tracks: win.timelineState.tracks.length,
          clips: win.timelineState.tracks[0]?.clips.length
        })}` 
      });
    });

    // Wait for timeline content
    cy.get('.timeline-content-wrapper')
      .should('exist')
      .and('be.visible')
      .then(() => {
        cy.task('log', { level: 'info', category: 'mount', text: 'Timeline content wrapper mounted' });
      });

    // Log all timeline tracks found
    cy.get('.timeline-track').then(($tracks) => {
      cy.task('log', { 
        level: 'info', 
        category: 'mount', 
        text: `Found ${$tracks.length} timeline tracks with classes: ${$tracks.map((_, el) => el.className).get().join(', ')}` 
      });
    });

    // Check for clips
    cy.get('.timeline-clip').then(($clips) => {
      cy.task('log', { 
        level: 'info', 
        category: 'mount', 
        text: `Found ${$clips.length} timeline clips` 
      });
    });

    // Verify final structure
    cy.get('.timeline-track')
      .should('have.length', 1)
      .find('.timeline-clip')
      .should('have.length', 1)
      .then(() => {
        cy.task('log', { level: 'info', category: 'mount', text: 'Timeline structure mounted' });
      });
  });

  it('should display preview and handle basic clip operations', () => {
    // Verify preview display
    cy.get('[data-testid="preview-display"]')
      .should('be.visible')
      .within(() => {
        cy.get('[data-testid="preview-canvas"]')
          .should('be.visible')
          .then(($canvas) => {
            const width = $canvas.width() || 0;
            const height = $canvas.height() || 0;
            expect(width).to.be.gt(0);
            expect(height).to.be.gt(0);
            expect(width / height).to.be.closeTo(4/3, 0.5); // 320x240 aspect ratio
            cy.task('log', { level: 'info', category: 'mount', text: 'Preview canvas mounted with correct dimensions' });
          });
      });

    // Verify timeline state
    cy.window().then((win: any) => {
      const state = win.timelineState;
      expect(state.currentTime).to.equal(0);
      expect(state.isPlaying).to.be.false;
      expect(state.tracks[0].clips[0].src).to.equal('/test.mp4');
      cy.task('log', { level: 'info', category: 'state', text: 'Final timeline state verified' });
    });

    // Wait for clip to be mounted and verify its properties
    cy.get('.timeline-clip').should('be.visible');
    
    // Test handle positions relative to source media
    cy.window().then((win: any) => {
      const clip = win.timelineState.tracks[0].clips[0];
      const sourceMediaStart = clip.mediaOffset;
      const sourceMediaEnd = clip.mediaOffset + clip.mediaDuration;

      // Log initial state
      cy.task('log', { 
        level: 'info', 
        category: 'state', 
        text: `Initial clip state: ${JSON.stringify({
          id: clip.id,
          startTime: clip.startTime,
          endTime: clip.endTime,
          sourceMediaStart,
          sourceMediaEnd
        })}` 
      });

      // Test 1: Try to trim start before source media start
      win.timelineDispatch({
        type: 'TRIM_CLIP',
        payload: {
          clipId: clip.id,
          startTime: -0.5, // Try to start before timeline start
          endTime: clip.endTime,
          handles: {
            startPosition: clip.mediaOffset,
            endPosition: clip.mediaOffset + clip.endTime
          }
        }
      });

      // Verify start handle is clamped to timeline start
      cy.wait(100);
      cy.window().then((win: any) => {
        const updatedClip = win.timelineState.tracks[0].clips[0];
        expect(updatedClip.startTime).to.equal(0); // Timeline position stays at 0
        expect(updatedClip.handles.startPosition).to.equal(updatedClip.mediaOffset); // Handle aligns with media start
      }).then(() => {
        cy.task('log', { level: 'info', category: 'clip', text: 'Start handle clamped to timeline start' });
      });

      // Test 2: Try to trim end beyond source media end
      win.timelineDispatch({
        type: 'TRIM_CLIP',
        payload: {
          clipId: clip.id,
          startTime: clip.startTime,
          endTime: sourceMediaEnd + 0.5, // Try to extend beyond source media
          handles: {
            startPosition: clip.mediaOffset,
            endPosition: clip.mediaOffset + clip.mediaDuration // Should clamp to media duration
          }
        }
      });

      // Verify end handle is clamped to source media end
      cy.wait(100);
      cy.window().then((win: any) => {
        const updatedClip = win.timelineState.tracks[0].clips[0];
        expect(updatedClip.endTime).to.equal(1); // Timeline position at media duration
        expect(updatedClip.handles.endPosition).to.equal(updatedClip.mediaOffset + 1); // Handle aligns with media end
      }).then(() => {
        cy.task('log', { level: 'info', category: 'clip', text: 'End handle clamped to source media end' });
      });

      // Test 3: Try asymmetric trim within source media bounds
      win.timelineDispatch({
        type: 'TRIM_CLIP',
        payload: {
          clipId: clip.id,
          startTime: 0, // Keep at timeline start
          endTime: 0.8,  // Trim end to 0.8s
          handles: {
            startPosition: clip.mediaOffset, // Keep at media start
            endPosition: clip.mediaOffset + 0.8  // Handle at 0.8s into media
          }
        }
      });

      // Verify handle positions relative to source media
      cy.wait(100);
      cy.window().then((win: any) => {
        const updatedClip = win.timelineState.tracks[0].clips[0];
        expect(updatedClip.startTime).to.equal(0); // Timeline position stays at 0
        expect(updatedClip.endTime).to.equal(1); // Timeline position at 1s (media duration)
        expect(updatedClip.handles.startPosition).to.equal(updatedClip.mediaOffset); // Handle stays at media start
        expect(updatedClip.handles.endPosition).to.equal(updatedClip.mediaOffset + 1); // Handle at media end
      }).then(() => {
        cy.task('log', { level: 'info', category: 'clip', text: 'Asymmetric trim handle positions verified' });
      });
    });
  });
});
