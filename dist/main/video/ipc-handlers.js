"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVideoHandlers = void 0;
const electron_1 = require("electron");
const logger_1 = require("../utils/logger");
const VideoProcessor_1 = require("./VideoProcessor");
const logger = new logger_1.Logger('VideoIpcHandlers');
function registerVideoHandlers() {
    logger.info('registerVideoHandlers enter');
    const videoProcessor = new VideoProcessor_1.VideoProcessor();
    electron_1.ipcMain.handle('video:load', async (_event, filePath) => {
        logger.info('video:load handler called', { filePath });
        try {
            const metadata = await videoProcessor.loadVideo(filePath);
            logger.info('video:load handler success', { metadata });
            return metadata;
        }
        catch (error) {
            logger.error('Failed to load video:', error);
            throw error;
        }
    });
    electron_1.ipcMain.handle('video:getMetadata', async (_event, filePath) => {
        logger.info('video:getMetadata handler called', { filePath });
        try {
            const metadata = await videoProcessor.getMetadata(filePath);
            logger.info('video:getMetadata handler success', { metadata });
            return metadata;
        }
        catch (error) {
            logger.error('Failed to get video metadata:', error);
            throw error;
        }
    });
    logger.info('registerVideoHandlers exit');
}
exports.registerVideoHandlers = registerVideoHandlers;
