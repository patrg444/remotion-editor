/// <reference types="cypress" />

interface Window {
  validateFile: () => Promise<void>;
  processFile: (file: File) => Promise<{
    id: string;
    name: string;
    type: string;
    path: string;
    duration: number;
  }>;
  timelineDispatch: any;
  timelineState: any;
}

declare namespace Cypress {
  interface Chainable {
    mockFileOperations(): Chainable<void>;
    addTestMediaItems(): Chainable<void>;
    realMouseDown(options?: { position?: string }): Chainable<JQuery<HTMLElement>>;
    realMouseUp(options?: { position?: string }): Chainable<JQuery<HTMLElement>>;
    realMouseMove(x: number, y: number, options?: { position?: string }): Chainable<JQuery<HTMLElement>>;
  }
}
