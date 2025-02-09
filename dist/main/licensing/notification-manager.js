"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationManager = void 0;
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('NotificationManager');
class NotificationManager {
    constructor() {
        logger.info('constructor enter');
        logger.info('constructor exit');
    }
    showLicenseExpiredNotification() {
        logger.info('showLicenseExpiredNotification enter');
        // TODO: Implement notification logic
        logger.info('showLicenseExpiredNotification exit');
    }
    showLicenseExpiringNotification(daysRemaining) {
        logger.info('showLicenseExpiringNotification enter', { daysRemaining });
        // TODO: Implement notification logic
        logger.info('showLicenseExpiringNotification exit');
    }
    showUpgradeAvailableNotification() {
        logger.info('showUpgradeAvailableNotification enter');
        // TODO: Implement notification logic
        logger.info('showUpgradeAvailableNotification exit');
    }
}
exports.NotificationManager = NotificationManager;
