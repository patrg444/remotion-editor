import { TransitionType } from '../../../src/renderer/types/transition';

declare global {
  namespace Cypress {
    interface Chainable {
      verifyWebGLContext(transitionId: string): Chainable<void>;
      verifyShaderCompilation(transitionId: string): Chainable<void>;
      verifyFramebufferStatus(transitionId: string): Chainable<void>;
      createTransitionWithVerification(fromClipId: string, toClipId: string, type: TransitionType, params?: any): Chainable<string>;
      verifyTransitionCleanup(transitionId: string): Chainable<void>;
      verifyTransitionParams(transitionId: string, params: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('verifyWebGLContext', (transitionId: string) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .find('canvas')
    .should('exist')
    .should('be.visible')
    .then(($canvas: JQuery<HTMLCanvasElement>) => {
      const canvas = $canvas[0];
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      expect(gl, 'WebGL context should be available').to.exist;
      
      // Verify canvas has dimensions
      expect(canvas.width).to.be.greaterThan(0);
      expect(canvas.height).to.be.greaterThan(0);
    }) as unknown as Cypress.Chainable<void>;
});

Cypress.Commands.add('verifyTransitionParams', (transitionId: string, params: any) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .should('exist')
    .should('be.visible')
    .then(() => {
      Object.entries(params).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
          cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
            .should('have.attr', `data-${key}`, value.toString());
        }
      });
    }) as unknown as Cypress.Chainable<void>;
});

Cypress.Commands.add('verifyShaderCompilation', (transitionId: string) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .find('canvas')
    .should('exist')
    .should('be.visible')
    .then(($canvas: JQuery<HTMLCanvasElement>) => {
      const canvas = $canvas[0];
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      expect(gl, 'WebGL context should be available').to.exist;

      // Check for shader errors
      return cy.window().then(win => {
        const consoleErrors = (win.console as any).error?.args || [];
        const shaderErrors = consoleErrors.filter((args: any[]) => 
          args[0]?.includes('shader compilation failed') || 
          args[0]?.includes('shader error') ||
          args[0]?.includes('WebGL error')
        );
        expect(shaderErrors, 'No shader compilation errors').to.have.length(0);
      });
    }) as unknown as Cypress.Chainable<void>;
});

Cypress.Commands.add('verifyFramebufferStatus', (transitionId: string) => {
  return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
    .find('canvas')
    .should('exist')
    .should('be.visible')
    .then(($canvas: JQuery<HTMLCanvasElement>) => {
      const canvas = $canvas[0];
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      expect(gl, 'WebGL context should be available').to.exist;

      if (gl) {
        // Create and check framebuffer
        const framebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

        // Create a texture to attach to the framebuffer
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        expect(status).to.equal(gl.FRAMEBUFFER_COMPLETE);

        // Clean up
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(framebuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    }) as unknown as Cypress.Chainable<void>;
});

Cypress.Commands.add('createTransitionWithVerification', (fromClipId: string, toClipId: string, type: TransitionType, params: any = {}) => {
  return cy.addTransition(fromClipId, toClipId, type, params)
    .then(transitionId => {
      // Verify transition exists with correct type
      cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
        .should('exist')
        .should('be.visible')
        .should('have.attr', 'data-type', type);

      // Verify WebGL setup
      cy.verifyWebGLContext(transitionId);
      cy.verifyShaderCompilation(transitionId);
      cy.verifyFramebufferStatus(transitionId);

      // Return the transition ID
      return cy.wrap(transitionId);
    });
});

Cypress.Commands.add('verifyTransitionCleanup', (transitionId: string) => {
  return cy.window().then(win => {
    win.timelineDispatch({
      type: 'REMOVE_TRANSITION',
      payload: { transitionId }
    });

    // Verify transition is removed from DOM
    return cy.get(`[data-testid="timeline-transition"][data-transition-id="${transitionId}"]`)
      .should('not.exist')
      .then(() => {
        // Verify transition is removed from state
        const track = win.timelineState.tracks[0];
        expect(track.transitions.find((t: any) => t.id === transitionId)).to.not.exist;
      }) as unknown as Cypress.Chainable<void>;
  });
});
