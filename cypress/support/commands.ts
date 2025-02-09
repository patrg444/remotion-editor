declare global {
  namespace Cypress {
    interface Chainable {
      mockFileOperations(): Chainable<void>;
      addTestMediaItems(): Chainable<void>;
      dragAndDrop(target: string, options?: {
        clientX?: number;
        clientY?: number;
        force?: boolean;
        json?: any;
      }): Chainable<void>;
      setupTransitionTest(): Chainable<void>;
      addTransition(clipAId: string, clipBId: string, type: string, options?: {
        duration?: number;
      }): Chainable<string>;
    }
  }
}

Cypress.Commands.add('mockFileOperations', () => {
  cy.window().then((win) => {
    win.validateFile = () => Promise.resolve();
    win.processFile = (file: File) => Promise.resolve({
      id: `media-1-${Date.now().toString(36)}`,
      name: file.name,
      type: file.type,
      path: URL.createObjectURL(file),
      duration: 10,
      width: 1920,
      height: 1080,
      thumbnail: '/test.webm',
      metadata: {
        duration: 10,
        fps: 30,
        codec: 'h264',
        width: 1920,
        height: 1080
      },
      originalDuration: 10,
      initialDuration: 10,
      maxDuration: 10,
      source: '/test.mp4'
    });
  });
});

Cypress.Commands.add('addTestMediaItems', () => {
  cy.window().then((win) => {
    const items = [
      {
        id: `media-1-${Date.now().toString(36)}`,
        name: 'test.mp4',
        type: 'video',
        path: '/test.mp4',
        duration: 10,
        originalDuration: 10,
        initialDuration: 10,
        maxDuration: 10,
        width: 1920,
        height: 1080,
        thumbnail: '/test.webm',
        metadata: {
          fps: 30,
          codec: 'h264',
          duration: 10,
          width: 1920,
          height: 1080
        },
        source: '/test.mp4'
      }
    ];

    // Add items through MediaBinContext
    if (win.mediaBinContext && win.mediaBinContext.addItems) {
      win.mediaBinContext.addItems(items);
    }
  });
});

Cypress.Commands.add('dragAndDrop', { prevSubject: 'element' }, (subject, target: string, options = {}) => {
  const { clientX = 0, clientY = 0, force = false, json } = options;

  const dataTransfer = {
    getData: (type: string) => {
      console.log('getData called with type:', type);
      if (type === 'application/json' && json) {
        const jsonStr = JSON.stringify(json);
        console.log('Returning JSON data:', jsonStr);
        return jsonStr;
      }
      console.log('No data for type:', type);
      return '';
    },
    setData: (type: string, value: string) => {
      console.log('setData called:', { type, value });
    },
    types: ['application/json'],
    dropEffect: 'move',
    effectAllowed: 'all',
    files: [],
    items: [],
    clearData: () => {
      console.log('clearData called');
    }
  };

  console.log('Created dataTransfer:', dataTransfer);

  cy.wrap(subject).trigger('dragstart', {
    force,
    dataTransfer
  }).then(() => {
    console.log('dragstart triggered');
  });

  cy.get(target)
    .trigger('dragenter', { force, clientX, clientY, dataTransfer })
    .then(() => {
      console.log('dragenter triggered');
    })
    .trigger('dragover', { force, clientX, clientY, dataTransfer })
    .then(() => {
      console.log('dragover triggered');
    })
    .trigger('drop', { force, clientX, clientY, dataTransfer })
    .then(() => {
      console.log('drop triggered');
    });

  cy.wrap(subject).trigger('dragend', { force })
    .then(() => {
      console.log('dragend triggered');
    });
});

// Add transition between two clips
Cypress.Commands.add('addTransition', (clipAId: string, clipBId: string, type: string, options = {}) => {
  const { duration = 0.5 } = options;

  return cy.window().then(win => {
    const transitionId = `transition-${Date.now().toString(36)}`;

    win.timelineDispatch({
      type: 'ADD_TRANSITION',
      payload: {
        id: transitionId,
        clipAId,
        clipBId,
        type,
        duration
      }
    });

    win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

    return transitionId;
  });
});

// Import the setup function
import { setupTransitionTest } from './utils/transition-test-setup';

// Add the command
Cypress.Commands.add('setupTransitionTest', setupTransitionTest);

export {};
