import { useEffect, useState, useCallback } from 'react';
import { Logger } from '../../main/utils/logger';

const logger = new Logger('useGPU');

// Electron interface is already declared in useFileOperations.ts

export interface GPUStats {
  memoryUsed: number;
  memoryTotal: number;
  utilization: number;
  temperature: number;
  vendor: string;
  renderer: string;
  version: string;
  isWebGL2: boolean;
  maxTextureSize: number;
  maxViewportDims: number[];
  extensions: string[];
}

const initialStats: GPUStats = {
  memoryUsed: 0,
  memoryTotal: 0,
  utilization: 0,
  temperature: 0,
  vendor: '',
  renderer: '',
  version: '',
  isWebGL2: false,
  maxTextureSize: 0,
  maxViewportDims: [0, 0],
  extensions: []
};

export function useGPU(onStatsUpdate?: (stats: GPUStats) => void): GPUStats {
  const [stats, setStats] = useState<GPUStats>(initialStats);

  // Memoize the update handler to avoid recreating it on every render
  const handleUpdate = useCallback((event: any, newStats: GPUStats) => {
    logger.debug('Received GPU stats update:', newStats);
    setStats(newStats);
    onStatsUpdate?.(newStats);
  }, [onStatsUpdate]);

  useEffect(() => {
    logger.info('Initializing GPU monitoring');

    // Get initial GPU capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        const initialCapabilities = {
          vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
          renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
          version: gl.getParameter(gl.VERSION),
          isWebGL2: gl instanceof WebGL2RenderingContext,
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
          extensions: gl.getSupportedExtensions() || []
        };
        logger.info('GPU capabilities:', initialCapabilities);
      }
    }

    // Subscribe to GPU stats updates from main process
    window.electron.on('gpu:stats', handleUpdate);

    // Request initial stats
    window.electron.invoke('gpu:getStats').catch(error => {
      logger.error('Failed to get initial GPU stats:', error);
    });

    // Start monitoring
    const monitoringInterval = setInterval(() => {
      window.electron.invoke('gpu:getStats').catch(error => {
        logger.error('Failed to get GPU stats:', error);
      });
    }, 1000); // Update every second

    // Cleanup
    return () => {
      logger.info('Cleaning up GPU monitoring');
      window.electron.off('gpu:stats', handleUpdate);
      clearInterval(monitoringInterval);
    };
  }, [handleUpdate]); // Only run on mount/unmount and when handler changes

  return stats;
}
