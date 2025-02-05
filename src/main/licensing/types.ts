export interface LicenseStatus {
  isValid: boolean;
  message?: string;
  expiresAt?: string;
  features?: string[];
  plan?: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  error?: string;
  license?: {
    key: string;
    expiryDate?: Date;
    features: string[];
    maxProjects?: number;
    maxResolution?: string;
    hardwareId: string;
    activated: boolean;
    tier: string;
  };
}

export interface LicenseActivationOptions {
  key: string;
  hardwareId: string;
  tier: string;
  expiryDate?: Date;
  maxProjects?: number;
  maxResolution?: string;
}

export interface UpgradeDialogOptions {
  currentTier: string | null;
  requiredTier: string;
  feature: string;
}
