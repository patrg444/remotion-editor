"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookHandler = void 0;
const logger_1 = require("../utils/logger");
const PaymentHandler_1 = require("./PaymentHandler");
const logger = new logger_1.Logger('WebhookHandler');
class WebhookHandler {
    constructor() {
        logger.info('constructor enter');
        this.paymentHandler = PaymentHandler_1.PaymentHandler.getInstance();
        logger.info('constructor exit');
    }
    static getInstance() {
        if (!WebhookHandler.instance) {
            WebhookHandler.instance = new WebhookHandler();
        }
        return WebhookHandler.instance;
    }
    async handleWebhook(event) {
        logger.info('handleWebhook enter', { type: event.type });
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentIntentSucceeded(event);
                break;
            case 'customer.subscription.created':
                await this.handleSubscriptionCreated(event);
                break;
            case 'customer.subscription.updated':
                await this.handleSubscriptionUpdated(event);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event);
                break;
            default:
                logger.info('Unhandled webhook event type:', event.type);
        }
        logger.info('handleWebhook exit');
    }
    async handlePaymentIntentSucceeded(event) {
        logger.info('handlePaymentIntentSucceeded enter');
        const { id } = event.data.object;
        await this.paymentHandler.handlePaymentIntent(id);
        logger.info('handlePaymentIntentSucceeded exit');
    }
    async handleSubscriptionCreated(event) {
        logger.info('handleSubscriptionCreated enter');
        const { id, current_period_end } = event.data.object;
        if (current_period_end) {
            const expiresAt = new Date(current_period_end * 1000).toISOString();
            await this.paymentHandler.handleSubscriptionCreated(id, expiresAt);
        }
        logger.info('handleSubscriptionCreated exit');
    }
    async handleSubscriptionUpdated(event) {
        logger.info('handleSubscriptionUpdated enter');
        const { id, current_period_end } = event.data.object;
        if (current_period_end) {
            const expiresAt = new Date(current_period_end * 1000).toISOString();
            await this.paymentHandler.handleSubscriptionUpdated(id, expiresAt);
        }
        logger.info('handleSubscriptionUpdated exit');
    }
    async handleSubscriptionDeleted(event) {
        logger.info('handleSubscriptionDeleted enter');
        const { id } = event.data.object;
        await this.paymentHandler.handleSubscriptionCancelled(id);
        logger.info('handleSubscriptionDeleted exit');
    }
}
exports.WebhookHandler = WebhookHandler;
