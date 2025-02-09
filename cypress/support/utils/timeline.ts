import { TimelineState } from '../../../src/renderer/types/timeline';
import { TimelineConstants } from '../../../src/renderer/utils/timelineConstants';
import { timeToPixels } from '../../../src/renderer/utils/timelineScale';

// Timeline types
type TimelineClip = {
  id: string;
  startTime: number;
  endTime: number;
  mediaOffset?: number;
  mediaDuration?: number;
};

type TimelineTrack = {
  id: string;
  clips: TimelineClip[];
  transitions?: Array<{
    id: string;
    type: string;
    clipAId: string;
    clipBId: string;
    duration: number;
    startTime: number;
    endTime: number;
  }>;
};

interface ClipValidationProps {
  id: string;
  left?: number;
  width?: number;
  top?: number;
  zIndex?: number;
  opacity?: number;
  time?: number;
  duration?: number;
  startTime?: number;
  endTime?: number;
}

export const logClipEvent = (event: string, clipId: string, details: any) => {
  console.log(`${event} - Clip ${clipId}:`, JSON.stringify(details, null, 2));
};

export const validateClipProperties = (
  $clip: JQuery<HTMLElement>,
  expectedProps: ClipValidationProps,
  zoom: number
) => {
  const style = window.getComputedStyle($clip[0]);
  const actualProps = {
    id: $clip.attr('data-clip-id'),
    left: parseInt(style.left, 10),
    width: parseInt(style.width, 10),
    top: parseInt(style.top, 10),
    zIndex: parseInt(style.zIndex, 10),
    opacity: parseFloat(style.opacity)
  };

  // Log validation attempt
  console.log('Validating clip properties:', {
    actual: actualProps,
    expected: expectedProps
  });

  // Basic property checks
  expect(actualProps.id).to.equal(expectedProps.id, 'Clip ID should match');
  
  if (expectedProps.left !== undefined) {
    expect(actualProps.left).to.be.closeTo(expectedProps.left, 1, 'Clip left position should match');
  }
  
  if (expectedProps.width !== undefined) {
    expect(actualProps.width).to.be.closeTo(expectedProps.width, 1, 'Clip width should match');
  }

  if (expectedProps.top !== undefined) {
    expect(actualProps.top).to.be.closeTo(expectedProps.top, 1, 'Clip top position should match');
  }

  if (expectedProps.zIndex !== undefined) {
    expect(actualProps.zIndex).to.equal(expectedProps.zIndex, 'Clip z-index should match');
  }

  if (expectedProps.opacity !== undefined) {
    expect(actualProps.opacity).to.be.closeTo(expectedProps.opacity, 0.01, 'Clip opacity should match');
  }

  // Time-based checks if provided
  if (expectedProps.time !== undefined) {
    const expectedLeft = timeToPixels(expectedProps.time, zoom);
    expect(actualProps.left).to.be.closeTo(expectedLeft, 1, 'Clip time position should match');
  }

  if (expectedProps.duration !== undefined) {
    const expectedWidth = timeToPixels(expectedProps.duration, zoom);
    expect(actualProps.width).to.be.closeTo(expectedWidth, 1, 'Clip duration width should match');
  }

  return actualProps;
};

export const waitForTimelineInit = () => {
  return cy.window().should('have.property', 'timelineDispatch');
};

export const waitForTimelineReady = () => {
  return cy.window().should('have.property', 'timelineReady', true);
};

