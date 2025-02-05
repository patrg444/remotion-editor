import { ipcMain } from 'electron';
import { Logger } from '../utils/logger';

const logger = new Logger('gpu-ipc-handlers');

let statsInterval: NodeJS.Timeout | null = null;

export function setupGPUHandlers() {
  // Mock GPU stats for testing
  const sendMockStats = (event: Electron.IpcMainEvent) => {
    event.sender.send('gpu-stats-update', {
      memoryUsed: Math.random() * 1024 * 1024 * 1024, // Random value up to 1GB
      memoryTotal: 4 * 1024 * 1024 * 1024, // 4GB total
      utilization: Math.random() * 100,
      temperature: 50 + Math.random() * 30 // Random temp between 50-80°C
    });
  };

  ipcMain.on('start-gpu-monitoring', (event) => {
    logger.info('Starting GPU monitoring');
    if (!statsInterval) {
      statsInterval = setInterval(() => sendMockStats(event), 1000);
    }
  });

  ipcMain.on('stop-gpu-monitoring', () => {
    logger.info('Stopping GPU monitoring');
    if (statsInterval) {
      clearInterval(statsInterval);
      statsInterval = null;
    }
  });
}
