/// <reference types="cypress" />
import "cypress-real-events";

// Import commands.js using ES2015 syntax:
import './commands';

// Import additional command files
import './commands/media-bin';
import './commands/timeline';
import './commands/preview';

// Import utilities
import { waitForTimelineInit } from './utils/timeline';

// Configure uncaught exception handling
Cypress.on('uncaught:exception', () => false);

// Configure before hook for global setup
before(() => {
  // Visit app and wait for it to be ready
  cy.visit('http://localhost:8083', {
    timeout: 60000,
    retryOnNetworkFailure: true,
    onBeforeLoad(win) {
      // Keep all console logs for debugging
      const originalLog = win.console.log;
      const originalError = win.console.error;
      win.console.log = (...args) => {
        originalLog.apply(win.console, args);
        cy.log('Console:', ...args);
      };
      win.console.error = (...args) => {
        originalError.apply(win.console, args);
        cy.log('Error:', ...args);
      };
    }
  });

  // Wait for root element and log its state
  cy.get('#root', { timeout: 60000 })
    .should('exist')
    .then($root => {
      cy.log('Root element found:', {
        html: $root.html(),
        width: $root.width(),
        height: $root.height(),
        isVisible: $root.is(':visible')
      });
    });

  // Log all elements with data-testid attributes
  cy.document().then(doc => {
    const elements = doc.querySelectorAll('[data-testid]');
    cy.log('Found elements with data-testid:', Array.from(elements).map(el => ({
      testId: el.getAttribute('data-testid'),
      isVisible: window.getComputedStyle(el).display !== 'none'
    })));
  });

  // Wait for app-root element with detailed logging
  cy.get('[data-testid="app-root"]', { timeout: 60000 })
    .should('exist')
    .and('be.visible')
    .then($appRoot => {
      cy.log('App root found:', {
        html: $appRoot.html(),
        width: $appRoot.width(),
        height: $appRoot.height(),
        isVisible: $appRoot.is(':visible'),
        computedStyle: window.getComputedStyle($appRoot[0])
      });
    });

  // Wait for timeline initialization
  cy.window({ timeout: 60000 }).should((win: any) => {
    const ready = win.timelineReady === true &&
                 win.timelineState != null &&
                 win.timelineFunctions?.rippleTrim != null;
    if (ready) {
      cy.log('Timeline ready');
    }
    return ready;
  });

  // Cache initial state
  cy.window({ log: false }).then(win => {
    (win as any).__initialState = {
      timelineState: { ...(win as any).timelineState },
      mediaBinContext: { ...(win as any).mediaBinContext }
    };
  });
});

// Configure before each hook
beforeEach(() => {
  // Reset viewport
  cy.viewport(1000, 660, { log: false });

  // Reset state to empty
  cy.window({ log: false }).then(win => {
    if ((win as any).timelineState) {
      (win as any).timelineState.dispatch({
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
    }
    if ((win as any).mediaBinContext) {
      (win as any).mediaBinContext.items = [];
    }
  });
});

// Configure after each hook
afterEach(() => {
  // Clean up timeline state
  cy.window({ log: false }).then(win => {
    const state = (win as any).timelineState;
    if (state) {
      state.dispatch({
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
    }
  });
});
