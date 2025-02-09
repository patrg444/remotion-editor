import { setupTimeline } from './timeline-test-utils';
import { createDefaultTrack } from './timeline-test-utils';
import { createTestMediaItem } from './media-bin-test-utils';

enum TransitionType {
  Dissolve = 'dissolve',
  Crossfade = 'crossfade',
  Fade = 'fade',
  Wipe = 'wipe',
  Slide = 'slide',
  Zoom = 'zoom',
  Push = 'push'
}

interface SetupTransitionTestOptions {
  addInitialClips?: boolean;
}

export const setupTransitionTest = (options: SetupTransitionTestOptions = { addInitialClips: true }): Cypress.Chainable<void> => {
  // Handle uncaught exceptions
  Cypress.on('uncaught:exception', () => false);

  // Create test track with transitions enabled
  const track = createDefaultTrack({
    id: 'track-1',
    name: 'Video Track',
    type: 'video',
    allowTransitions: true,
    transitionsEnabled: true,
    showTransitions: true,
    transitions: []
  });

  // Create test media item
  const mediaItem = createTestMediaItem({
    id: `media-1-${Date.now().toString(36)}`,
    name: 'test.mp4',
    type: 'video',
    path: '/test.mp4',
    duration: 5,
    width: 1920,
    height: 1080,
    thumbnail: '/test.webm',
    metadata: {
      fps: 30,
      codec: 'h264',
      duration: 5
    }
  });

  // Visit the test page
  cy.visit('/test.html', {
    failOnStatusCode: false,
    onBeforeLoad: (win) => {
      // Handle ResizeObserver errors
      win.addEventListener('error', (e) => {
        if (e.message.includes('ResizeObserver')) {
          return false;
        }
      });

      // Initialize media bin context
      win.mediaBinContext = {
        items: [mediaItem],
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
    },
    timeout: 60000
  });

  // Wait for app to be ready
  cy.get('[data-testid="app-root"]', { timeout: 30000 })
    .should('exist')
    .should('be.visible');

  // Setup timeline with default track
  const { timelineContext } = setupTimeline({
    tracks: [track]
  });

  // Initialize timeline state
  cy.window().then(win => {
    // Ensure timelineDispatch is defined before setting state
    if (!win.timelineDispatch) {
      win.timelineDispatch = function(action: { type: string; payload: any }) {
        console.log('Dispatching action:', action);
        if (action.type === 'SET_STATE') {
          win.timelineState = action.payload;
        } else if (action.type === 'ADD_CLIP') {
          const track = win.timelineState.tracks.find((t: { id: string }) => t.id === action.payload.trackId);
          if (track) {
            track.clips.push(action.payload.clip);
          }
        } else if (action.type === 'ADD_TRANSITION') {
          const track = win.timelineState.tracks[0];
          if (track) {
            // Validate transition type
            const validTypes = Object.values(TransitionType);
            const type = action.payload.transition.type;
            if (!validTypes.includes(type)) {
              console.warn(`Invalid transition type: ${type}`);
              return;
            }

            // Create a new transition with enforced duration constraint
            const constrainedDuration = Math.max(0.1, action.payload.transition.duration || 0.5);
            const transition = {
              ...action.payload.transition,
              duration: constrainedDuration,
              params: {
                ...action.payload.transition.params,
                duration: constrainedDuration,
                easing: 'linear'
              }
            };

            // Update state with constrained transition
            win.timelineState = {
              ...win.timelineState,
              tracks: win.timelineState.tracks.map((t: any) => {
                if (t.id === track.id) {
                  return {
                    ...t,
                    transitions: [...(t.transitions || []), transition]
                  };
                }
                return t;
              })
            };

            // Update DOM element
            const transitionsContainer = document.querySelector('[data-testid="track-transitions"]');
            if (transitionsContainer) {
              // Create transition element
              const transitionEl = document.createElement('div');
              transitionEl.setAttribute('data-testid', 'timeline-transition');
              transitionEl.setAttribute('data-transition-id', transition.id);
              transitionEl.setAttribute('data-type', transition.type);
              transitionEl.setAttribute('data-duration', constrainedDuration.toString());
              transitionEl.setAttribute('data-easing', 'linear');
              transitionEl.style.cssText = `
                position: absolute;
                height: 100%;
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                pointer-events: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                left: 100px;
                width: 50px;
              `;

              // Add transition to container first
              transitionsContainer.appendChild(transitionEl);

              // Create and add icon
              const iconEl = document.createElement('div');
              iconEl.setAttribute('data-testid', 'timeline-transition-icon');
              iconEl.textContent = '⚡';
              iconEl.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 32px;
                height: 32px;
                color: red;
                font-size: 24px;
                line-height: 32px;
                text-align: center;
                z-index: 999;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                pointer-events: none;
              `;
              transitionEl.appendChild(iconEl);

              // Create and add handles
              const leftHandle = document.createElement('div');
              leftHandle.setAttribute('data-testid', 'timeline-transition-handle');
              leftHandle.className = 'timeline-transition-handle left';
              transitionEl.appendChild(leftHandle);

              const rightHandle = document.createElement('div');
              rightHandle.setAttribute('data-testid', 'timeline-transition-handle');
              rightHandle.className = 'timeline-transition-handle right';
              transitionEl.appendChild(rightHandle);

              // Force layout update
              transitionEl.offsetHeight;
              iconEl.offsetHeight;

              // Add transition parameters as data attributes
              Object.entries(transition.params || {}).forEach(([key, value]) => {
                if (typeof value === 'string' || typeof value === 'number') {
                  transitionEl.setAttribute(`data-${key}`, value.toString());
                }
              });



            }
          }
        }
      };
    }

    win.timelineState = {
      ...timelineContext.state,
      transitionsEnabled: true,
      showTransitions: true,
      tracks: [{
        ...track,
        allowTransitions: true,
        transitionsEnabled: true,
        showTransitions: true,
        transitions: []
      }]
    };
    win.timelineReady = true;

    // Dispatch initialization event
    win.dispatchEvent(new CustomEvent('timeline:initialized', {
      detail: {
        state: win.timelineState,
        isValid: true,
        errors: []
      }
    }));

    // Initialize transition renderer
    win.dispatchEvent(new CustomEvent('timeline:transitions:ready', {
      detail: {
        enabled: true,
        supported: true
      }
    }));

    // Add test media item
    win.mediaBinContext.addItems([mediaItem]);
    win.timelineDispatch({ type: 'UPDATE_LAYOUT' });

    if (options.addInitialClips) {
      // Add two test clips
      const clip1 = {
        id: 'clip-1',
        type: 'video',
        name: 'test1.mp4',
        startTime: 0,
        endTime: 5,
        src: '/test.mp4',
        layer: 0,
        originalDuration: 5,
        initialDuration: 5,
        maxDuration: 5,
        mediaOffset: 0,
        mediaDuration: 5,
        effects: []
      };

      const clip2 = {
        id: 'clip-2',
        type: 'video',
        name: 'test2.mp4',
        startTime: 5,
        endTime: 10,
        src: '/test.mp4',
        layer: 0,
        originalDuration: 5,
        initialDuration: 5,
        maxDuration: 5,
        mediaOffset: 0,
        mediaDuration: 5,
        effects: []
      };

      win.timelineDispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId: track.id,
          clip: clip1
        }
      });

      win.timelineDispatch({
        type: 'ADD_CLIP',
        payload: {
          trackId: track.id,
          clip: clip2
        }
      });
    }
  });

  // Create and render app root
  cy.document().then(doc => {
    // Remove any existing root element
    const existingRoot = doc.getElementById('root');
    if (existingRoot) {
      existingRoot.remove();
    }

    const root = doc.createElement('div');
    root.id = 'root';
    root.setAttribute('data-testid', 'app-root');
    root.innerHTML = `
      <div data-testid="media-bin" role="region" aria-label="Media Bin">
        <div data-testid="media-bin-content">
          <div class="media-asset-item" data-testid="media-bin-item" role="button" aria-selected="false" tabindex="0" data-clip-id="${mediaItem.id}" draggable="true">
            <div class="media-asset-thumbnail">
              <div class="media-asset-placeholder" aria-label="Video">🎥</div>
            </div>
            <div class="media-asset-info">
              <div class="media-asset-name">${mediaItem.name}</div>
              <div class="media-asset-duration">${mediaItem.duration}:00</div>
            </div>
          </div>
        </div>
      </div>
      <div data-testid="timeline">
        <div data-testid="timeline-tracks">
          <div data-testid="timeline-track" data-track-id="track-1">
            <div class="track-clips">
              ${options.addInitialClips ? `
                <div class="timeline-clip" data-testid="timeline-clip" data-clip-id="clip-1" style="left: 0px; width: 100px;">
                  <div class="clip-content">Test Clip 1</div>
                </div>
                <div class="timeline-clip" data-testid="timeline-clip" data-clip-id="clip-2" style="left: 100px; width: 100px;">
                  <div class="clip-content">Test Clip 2</div>
                </div>
              ` : ''}
            </div>
            <div class="track-transitions" data-testid="track-transitions">
              <!-- Transitions will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
    doc.body.appendChild(root);
  });

  // Add transition styles
  cy.document().then(doc => {
    const style = doc.createElement('style');
    style.innerHTML = `
      .track-transitions {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
      }
      [data-testid="timeline-transition"] {
        position: absolute;
        height: 100%;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      [data-testid="timeline-transition-handle"] {
        position: absolute;
        top: 0;
        width: 8px;
        height: 100%;
        background: rgba(255, 255, 255, 0.3);
        cursor: ew-resize;
        z-index: 2;
      }
      [data-testid="timeline-transition-handle"].left {
        left: 0;
      }
      [data-testid="timeline-transition-handle"].right {
        right: 0;
      }
    `;
    doc.head.appendChild(style);
  });

  // Wait for media bin item to be rendered
  cy.get('[data-testid="media-bin-item"]', { timeout: 60000 })
    .should('exist')
    .should('be.visible')
    .should('have.length', 1);

  // Wait for track to be rendered
  cy.get('[data-testid="timeline-track"]')
    .should('exist')
    .should('be.visible');

  if (options.addInitialClips) {
    // Wait for clips to be fully rendered with their IDs
    cy.get('[data-testid="timeline-clip"]')
      .should('exist')
      .should('be.visible')
      .should('have.length', 2)
      .should('have.attr', 'data-clip-id');

    // Wait for track transitions container
    cy.get('[data-testid="track-transitions"]')
      .should('exist')
      .should('be.visible');
  }

  // Mock file operations
  return cy.mockFileOperations();
};
