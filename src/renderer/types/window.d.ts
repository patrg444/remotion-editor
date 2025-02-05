import { ElectronAPI } from './electron';
import { MockElectronAPI } from './electron-mock';

declare global {
  interface Window {
    electron: ElectronAPI | MockElectronAPI;
  }
}

export {};
