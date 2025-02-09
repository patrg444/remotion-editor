/// <reference types="cypress" />

import { TransitionType } from '../../src/renderer/types/transition';

declare module 'cypress' {
  interface AUTWindow {
    useFileOperations: () => {
      validateFile: (file: File) => Promise<void>;
      processFile: (file: File) => Promise<{
        id: string;
        name: string;
        type: string;
        metadata: {
          duration: number;
          fps: number;
          codec: string;
        };
      }>;
    };
    timelineDispatch: (action: any) => void;
    timelineState: any;
    mediaBinContext: any;
    gc?: () => void;
    performance?: {
      memory?: {
        usedJSHeapSize: number;
      };
    };
  }

  interface Chainable<Subject = any> {
    waitForTimeline(): Chainable<void>;
    waitForMediaBin(): Chainable<void>;
    waitForPreview(): Chainable<void>;
    addTrack(name: string, type: string): Chainable<void>;
    addClip(trackIndex: number, mediaItem: any): Chainable<void>;
    addMediaItems(items: any[]): Chainable<void>;
    dragClip(clipIndex: number, x: number, y: number): Chainable<void>;
    trimClip(clipIndex: number, edge: 'start' | 'end', x: number): Chainable<void>;
    selectClip(clipIndex: number): Chainable<void>;
    togglePlayback(): Chainable<void>;
    seekTo(time: number): Chainable<void>;
    getCurrentTime(): Chainable<number>;
    setupTestData(): Chainable<void>;
    
    // Transition utility commands
    verifyWebGLContext(transitionId: string): Chainable<void>;
    verifyShaderCompilation(transitionId: string): Chainable<void>;
    verifyFramebufferSetup(transitionId: string): Chainable<void>;
    createTransitionWithVerification(fromClipId: string, toClipId: string, type: TransitionType, params?: any): Chainable<string>;
    verifyTransitionCleanup(transitionId: string): Chainable<void>;
  }
}
