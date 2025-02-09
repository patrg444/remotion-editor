/// <reference types="cypress" />

export {};

interface MediaBinContext {
  items: any[];
  selectedItem: any | null;
  addItems: (items: any[]) => void;
  removeItem: (id: string) => void;
  selectItem: (item: any | null) => void;
}

declare global {
  interface Window {
    mediaBinContext: MediaBinContext;
  }

  namespace Cypress {
    interface Chainable<Subject = any> {
      waitForMediaBin(): Chainable<void>;
      addMediaItems(items: any[]): Chainable<void>;
      selectMediaItem(index: number): Chainable<void>;
      removeMediaItem(index: number): Chainable<void>;
      dragMediaToTimeline(index: number, x: number, y: number): Chainable<void>;
      setupTestData(): Chainable<void>;
    }
  }
}

// Helper function to create a test media item
function loadTestVideo(win: Window & typeof globalThis): void {
  const mediaItem = {
    id: `media-1-${Date.now().toString(36)}`,
    name: 'test.mp4',
    type: 'video',
    path: '/test.mp4',
    duration: 5,
    originalDuration: 5,
    initialDuration: 5,
    maxDuration: 5,
    width: 1920,
    height: 1080,
    thumbnail: '/test.webm',
    metadata: {
      fps: 30,
      codec: 'h264',
      duration: 5
    }
  };

  // Initialize MediaBinContext
  win.mediaBinContext = {
    items: [],
    selectedItem: null,
    addItems: (items: any[]) => {
      win.mediaBinContext.items = [...win.mediaBinContext.items, ...items];
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          mediaBin: {
            ...win.timelineState.mediaBin,
            items: win.mediaBinContext.items
          }
        }
      });
    },
    removeItem: (id: string) => {
      win.timelineDispatch({
        type: 'REMOVE_MEDIA_ITEM',
        payload: { id }
      });
    },
    selectItem: () => {}
  };

  // Add item through context
  win.mediaBinContext.addItems([mediaItem]);

  // Force layout update
  win.timelineDispatch({
    type: 'UPDATE_LAYOUT'
  });
}

function initializeMediaBinContext(win: Window & typeof globalThis): void {
  win.mediaBinContext = {
    items: [],
    selectedItem: null,
    addItems: (items: any[]) => {
      win.mediaBinContext.items = [...win.mediaBinContext.items, ...items];
      win.timelineDispatch({
        type: 'SET_STATE',
        payload: {
          ...win.timelineState,
          mediaBin: {
            ...win.timelineState.mediaBin,
            items: win.mediaBinContext.items
          }
        }
      });
    },
    removeItem: (id: string) => {
      win.timelineDispatch({
        type: 'REMOVE_MEDIA_ITEM',
        payload: { id }
      });
    },
    selectItem: () => {}
  };
}

function resetTimelineState(win: Window & typeof globalThis): void {
  win.timelineDispatch({
    type: 'SET_STATE',
    payload: {
      mediaBin: {
        items: [],
        selectedIds: []
      },
      tracks: [
        {
          id: 'track-1',
          clips: [],
          transitions: [],
          allowTransitions: true,
          transitionsEnabled: true,
          showTransitions: true
        }
      ],
      zoom: 50,
      currentTime: 0,
      duration: 0,
      fps: 30,
      isPlaying: false,
      isDragging: false,
      dragStartX: 0,
      dragStartY: 0,
      scrollX: 0,
      scrollY: 0,
      error: null,
      selectedClipIds: [],
      selectedTrackId: null,
      history: {
        entries: [],
        currentIndex: -1
      }
    }
  });
  win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
}

Cypress.Commands.add('waitForMediaBin', () => {
  cy.get('[data-testid="media-bin"]', { timeout: 60000 }).should('exist').should('be.visible');
  cy.get('[data-testid="media-bin-content"]', { timeout: 60000 }).should('exist').should('be.visible');
  cy.window().then(win => {
    initializeMediaBinContext(win);
    resetTimelineState(win);
    loadTestVideo(win);
  });
  cy.get('[data-testid="media-bin-item"]', { timeout: 60000 }).should('exist').should('be.visible').should('have.length', 1);
});

