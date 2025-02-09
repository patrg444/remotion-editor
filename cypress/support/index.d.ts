/// <reference types="cypress" />

declare namespace Cypress {
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
}
