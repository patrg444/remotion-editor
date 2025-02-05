import { useCallback } from 'react';
import { ExportSettings } from '../types/export';

declare global {
  interface Window {
    electron: {
      invoke(channel: string, ...args: any[]): Promise<any>;
      on(channel: string, listener: (...args: any[]) => void): void;
      off(channel: string, listener: (...args: any[]) => void): void;
      send(channel: string, ...args: any[]): void;
    };
  }
}

interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  lastModified: number;
  metadata: {
    duration?: number;
    width?: number;
    height?: number;
  };
}

export const useFileOperations = () => {
  const validateFile = useCallback(async (file: File) => {
    // Check file type
    if (!file.type.match(/^(video|audio|image)\//)) {
      throw new Error('Unsupported file type');
    }

    // Check file size (e.g., max 2GB)
    const MAX_SIZE = 2 * 1024 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('File size too large');
    }

    // Basic corruption check (at least has some content)
    if (file.size === 0) {
      throw new Error('File is corrupt');
    }

    return true;
  }, []);

  const validateExportSettings = useCallback((settings: ExportSettings) => {
    // Validate title
    if (!settings.title) {
      throw new Error('Title is required');
    }
    if (settings.title.includes('/')) {
      throw new Error('Invalid characters in filename');
    }

    // Validate resolution
    const minResolution = 480;
    if (settings.resolution.width < minResolution || settings.resolution.height < minResolution) {
      throw new Error('Resolution too low for selected platform');
    }

    // Validate in/out points
    if (settings.inPoint !== undefined && settings.outPoint !== undefined) {
      if (settings.inPoint >= settings.outPoint) {
        throw new Error('In point must be before out point');
      }
    }

    return true;
  }, []);

  const checkDiskSpace = useCallback(async () => {
    try {
      // Use Electron's ipcRenderer to call main process
      const { available, total } = await window.electron.invoke('get-disk-space');
      
      // Calculate required space based on export settings
      // Assume 4K video at 60fps for 1 hour = ~175GB
      // So 1 minute = ~3GB
      const requiredSpace = 3 * 1024 * 1024 * 1024; // 3GB per minute minimum

      return {
        available,
        required: requiredSpace,
        total
      };
    } catch (error) {
      console.error('Failed to check disk space:', error);
      throw new Error('Failed to check disk space');
    }
  }, []);

  const processFile = useCallback(async (file: File): Promise<ProcessedFile> => {
    try {
      // Create object URL for the file
      const url = URL.createObjectURL(file);

      // For video/audio files, get duration and resolution
      let metadata = {};
      if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
        const media = file.type.startsWith('video/') 
          ? document.createElement('video')
          : document.createElement('audio');
        
        metadata = await new Promise((resolve, reject) => {
          media.onloadedmetadata = () => {
            resolve({
              duration: media.duration,
              ...(file.type.startsWith('video/') ? {
                width: (media as HTMLVideoElement).videoWidth,
                height: (media as HTMLVideoElement).videoHeight,
              } : {})
            });
          };
          media.onerror = () => reject(new Error('Failed to load media metadata'));
          media.src = url;
        });

        // Clean up
        URL.revokeObjectURL(url);
      }

      // For images, get dimensions
      if (file.type.startsWith('image/')) {
        const img = new Image();
        metadata = await new Promise((resolve, reject) => {
          img.onload = () => {
            resolve({
              width: img.naturalWidth,
              height: img.naturalHeight
            });
          };
          img.onerror = () => reject(new Error('Failed to load image metadata'));
          img.src = url;
        });

        // Clean up
        URL.revokeObjectURL(url);
      }

      // Generate unique ID and return processed file info
      return {
        id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        metadata
      };
    } catch (error) {
      console.error('Failed to process file:', error);
      throw new Error('Failed to process file');
    }
  }, []);

  return {
    validateFile,
    processFile,
    validateExportSettings,
    checkDiskSpace
  };
};
