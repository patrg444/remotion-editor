import { Logger } from '../utils/logger';
import { PaymentHandler } from './PaymentHandler';

const logger = new Logger('WebhookHandler');

interface WebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      customer: string;
      amount?: number;
      currency?: string;
      status?: string;
      current_period_end?: number;
      plan?: {
        id: string;
      };
    };
  };
}

export class WebhookHandler {
  private static instance: WebhookHandler;
  private paymentHandler: PaymentHandler;

  private constructor() {
    logger.info('constructor enter');
    this.paymentHandler = PaymentHandler.getInstance();
    logger.info('constructor exit');
  }

  public static getInstance(): WebhookHandler {
    if (!WebhookHandler.instance) {
      WebhookHandler.instance = new WebhookHandler();
    }
    return WebhookHandler.instance;
  }

  public async handleWebhook(event: WebhookEvent): Promise<void> {
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

  private async handlePaymentIntentSucceeded(event: WebhookEvent): Promise<void> {
    logger.info('handlePaymentIntentSucceeded enter');
    const { id } = event.data.object;
    await this.paymentHandler.handlePaymentIntent(id);
    logger.info('handlePaymentIntentSucceeded exit');
  }

  private async handleSubscriptionCreated(event: WebhookEvent): Promise<void> {
    logger.info('handleSubscriptionCreated enter');
    const { id, current_period_end } = event.data.object;
    if (current_period_end) {
      const expiresAt = new Date(current_period_end * 1000).toISOString();
      await this.paymentHandler.handleSubscriptionCreated(id, expiresAt);
    }
    logger.info('handleSubscriptionCreated exit');
  }

  private async handleSubscriptionUpdated(event: WebhookEvent): Promise<void> {
    logger.info('handleSubscriptionUpdated enter');
    const { id, current_period_end } = event.data.object;
    if (current_period_end) {
      const expiresAt = new Date(current_period_end * 1000).toISOString();
      await this.paymentHandler.handleSubscriptionUpdated(id, expiresAt);
    }
    logger.info('handleSubscriptionUpdated exit');
  }

  private async handleSubscriptionDeleted(event: WebhookEvent): Promise<void> {
    logger.info('handleSubscriptionDeleted enter');
    const { id } = event.data.object;
    await this.paymentHandler.handleSubscriptionCancelled(id);
    logger.info('handleSubscriptionDeleted exit');
  }
}
