# Licensing System

The licensing system manages user licenses, subscriptions, and feature access in the video editor application. It provides a secure and flexible way to handle different subscription tiers and trial periods.

## Architecture

The licensing system consists of several key components:

### LicenseManager

The core component that handles license validation, activation, and feature access control. It maintains the current license state and provides methods to check license validity and feature availability.

### PaymentHandler

Manages all payment-related operations through Stripe integration:
- Subscription creation and management
- Payment processing
- Webhook handling for subscription events

### NotificationManager

Handles license-related notifications:
- License expiration warnings
- Trial period reminders
- Subscription status updates

### LicenseMonitor

Continuously monitors license status and triggers appropriate actions:
- Checks license validity periodically
- Initiates notifications when needed
- Handles grace periods

## Configuration

The system is configured through `payment-config.json`, which defines:
- Subscription plans and pricing
- Feature sets for each tier
- Trial period settings
- Stripe API configuration

## Development Mode

In development mode (`NODE_ENV=development`):
- License checks always return valid
- All features are enabled
- No payment processing is performed
- Mock data is used for subscriptions

## Production Mode

In production:
- License validation is enforced
- Payment processing is active
- Feature access is restricted based on subscription tier
- Real Stripe API integration is used

## Usage

### Checking License Status

```typescript
const licenseManager = LicenseManager.getInstance();
const status = await licenseManager.checkLicense();
```

### Activating a License

```typescript
const success = await licenseManager.activateLicense(licenseKey);
```

### Creating a Subscription

```typescript
const paymentHandler = PaymentHandler.getInstance();
const session = await paymentHandler.createCheckoutSession(priceId);
```

### Checking Feature Access

```typescript
const canAccess = await licenseManager.checkFeatureAccess('4k_export');
```

## Webhook Integration

The system handles the following Stripe webhook events:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `payment_intent.succeeded`

## Security

- License keys are encrypted at rest
- Payment information is handled securely through Stripe
- Webhook signatures are verified
- License checks are performed server-side

## Error Handling

The system provides detailed error handling for:
- Invalid license keys
- Failed payments
- Network issues
- Webhook processing errors

## Testing

Run the test suite:
```bash
npm run test:licensing
```

## Subscription Tiers

### Basic
- Basic video editing
- 720p export
- 2 video tracks
- 2 audio tracks

### Professional
- Advanced video editing
- 4K export
- Unlimited video tracks
- Unlimited audio tracks
- Motion graphics
- Color grading
- Audio effects

### Enterprise
- All Pro features
- 8K export
- Team collaboration
- Custom branding
- Priority support
- API access
- Custom integrations

## Implementation Notes

1. Always use the singleton instances:
   ```typescript
   const licenseManager = LicenseManager.getInstance();
   const paymentHandler = PaymentHandler.getInstance();
   ```

2. Handle license checks gracefully:
   ```typescript
   try {
     const status = await licenseManager.checkLicense();
     if (!status.isValid) {
       // Handle invalid license
     }
   } catch (error) {
     // Handle error
   }
   ```

3. Monitor license status changes:
   ```typescript
   licenseManager.on('licenseChanged', (status) => {
     // Update UI or take appropriate action
   });
   ```

4. Implement feature gates:
   ```typescript
   if (await licenseManager.checkFeatureAccess('feature_name')) {
     // Enable feature
   } else {
     // Show upgrade prompt
   }
   ```

## Troubleshooting

Common issues and solutions:

1. License Not Recognized
   - Check license key format
   - Verify activation server connection
   - Clear license cache

2. Payment Processing Failed
   - Check Stripe API keys
   - Verify webhook configuration
   - Check payment method validity

3. Feature Access Issues
   - Verify subscription tier
   - Check license status
   - Clear feature access cache

## Contributing

When adding new features to the licensing system:

1. Update type definitions in `payment-config.types.ts`
2. Add appropriate tests
3. Update documentation
4. Follow the existing error handling patterns
5. Consider backward compatibility
