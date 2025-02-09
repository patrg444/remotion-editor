"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupGPUHandlers = void 0;
const electron_1 = require("electron");
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('gpu-ipc-handlers');
let statsInterval = null;
function setupGPUHandlers() {
    // Mock GPU stats for testing
    const sendMockStats = (event) => {
        event.sender.send('gpu-stats-update', {
            memoryUsed: Math.random() * 1024 * 1024 * 1024,
            memoryTotal: 4 * 1024 * 1024 * 1024,
            utilization: Math.random() * 100,
            temperature: 50 + Math.random() * 30 // Random temp between 50-80°C
        });
    };
    electron_1.ipcMain.on('start-gpu-monitoring', (event) => {
        logger.info('Starting GPU monitoring');
        if (!statsInterval) {
            statsInterval = setInterval(() => sendMockStats(event), 1000);
        }
    });
    electron_1.ipcMain.on('stop-gpu-monitoring', () => {
        logger.info('Stopping GPU monitoring');
        if (statsInterval) {
            clearInterval(statsInterval);
            statsInterval = null;
        }
    });
}
exports.setupGPUHandlers = setupGPUHandlers;
