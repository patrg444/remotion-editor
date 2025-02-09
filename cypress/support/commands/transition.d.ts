/// <reference types="cypress" />

import { TransitionType } from '../../../src/renderer/types/transition';

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Verify WebGL context for a transition
       * @param transitionId The ID of the transition to verify
       */
      verifyWebGLContext(transitionId: string): Chainable<void>;

      /**
       * Verify shader compilation for a transition
       * @param transitionId The ID of the transition to verify
       */
      verifyShaderCompilation(transitionId: string): Chainable<void>;

      /**
       * Verify framebuffer setup for a transition
       * @param transitionId The ID of the transition to verify
       */
      verifyFramebufferSetup(transitionId: string): Chainable<void>;

      /**
       * Create a transition and verify its setup
       * @param fromClipId The ID of the source clip
       * @param toClipId The ID of the target clip
       * @param type The type of transition
       * @param params Optional transition parameters
       */
      createTransitionWithVerification(fromClipId: string, toClipId: string, type: TransitionType, params?: any): Chainable<string>;

      /**
       * Verify transition cleanup
       * @param transitionId The ID of the transition to verify cleanup for
       */
      verifyTransitionCleanup(transitionId: string): Chainable<void>;
    }
  }
}
