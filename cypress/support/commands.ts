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
    }
  }
}

Cypress.Commands.add('mockFileOperations', () => {
  cy.window().then((win) => {
    win.validateFile = () => Promise.resolve();
    win.processFile = (file: File) => Promise.resolve({
      id: '1',
      name: file.name,
      type: file.type,
      path: URL.createObjectURL(file),
      duration: 10
    });
  });
});

Cypress.Commands.add('addTestMediaItems', () => {
  cy.window().then((win) => {
    const items = [
      {
        id: '1',
        name: 'test.mp4',
        type: 'video',
        path: 'test-assets/test.mp4',
        duration: 10
      },
      {
        id: '2',
        name: 'test.wav',
        type: 'audio',
        path: 'test-assets/test.wav',
        duration: 10
      },
      {
        id: '3',
        name: 'test.srt',
        type: 'caption',
        path: 'test-assets/test.srt',
        duration: 10
      }
    ];

    // Add items to MediaBin
    win.dispatchEvent(new CustomEvent('test:addMediaItems', { detail: items }));
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

export {};
