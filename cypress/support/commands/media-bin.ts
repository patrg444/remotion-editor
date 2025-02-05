/// <reference types="cypress" />

export {};

declare global {
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

Cypress.Commands.addAll({
  waitForMediaBin() {
    // Wait for media bin UI
    cy.get('[data-testid="media-bin"]')
      .should('exist')
      .and('be.visible');
  },

  addMediaItems(items: any[]) {
    // Add items directly to state
    cy.window().then(win => {
      const context = (win as any).mediaBinContext;
      context.addItems(items);
    });

    // Wait for items to be rendered
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', items.length);
  },

  selectMediaItem(index: number) {
    cy.get('[data-testid="media-bin-item"]')
      .eq(index)
      .click();
  },

  removeMediaItem(index: number) {
    cy.window().then(win => {
      const context = (win as any).mediaBinContext;
      context.removeItem(context.items[index]);
    });
  },

  dragMediaToTimeline(index: number, x: number, y: number) {
    cy.get('[data-testid="media-bin-item"]')
      .eq(index)
      .trigger('mousedown', { button: 0 })
      .get('[data-testid="timeline-tracks-content"]')
      .trigger('mousemove', { clientX: x, clientY: y })
      .trigger('mouseup', { force: true });
  },

  setupTestData() {
    // Initialize media bin context
    cy.window().then(win => {
      (win as any).mediaBinContext = {
        items: [],
        selectedItem: null,
        addItems: (items: any[]) => {
          (win as any).mediaBinContext.items = [
            ...(win as any).mediaBinContext.items,
            ...items
          ];
        },
        removeItem: (id: string) => {
          (win as any).mediaBinContext.items = (win as any).mediaBinContext.items
            .filter((item: any) => item.id !== id);
        },
        selectItem: (item: any) => {
          (win as any).mediaBinContext.selectedItem = item;
        }
      };

      // Add test media items
      (win as any).mediaBinContext.addItems([{
        id: 'test-video',
        name: 'Test Video',
        path: 'mock://test.mp4',
        type: 'video',
        duration: 1,
        width: 1920,
        height: 1080,
        fps: 30,
        frames: 30,
        metadata: {
          duration: 1,
          width: 1920,
          height: 1080,
          fps: 30,
          frames: 30
        },
        content: {
          frames: Array.from({ length: 30 }, (_, i) => ({
            index: i,
            timestamp: i / 30
          })),
          currentFrame: 0,
          isPlaying: false
        }
      }]);
    });

    // Wait for items to be rendered
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', 1);
  }
});
