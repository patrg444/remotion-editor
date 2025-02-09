"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentHandler = void 0;
const logger_1 = require("../utils/logger");
const LicenseManager_1 = require("./LicenseManager");
const fs_1 = require("fs");
const path_1 = require("path");
const electron_1 = require("electron");
const logger = new logger_1.Logger('PaymentHandler');
const defaultConfig = {
    stripePublicKey: 'pk_test_sample',
    stripeSecretKey: 'sk_test_sample',
    webhookSecret: 'whsec_sample',
    prices: {
        monthly: 'price_monthly_sample',
        yearly: 'price_yearly_sample'
    },
    plans: {
        basic: {
            id: 'basic',
            name: 'Basic',
            features: ['Basic video editing', '720p export'],
            price: { monthly: 9.99, yearly: 99.99 }
        }
    },
    trial: {
        duration: 14,
        features: ['Basic video editing', '720p export']
    }
};
class PaymentHandler {
    constructor() {
        logger.info('constructor enter');
        this.licenseManager = LicenseManager_1.LicenseManager.getInstance();
        this.loadConfig();
        logger.info('constructor exit');
    }
    static getInstance() {
        if (!PaymentHandler.instance) {
            PaymentHandler.instance = new PaymentHandler();
        }
        return PaymentHandler.instance;
    }
    loadConfig() {
        logger.info('loadConfig enter');
        try {
            // In development mode, use the config from the project directory
            const configPath = process.env.NODE_ENV === 'development'
                ? (0, path_1.join)(process.cwd(), 'src', 'main', 'licensing', 'payment-config.json')
                : (0, path_1.join)(electron_1.app.getPath('userData'), 'payment-config.json');
            const configContent = (0, fs_1.readFileSync)(configPath, 'utf-8');
            this.config = JSON.parse(configContent);
            logger.info('loadConfig exit (success)');
        }
        catch (error) {
            logger.error('Failed to load payment config:', error);
            // Use default config
            this.config = defaultConfig;
            logger.info('loadConfig exit (using default config)');
        }
    }
    async createCheckoutSession(priceId) {
        logger.info('createCheckoutSession enter', { priceId });
        // In development mode, return a mock session ID
        if (process.env.NODE_ENV === 'development') {
            logger.info('createCheckoutSession exit (development mode)');
            return 'cs_test_mock_session_id';
        }
        // TODO: Implement Stripe checkout session creation
        logger.info('createCheckoutSession exit');
        return '';
    }
    async handlePaymentSuccess(paymentIntentId) {
        logger.info('handlePaymentSuccess enter', { paymentIntentId });
        // Set a temporary expiry date for successful payments
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
        await this.licenseManager.updateLicenseExpiry(expiryDate.toISOString());
        logger.info('handlePaymentSuccess exit');
    }
    async handlePaymentIntent(paymentIntentId) {
        logger.info('handlePaymentIntent enter', { paymentIntentId });
        await this.handlePaymentSuccess(paymentIntentId);
        logger.info('handlePaymentIntent exit');
    }
    async handleSubscriptionCreated(subscriptionId, expiresAt) {
        logger.info('handleSubscriptionCreated enter', { subscriptionId });
        await this.licenseManager.updateLicenseExpiry(expiresAt);
        logger.info('handleSubscriptionCreated exit');
    }
    async handleSubscriptionUpdated(subscriptionId, expiresAt) {
        logger.info('handleSubscriptionUpdated enter', { subscriptionId });
        const currentLicense = await this.licenseManager.getCurrentLicense();
        if (currentLicense) {
            await this.licenseManager.updateLicenseExpiry(expiresAt);
        }
        logger.info('handleSubscriptionUpdated exit');
    }
    async handleSubscriptionCancelled(subscriptionId) {
        logger.info('handleSubscriptionCancelled enter', { subscriptionId });
        const currentLicense = await this.licenseManager.getCurrentLicense();
        if (currentLicense) {
            // Set expiry to now to invalidate the license
            await this.licenseManager.updateLicenseExpiry(new Date().toISOString());
        }
        logger.info('handleSubscriptionCancelled exit');
    }
    getPublicKey() {
        return this.config.stripePublicKey;
    }
    getPrices() {
        return this.config.prices;
    }
    getPlans() {
        return this.config.plans;
    }
}
exports.PaymentHandler = PaymentHandler;
