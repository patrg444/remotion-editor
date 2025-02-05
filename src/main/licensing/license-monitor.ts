import { Logger } from '../utils/logger';
import { LicenseManager } from './LicenseManager';
import { NotificationManager } from './notification-manager';

const logger = new Logger('LicenseMonitor');

const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
const WARNING_THRESHOLD = 7 * 24 * 60 * 60 * 1000; // 7 days

export class LicenseMonitor {
  private checkTimer: NodeJS.Timeout | null = null;

  constructor(
    private licenseManager: LicenseManager,
    private notificationManager: NotificationManager
  ) {
    logger.info('constructor enter');
    logger.info('constructor exit');
  }

  startMonitoring(): void {
    logger.info('startMonitoring enter');
    this.checkLicense();
    this.checkTimer = setInterval(() => this.checkLicense(), CHECK_INTERVAL);
    logger.info('License monitoring started');
    logger.info('startMonitoring exit');
  }

  stopMonitoring(): void {
    logger.info('stopMonitoring enter');
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
    logger.info('License monitoring stopped');
    logger.info('stopMonitoring exit');
  }

  async checkLicense(): Promise<void> {
    logger.info('checkLicense enter');
    try {
      const status = await this.licenseManager.checkLicense();

      if (!status.isValid) {
        this.notificationManager.showLicenseExpiredNotification();
        return;
      }

      if (status.expiresAt) {
        const expiryDate = new Date(status.expiresAt);
        const now = new Date();
        const timeRemaining = expiryDate.getTime() - now.getTime();

        if (timeRemaining <= WARNING_THRESHOLD) {
          const daysRemaining = Math.ceil(timeRemaining / (24 * 60 * 60 * 1000));
          this.notificationManager.showLicenseExpiringNotification(daysRemaining);
        }
      }
    } catch (error) {
      logger.error('Failed to check license:', error);
    }
    logger.info('checkLicense exit');
  }
}
