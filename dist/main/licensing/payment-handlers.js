"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPaymentHandlers = void 0;
const electron_1 = require("electron");
const logger_1 = require("../utils/logger");
const PaymentHandler_1 = require("./PaymentHandler");
const logger = new logger_1.Logger('PaymentHandlers');
function registerPaymentHandlers() {
    logger.info('registerPaymentHandlers enter');
    const paymentHandler = PaymentHandler_1.PaymentHandler.getInstance();
    // Payment handlers
    electron_1.ipcMain.handle('payment:createCheckout', async (_event, priceId) => {
        logger.info('payment:createCheckout handler called', { priceId });
        return await paymentHandler.createCheckoutSession(priceId);
    });
    electron_1.ipcMain.handle('payment:getPublicKey', async () => {
        logger.info('payment:getPublicKey handler called');
        return paymentHandler.getPublicKey();
    });
    electron_1.ipcMain.handle('payment:getPrices', async () => {
        logger.info('payment:getPrices handler called');
        return paymentHandler.getPrices();
    });
    electron_1.ipcMain.handle('payment:getPlans', async () => {
        logger.info('payment:getPlans handler called');
        return paymentHandler.getPlans();
    });
    logger.info('registerPaymentHandlers exit');
}
exports.registerPaymentHandlers = registerPaymentHandlers;
