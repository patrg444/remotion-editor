import { Logger } from '../utils/logger';

const logger = new Logger('NotificationManager');

export class NotificationManager {
  constructor() {
    logger.info('constructor enter');
    logger.info('constructor exit');
  }

  showLicenseExpiredNotification(): void {
    logger.info('showLicenseExpiredNotification enter');
    // TODO: Implement notification logic
    logger.info('showLicenseExpiredNotification exit');
  }

  showLicenseExpiringNotification(daysRemaining: number): void {
    logger.info('showLicenseExpiringNotification enter', { daysRemaining });
    // TODO: Implement notification logic
    logger.info('showLicenseExpiringNotification exit');
  }

  showUpgradeAvailableNotification(): void {
    logger.info('showUpgradeAvailableNotification enter');
    // TODO: Implement notification logic
    logger.info('showUpgradeAvailableNotification exit');
  }
}
