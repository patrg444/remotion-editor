import { setupTransitionTest } from '../../../support/utils/transition-test-setup';
import { TransitionType } from '../../../../src/renderer/types/transition';
import '../../../support/commands/transition';

describe('Timeline Transition WebGL Rendering', () => {
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

  it('should compile shaders without errors', () => {
    cy.get('[data-testid="timeline-clip"]').then(($clips: JQuery<HTMLElement>) => {
      const fromClipId = $clips[0].getAttribute('data-clip-id');
      const toClipId = $clips[1].getAttribute('data-clip-id');
      
      // Test each transition type
      [TransitionType.Dissolve, TransitionType.Fade, TransitionType.Wipe].forEach(type => {
        cy.createTransitionWithVerification(fromClipId!, toClipId!, type)
          .then((transitionId: string) => {
            // Clean up for next test
            cy.verifyTransitionCleanup(transitionId);
          });
      });
    });
  });

  it('should handle WebGL context loss/restore', () => {
    cy.get('[data-testid="timeline-clip"]').then(($clips: JQuery<HTMLElement>) => {
      const fromClipId = $clips[0].getAttribute('data-clip-id');
      const toClipId = $clips[1].getAttribute('data-clip-id');
      
      cy.createTransitionWithVerification(fromClipId!, toClipId!, TransitionType.Dissolve)
        .then((transitionId: string) => {
          // Simulate context loss
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .find('canvas')
            .then($canvas => {
              const gl = ($canvas[0] as HTMLCanvasElement).getContext('webgl2');
              const ext = gl?.getExtension('WEBGL_lose_context');
              ext?.loseContext();

              // Wait for context restore
              cy.wait(500);

              // Verify transition still renders
              cy.verifyWebGLContext(transitionId);
              cy.verifyShaderCompilation(transitionId);
              cy.verifyFramebufferStatus(transitionId);
            });
        });
    });
  });

  it('should handle multiple WebGL contexts', () => {
    cy.get('[data-testid="timeline-clip"]').then(($clips: JQuery<HTMLElement>) => {
      const fromClipId = $clips[0].getAttribute('data-clip-id');
      const toClipId = $clips[1].getAttribute('data-clip-id');
      
      // Create transitions in sequence
      cy.createTransitionWithVerification(fromClipId!, toClipId!, TransitionType.Dissolve).then((id1: string) => {
        cy.createTransitionWithVerification(fromClipId!, toClipId!, TransitionType.Wipe).then((id2: string) => {
          cy.createTransitionWithVerification(fromClipId!, toClipId!, TransitionType.Fade).then((id3: string) => {
            // Verify all transitions are rendered
            cy.get('[data-testid="timeline-transition"]')
              .should('have.length', 3)
              .each($transition => {
                const transitionId = $transition.attr('data-transition-id');
                cy.verifyWebGLContext(transitionId!);
              });
          });
        });
      });
    });
  });

  it('should handle WebGL memory cleanup', () => {
    cy.get('[data-testid="timeline-clip"]').then(($clips: JQuery<HTMLElement>) => {
      const fromClipId = $clips[0].getAttribute('data-clip-id');
      const toClipId = $clips[1].getAttribute('data-clip-id');
      
      // Create and remove transitions repeatedly
      const iterations = 5;
      for (let i = 0; i < iterations; i++) {
        cy.createTransitionWithVerification(fromClipId!, toClipId!, TransitionType.Dissolve)
          .then((transitionId: string) => {
            cy.verifyTransitionCleanup(transitionId);
          });
      }

      // Verify no WebGL errors after cleanup
      cy.window().then(win => {
        const hasErrors = (win.console as any).error?.args
          ?.some((args: any[]) => args[0]?.includes('WebGL'));
        expect(hasErrors || false, 'No WebGL errors').to.be.false;
      });
    });
  });

  it('should handle framebuffer and transition parameters correctly', () => {
    cy.get('[data-testid="timeline-clip"]').then(($clips: JQuery<HTMLElement>) => {
      const fromClipId = $clips[0].getAttribute('data-clip-id');
      const toClipId = $clips[1].getAttribute('data-clip-id');
      
      // Test each transition type with different parameters
      const testCases = [
        {
          type: TransitionType.Wipe,
          params: { direction: 'right', easing: 'linear' }
        },
        {
          type: TransitionType.Dissolve,
          params: { easing: 'linear' }
        },
        {
          type: TransitionType.Fade,
          params: { easing: 'linear' }
        }
      ];

      testCases.forEach(({ type, params }) => {
        cy.addTransition(fromClipId!, toClipId!, type)
          .then((transitionId: string) => {
            // Verify framebuffer setup
            cy.verifyFramebufferStatus(transitionId);

            // Verify transition parameters
            cy.verifyTransitionParams(transitionId, params);

            // Clean up
            cy.window().then(win => {
              win.timelineDispatch({
                type: 'REMOVE_TRANSITION',
                payload: { transitionId }
              });
            });
          });
      });
    });
  });
});
