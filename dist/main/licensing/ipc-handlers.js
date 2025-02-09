"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLicenseHandlers = void 0;
const electron_1 = require("electron");
const logger_1 = require("../utils/logger");
const LicenseManager_1 = require("./LicenseManager");
const logger = new logger_1.Logger('IpcHandlers');
function registerLicenseHandlers() {
    logger.info('registerLicenseHandlers enter');
    const licenseManager = LicenseManager_1.LicenseManager.getInstance();
    // License handlers
    electron_1.ipcMain.handle('license:check', async () => {
        logger.info('license:check handler called');
        return await licenseManager.checkLicense();
    });
    electron_1.ipcMain.handle('license:activate', async (_event, key) => {
        logger.info('license:activate handler called', { key });
        return await licenseManager.activateLicense(key);
    });
    electron_1.ipcMain.handle('license:upgrade', async () => {
        logger.info('license:upgrade handler called');
        return await licenseManager.upgradeLicense();
    });
    // Dialog handlers
    electron_1.ipcMain.handle('dialog:showOpen', async (event, options) => {
        logger.info('dialog:showOpen handler called', { options });
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            throw new Error('No window found for dialog');
        }
        return await electron_1.dialog.showOpenDialog(window, options);
    });
    electron_1.ipcMain.handle('dialog:showSave', async (event, options) => {
        logger.info('dialog:showSave handler called', { options });
        const window = electron_1.BrowserWindow.fromWebContents(event.sender);
        if (!window) {
            throw new Error('No window found for dialog');
        }
        return await electron_1.dialog.showSaveDialog(window, options);
    });
    logger.info('registerLicenseHandlers exit');
}
exports.registerLicenseHandlers = registerLicenseHandlers;
