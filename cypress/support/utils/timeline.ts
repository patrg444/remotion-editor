/// <reference types="cypress" />

export const waitForTimelineInit = () => {
  // Wait for timeline state to be initialized with retries
  cy.window({ log: false }).should(win => {
    expect(win.timelineReady, 'Timeline ready flag should be set').to.be.true;
    const state = (win as any).timelineState;
    expect(state, 'Timeline state should exist').to.exist;
    expect(state.tracks, 'Timeline tracks should be an array').to.be.an('array');
    expect(state.dispatch, 'Timeline dispatch should be a function').to.be.a('function');
  });

  // Wait for timeline events to be dispatched
  cy.window({ log: false }).then(win => {
    return new Promise((resolve) => {
      const checkInit = () => {
        if ((win as any).timelineReady && (win as any).timelineState) {
          resolve(true);
        } else {
          setTimeout(checkInit, 100);
        }
      };
      checkInit();
    });
  });

  // Additional wait to ensure state is stable
  cy.wait(500);
};

export const verifyTimelineState = () => {
  // Verify timeline state with retries
  cy.window({ log: false, timeout: 10000 }).should(win => {
    const state = (win as any).timelineState;
    expect(state?.tracks, 'Timeline tracks should be an array').to.be.an('array');
    expect(state?.currentTime, 'Timeline current time should be a number').to.be.a('number');
    expect(state?.isPlaying, 'Timeline playing state should be a boolean').to.be.a('boolean');
    expect(state?.zoom, 'Timeline zoom should be a number').to.be.a('number');
    expect(state?.fps, 'Timeline FPS should be a number').to.be.a('number');
  });
};

export const waitForTimelineReady = () => {
  // Wait for essential timeline elements with increased timeouts
  cy.get('[data-testid="timeline"]', { timeout: 10000, log: false })
    .should('exist')
    .and('be.visible');

  cy.get('[data-testid="timeline-body"]', { timeout: 10000, log: false })
    .should('exist')
    .and('be.visible');

  cy.get('[data-testid="timeline-content"]', { timeout: 10000, log: false })
    .should('exist')
    .and('be.visible');

  cy.get('.timeline-tracks-container', { timeout: 10000, log: false })
    .should('exist')
    .and('be.visible');

  cy.get('[data-testid="timeline-tracks-content"]', { timeout: 10000, log: false })
    .should('exist')
    .and('be.visible');
};

export const verifyClipContent = (clip: any) => {
  expect(clip?.content?.frames, 'Clip frames should exist').to.exist;
  expect(clip?.content?.frames?.length, 'Clip should have frames').to.be.gt(0);
  expect(clip?.content?.currentFrame, 'Clip current frame should be a number').to.be.a('number');
  expect(clip?.content?.isPlaying, 'Clip playing state should be a boolean').to.be.a('boolean');
};