export const waitForStateAndRender = (predicate: (state: TimelineState) => boolean) => {
  // First wait for state to update with retries
  return cy.window({ timeout: 30000 }).should(win => {
    const state = (win as any).timelineState;
    const result = predicate(state);
    console.log('State check:', {
      result,
      state: {
        tracks: state.tracks.map((t: TimelineTrack) => ({
          id: t.id,
          clips: t.clips.map((c: TimelineClip) => ({ id: c.id })),
          transitions: t.transitions?.map((tr: any) => ({ id: tr.id, type: tr.type }))
        }))
      }
    });
    return result;
  }).then(() => {
    // Then wait for DOM to update
    return cy.get('[data-testid="timeline-tracks-content"]')
      .should('exist')
      .and('be.visible');
  }).then(() => {
    // Wait for track content to be ready
    return cy.get('[data-testid="timeline-track"]')
      .should('exist')
      .and('be.visible')
      .and('have.css', 'height')
      .and('not.eq', '0px');
  }).then(() => {
    // Check for clips and transitions
    return cy.get('body').then($body => {
      const hasClips = $body.find('[data-testid="timeline-clip"]').length > 0;
      const hasTransitions = $body.find('[data-testid="timeline-transition"]').length > 0;

      // If no clips or transitions, we're done
      if (!hasClips && !hasTransitions) {
        return;
      }

      // Check clips if they exist
      if (hasClips) {
        cy.get('[data-testid="timeline-clip"]')
          .should('exist')
          .and('be.visible')
          .and(($clips) => {
            $clips.each((_, clip) => {
              const rect = clip.getBoundingClientRect();
              expect(rect.left).to.not.equal(0);
              expect(rect.top).to.not.equal(0);
            });
          });
      }

      // Check transitions if they exist
      if (hasTransitions) {
        cy.get('[data-testid="timeline-transition"]')
          .should('exist')
          .and('be.visible')
          .and(($transitions) => {
            $transitions.each((_, transition) => {
              const rect = transition.getBoundingClientRect();
              expect(rect.width).to.be.greaterThan(0);
              expect(rect.height).to.be.greaterThan(0);
            });
          });
      }
    });
  }).then(() => {
    // Wait for any animations to complete
    return cy.wait(500);
  }).then(() => {
    // Verify state is still valid
    return cy.window().should(win => {
      const state = (win as any).timelineState;
      const result = predicate(state);
      console.log('Final state check:', {
        result,
        state: {
          tracks: state.tracks.map((t: TimelineTrack) => ({
            id: t.id,
            clips: t.clips.map((c: TimelineClip) => ({ id: c.id })),
            transitions: t.transitions?.map((tr: any) => ({ id: tr.id, type: tr.type }))
          }))
        }
      });
      expect(result, 'State predicate should be true').to.be.true;
    });
  });
};

export const debugTimelineState = (label: string) => {
  cy.window().then(win => {
    const state = (win as any).timelineState;
    console.log(`${label}:`, JSON.stringify(state, null, 2));
  });
};

export const logTimelineState = (label: string) => {
  cy.window().then(win => {
    const state = (win as any).timelineState;
    console.log(`${label}:`, state);
  });
};

export const waitForHistoryOperation = (expectedIndex: number) => {
  cy.window().should(win => {
    const state = (win as any).timelineState;
    expect(state.history.currentIndex).to.equal(expectedIndex);
  });
};

export const waitForClipRender = (clipId: string) => {
  return new Promise<void>((resolve) => {
    cy.window().then(win => {
      // First check if clip already exists in DOM and is positioned
      const existingClip = document.querySelector(`[data-clip-id="${clipId}"]`);
      if (existingClip) {
        const rect = existingClip.getBoundingClientRect();
        const hasPosition = rect.left !== 0 && rect.top !== 0;
        if (hasPosition) {
          console.log('Clip already rendered and positioned:', clipId);
          resolve();
          return;
        }
      }

      let isRendered = false;
      let isPositioned = false;

      const checkComplete = () => {
        if (isRendered && isPositioned) {
          console.log('Clip fully rendered and positioned:', clipId);
          win.removeEventListener('clip:rendered', handleClipRendered as EventListener);
          win.removeEventListener('clip:positioned', handleClipPositioned as EventListener);
          resolve();
        }
      };

      const handleClipRendered = (e: CustomEvent) => {
        if (e.detail.clipId === clipId) {
          console.log('Clip render event received:', clipId);
          isRendered = true;
          checkComplete();
        }
      };

      const handleClipPositioned = (e: CustomEvent) => {
        if (e.detail.clipId === clipId) {
          console.log('Clip positioned event received:', clipId);
          isPositioned = true;
          checkComplete();
        }
      };

      win.addEventListener('clip:rendered', handleClipRendered as EventListener);
      win.addEventListener('clip:positioned', handleClipPositioned as EventListener);

      // Add cleanup after timeout
      setTimeout(() => {
        if (!isRendered || !isPositioned) {
          console.warn(`Clip ${clipId} render/position timeout - Current state:`, { isRendered, isPositioned });
          win.removeEventListener('clip:rendered', handleClipRendered as EventListener);
          win.removeEventListener('clip:positioned', handleClipPositioned as EventListener);
          resolve(); // Resolve anyway to prevent test hanging
        }
      }, 30000);
    });
  });
};

