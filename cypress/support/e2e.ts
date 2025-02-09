/// <reference types="cypress" />
import "cypress-real-events";

// Import commands
import './commands';
import './commands/performance';
import './commands/media-bin';
import './commands/timeline';
import './commands/transition';
import './commands/preview';

// Handle only known benign exceptions
Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});

// Set default viewport
beforeEach(() => {
  cy.viewport(1280, 800);
});
