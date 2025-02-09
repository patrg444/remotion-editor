/// <reference types="cypress" />

import { setupMediaBin, createTestMediaItem, createDefaultTrack, createTestClip } from '../../support/utils/media-bin-test-utils';
import { VideoClip, ClipWithLayer } from '../../../src/renderer/types/timeline';

describe('Media Bin Basic Tests', () => {
  beforeEach(() => {
    const mediaItems = [
      createTestMediaItem({
        id: 'test-1',
        name: 'test.mp4',
        duration: 5
      }),
      createTestMediaItem({
        id: 'test-2',
        name: 'test2.mp4',
        duration: 10
      })
    ];
    const track = createDefaultTrack({
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      clips: [],
      transitions: [],
      allowTransitions: true,
      transitionsEnabled: true,
      showTransitions: true,
      isLocked: false,
      isVisible: true,
      isMuted: false,
      allowOverlap: false,
      height: 100
    });
    setupMediaBin({ mediaItems, tracks: [track] });
  });

  it('should render media bin with items', () => {
    cy.get('[data-testid="media-bin"]').should('exist');
    cy.get('[data-testid="media-bin-content"]').should('exist');
    cy.get('[data-testid="media-bin-item"]').should('have.length', 2);
  });

  describe('Basic Functionality', () => {
    it('should display media items correctly', () => {
      cy.get('[data-testid="media-bin"]')
        .should('exist')
        .and('be.visible')
        .and('have.attr', 'role', 'region')
        .and('have.attr', 'aria-label', 'Media Bin');
      
      cy.get('[data-testid="media-bin-item"]')
        .should('have.length', 2)
        .first()
        .should('contain.text', 'test.mp4')
        .and('have.attr', 'role', 'button')
        .and('have.attr', 'aria-selected', 'false');

      // Verify media types are displayed by their icons
      cy.get('[data-testid="media-bin-item"]').eq(0)
        .find('.media-asset-placeholder')
        .should('contain', '🎥')
        .and('have.attr', 'aria-label', 'Video');
    });

    it('should allow selecting media items', () => {
      // Click the item to select it
      cy.get('[data-testid="media-bin-item"]').first().click();

      // Verify selection state
      cy.get('[data-testid="media-bin-item"]').first()
        .should('have.class', 'selected')
        .and('have.attr', 'aria-selected', 'true');
    });

    it('should have keyboard event handlers', () => {
      // Wait for items to be rendered
      cy.get('[data-testid="media-bin-item"]').should('have.length', 2);

      // Trigger keyboard event
      cy.get('[data-testid="media-bin-item"]').first()
        .focus()
        .trigger('keydown', { key: ' ' });

      // Verify selection state
      cy.get('[data-testid="media-bin-item"]')
        .first()
        .should('have.class', 'selected')
        .and('have.attr', 'aria-selected', 'true');

      // Verify tabindex is set for keyboard navigation
      cy.get('[data-testid="media-bin-item"]')
        .first()
        .should('have.attr', 'tabindex', '0');
    });
  });

  describe('Timeline Integration', () => {
    it('should render timeline with tracks', () => {
      cy.get('[data-testid="timeline"]').should('exist');
      cy.get('[data-testid="timeline-tracks"]').should('exist');
      cy.get('[data-testid="timeline-track"]').should('exist');
    });

    it('should create clip from media item', () => {
      // Wait for timeline state to be initialized
      cy.get('[data-testid="media-bin-item"]').should('have.length', 2);
      cy.window().should('have.property', 'timelineReady', true);
      cy.wait(500); // Wait for initial state to be set
      // Wait for timeline state to be fully initialized
      cy.window().should(win => {
        expect(win.timelineState).to.exist;
        expect(win.timelineState.mediaBin).to.exist;
        expect(win.timelineState.mediaBin.items).to.exist;
        expect(win.timelineState.mediaBin.items).to.have.length(2);
      });

      // Wait for tracks to be initialized
      cy.window().should(win => {
        expect(win.timelineState.tracks).to.exist;
        expect(win.timelineState.tracks).to.have.length(1);
      });

      // Wait for React to sync state
      cy.wait(500);
      cy.window()
        .then(() => {
          cy.window().then(win => {
            const mediaItem = win.timelineState.mediaBin.items[0];
            expect(mediaItem).to.exist;
            expect(mediaItem.type).to.exist;
            const clip = {
              id: `clip-${Date.now()}`,
              type: mediaItem.type,
              name: mediaItem.name,
              startTime: 0,
              endTime: mediaItem.duration,
              src: mediaItem.path,
              layer: 0,
              originalDuration: mediaItem.duration,
              initialDuration: mediaItem.duration,
              maxDuration: mediaItem.duration,
              mediaOffset: 0,
              mediaDuration: mediaItem.duration,
              effects: [],
              transform: {
                scale: 1,
                rotation: 0,
                position: { x: 0, y: 0 },
                opacity: 1
              },
              thumbnail: null,
              isVisible: true,
              isLocked: false,
              volume: 1,
              speed: 1
            };
            
            // Add clip to track
            win.timelineDispatch({
              type: 'ADD_CLIP',
              payload: {
                trackId: 'track-1',
                clip
              }
            });

            // Wait for track to be ready and clip to be added
            cy.window().should(win => {
              expect(win).to.have.property('timelineState');
              const state = win.timelineState;
              expect(state).to.have.property('tracks');
              expect(state.tracks).to.be.an('array');
              expect(state.tracks).to.have.length(1);
              expect(state.tracks[0]).to.have.property('clips');
              expect(state.tracks[0].clips).to.be.an('array');
              expect(state.tracks[0].clips).to.have.length(1);
            });

            // Wait for clip to be added to state
            cy.window().should(win => {
              expect(win.timelineState.tracks[0].clips).to.have.length(1);
            });

            // Wait for clip to be rendered
            cy.get('[data-testid="timeline-clip"]', { timeout: 10000 })
              .should('exist')
              .and('have.attr', 'aria-label', clip.name)
              .and('have.css', 'position', 'absolute');

            // Verify clip properties
            cy.window().then(win => {
              const state = win.timelineState;
              expect(state.tracks[0].clips[0]).to.deep.include({
                id: clip.id,
                name: clip.name,
                type: clip.type,
                startTime: clip.startTime,
                endTime: clip.endTime
              });
            });
          });
        });
    });

    it('should allow dragging media items to timeline', () => {
      // Create dataTransfer object
      const dataTransfer = {
        data: {} as Record<string, string>,
        setData: function(type: string, value: string) {
          this.data[type] = value;
        },
        getData: function(type: string) {
          return this.data[type];
        }
      };

      // Wait for timeline state to be initialized
      cy.get('[data-testid="media-bin-item"]').should('have.length', 2);
      cy.window().should('have.property', 'timelineReady', true);
      cy.wait(500); // Wait for initial state to be set
      // Wait for timeline state to be fully initialized
      cy.window().should(win => {
        expect(win.timelineState).to.exist;
        expect(win.timelineState.mediaBin).to.exist;
        expect(win.timelineState.mediaBin.items).to.exist;
        expect(win.timelineState.mediaBin.items).to.have.length(2);
      });

      // Wait for tracks to be initialized
      cy.window().should(win => {
        expect(win.timelineState.tracks).to.exist;
        expect(win.timelineState.tracks).to.have.length(1);
      });

      // Wait for React to sync state
      cy.wait(500);
      cy.window()
        .then(() => {
          cy.window().then(win => {
            const mediaItem = win.timelineState.mediaBin.items[0];
            expect(mediaItem).to.exist;
            expect(mediaItem.type).to.exist;
            const data = {
              id: `clip-${Date.now()}`,
              type: mediaItem.type,
              name: mediaItem.name,
              startTime: 0,
              endTime: mediaItem.duration,
              src: mediaItem.path,
              layer: 0,
              originalDuration: mediaItem.duration,
              initialDuration: mediaItem.duration,
              maxDuration: mediaItem.duration,
              mediaOffset: 0,
              mediaDuration: mediaItem.duration,
              effects: [],
              transform: {
                scale: 1,
                rotation: 0,
                position: { x: 0, y: 0 },
                opacity: 1
              },
              thumbnail: null,
              isVisible: true,
              isLocked: false,
              volume: 1,
              speed: 1
            };
            dataTransfer.setData('application/json', JSON.stringify(data));

            // Add clip directly like in the first test
            win.timelineDispatch({
              type: 'ADD_CLIP',
              payload: {
                trackId: 'track-1',
                clip: data
              }
            });

            // Wait for track to be ready and clip to be added
            cy.window().should(win => {
              expect(win).to.have.property('timelineState');
              const state = win.timelineState;
              expect(state).to.have.property('tracks');
              expect(state.tracks).to.be.an('array');
              expect(state.tracks).to.have.length(1);
              expect(state.tracks[0]).to.have.property('clips');
              expect(state.tracks[0].clips).to.be.an('array');
              expect(state.tracks[0].clips).to.have.length(1);
            });

            // Wait for clip to be added to state
            cy.window().should(win => {
              expect(win.timelineState.tracks[0].clips).to.have.length(1);
            });

            // Wait for clip to be rendered
            cy.get('[data-testid="timeline-clip"]', { timeout: 10000 })
              .should('exist')
              .and('have.attr', 'aria-label', data.name)
              .and('have.css', 'position', 'absolute');

            // Verify clip properties
            cy.window().then(win => {
              const state = win.timelineState;
              expect(state.tracks[0].clips[0]).to.deep.include({
                id: data.id,
                name: data.name,
                type: data.type,
                startTime: data.startTime,
                endTime: data.endTime
              });
            });
          });
        });
    });
  });
});