export const waitForSplitOperation = (trackId: string, clipId: string, expectedClipCount: number) => {
  // First wait for state to update
  return cy.window({ timeout: 60000 }).then(win => {
    const state = (win as any).timelineState;
    if (!state || !state.tracks) {
      throw new Error('Timeline state not ready');
    }
    const track = state.tracks.find((t: TimelineTrack) => t.id === trackId);
    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }
    console.log('Track state:', track);
    expect(track.clips).to.have.length(expectedClipCount);

    // Verify clip IDs follow expected pattern
    if (expectedClipCount === 2) {
      const firstClip = track.clips[0];
      const secondClip = track.clips[1];
      expect(firstClip.id).to.equal(`${clipId}-1`);
      expect(secondClip.id).to.equal(`${clipId}-2`);

      // Log clip details
      console.log('Split clips:', {
        first: {
          id: firstClip.id,
          startTime: firstClip.startTime,
          endTime: firstClip.endTime,
          mediaOffset: firstClip.mediaOffset,
          mediaDuration: firstClip.mediaDuration
        },
        second: {
          id: secondClip.id,
          startTime: secondClip.startTime,
          endTime: secondClip.endTime,
          mediaOffset: secondClip.mediaOffset,
          mediaDuration: secondClip.mediaDuration
        }
      });
    }
  }).then(() => {
    // Wait for React state updates to complete
    return cy.wait(1000);
  }).then(() => {
    // Create a promise that resolves when both clips are rendered and positioned
    return new Cypress.Promise((resolve) => {
      cy.window().then(win => {
        const firstClipId = `${clipId}-1`;
        const secondClipId = `${clipId}-2`;
        let firstClipReady = false;
        let secondClipReady = false;

        const checkComplete = () => {
          if (firstClipReady && secondClipReady) {
            console.log('Both clips ready:', { firstClipId, secondClipId });
            win.removeEventListener('clip:rendered', handleClipRendered as EventListener);
            win.removeEventListener('clip:positioned', handleClipPositioned as EventListener);
            resolve(null);
          }
        };

        const handleClipRendered = (e: CustomEvent) => {
          console.log('Clip rendered:', e.detail);
          if (e.detail.clipId === firstClipId) {
            firstClipReady = true;
          } else if (e.detail.clipId === secondClipId) {
            secondClipReady = true;
          }
          checkComplete();
        };

        const handleClipPositioned = (e: CustomEvent) => {
          console.log('Clip positioned:', e.detail);
          if (e.detail.clipId === firstClipId) {
            firstClipReady = true;
          } else if (e.detail.clipId === secondClipId) {
            secondClipReady = true;
          }
          checkComplete();
        };

        win.addEventListener('clip:rendered', handleClipRendered as EventListener);
        win.addEventListener('clip:positioned', handleClipPositioned as EventListener);

        // Check if clips are already in DOM and positioned
        const clips = document.querySelectorAll('[data-testid="timeline-clip"]');
        Array.from(clips).forEach(clip => {
          const clipId = clip.getAttribute('data-clip-id');
          const rect = clip.getBoundingClientRect();
          const hasPosition = rect.left !== 0 && rect.top !== 0;
          
          if (clipId === firstClipId && hasPosition) {
            console.log('First clip already ready');
            firstClipReady = true;
          } else if (clipId === secondClipId && hasPosition) {
            console.log('Second clip already ready');
            secondClipReady = true;
          }
        });

        // Check if both clips are already ready
        checkComplete();

        // Add cleanup after timeout
        setTimeout(() => {
          if (!firstClipReady || !secondClipReady) {
            console.warn('Split operation timeout - Current state:', {
              firstClipReady,
              secondClipReady
            });
            win.removeEventListener('clip:rendered', handleClipRendered as EventListener);
            win.removeEventListener('clip:positioned', handleClipPositioned as EventListener);
            resolve(null); // Resolve anyway to prevent test hanging
          }
        }, 30000);
      });
    });
  }).then(() => {
    // Finally verify DOM state
    return cy.get('[data-testid="timeline-clip"]', { timeout: 30000 })
      .should('have.length', expectedClipCount)
      .then($clips => {
        if (expectedClipCount === 2) {
          const clips = Array.from($clips).map(clip => ({
            id: clip.getAttribute('data-clip-id'),
            rect: clip.getBoundingClientRect(),
            style: clip.getAttribute('style')
          }));

          console.log('Final clip check:', clips);

          // Verify both clips exist and have proper IDs
          const firstClip = clips.find(c => c.id === `${clipId}-1`);
          const secondClip = clips.find(c => c.id === `${clipId}-2`);
          
          expect(firstClip, 'First clip should exist').to.exist;
          expect(secondClip, 'Second clip should exist').to.exist;
        }
      });
  });
};

