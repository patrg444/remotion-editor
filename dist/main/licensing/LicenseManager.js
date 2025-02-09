"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LicenseManager = void 0;
const logger_1 = require("../utils/logger");
const logger = new logger_1.Logger('LicenseManager');
class LicenseManager {
    constructor() {
        logger.info('constructor enter');
        // In development mode, always return valid license
        this.licenseStatus = process.env.NODE_ENV === 'development'
            ? {
                isValid: true,
                message: 'Development mode - license always valid',
                plan: 'enterprise',
                features: [
                    'Basic video editing',
                    '8K export',
                    'Unlimited video tracks',
                    'Unlimited audio tracks',
                    'Motion graphics',
                    'Color grading',
                    'Audio effects',
                    'Team collaboration',
                    'Custom branding',
                    'Priority support',
                    'API access',
                    'Custom integrations'
                ],
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            }
            : {
                isValid: false,
                message: 'No license activated'
            };
        logger.info('constructor exit');
    }
    static getInstance() {
        if (!LicenseManager.instance) {
            LicenseManager.instance = new LicenseManager();
        }
        return LicenseManager.instance;
    }
    async checkLicense() {
        logger.info('checkLicense enter');
        // In development mode, always return valid
        if (process.env.NODE_ENV === 'development') {
            logger.info('checkLicense exit (development mode)');
            return this.licenseStatus;
        }
        // In production, implement actual license check logic here
        // This would typically involve:
        // 1. Check local license file
        // 2. Validate with license server
        // 3. Check expiration
        // 4. Update status
        logger.info('checkLicense exit');
        return this.licenseStatus;
    }
    async activateLicense(key) {
        logger.info('activateLicense enter', { key });
        // In development mode, always succeed
        if (process.env.NODE_ENV === 'development') {
            this.licenseStatus.isValid = true;
            this.licenseStatus.message = 'License activated (development mode)';
            logger.info('activateLicense exit (development mode)', { success: true });
            return true;
        }
        // In production, implement actual activation logic here
        // This would typically involve:
        // 1. Validate license key format
        // 2. Contact license server
        // 3. Store license locally
        // 4. Update status
        logger.info('activateLicense exit');
        return false;
    }
    async upgradeLicense() {
        logger.info('upgradeLicense enter');
        // In development mode, always succeed
        if (process.env.NODE_ENV === 'development') {
            this.licenseStatus.plan = 'enterprise';
            this.licenseStatus.message = 'License upgraded (development mode)';
            logger.info('upgradeLicense exit (development mode)', { success: true });
            return true;
        }
        // In production, implement actual upgrade logic here
        // This would typically involve:
        // 1. Contact license server
        // 2. Process payment
        // 3. Update local license
        // 4. Update status
        logger.info('upgradeLicense exit');
        return false;
    }
    async checkFeatureAccess(feature) {
        logger.info('checkFeatureAccess enter', { feature });
        // In development mode, always allow
        if (process.env.NODE_ENV === 'development') {
            logger.info('checkFeatureAccess exit (development mode)', { hasAccess: true });
            return true;
        }
        // In production, check if feature is included in current plan
        const hasAccess = this.licenseStatus.features?.includes(feature) ?? false;
        logger.info('checkFeatureAccess exit', { hasAccess });
        return hasAccess;
    }
    async getCurrentLicense() {
        logger.info('getCurrentLicense enter');
        return this.licenseStatus;
    }
    async updateLicenseExpiry(expiresAt) {
        logger.info('updateLicenseExpiry enter', { expiresAt });
        this.licenseStatus.expiresAt = expiresAt;
        this.licenseStatus.isValid = new Date(expiresAt) > new Date();
        logger.info('updateLicenseExpiry exit');
    }
}
exports.LicenseManager = LicenseManager;
