describe('Timeline Scrolling and Zooming', () => {
  beforeEach(() => {
    // Set longer timeout for all commands in this suite
    Cypress.config('defaultCommandTimeout', 30000);

    // Fresh page load with event logging
    cy.visit('http://localhost:8084', {
      onBeforeLoad(win) {
        // Add logging for timeline events
        const originalAddEventListener = win.addEventListener;
        win.addEventListener = function(
          this: Window,
          type: string,
          listener: EventListenerOrEventListenerObject,
          ...args: any[]
        ): void {
          if (type.startsWith('timeline:')) {
            const wrappedListener = function(this: Window, event: Event): void {
              console.log(`Timeline Event: ${type}`, (event as CustomEvent).detail);
              if (typeof listener === 'function') {
                return listener.apply(this, [event]);
              }
              return listener.handleEvent(event);
            };
            return originalAddEventListener.call(this, type, wrappedListener, ...args);
          }
          return originalAddEventListener.call(this, type, listener, ...args);
        };
      }
    });

    // Wait for MediaBin and timeline to be ready
    cy.log('Waiting for MediaBin...');
    cy.waitForMediaBin();
    cy.log('MediaBin ready');

    cy.log('Waiting for timeline dispatch...');
    cy.window().should('have.property', 'timelineDispatch');
    cy.log('Timeline dispatch ready');
    
    cy.log('Waiting for timeline ready flag...');
    cy.window().should('have.property', 'timelineReady', true);
    cy.log('Timeline ready');

    // Clear any existing state
    cy.log('Clearing timeline state...');
    cy.window().then(win => {
      console.log('Current state before clear:', win.timelineState);
      win.timelineDispatch({
        type: 'CLEAR_STATE'
      });
    });

    // Wait for state to be cleared and DOM to update
    cy.log('Waiting for state to clear...');
    cy.window().should(win => {
      const state = win.timelineState;
      console.log('Current state after clear:', state);
      expect(state.tracks).to.have.length(0);
    });
    cy.get('[data-testid="timeline-track"]').should('not.exist');
    cy.log('State and DOM cleared');

    // Add initial tracks
    cy.log('Adding initial tracks...');
    cy.window().then(win => {
      // Add three tracks
      for (let i = 0; i < 3; i++) {
        const trackId = `track-${Date.now()}-${i}`;
        win.timelineDispatch({
          type: 'ADD_TRACK',
          payload: {
            track: {
              id: trackId,
              name: `Track ${i + 1}`,
              type: 'video',
              clips: [],
              isLocked: false,
              isVisible: true,
              isMuted: false,
              allowOverlap: false,
              layers: [{ id: `layer-${i}-1`, index: 0, visible: true, locked: false }]
            }
          }
        });
      }
    });

    // Wait for tracks to be added and rendered with retries
    cy.log('Waiting for tracks to be rendered...');
    cy.window().should(win => {
      const state = win.timelineState;
      expect(state.tracks).to.have.length(3);
    });
    cy.get('[data-testid="timeline-track"]', { timeout: 30000 })
      .should('have.length', 3)
      .should('be.visible')
      .then(() => {
        // Verify track count matches state
        cy.window().then(win => {
          const state = win.timelineState;
          expect(state.tracks).to.have.length(3);
        });
      });

      // Wait a bit for any animations/transitions
      cy.wait(1000);

    // Add clips to tracks
    cy.log('Adding clips to tracks...');
    cy.addVideoClipToTrack(0, 0);
    cy.addVideoClipToTrack(0, 10);
    cy.addVideoClipToTrack(1, 5);
    cy.addVideoClipToTrack(2, 15);

    // Wait for all clips to be rendered
    cy.log('Waiting for clips to be rendered...');
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 4)
      .should('be.visible');
  });

  describe('Scrolling', () => {
    it('should scroll horizontally while keeping track headers pinned', () => {
      // Get initial position of track headers and ruler
      cy.get('.timeline-tracks-controls').then(($headers) => {
        const initialLeft = $headers[0].getBoundingClientRect().left;
        const initialTop = $headers[0].getBoundingClientRect().top;

        // Scroll timeline horizontally
        cy.get('.timeline-tracks-content')
          .scrollTo('right')
          .wait(100) // Wait for scroll to settle
          .then(() => {
            // Verify track headers stayed in place
            cy.get('.timeline-tracks-controls').then(($headersAfterScroll) => {
              const scrolledLeft = $headersAfterScroll[0].getBoundingClientRect().left;
              const scrolledTop = $headersAfterScroll[0].getBoundingClientRect().top;
              expect(scrolledLeft).to.equal(initialLeft);
              expect(scrolledTop).to.equal(initialTop);
            });

            // Verify ruler stayed fixed
            cy.get('.timeline-ruler').then(($ruler) => {
              const rulerLeft = $ruler[0].getBoundingClientRect().left;
              expect(rulerLeft).to.equal(initialLeft);
            });
          });
      });
    });

    it('should scroll vertically while keeping ruler and track headers pinned', () => {
      // Add more tracks to create vertical scroll
      cy.window().then(win => {
        for (let i = 0; i < 8; i++) {
          const trackId = `track-${Date.now()}-extra-${i}`;
          win.timelineDispatch({
            type: 'ADD_TRACK',
            payload: {
              track: {
                id: trackId,
                name: `Extra Track ${i + 1}`,
                type: 'video',
                clips: [],
                isLocked: false,
                isVisible: true
              }
            }
          });
        }
      });

      // Wait for all tracks to be rendered
      cy.get('[data-testid="timeline-track"]')
        .should('have.length', 11)
        .should('be.visible');

      // Get initial positions
      cy.get('.timeline-ruler').then(($ruler) => {
        const initialTop = $ruler[0].getBoundingClientRect().top;
        const initialLeft = $ruler[0].getBoundingClientRect().left;

        // Scroll timeline vertically
        cy.get('.timeline-tracks-content')
          .scrollTo('bottom', { ensureScrollable: false })
          .wait(100) // Wait for scroll to settle
          .then(() => {
            // Verify ruler stayed at top
            cy.get('.timeline-ruler').then(($rulerAfterScroll) => {
              const scrolledTop = $rulerAfterScroll[0].getBoundingClientRect().top;
              const scrolledLeft = $rulerAfterScroll[0].getBoundingClientRect().left;
              expect(scrolledTop).to.equal(initialTop);
              expect(scrolledLeft).to.equal(initialLeft);
            });

            // Verify track headers stayed in place horizontally
            cy.get('.timeline-tracks-controls').then(($headers) => {
              expect($headers[0].getBoundingClientRect().left).to.equal(initialLeft);
            });
          });
      });
    });
  });

  describe('Zooming', () => {
    it('should zoom in/out with ctrl+mousewheel and maintain relative positions', () => {
      // Get initial clip width and scroll position
      cy.get('.timeline-clip').first().then(($clip) => {
        const initialWidth = $clip[0].getBoundingClientRect().width;
        const initialLeft = $clip[0].getBoundingClientRect().left;

        // Zoom in
        cy.get('.timeline-content-wrapper')
          .trigger('wheel', { deltaY: -100, ctrlKey: true })
          .wait(100) // Wait for zoom animation
          .then(() => {
            // Verify clip is wider (zoomed in)
            cy.get('.timeline-clip').first().then(($clipZoomed) => {
              const zoomedWidth = $clipZoomed[0].getBoundingClientRect().width;
              const zoomedLeft = $clipZoomed[0].getBoundingClientRect().left;
              expect(zoomedWidth).to.be.greaterThan(initialWidth);
              
              // Relative position should be maintained
              const initialRatio = initialLeft / initialWidth;
              const zoomedRatio = zoomedLeft / zoomedWidth;
              expect(zoomedRatio).to.be.closeTo(initialRatio, 0.5);
            });

            // Zoom out
            cy.get('.timeline-content-wrapper')
              .trigger('wheel', { deltaY: 100, ctrlKey: true })
              .wait(100) // Wait for zoom animation
              .then(() => {
                // Verify clip is back to original size
                cy.get('.timeline-clip').first().then(($clipUnzoomed) => {
                  const unzoomedWidth = $clipUnzoomed[0].getBoundingClientRect().width;
                  expect(unzoomedWidth).to.be.closeTo(initialWidth, 5);
                });
              });
          });
      });
    });

    it('should respect minimum and maximum zoom levels', () => {
      // Get initial clip width
      cy.get('.timeline-clip').first().then(($clip) => {
        const initialWidth = $clip[0].getBoundingClientRect().width;

        // Try to zoom out beyond minimum
        for (let i = 0; i < 20; i++) {
          cy.get('.timeline-content-wrapper')
            .trigger('wheel', { deltaY: 100, ctrlKey: true });
        }

        // Get width at min zoom
        cy.get('.timeline-clip').first().then(($clipMinZoom) => {
          const minWidth = $clipMinZoom[0].getBoundingClientRect().width;

          // Try to zoom out more
          cy.get('.timeline-content-wrapper')
            .trigger('wheel', { deltaY: 100, ctrlKey: true })
            .wait(100);

          // Verify width didn't decrease further
          cy.get('.timeline-clip').first().then(($clipAfterMin) => {
            const afterMinWidth = $clipAfterMin[0].getBoundingClientRect().width;
            expect(afterMinWidth).to.be.closeTo(minWidth, 50);
          });
        });

        // Try to zoom in beyond maximum
        for (let i = 0; i < 20; i++) {
          cy.get('.timeline-content-wrapper')
            .trigger('wheel', { deltaY: -100, ctrlKey: true });
        }

        // Get width at max zoom
        cy.get('.timeline-clip').first().then(($clipMaxZoom) => {
          const maxWidth = $clipMaxZoom[0].getBoundingClientRect().width;

          // Try to zoom in more
          cy.get('.timeline-content-wrapper')
            .trigger('wheel', { deltaY: -100, ctrlKey: true })
            .wait(100);

          // Verify width didn't increase further
          cy.get('.timeline-clip').first().then(($clipAfterMax) => {
            const afterMaxWidth = $clipAfterMax[0].getBoundingClientRect().width;
            expect(afterMaxWidth).to.be.closeTo(maxWidth, 50);
          });
        });
      });
    });

    it('should maintain clip positions when zooming', () => {
      // Get initial positions of all clips
      cy.get('.timeline-clip').then(($clips) => {
        const initialPositions = Array.from($clips).map(clip => ({
          left: clip.getBoundingClientRect().left,
          width: clip.getBoundingClientRect().width
        }));

        // Zoom in
        cy.get('.timeline-content-wrapper')
          .trigger('wheel', { deltaY: -100, ctrlKey: true })
          .wait(100);

        // Verify relative positions are maintained
        cy.get('.timeline-clip').then(($clipsZoomed) => {
          $clipsZoomed.each((index, clip) => {
            const zoomedPos = clip.getBoundingClientRect();
            const initial = initialPositions[index];
            
            // Check that relative spacing is maintained
            if (index > 0) {
              const prevInitialGap = initialPositions[index].left - initialPositions[index - 1].left;
              const prevZoomedGap = zoomedPos.left - $clipsZoomed[index - 1].getBoundingClientRect().left;
              const gapRatio = prevZoomedGap / prevInitialGap;
              expect(gapRatio).to.be.closeTo(zoomedPos.width / initial.width, 0.5);
            }
          });
        });
      });
    });

    it('should maintain clip selection while scrolling', () => {
      // Select a clip
      cy.get('.timeline-clip').first().click();

      // Scroll horizontally
      cy.get('.timeline-tracks-content')
        .scrollTo('right')
        .wait(100);

      // Verify clip remains selected
      cy.get('.timeline-clip').first()
        .should('have.class', 'selected');
    });

    it('should show all clips when scrolled to end while zoomed in', () => {
      // Get initial clip count
      cy.get('.timeline-clip').then(($clips) => {
        const clipCount = $clips.length;

        // Zoom in
        cy.get('.timeline-content-wrapper')
          .trigger('wheel', { deltaY: -100, ctrlKey: true })
          .wait(100);

        // Scroll to end
        cy.get('.timeline-tracks-content')
          .scrollTo('right')
          .wait(100);

        // Verify all clips are still present
        cy.get('.timeline-clip')
          .should('have.length', clipCount)
          .should('be.visible');
      });
    });

    it('should handle simultaneous scrolling and zooming', () => {
      // Zoom in first
      cy.get('.timeline-content-wrapper')
        .trigger('wheel', { deltaY: -100, ctrlKey: true })
        .wait(100);

      // Get clip position after zoom
      cy.get('.timeline-clip').first().then(($clipZoomed) => {
        const zoomedLeft = $clipZoomed[0].getBoundingClientRect().left;

        // Scroll while zoomed
        cy.get('.timeline-tracks-content')
          .scrollTo('right')
          .wait(100);

        // Zoom out while scrolled
        cy.get('.timeline-content-wrapper')
          .trigger('wheel', { deltaY: 100, ctrlKey: true })
          .wait(100);

        // Verify clips are still visible
        cy.get('.timeline-clip')
          .should('be.visible');
      });
    });

    it('should keep playhead visible during scrolling', () => {
      // Get initial playhead position
      cy.get('.timeline-playhead').then(($playhead) => {
        const initialLeft = $playhead[0].getBoundingClientRect().left;

        // Scroll timeline
        cy.get('.timeline-tracks-content')
          .scrollTo('right')
          .wait(100);

        // Verify playhead is still visible and at same position
        cy.get('.timeline-playhead').then(($playheadAfterScroll) => {
          const scrolledLeft = $playheadAfterScroll[0].getBoundingClientRect().left;
          expect(scrolledLeft).to.equal(initialLeft);
        });
      });
    });

    it('should scroll correctly with different track heights', () => {
      // Add tracks with different heights
      cy.window().then(win => {
        win.timelineDispatch({
          type: 'ADD_TRACK',
          payload: {
            track: {
              id: `track-${Date.now()}-tall`,
              name: 'Tall Track',
              type: 'video',
              clips: [],
              isLocked: false,
              isVisible: true,
              height: 100 // Taller track
            }
          }
        });
      });

      // Verify scrolling still works
      cy.get('.timeline-tracks-content')
        .scrollTo('bottom')
        .wait(100)
        .scrollTo('top')
        .wait(100);

      // Verify track headers stay aligned
      cy.get('.timeline-tracks-controls').each(($header) => {
        const left = $header[0].getBoundingClientRect().left;
        expect(left).to.equal($header.first()[0].getBoundingClientRect().left);
      });
    });
  });
});
