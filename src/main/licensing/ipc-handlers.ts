import { ipcMain, dialog, BrowserWindow, IpcMainInvokeEvent, OpenDialogOptions, SaveDialogOptions } from 'electron';
import { Logger } from '../utils/logger';
import { LicenseManager } from './LicenseManager';

const logger = new Logger('IpcHandlers');

export function registerLicenseHandlers(): void {
  logger.info('registerLicenseHandlers enter');

  const licenseManager = LicenseManager.getInstance();

  // License handlers
  ipcMain.handle('license:check', async () => {
    logger.info('license:check handler called');
    return await licenseManager.checkLicense();
  });

  ipcMain.handle('license:activate', async (_event, key: string) => {
    logger.info('license:activate handler called', { key });
    return await licenseManager.activateLicense(key);
  });

  ipcMain.handle('license:upgrade', async () => {
    logger.info('license:upgrade handler called');
    return await licenseManager.upgradeLicense();
  });

  // Dialog handlers
  ipcMain.handle('dialog:showOpen', async (event: IpcMainInvokeEvent, options: OpenDialogOptions) => {
    logger.info('dialog:showOpen handler called', { options });
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      throw new Error('No window found for dialog');
    }
    return await dialog.showOpenDialog(window, options);
  });

  ipcMain.handle('dialog:showSave', async (event: IpcMainInvokeEvent, options: SaveDialogOptions) => {
    logger.info('dialog:showSave handler called', { options });
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      throw new Error('No window found for dialog');
    }
    return await dialog.showSaveDialog(window, options);
  });

  logger.info('registerLicenseHandlers exit');
}
