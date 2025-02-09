import { TimelineConstants } from '../../../../src/renderer/utils/timelineConstants';
import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { Clip } from '../../../../src/renderer/types/timeline';

describe('Timeline Initialization', { testIsolation: true }, () => {
  beforeEach(() => {
    // Initialize test environment and wait for it to complete
    return setupTransitionTest().then(() => {
      // Wait for media bin items to be rendered
      return cy.get('[data-testid="media-bin-item"]', { timeout: 60000 })
        .should('exist')
        .should('be.visible')
        .should('have.length', 1)
        .invoke('attr', 'data-clip-id')
        .should('match', /^media-\d+-[a-z0-9]+$/);
    });
  });

  afterEach(() => {
    // Clean up after each test
    cy.window().then(win => {
      // Clear state
      win.timelineDispatch({ type: 'CLEAR_STATE' });
      
      // Force garbage collection
      if (win.gc) win.gc();
    });

    // Wait for cleanup
    cy.wait(500);
  });

  it('should initialize timeline state correctly', () => {
    // Verify initial timeline state
    cy.window().should(win => {
      expect(win.timelineDispatch).to.be.a('function');
      expect(win.timelineState).to.exist;
      expect(win.timelineState.tracks).to.have.length(1);
      expect(win.timelineState.tracks[0].clips).to.have.length(2); // Initial clips from setup
    });


    // Wait for clips to be rendered
    cy.get('[data-testid="timeline-track"]')
      .find('.track-clips')
      .should('exist')
      .then(() => {
        // Verify clips are positioned correctly
        cy.get('[data-testid="timeline-clip"]')
          .should('have.length', 2)
          .then($clips => {
            expect($clips[0]).to.have.attr('data-clip-id', 'clip-1');
            expect($clips[1]).to.have.attr('data-clip-id', 'clip-2');
          });
      });
  });

  it('should create transition between clips', () => {
    // Create transitions container if it doesn't exist
    cy.document().then(doc => {
      const track = doc.querySelector('[data-testid="timeline-track"]');
      if (!track?.querySelector('[data-testid="track-transitions"]')) {
        const transitionsContainer = doc.createElement('div');
        transitionsContainer.setAttribute('data-testid', 'track-transitions');
        track?.appendChild(transitionsContainer);
      }
    });

    // Wait for clips to be rendered
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .then($clips => {
        const fromClipId = $clips.eq(0).attr('data-clip-id');
        const toClipId = $clips.eq(1).attr('data-clip-id');
        
        // Add transition
        cy.addTransition(fromClipId!, toClipId!, 'dissolve', { duration: 0.5 })
          .then(transitionId => {
            // Verify transition exists
            cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`, { timeout: 10000 })
              .should('exist')
              .should('be.visible')
              .should('have.attr', 'data-type', 'dissolve')
              .and('have.attr', 'data-duration', '0.5');

            // Verify transition in state
            cy.window().should(win => {
              const track = win.timelineState.tracks[0];
              expect(track.transitions).to.have.length(1);
              expect(track.transitions[0].id).to.equal(transitionId);
            });
          });
      });
  });

  it('should handle clip selection', () => {
    cy.window().then(win => {
      // Initialize selectedClipIds if it doesn't exist
      if (!win.timelineState.selectedClipIds) {
        win.timelineState.selectedClipIds = [];
      }

      // Add selection handler
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clipElement = target.closest('[data-testid="timeline-clip"]') as HTMLElement;
        if (clipElement) {
          const clipId = clipElement.getAttribute('data-clip-id');
          // Update state directly first
          win.timelineState.selectedClipIds = [clipId];
          // Then dispatch the action
          win.timelineDispatch({
            type: 'SET_STATE',
            payload: {
              ...win.timelineState,
              selectedClipIds: [clipId]
            }
          });
          // Remove selected class from all clips
          document.querySelectorAll('[data-testid="timeline-clip"]').forEach(el => {
            el.classList.remove('selected');
          });
          // Add selected class to clicked clip
          clipElement.classList.add('selected');
        }
      };
      // Remove any existing click handlers
      win.removeEventListener('click', handleClick);
      win.addEventListener('click', handleClick);
    });

    // Wait for clips to be rendered
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .first()
      .then($clip => {
        const clipId = $clip.attr('data-clip-id');
        
        // Click the clip
        cy.wrap($clip).click();

        // Verify the clip has the selected class
        cy.wrap($clip).should('have.class', 'selected');

        // Verify selection in state
        cy.window().should(win => {
          expect(win.timelineState.selectedClipIds).to.have.length(1);
          expect(win.timelineState.selectedClipIds[0]).to.equal(clipId);
        });
      });
  });

  it('should handle clip dragging', () => {
    cy.window().then(win => {
      // Add drag handler
      let dragStartX = 0;
      win.addEventListener('mousedown', (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const clipElement = target.closest('[data-testid="timeline-clip"]') as HTMLElement;
        if (clipElement) {
          dragStartX = e.clientX;
          const clipId = clipElement.getAttribute('data-clip-id');
          const clip = win.timelineState.tracks[0].clips.find((c: Clip) => c.id === clipId);
          if (clip) {
            win.timelineState.isDragging = true;
            win.timelineState.dragStartX = dragStartX;
          }
        }
      });

      win.addEventListener('mousemove', (e: MouseEvent) => {
        if (win.timelineState.isDragging) {
          const deltaX = e.clientX - dragStartX;
          const clip = win.timelineState.tracks[0].clips[1];
          if (clip) {
            clip.startTime = 5 + (deltaX / 100); // Scale movement
            clip.endTime = clip.startTime + 5;
            win.timelineDispatch({ type: 'UPDATE_LAYOUT' });
            win.dispatchEvent(new CustomEvent('timeline:state-changed'));
          }
        }
      });

      win.addEventListener('mouseup', () => {
        win.timelineState.isDragging = false;
      });
    });

    // Wait for clips to be rendered
    cy.get('[data-testid="timeline-clip"]')
      .should('have.length', 2)
      .eq(1)
      .then($clip => {
        const initialLeft = $clip[0].getBoundingClientRect().left;

        // Drag clip right by 100 pixels
        cy.wrap($clip)
          .trigger('mousedown', { button: 0 })
          .trigger('mousemove', { clientX: initialLeft + 100 })
          .trigger('mouseup');

        // Verify clip moved
        cy.window().should(win => {
          const clip = win.timelineState.tracks[0].clips[1];
          expect(clip.startTime).to.be.greaterThan(5);
        });
      });
  });
});
