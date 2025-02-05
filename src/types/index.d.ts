import { OpenDialogOptions, SaveDialogOptions, OpenDialogReturnValue, SaveDialogReturnValue } from 'electron';
import { LicenseValidationResult } from '../main/licensing/types';
import { GPUStats, GPUAPI } from '../renderer/types/api';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
}

interface ElectronAPI {
  // License management
  checkLicense: () => Promise<LicenseValidationResult>;
  activateLicense: (key: string) => Promise<boolean>;
  upgradeLicense: () => Promise<boolean>;

  // File dialogs
  showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>;
  showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>;

  // Video processing
  getVideoMetadata: (filePath: string) => Promise<VideoMetadata>;
  processVideo: (options: any) => Promise<string>;
  generateThumbnail: (path: string, time: number) => Promise<string>;
  extractFrame: (path: string, time: number) => Promise<string>;
  generateWaveform: (path: string) => Promise<number[]>;

  // GPU monitoring
  gpu: GPUAPI;

  // Event handling
  send: (channel: string, data: any) => void;
  receive: (channel: string, func: (...args: any[]) => void) => void;
  invoke: (channel: string, data: any) => Promise<any>;
}

declare global {
  interface Window {
    api: ElectronAPI;
    process: {
      env: {
        NODE_ENV: string;
      };
    };
  }
}

export {};
