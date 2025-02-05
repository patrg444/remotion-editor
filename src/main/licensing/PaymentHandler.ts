import { Logger } from '../utils/logger';
import { LicenseManager } from './LicenseManager';
import { readFileSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

const logger = new Logger('PaymentHandler');

interface PaymentConfig {
  stripePublicKey: string;
  stripeSecretKey: string;
  webhookSecret: string;
  prices: {
    monthly: string;
    yearly: string;
  };
  plans: {
    [key: string]: {
      id: string;
      name: string;
      features: string[];
      price: {
        monthly: number;
        yearly: number;
      };
    };
  };
  trial: {
    duration: number;
    features: string[];
  };
}

const defaultConfig: PaymentConfig = {
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

export class PaymentHandler {
  private static instance: PaymentHandler;
  private config!: PaymentConfig;
  private licenseManager: LicenseManager;

  private constructor() {
    logger.info('constructor enter');
    this.licenseManager = LicenseManager.getInstance();
    this.loadConfig();
    logger.info('constructor exit');
  }

  public static getInstance(): PaymentHandler {
    if (!PaymentHandler.instance) {
      PaymentHandler.instance = new PaymentHandler();
    }
    return PaymentHandler.instance;
  }

  private loadConfig(): void {
    logger.info('loadConfig enter');
    try {
      // In development mode, use the config from the project directory
      const configPath = process.env.NODE_ENV === 'development'
        ? join(process.cwd(), 'src', 'main', 'licensing', 'payment-config.json')
        : join(app.getPath('userData'), 'payment-config.json');

      const configContent = readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      logger.info('loadConfig exit (success)');
    } catch (error) {
      logger.error('Failed to load payment config:', error);
      // Use default config
      this.config = defaultConfig;
      logger.info('loadConfig exit (using default config)');
    }
  }

  public async createCheckoutSession(priceId: string): Promise<string> {
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

  public async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    logger.info('handlePaymentSuccess enter', { paymentIntentId });
    // Set a temporary expiry date for successful payments
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
    await this.licenseManager.updateLicenseExpiry(expiryDate.toISOString());
    logger.info('handlePaymentSuccess exit');
  }

  public async handlePaymentIntent(paymentIntentId: string): Promise<void> {
    logger.info('handlePaymentIntent enter', { paymentIntentId });
    await this.handlePaymentSuccess(paymentIntentId);
    logger.info('handlePaymentIntent exit');
  }

  public async handleSubscriptionCreated(subscriptionId: string, expiresAt: string): Promise<void> {
    logger.info('handleSubscriptionCreated enter', { subscriptionId });
    await this.licenseManager.updateLicenseExpiry(expiresAt);
    logger.info('handleSubscriptionCreated exit');
  }

  public async handleSubscriptionUpdated(subscriptionId: string, expiresAt: string): Promise<void> {
    logger.info('handleSubscriptionUpdated enter', { subscriptionId });
    const currentLicense = await this.licenseManager.getCurrentLicense();
    if (currentLicense) {
      await this.licenseManager.updateLicenseExpiry(expiresAt);
    }
    logger.info('handleSubscriptionUpdated exit');
  }

  public async handleSubscriptionCancelled(subscriptionId: string): Promise<void> {
    logger.info('handleSubscriptionCancelled enter', { subscriptionId });
    const currentLicense = await this.licenseManager.getCurrentLicense();
    if (currentLicense) {
      // Set expiry to now to invalidate the license
      await this.licenseManager.updateLicenseExpiry(new Date().toISOString());
    }
    logger.info('handleSubscriptionCancelled exit');
  }

  public getPublicKey(): string {
    return this.config.stripePublicKey;
  }

  public getPrices(): { monthly: string; yearly: string } {
    return this.config.prices;
  }

  public getPlans(): typeof this.config.plans {
    return this.config.plans;
  }
}
