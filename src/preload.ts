import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { GPUStats } from './renderer/types/api';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api',
  {
    send: (channel: string, data: any) => {
      ipcRenderer.send(channel, data);
    },
    receive: (channel: string, func: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    gpu: {
      onStatsUpdate: (callback: (stats: GPUStats) => void) => {
        const wrappedCallback = (_event: IpcRendererEvent, stats: GPUStats) => callback(stats);
        ipcRenderer.on('gpu-stats-update', wrappedCallback);
        return () => {
          ipcRenderer.removeListener('gpu-stats-update', wrappedCallback);
        };
      },
      offStatsUpdate: (callback: (stats: GPUStats) => void) => {
        const wrappedCallback = (_event: IpcRendererEvent, stats: GPUStats) => callback(stats);
        ipcRenderer.removeListener('gpu-stats-update', wrappedCallback);
      }
    }
  }
);
