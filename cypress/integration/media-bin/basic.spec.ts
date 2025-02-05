/// <reference types="cypress" />

describe('Media Bin Basic Tests', () => {
  beforeEach(() => {
    // Set up test data and wait for initialization
    cy.setupTestData();
    
    // Wait for timeline initialization
    cy.window().then(win => {
      return new Cypress.Promise((resolve) => {
        const handleInit = (e: CustomEvent) => {
          win.removeEventListener('timeline:initialized', handleInit as EventListener);
          resolve(e.detail);
        };
        
        win.addEventListener('timeline:initialized', handleInit as EventListener);
        
        // Also resolve if state is already initialized
        if ((win as any).timelineReady) {
          resolve({
            state: (win as any).timelineState,
            isValid: true,
            errors: []
          });
        }
      });
    }).then((detail: any) => {
      // Verify initialization was successful
      expect(detail.isValid).to.be.true;
      expect(detail.errors).to.have.length(0);
      expect(detail.state).to.exist;
    });

    // Wait for media bin to be ready
    cy.waitForMediaBin();
  });

  afterEach(() => {
    // Clean up any test-created media items
    cy.window().then((win) => {
      const state = (win as any).timelineState;
      if (state && state.mediaItems) {
        state.mediaItems.forEach((item: any) => {
          if (item.path && item.path.startsWith('blob:')) {
            try {
              win.URL.revokeObjectURL(item.path);
            } catch (e) {
              // Ignore errors from invalid URLs
            }
          }
        });
      }
    });
  });

  it('should display media items correctly', () => {
    // Verify initial media items
    cy.get('[data-testid="media-bin"]').should('exist');
    
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', 2)
      .first()
      .should('contain.text', 'test.mp4');

    // Verify media types are displayed by their icons
    cy.get('[data-testid="media-bin-item"]').eq(0)
      .find('.media-asset-placeholder')
      .should('contain', '🎥'); // Video icon
    cy.get('[data-testid="media-bin-item"]').eq(1)
      .find('.media-asset-placeholder')
      .should('contain', '🔊'); // Audio icon
  });

  it('should allow selecting media items', () => {
    // Select first item and verify selection
    cy.selectMediaItem(0);

    // Select second item and verify selection
    cy.selectMediaItem(1);
  });

  it('should allow importing new media', () => {
    // Import a new video file using test event
    cy.window().then(win => {
      const newItem = {
        id: '3',
        name: 'test.mp4',
        type: 'video',
        path: 'mock://test.mp4',
        duration: 10,
        originalDuration: 10,
        initialDuration: 10,
        maxDuration: 10
      };
      win.dispatchEvent(new CustomEvent('test:addMediaItems', { 
        detail: [newItem]
      }));
    });
    
    // Verify new item is added
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', 3)
      .last()
      .should('contain.text', 'test.mp4');
  });

  it('should allow removing media items', () => {
    // Get initial items count
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', 2);

    // Remove first item and verify second item remains
    cy.removeMediaItem(0);
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', 1)
      .first()
      .should('contain.text', 'test.wav');

    // Verify state is updated
    cy.window().should(win => {
      const state = (win as any).timelineState;
      expect(state.mediaItems).to.have.length(1);
      expect(state.mediaItems[0].name).to.equal('test.wav');
    });
  });

  it('should allow dragging media to timeline', () => {
    // Add a video track and drag media to it
    cy.addTrack('Video Track', 'video');
    cy.get('.timeline-track').should('exist');
    cy.dragMediaToTimeline(0, 0, 100);

    // Wait for clip to be added and verify properties
    cy.get('.timeline-clip')
      .should('exist')
      .and('have.length', 1);

    // Verify clip was added to timeline state
    cy.window().should(win => {
      const state = (win as any).timelineState;
      const clip = state.tracks[0].clips[0];
      
      expect(clip).to.not.be.undefined;
      expect(clip.path).to.include('test.mp4');
      expect(clip.startTime).to.be.closeTo(1, 0.1); // Around 1 second (100px)
      expect(clip.duration).to.be.closeTo(10, 0.1); // Default duration
    });
  });

  it('should maintain media bin state after timeline operations', () => {
    // Add track and drag media to it
    cy.addTrack('Video Track', 'video');
    cy.dragMediaToTimeline(0, 0, 100);

    // Verify media bin still has all items
    cy.get('[data-testid="media-bin-item"]')
      .should('have.length', 2);

    // Verify items are still selectable
    cy.selectMediaItem(0);
  });
});
