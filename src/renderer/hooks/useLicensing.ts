import { useEffect, useState } from 'react';
import { Logger } from '../../main/utils/logger';
import { LicenseValidationResult } from '../../main/licensing/types';

const logger = new Logger('useLicensing');

interface LicenseStatus {
  isValid: boolean;
  message: string;
  plan?: string;
  features?: string[];
  expiresAt?: string;
}

function convertToLicenseStatus(result: LicenseValidationResult): LicenseStatus {
  return {
    isValid: result.valid,
    message: result.error || (result.valid ? 'License valid' : 'License invalid'),
    plan: result.license?.tier,
    features: result.license?.features,
    expiresAt: result.license?.expiryDate?.toISOString()
  };
}

export function useLicensing() {
  const [licenseStatus, setLicenseStatus] = useState<LicenseStatus>({
    isValid: false,
    message: 'Checking license...'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkLicense = async () => {
      try {
        logger.info('checkLicense enter');
        const result = await window.electron.invoke('license:check');
        if (mounted) {
          setLicenseStatus(convertToLicenseStatus(result));
        }
        logger.info('checkLicense exit', result);
      } catch (error) {
        logger.error('Failed to check license:', error);
        if (mounted) {
          setLicenseStatus({
            isValid: false,
            message: 'Failed to check license'
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial check
    checkLicense();

    // Set up periodic check every 5 minutes
    const interval = setInterval(checkLicense, 5 * 60 * 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const activateLicense = async (key: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await window.electron.invoke('license:activate', key);
      if (result) {
        const validationResult = await window.electron.invoke('license:check');
        const status = convertToLicenseStatus(validationResult);
        setLicenseStatus(status);
        return status.isValid;
      }
      setLicenseStatus({
        isValid: false,
        message: 'License activation failed'
      });
      return false;
    } catch (error) {
      logger.error('Failed to activate license:', error);
      setLicenseStatus({
        isValid: false,
        message: 'License activation failed'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeLicense = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await window.electron.invoke('license:upgrade');
      if (result) {
        const validationResult = await window.electron.invoke('license:check');
        const status = convertToLicenseStatus(validationResult);
        setLicenseStatus(status);
        return status.isValid;
      }
      setLicenseStatus({
        isValid: false,
        message: 'License upgrade failed'
      });
      return false;
    } catch (error) {
      logger.error('Failed to upgrade license:', error);
      setLicenseStatus({
        isValid: false,
        message: 'License upgrade failed'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    licenseStatus,
    isLoading,
    activateLicense,
    upgradeLicense
  };
}
