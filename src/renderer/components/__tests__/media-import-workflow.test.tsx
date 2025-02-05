import React, { useState } from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { initialTracks, mockVideoFile, mockAudioFile } from './test-utils';
import MediaBin from '../MediaBin';
import { MediaItem } from '../../types/media-bin';

// Mock useFileOperations hook
const mockValidateFile = jest.fn();
const mockProcessFile = jest.fn();

jest.mock('../../hooks/useFileOperations', () => ({
  useFileOperations: () => ({
    validateFile: async (file: File) => {
      const result = await mockValidateFile(file);
      if (result instanceof Error) throw result;
      return result;
    },
    processFile: async (file: File) => {
      const result = await mockProcessFile(file);
      if (result instanceof Error) throw result;
      return result;
    }
  })
}));

describe('Media Import Workflow', () => {
  beforeEach(() => {
    // Reset mocks
    mockValidateFile.mockReset();
    mockProcessFile.mockReset();
    URL.createObjectURL = jest.fn(() => 'mock-url');
    URL.revokeObjectURL = jest.fn();

    // Setup default mock implementations
    mockValidateFile.mockImplementation(async (file: File) => {
      if (file.name === 'corrupt.mp4') {
        throw new Error('File is corrupt');
      }
      if (file.name === 'unsupported.txt') {
        throw new Error('Unsupported file type');
      }
      return true;
    });

    mockProcessFile.mockImplementation(async (file: File) => {
      if (file.name === 'corrupt.mp4') {
        throw new Error('File is corrupt');
      }
      
      // Determine type based on file extension
      const type = file.type.startsWith('video/') ? 'video' as const :
                  file.type.startsWith('audio/') ? 'audio' as const :
                  'image' as const;

      return {
        id: file.name,
        name: file.name,
        type,
        duration: 10
      };
    });
  });

  it('should handle single file import', async () => {
    const expectedItem: MediaItem = {
      id: mockVideoFile.name,
      name: mockVideoFile.name,
      type: 'video',
      path: 'mock-url',
      duration: 10
    };

    // Create a wrapper component to manage state
    const TestWrapper = () => {
      const [items, setItems] = useState<MediaItem[]>([]);
      const handleImport = (newItems: MediaItem[]) => {
        setItems(prev => [...prev, ...newItems]);
      };
      return <MediaBin items={items} onImport={handleImport} />;
    };

    render(<TestWrapper />);

    const input = screen.getByTestId('media-import-input');

    // Mock processFile to return the expected item
    mockProcessFile.mockResolvedValueOnce({
      id: mockVideoFile.name,
      name: mockVideoFile.name,
      type: 'video',
      duration: 10
    });

    await act(async () => {
      fireEvent.change(input, { target: { files: [mockVideoFile] } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for media item to appear
    await waitFor(() => {
      const mediaItem = screen.getByTestId('media-bin-item');
      expect(mediaItem).toBeInTheDocument();
      expect(mediaItem).toHaveTextContent(mockVideoFile.name);
    });

    // Verify the item was processed correctly
    expect(mockProcessFile).toHaveBeenCalledWith(mockVideoFile);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockVideoFile);
  });

  it('should handle multiple file import', async () => {
    // Create a wrapper component to manage state
    const TestWrapper = () => {
      const [items, setItems] = useState<MediaItem[]>([]);
      const handleImport = (newItems: MediaItem[]) => {
        setItems(prev => [...prev, ...newItems]);
      };
      return <MediaBin items={items} onImport={handleImport} />;
    };

    render(<TestWrapper />);

    const input = screen.getByTestId('media-import-input');

    // Mock processFile to return the expected items
    mockProcessFile
      .mockResolvedValueOnce({
        id: mockVideoFile.name,
        name: mockVideoFile.name,
        type: 'video',
        duration: 10
      })
      .mockResolvedValueOnce({
        id: mockAudioFile.name,
        name: mockAudioFile.name,
        type: 'audio',
        duration: 10
      });

    await act(async () => {
      fireEvent.change(input, { target: { files: [mockVideoFile, mockAudioFile] } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for media items to appear
    await waitFor(() => {
      const mediaItems = screen.getAllByTestId('media-bin-item');
      expect(mediaItems).toHaveLength(2);
      expect(mediaItems[0]).toHaveTextContent(mockVideoFile.name);
      expect(mediaItems[1]).toHaveTextContent(mockAudioFile.name);
    });

    // Verify the items were processed correctly
    expect(mockProcessFile).toHaveBeenCalledWith(mockVideoFile);
    expect(mockProcessFile).toHaveBeenCalledWith(mockAudioFile);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockVideoFile);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockAudioFile);
  });

  it('should handle corrupt file import', async () => {
    const onImport = jest.fn();
    const corruptFile = new File([''], 'corrupt.mp4', { type: 'video/mp4' });
    render(<MediaBin items={[]} onImport={onImport} />);

    const input = screen.getByTestId('media-import-input');
    
    // Mock validateFile to throw error
    mockValidateFile.mockRejectedValueOnce(new Error('File is corrupt'));

    // Trigger file input change
    await act(async () => {
      fireEvent.change(input, { target: { files: [corruptFile] } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for error message to appear
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('File is corrupt');
    }, { timeout: 2000 });

    // Verify no media item was added
    expect(screen.queryByTestId('media-bin-item')).not.toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });

  it('should handle unsupported file type', async () => {
    const onImport = jest.fn();
    render(<MediaBin items={[]} onImport={onImport} />);

    const textFile = new File([''], 'unsupported.txt', { type: 'text/plain' });
    const input = screen.getByTestId('media-import-input');
    
    // Mock validateFile to throw error
    mockValidateFile.mockRejectedValueOnce(new Error('Unsupported file type'));

    await act(async () => {
      fireEvent.change(input, { target: { files: [textFile] } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Unsupported file type');
    });

    expect(screen.queryByTestId('media-bin-item')).not.toBeInTheDocument();
    expect(onImport).not.toHaveBeenCalled();
  });

  it('should handle duplicate file import', async () => {
    const onImport = jest.fn();
    const existingItem: MediaItem = {
      id: mockVideoFile.name,
      name: mockVideoFile.name,
      type: 'video',
      path: 'mock-url',
      duration: 10
    };
    render(<MediaBin items={[existingItem]} onImport={onImport} />);

    const input = screen.getByTestId('media-import-input');
    
    // Import same file again
    await act(async () => {
      fireEvent.change(input, { target: { files: [mockVideoFile] } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent(`${mockVideoFile.name} has already been imported`);
    });

    // Verify only one item exists
    const mediaItems = screen.getAllByTestId('media-bin-item');
    expect(mediaItems).toHaveLength(1);
    expect(onImport).not.toHaveBeenCalled();
  });

  it('should handle large number of files', async () => {
    // Create a wrapper component to manage state
    const TestWrapper = () => {
      const [items, setItems] = useState<MediaItem[]>([]);
      const handleImport = (newItems: MediaItem[]) => {
        setItems(prev => [...prev, ...newItems]);
      };
      return <MediaBin items={items} onImport={handleImport} />;
    };

    render(<TestWrapper />);

    const input = screen.getByTestId('media-import-input');

    // Create test files
    const manyFiles = Array.from({ length: 50 }, (_, i) => 
      new File([''], `video${i}.mp4`, { type: 'video/mp4' })
    );

    // Mock processFile for each file
    manyFiles.forEach((file) => {
      mockProcessFile.mockResolvedValueOnce({
        id: file.name,
        name: file.name,
        type: 'video',
        duration: 10
      });
    });

    await act(async () => {
      fireEvent.change(input, { target: { files: manyFiles } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for all media items to appear
    await waitFor(() => {
      const mediaItems = screen.getAllByTestId('media-bin-item');
      expect(mediaItems).toHaveLength(50);
      mediaItems.forEach((item, i) => {
        expect(item).toHaveTextContent(`video${i}.mp4`);
      });
    });

    // Verify all files were processed
    expect(mockProcessFile).toHaveBeenCalledTimes(50);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(50);
  });

  it('should handle drag and drop', async () => {
    // Create a wrapper component to manage state
    const TestWrapper = () => {
      const [items, setItems] = useState<MediaItem[]>([]);
      const handleImport = (newItems: MediaItem[]) => {
        setItems(prev => [...prev, ...newItems]);
      };
      return <MediaBin items={items} onImport={handleImport} />;
    };

    render(<TestWrapper />);

    const mediaBin = screen.getByTestId('media-bin');
    const dataTransfer = {
      items: [mockVideoFile],
      files: [mockVideoFile],
      types: ['Files'],
      effectAllowed: 'all',
      dropEffect: 'copy',
      setData: jest.fn(),
      getData: jest.fn()
    };

    // Mock processFile to return the expected item
    mockProcessFile.mockResolvedValueOnce({
      id: mockVideoFile.name,
      name: mockVideoFile.name,
      type: 'video',
      duration: 10
    });

    // Simulate drag sequence
    await act(async () => {
      fireEvent.dragEnter(mediaBin, { dataTransfer });
      fireEvent.dragOver(mediaBin, { dataTransfer });
    });

    await waitFor(() => {
      expect(mediaBin).toHaveClass('drag-over');
    });

    // Drop file
    await act(async () => {
      fireEvent.drop(mediaBin, { dataTransfer });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for media item to appear
    await waitFor(() => {
      const mediaItem = screen.getByTestId('media-bin-item');
      expect(mediaItem).toBeInTheDocument();
      expect(mediaItem).toHaveTextContent(mockVideoFile.name);
      expect(mediaBin).not.toHaveClass('drag-over');
    });

    // Verify the item was processed correctly
    expect(mockProcessFile).toHaveBeenCalledWith(mockVideoFile);
    expect(URL.createObjectURL).toHaveBeenCalledWith(mockVideoFile);
  });

  it('should reject invalid drag and drop', async () => {
    // Create a wrapper component to manage state
    const TestWrapper = () => {
      const [items, setItems] = useState<MediaItem[]>([]);
      const handleImport = (newItems: MediaItem[]) => {
        setItems(prev => [...prev, ...newItems]);
      };
      return <MediaBin items={items} onImport={handleImport} />;
    };

    render(<TestWrapper />);

    const mediaBin = screen.getByTestId('media-bin');
    const textFile = new File([''], 'test.txt', { type: 'text/plain' });
    const dataTransfer = {
      items: [textFile],
      files: [textFile],
      types: ['Files'],
      effectAllowed: 'all',
      dropEffect: 'copy',
      setData: jest.fn(),
      getData: jest.fn()
    };

    // Mock validateFile to throw error
    mockValidateFile.mockRejectedValueOnce(new Error('Unsupported file type'));

    // Drop invalid file
    await act(async () => {
      fireEvent.drop(mediaBin, { dataTransfer });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for error message to appear
    await waitFor(() => {
      const errorMessage = screen.getByTestId('error-message');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveTextContent('Unsupported file type');
    });

    // Verify no media item was added
    expect(screen.queryByTestId('media-bin-item')).not.toBeInTheDocument();
  });

  it('should cleanup temporary resources', async () => {
    // Create a wrapper component to manage state
    const TestWrapper = () => {
      const [items, setItems] = useState<MediaItem[]>([]);
      const handleImport = (newItems: MediaItem[]) => {
        setItems(prev => [...prev, ...newItems]);
      };
      return <MediaBin items={items} onImport={handleImport} />;
    };

    const { unmount } = render(<TestWrapper />);

    const input = screen.getByTestId('media-import-input');

    // Mock processFile to return the expected item
    mockProcessFile.mockResolvedValueOnce({
      id: mockVideoFile.name,
      name: mockVideoFile.name,
      type: 'video',
      duration: 10
    });

    await act(async () => {
      fireEvent.change(input, { target: { files: [mockVideoFile] } });
      // Wait for all promises to resolve
      await Promise.resolve();
      await Promise.resolve();
    });

    // Wait for media item to appear
    await waitFor(() => {
      const mediaItem = screen.getByTestId('media-bin-item');
      expect(mediaItem).toBeInTheDocument();
      expect(mediaItem).toHaveTextContent(mockVideoFile.name);
    });

    // Get the URL that was created
    const mockUrl = 'mock-url';

    // Unmount component
    await act(async () => {
      unmount();
    });

    // Verify URL.revokeObjectURL was called with the correct URL
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);
  });
});
