export interface PlanPrice {
  monthly: number;
  yearly: number;
}

export interface Plan {
  id: string;
  name: string;
  features: string[];
  price: PlanPrice;
}

export interface Plans {
  basic: Plan;
  pro: Plan;
  enterprise: Plan;
}

export interface StripePrices {
  monthly: string;
  yearly: string;
}

export interface Trial {
  duration: number;
  features: string[];
}

export interface PaymentConfig {
  stripePublicKey: string;
  stripeSecretKey: string;
  webhookSecret: string;
  prices: StripePrices;
  plans: Plans;
  trial: Trial;
}

export type PlanId = keyof Plans;
export type BillingInterval = keyof StripePrices;

export interface PlanFeature {
  name: string;
  included: boolean;
}

export interface PlanDetails {
  id: PlanId;
  name: string;
  features: PlanFeature[];
  price: {
    monthly: string;
    yearly: string;
  };
  recommended?: boolean;
}

export interface SubscriptionDetails {
  planId: PlanId;
  interval: BillingInterval;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

export interface PaymentDetails {
  customerId: string;
  subscription?: SubscriptionDetails;
  defaultPaymentMethod?: PaymentMethod;
  invoices?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
  }>;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface BillingPortalSession {
  id: string;
  url: string;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: {
    object: any;
  };
}
