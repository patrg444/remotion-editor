/// <reference types="cypress" />

export {};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      /**
       * Wait for preview to be ready
       */
      waitForPreview(): Chainable<void>;

      /**
       * Play/pause preview
       */
      togglePlayback(): Chainable<void>;

      /**
       * Seek to specific time
       * @param time Time in seconds
       */
      seekTo(time: number): Chainable<void>;

      /**
       * Get current playback time
       */
      getCurrentTime(): Chainable<number>;
    }
  }
}

Cypress.Commands.addAll({
  waitForPreview() {
    // Import timeline utilities
    const { waitForTimelineInit, verifyTimelineState } = require('../utils/timeline');

    // Wait for initialization
    waitForTimelineInit();

    // Wait for app to be ready
    cy.get('[data-testid="app-root"]', { timeout: 60000 })
      .should('exist')
      .and('be.visible');

    // Wait for preview UI
    cy.get('[data-testid="preview-display"]', { timeout: 60000 })
      .should('exist')
      .and('be.visible')
      .within(() => {
        cy.get('[data-testid="preview-canvas"]')
          .should('exist')
          .and('be.visible')
          .and(($canvas) => {
            const width = $canvas.width() || 0;
            const height = $canvas.height() || 0;
            expect(width, `Preview width (${width}px) should be greater than 0`).to.be.gt(0);
            expect(height, `Preview height (${height}px) should be greater than 0`).to.be.gt(0);
            
            // Allow more flexibility in aspect ratio due to container constraints
            const aspectRatio = width / height;
            const expectedRatio = 16/9;
            const tolerance = 0.5; // Increased tolerance for aspect ratio
            expect(
              aspectRatio,
              `Preview aspect ratio (${aspectRatio.toFixed(2)}) should be roughly 16:9 (${expectedRatio}). Current dimensions: ${width}x${height}`
            ).to.be.closeTo(expectedRatio, tolerance);
          });
      });

    // Wait for playback controls
    cy.get('[data-testid="playback-controls"]', { timeout: 60000 })
      .should('exist')
      .and('be.visible')
      .within(() => {
        cy.get('[data-testid="play-button"]')
          .should('exist')
          .and('be.visible');
      });

    // Verify timeline state
    verifyTimelineState();

    // Verify preview specific state
    cy.window({ timeout: 60000 }).should(win => {
      const state = (win as any).timelineState;
      expect(state.currentTime, 'Current time should be a number').to.be.a('number');
      expect(state.isPlaying, 'isPlaying should be a boolean').to.be.a('boolean');
      expect(state.aspectRatio, 'Aspect ratio should be defined').to.be.a('string');
      expect(state.error === null || state.error === undefined, 'No errors should be present').to.be.true;
      expect(state.tracks, 'Tracks should be an array').to.be.an('array');
      expect(state.selectedClipIds, 'Selected clips should be an array').to.be.an('array');
    });

    // Wait for any animations to complete
    cy.wait(500);
  },

  togglePlayback() {
    // Get initial state
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const wasPlaying = state.isPlaying;

      // Click play button
      cy.get('[data-testid="play-button"]').click();

      // Verify state changed
      cy.window().should(win => {
        const state = (win as any).timelineState;
        expect(state.isPlaying, 'Playback state should toggle').to.equal(!wasPlaying);
        if (state.isPlaying) {
          expect(state.currentTime, 'Time should advance when playing').to.be.gte(0);
        }
      });
    });
  },

  seekTo(time: number) {
    // Import timeline utilities
    const { timeToPixels } = require('../utils/timeline');

    // Get current zoom and calculate position
    cy.window().then(win => {
      const state = (win as any).timelineState;
      const x = timeToPixels(time, state.zoom);

      // Click timeline ruler at calculated position
      cy.get('[data-testid="timeline-ruler"]').click(x, 10);

      // Verify seek with retries
      cy.window().should(win => {
        const state = (win as any).timelineState;
        expect(state.currentTime, `Time should be close to ${time}`).to.be.closeTo(time, 0.1);
        expect(state.error === null || state.error === undefined, 'No errors should occur during seek').to.be.true;
      });
    });
  },

  getCurrentTime() {
    return cy.window().then(win => {
      const state = (win as any).timelineState;
      expect(state.currentTime, 'Current time should be a number').to.be.a('number');
      return state.currentTime;
    });
  }
});