export const waitForClipsToRender = (expectedClips: Array<ClipValidationProps>, zoom: number) => {
  // First wait for state to update
  return cy.window({ timeout: 60000 }).then(win => {
    const state = (win as any).timelineState;
    if (!state || !state.tracks) {
      throw new Error('Timeline state not ready');
    }

    // Cast state.tracks to array of TimelineTrack
    const tracks = state.tracks as TimelineTrack[];

    // Log current state
    console.log('Current timeline state:', {
      tracks: tracks.map(track => ({
        id: track.id,
        clips: track.clips.map(clip => ({
          id: clip.id,
          startTime: clip.startTime,
          endTime: clip.endTime
        }))
      }))
    });

    // Verify each expected clip exists in state
    expectedClips.forEach(expected => {
      let foundClip: TimelineClip | undefined;
      for (const track of tracks) {
        foundClip = track.clips.find(clip => clip.id === expected.id);
        if (foundClip) break;
      }

      console.log('Checking clip:', {
        expectedId: expected.id,
        foundClip,
        expectedProps: expected
      });

      expect(foundClip, `Clip ${expected.id} not found in state`).to.exist;

      if (foundClip) {
        if (expected.startTime !== undefined) {
          expect(foundClip.startTime).to.equal(expected.startTime);
        }
        if (expected.endTime !== undefined) {
          expect(foundClip.endTime).to.equal(expected.endTime);
        }
      }
    });

    // Wait for React state updates to complete
    return cy.wait(1000);
  }).then(() => {
    // Then verify DOM state
    return cy.get('[data-testid="timeline-clip"]', { timeout: 60000 })
      .should('have.length', expectedClips.length)
      .then($clips => {
        // Validate each clip's properties
        const clips = Array.from($clips);
        expectedClips.forEach(expected => {
          const $clip = clips.find(clip => 
            clip.getAttribute('data-clip-id') === expected.id
          );
          expect($clip, `Clip ${expected.id} should exist in DOM`).to.exist;
          if ($clip) {
            validateClipProperties(Cypress.$($clip), expected, zoom);
          }
        });
      });
  });
};

export {};