Cypress.Commands.add('addMediaItems', (items: any[]) => {
  cy.window().then(win => {
    items.forEach(item => {
      win.timelineDispatch({
        type: 'ADD_MEDIA_ITEM',
        payload: item
      });
    });
    win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
  });
  cy.get('[data-testid="media-bin-item"]').should('have.length', items.length).should('be.visible');
});

Cypress.Commands.add('selectMediaItem', (index: number) => {
  cy.get('[data-testid="media-bin-item"]').eq(index).click();
});

Cypress.Commands.add('removeMediaItem', (index: number) => {
  cy.window().then(win => {
    const itemId = win.timelineState?.mediaBin?.items[index]?.id;
    win.timelineDispatch({
      type: 'REMOVE_MEDIA_ITEM',
      payload: { id: itemId }
    });
    win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
  });
});

Cypress.Commands.add('dragMediaToTimeline', (index: number, x: number, y: number) => {
  cy.get('[data-testid="timeline-tracks-content"]')
    .scrollIntoView()
    .should('exist')
    .should('be.visible')
    .then($content => {
      const rect = $content[0].getBoundingClientRect();
      const boundedX = Math.min(Math.max(x, rect.left + 10), rect.right - 10);
      const boundedY = Math.min(Math.max(y, rect.top + 10), rect.bottom - 10);

      cy.get('[data-testid="media-bin-item"]')
        .eq(index)
        .then($item => {
          const itemRect = $item[0].getBoundingClientRect();
          cy.wrap($item)
            .trigger('mousedown', { button: 0, clientX: itemRect.left + 10, clientY: itemRect.top + 10 })
            .trigger('mousemove', { clientX: boundedX, clientY: boundedY, force: true });
          cy.get('[data-testid="timeline-tracks-content"]')
            .trigger('mousemove', { clientX: boundedX, clientY: boundedY, force: true })
            .trigger('mouseup', { clientX: boundedX, clientY: boundedY, force: true });
        });
    });
});

Cypress.Commands.add('setupTestData', () => {
  // Visit the page first
  cy.visit('http://localhost:8084', {
    onBeforeLoad: (win) => {
      win.addEventListener('error', (e) => {
        // Ignore ResizeObserver errors
        if (e.message.includes('ResizeObserver')) {
          return false;
        }
      });
    }
  });

  // Wait for app root and initial components
  cy.get('[data-testid="app-root"]').should('exist').and('be.visible');

  // Wait for timeline initialization sequence
  cy.window().then(win => {
    return new Cypress.Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeline initialization timeout'));
      }, 30000);

      const handleInit = () => {
        clearTimeout(timeout);
        win.removeEventListener('timeline:initialized', handleInit);
        resolve(win);
      };

      win.addEventListener('timeline:initialized', handleInit);
      
      // If already initialized, resolve immediately
      if (win.timelineReady) {
        clearTimeout(timeout);
        resolve(win);
      }
    });
  });

  // Wait for timeline dispatch and state to be ready
  cy.window()
    .should('have.property', 'timelineDispatch')
    .should('have.property', 'timelineState')
    .should('have.property', 'timelineReady', true);

  // Wait for MediaBinContext to be ready and verify its structure
  cy.window().should(win => {
    expect(win).to.have.property('mediaBinContext');
    expect(win.mediaBinContext).to.have.property('items').that.is.an('array');
    expect(win.mediaBinContext).to.have.property('addItems').that.is.a('function');
    expect(win.mediaBinContext).to.have.property('removeItem').that.is.a('function');
    expect(win.mediaBinContext).to.have.property('selectItem').that.is.a('function');
  });

  // Initialize contexts and state
  cy.window().then(win => {
    // Reset everything first
    resetTimelineState(win);
    initializeMediaBinContext(win);

    // Add test media item and verify it was added
    loadTestVideo(win);
    
    // Force a re-render
    win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
  });

  // Wait for state update to complete
  cy.window().should(win => {
    expect(win.timelineState.mediaBin.items).to.have.length(1);
  });

  // Wait for media bin components
  cy.get('[data-testid="media-bin"]')
    .should('exist')
    .and('be.visible');
  
  cy.get('[data-testid="media-bin-content"]')
    .should('exist')
    .and('be.visible');

  // Wait for media bin item to be rendered
  cy.get('[data-testid="media-bin-item"]')
    .should('exist')
    .and('be.visible')
    .and('have.length', 1);
});
