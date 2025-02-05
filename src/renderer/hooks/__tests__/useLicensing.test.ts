import { renderHook, act } from '@testing-library/react-hooks';
import { useLicensing } from '../useLicensing';
import { Logger } from '../../../main/utils/logger';
import { LicenseValidationResult } from '../../../main/licensing/types';

// Mock Logger
jest.mock('../../../main/utils/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn()
  }))
}));

describe('useLicensing', () => {
  // Mock window.api
  const mockCheckLicense = jest.fn();
  const mockActivateLicense = jest.fn();
  const mockUpgradeLicense = jest.fn();

  beforeAll(() => {
    // Setup window.api mock
    (global as any).window = {
      api: {
        checkLicense: mockCheckLicense,
        activateLicense: mockActivateLicense,
        upgradeLicense: mockUpgradeLicense
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const validLicenseResult: LicenseValidationResult = {
    valid: true,
    license: {
      key: 'valid-license-key',
      tier: 'pro',
      features: ['feature1', 'feature2'],
      expiryDate: new Date('2024-12-31'),
      hardwareId: 'test-hardware-id',
      activated: true,
      maxProjects: 10,
      maxResolution: '4K'
    }
  };

  const invalidLicenseResult: LicenseValidationResult = {
    valid: false,
    error: 'Invalid license key'
  };

  describe('Initial License Check', () => {
    it('starts with loading state', () => {
      mockCheckLicense.mockImplementation(() => new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useLicensing());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'Checking license...'
      });
    });

    it('handles valid license', async () => {
      mockCheckLicense.mockResolvedValue(validLicenseResult);

      const { result } = renderHook(() => useLicensing());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: true,
        message: 'License valid',
        plan: validLicenseResult.license?.tier,
        features: validLicenseResult.license?.features,
        expiresAt: validLicenseResult.license?.expiryDate?.toISOString()
      });
    });

    it('handles invalid license', async () => {
      mockCheckLicense.mockResolvedValue(invalidLicenseResult);

      const { result } = renderHook(() => useLicensing());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'Invalid license key'
      });
    });

    it('handles check error', async () => {
      mockCheckLicense.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLicensing());

      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'Failed to check license'
      });
    });
  });

  describe('Periodic License Check', () => {
    it('checks license periodically', async () => {
      mockCheckLicense.mockResolvedValue(validLicenseResult);

      renderHook(() => useLicensing());

      // Initial check
      expect(mockCheckLicense).toHaveBeenCalledTimes(1);

      // Advance timer by 5 minutes
      await act(async () => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockCheckLicense).toHaveBeenCalledTimes(2);
    });

    it('stops periodic checks on unmount', () => {
      mockCheckLicense.mockResolvedValue(validLicenseResult);

      const { unmount } = renderHook(() => useLicensing());

      unmount();

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(5 * 60 * 1000);
      });

      expect(mockCheckLicense).toHaveBeenCalledTimes(1); // Only initial check
    });
  });

  describe('License Activation', () => {
    it('handles successful activation', async () => {
      mockActivateLicense.mockResolvedValue(true);
      mockCheckLicense.mockResolvedValue(validLicenseResult);

      const { result } = renderHook(() => useLicensing());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.activateLicense('valid-key');
      });

      expect(success).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus.isValid).toBe(true);
      expect(mockActivateLicense).toHaveBeenCalledWith('valid-key');
    });

    it('handles failed activation', async () => {
      mockActivateLicense.mockResolvedValue(false);

      const { result } = renderHook(() => useLicensing());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.activateLicense('invalid-key');
      });

      expect(success).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'License activation failed'
      });
    });

    it('handles activation error', async () => {
      mockActivateLicense.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLicensing());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.activateLicense('valid-key');
      });

      expect(success).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'License activation failed'
      });
    });
  });

  describe('License Upgrade', () => {
    it('handles successful upgrade', async () => {
      mockUpgradeLicense.mockResolvedValue(true);
      mockCheckLicense.mockResolvedValue(validLicenseResult);

      const { result } = renderHook(() => useLicensing());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.upgradeLicense();
      });

      expect(success).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus.isValid).toBe(true);
      expect(mockUpgradeLicense).toHaveBeenCalled();
    });

    it('handles failed upgrade', async () => {
      mockUpgradeLicense.mockResolvedValue(false);

      const { result } = renderHook(() => useLicensing());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.upgradeLicense();
      });

      expect(success).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'License upgrade failed'
      });
    });

    it('handles upgrade error', async () => {
      mockUpgradeLicense.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useLicensing());

      let success: boolean = false;
      await act(async () => {
        success = await result.current.upgradeLicense();
      });

      expect(success).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.licenseStatus).toEqual({
        isValid: false,
        message: 'License upgrade failed'
      });
    });
  });
});
