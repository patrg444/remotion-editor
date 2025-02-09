import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { Logger } from '../utils/logger';
import { PaymentHandler } from './PaymentHandler';

const logger = new Logger('PaymentHandlers');

export function registerPaymentHandlers(): void {
  logger.info('registerPaymentHandlers enter');

  const paymentHandler = PaymentHandler.getInstance();

  // Payment handlers
  ipcMain.handle('payment:createCheckout', async (_event: IpcMainInvokeEvent, priceId: string) => {
    logger.info('payment:createCheckout handler called', { priceId });
    return await paymentHandler.createCheckoutSession(priceId);
  });

  ipcMain.handle('payment:getPublicKey', async () => {
    logger.info('payment:getPublicKey handler called');
    return paymentHandler.getPublicKey();
  });

  ipcMain.handle('payment:getPrices', async () => {
    logger.info('payment:getPrices handler called');
    return paymentHandler.getPrices();
  });

  ipcMain.handle('payment:getPlans', async () => {
    logger.info('payment:getPlans handler called');
    return paymentHandler.getPlans();
  });

  logger.info('registerPaymentHandlers exit');
}
