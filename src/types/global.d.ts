/// <reference types="electron" />
/// <reference path="./electron-window.d.ts" />

declare global {
  interface Window extends ElectronWindow {}
  const __TEST__: boolean;
  const __DEBUG__: boolean;
}

export {};
