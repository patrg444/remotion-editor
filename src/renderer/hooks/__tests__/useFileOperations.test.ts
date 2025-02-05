import { renderHook, act } from '@testing-library/react-hooks';
import { useFileOperations } from '../useFileOperations';
import { Logger } from '../../../main/utils/logger';

// Mock Logger
jest.mock('../../../main/utils/logger', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    info: jest.fn(),
    error: jest.fn()
  }))
}));

describe('useFileOperations', () => {
  // Mock window.api
  const mockShowOpenDialog = jest.fn();
  const mockShowSaveDialog = jest.fn();
  const mockGetVideoMetadata = jest.fn();

  beforeAll(() => {
    // Setup window.api mock
    (global as any).window = {
      api: {
        showOpenDialog: mockShowOpenDialog,
        showSaveDialog: mockShowSaveDialog,
        getVideoMetadata: mockGetVideoMetadata
      }
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('openFile', () => {
    it('handles successful file open', async () => {
      const filePath = '/path/to/video.mp4';
      const metadata = { duration: 120, width: 1920, height: 1080 };

      mockShowOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: [filePath]
      });
      mockGetVideoMetadata.mockResolvedValue(metadata);

      const { result } = renderHook(() => useFileOperations());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Start file open operation
      const openPromise = result.current.openFile();
      expect(result.current.isLoading).toBe(true);

      // Wait for operation to complete
      await act(() => openPromise);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Verify dialog options
      expect(mockShowOpenDialog).toHaveBeenCalledWith({
        properties: ['openFile'],
        filters: [
          { name: 'Video Files', extensions: ['mp4', 'mov', 'avi', 'mkv'] }
        ]
      });

      // Verify metadata fetch
      expect(mockGetVideoMetadata).toHaveBeenCalledWith(filePath);
      expect(Logger).toHaveBeenCalled();
    });

    it('handles dialog cancellation', async () => {
      mockShowOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: []
      });

      const { result } = renderHook(() => useFileOperations());

      await act(() => result.current.openFile());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(mockGetVideoMetadata).not.toHaveBeenCalled();
    });

    it('handles open dialog error', async () => {
      const error = new Error('Failed to open dialog');
      mockShowOpenDialog.mockRejectedValue(error);

      const { result } = renderHook(() => useFileOperations());

      await act(() => result.current.openFile());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(error.message);
      expect(mockGetVideoMetadata).not.toHaveBeenCalled();
    });

    it('handles metadata fetch error', async () => {
      const error = new Error('Failed to get metadata');
      mockShowOpenDialog.mockResolvedValue({
        canceled: false,
        filePaths: ['/path/to/video.mp4']
      });
      mockGetVideoMetadata.mockRejectedValue(error);

      const { result } = renderHook(() => useFileOperations());

      await act(() => result.current.openFile());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(error.message);
    });
  });

  describe('saveFile', () => {
    it('handles successful file save', async () => {
      const filePath = '/path/to/save/video.mp4';
      mockShowSaveDialog.mockResolvedValue({
        canceled: false,
        filePath
      });

      const { result } = renderHook(() => useFileOperations());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Start file save operation
      const savePromise = result.current.saveFile();
      expect(result.current.isLoading).toBe(true);

      // Wait for operation to complete
      await act(() => savePromise);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();

      // Verify dialog options
      expect(mockShowSaveDialog).toHaveBeenCalledWith({
        filters: [
          { name: 'Video Files', extensions: ['mp4'] }
        ]
      });
    });

    it('handles dialog cancellation', async () => {
      mockShowSaveDialog.mockResolvedValue({
        canceled: true,
        filePath: undefined
      });

      const { result } = renderHook(() => useFileOperations());

      await act(() => result.current.saveFile());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles save dialog error', async () => {
      const error = new Error('Failed to save file');
      mockShowSaveDialog.mockRejectedValue(error);

      const { result } = renderHook(() => useFileOperations());

      await act(() => result.current.saveFile());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(error.message);
    });
  });

  describe('Error Handling', () => {
    it('handles non-Error objects', async () => {
      mockShowOpenDialog.mockRejectedValue('String error');

      const { result } = renderHook(() => useFileOperations());

      await act(() => result.current.openFile());

      expect(result.current.error).toBe('Failed to open file');
    });

    it('clears previous errors on new operation', async () => {
      // First operation fails
      mockShowOpenDialog.mockRejectedValue(new Error('First error'));
      const { result } = renderHook(() => useFileOperations());
      await act(() => result.current.openFile());
      expect(result.current.error).toBe('First error');

      // Second operation succeeds
      mockShowOpenDialog.mockResolvedValue({
        canceled: true,
        filePaths: []
      });
      await act(() => result.current.openFile());
      expect(result.current.error).toBeNull();
    });
  });
});
