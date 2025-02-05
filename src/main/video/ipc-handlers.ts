import { ipcMain } from 'electron';
import { Logger } from '../utils/logger';
import { VideoProcessor } from './VideoProcessor';

const logger = new Logger('VideoIpcHandlers');

export function registerVideoHandlers(): void {
  logger.info('registerVideoHandlers enter');

  const videoProcessor = new VideoProcessor();

  ipcMain.handle('video:load', async (_event, filePath: string) => {
    logger.info('video:load handler called', { filePath });
    try {
      const metadata = await videoProcessor.loadVideo(filePath);
      logger.info('video:load handler success', { metadata });
      return metadata;
    } catch (error) {
      logger.error('Failed to load video:', error);
      throw error;
    }
  });

  ipcMain.handle('video:getMetadata', async (_event, filePath: string) => {
    logger.info('video:getMetadata handler called', { filePath });
    try {
      const metadata = await videoProcessor.getMetadata(filePath);
      logger.info('video:getMetadata handler success', { metadata });
      return metadata;
    } catch (error) {
      logger.error('Failed to get video metadata:', error);
      throw error;
    }
  });

  logger.info('registerVideoHandlers exit');
}
