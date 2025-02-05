/// <reference types="cypress" />

import { createClip } from '../../../src/renderer/types/timeline';

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      waitForTimeline(): Chainable<void>;
      waitForTimelineReady(): Chainable<void>;
      addTrack(name: string, type: string): Chainable<void>;
      addClip(trackIndex: number, mediaItem: any): Chainable<void>;
      dragClip(clipIndex: number, x: number, y: number): Chainable<void>;
      trimClip(clipIndex: number, edge: 'start' | 'end', x: number): Chainable<void>;
      selectClip(clipIndex: number): Chainable<void>;
      setTrimMode(mode: 'normal' | 'ripple' | 'slip'): Chainable<void>;
    }
  }
}

Cypress.Commands.add('waitForTimeline', () => {
  // Import timeline utilities
  const { waitForTimelineInit, verifyTimelineState } = require('../utils/timeline');

  // Wait for initialization
  waitForTimelineInit();

  // Wait for timeline UI
  cy.get('[data-testid="timeline"]', { timeout: 10000 })
    .should('exist')
    .and('be.visible')
    .within(() => {
      cy.get('[data-testid="timeline-body"]').should('exist');
      cy.get('[data-testid="timeline-content"]').should('exist');
    });

  // Verify timeline state
  verifyTimelineState();
});

Cypress.Commands.add('waitForTimelineReady', () => {
  // Import timeline utilities
  const { waitForTimelineInit, verifyTimelineState } = require('../utils/timeline');

  // Wait for initialization
  waitForTimelineInit();

  // Wait for timeline UI
  cy.get('[data-testid="timeline"]', { timeout: 10000 })
    .should('exist')
    .and('be.visible')
    .within(() => {
      cy.get('[data-testid="timeline-body"]').should('exist');
      cy.get('[data-testid="timeline-content"]').should('exist');
    });

  // Verify timeline state
  verifyTimelineState();
});

Cypress.Commands.add('addTrack', (name: string, type: string) => {
  // Add track to state
  cy.window().then(win => {
    const state = (win as any).timelineState;
    win.timelineState.dispatch({
      type: 'ADD_TRACK',
      payload: {
        track: {
          id: `track-${Date.now()}`,
          name,
          type,
          clips: []
        }
      }
    });
  });

  // Wait for track to be rendered
  cy.get('.timeline-tracks-container', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

  cy.get('[data-testid="timeline-track"]')
    .should('have.length.at.least', 1);
});

Cypress.Commands.add('addClip', (trackIndex: number, mediaItem: any) => {
  // Add clip to state
  cy.window().then(win => {
    const state = (win as any).timelineState;
    const track = state.tracks[trackIndex];
    if (!track) throw new Error(`Track ${trackIndex} not found`);

    // Create clip using helper
    const clip = {
      ...mediaItem,
      id: mediaItem.id || `clip-${Date.now()}`,
      transform: {
        scale: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        opacity: 1
      },
      effects: []
    };

    // Add clip to track
    win.timelineState.dispatch({
      type: 'ADD_CLIP',
      payload: {
        trackId: track.id,
        clip
      }
    });

    // Log state after adding clip
    console.log('Timeline state after adding clip:', {
      track,
      clip,
      state
    });
  });

  // Wait for track container
  cy.get('.timeline-tracks-container', { timeout: 10000 })
    .should('exist')
    .and('be.visible');

  // Wait for track
  cy.get('[data-testid="timeline-track"]')
    .should('have.length.at.least', trackIndex + 1);

  // Wait for clip
  cy.get('[data-testid="timeline-track"]')
    .eq(trackIndex)
    .find('.timeline-clip')
    .should('have.length.at.least', 1)
    .and('be.visible');
});

Cypress.Commands.add('dragClip', (clipIndex: number, x: number, y: number) => {
  cy.get('.timeline-clip')
    .eq(clipIndex)
    .trigger('mousedown', { button: 0 });

  cy.get('.timeline-tracks-content')
    .trigger('mousemove', { clientX: x, clientY: y })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('trimClip', (clipIndex: number, edge: 'start' | 'end', x: number) => {
  const handle = edge === 'start' ? '.clip-trim-start' : '.clip-trim-end';
  cy.get('.timeline-clip')
    .eq(clipIndex)
    .find(handle)
    .trigger('mousedown', { button: 0 });

  cy.get('.timeline-tracks-content')
    .trigger('mousemove', { clientX: x })
    .trigger('mouseup', { force: true });
});

Cypress.Commands.add('selectClip', (clipIndex: number) => {
  // Get clip element
  cy.get('.timeline-clip')
    .eq(clipIndex)
    .as('clip')
    .then($clip => {
      const clipId = $clip.attr('data-clip-id');
      if (!clipId) throw new Error('Clip ID not found');

      // First dispatch the selection action
      cy.window().then(win => {
        cy.log('Initial state:', {
          selectedClipIds: win.timelineState.selectedClipIds,
          clipId
        });

        // Dispatch action
        win.timelineDispatch({
          type: 'SET_SELECTED_CLIP_IDS',
          payload: [clipId]
        });
      });

      // Wait for state update
      cy.window().should(win => {
        expect(win.timelineState.selectedClipIds).to.deep.equal([clipId]);
      });

      // Wait for DOM update
      cy.get('@clip')
        .should('have.class', 'selected')
        .and('have.attr', 'data-clip-id', clipId);

      // Then simulate click events
      cy.get('@clip')
        .trigger('pointerover', { force: true })
        .trigger('pointerenter', { force: true })
        .trigger('pointerdown', {
          button: 0,
          force: true,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse',
          clientX: $clip[0].getBoundingClientRect().left + 10,
          clientY: $clip[0].getBoundingClientRect().top + 10
        })
        .trigger('pointerup', {
          button: 0,
          force: true,
          bubbles: true,
          cancelable: true,
          pointerId: 1,
          pointerType: 'mouse'
        })
        .trigger('click', { force: true });

      // Log final state
      cy.window().then(win => {
        cy.log('Final state:', {
          selectedClipIds: win.timelineState.selectedClipIds,
          clipId
        });
      });
    });
});

Cypress.Commands.add('setTrimMode', (mode: 'normal' | 'ripple' | 'slip') => {
  // Get the currently trimming clip
  cy.get('[data-testid="timeline-clip"][data-trimming]').should('exist').then($clip => {
    // Focus the clip element
    $clip[0].focus();

    // Create and dispatch keyboard event based on mode
    let event;
    switch (mode) {
      case 'ripple':
        event = new KeyboardEvent('keydown', {
          key: 'r',
          code: 'KeyR',
          keyCode: 82,
          which: 82,
          bubbles: true,
          cancelable: true
        });
        break;
      case 'slip':
        event = new KeyboardEvent('keydown', {
          key: 'Shift',
          code: 'ShiftLeft',
          keyCode: 16,
          which: 16,
          shiftKey: true,
          bubbles: true,
          cancelable: true
        });
        break;
      case 'normal':
        event = new KeyboardEvent('keydown', {
          key: 'n',
          code: 'KeyN',
          keyCode: 78,
          which: 78,
          bubbles: true,
          cancelable: true
        });
        break;
    }

    // Dispatch event and verify mode was set
    $clip[0].dispatchEvent(event);
    cy.wrap($clip).should('have.attr', 'data-trim-mode', mode);
  });
});
