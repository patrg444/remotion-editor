import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import MediaBin from '../MediaBin';
import { MediaItem } from '../../types/media-bin';
import { renderWithProviders } from './test-utils';

const mockAssets: MediaItem[] = [
  {
    id: '1',
    name: 'test-video.mp4',
    type: 'video',
    path: 'file://test-video.mp4',
    duration: 120,
    originalDuration: 120,
    initialDuration: 120,
    maxDuration: 120
  },
  {
    id: '2',
    name: 'test-audio.mp3',
    type: 'audio',
    path: 'file://test-audio.mp3',
    duration: 60,
    originalDuration: 60,
    initialDuration: 60,
    maxDuration: 60
  }
];

jest.mock('../../contexts/MediaBinContext', () => ({
  MediaBinProvider: ({ children }: { children: React.ReactNode }) => children,
  useMediaBin: jest.fn()
}));

jest.mock('../../hooks/useFileOperations', () => ({
  useFileOperations: () => ({
    validateFile: jest.fn().mockResolvedValue(true),
    processFile: jest.fn().mockResolvedValue({
      id: 'test-id',
      name: 'test.mp4',
      type: 'video',
      metadata: { duration: 10 }
    })
  })
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn()
  }
}));

describe('MediaBin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock URL methods
    global.URL.createObjectURL = jest.fn();
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no assets are provided', () => {
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: [],
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    renderWithProviders(<MediaBin />);

    expect(screen.getByText('No media assets')).toBeInTheDocument();
    expect(screen.getByText('Click Import Media to add files')).toBeInTheDocument();
  });

  it('renders list of assets when provided', () => {
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    renderWithProviders(<MediaBin />);
    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('test-audio.mp3')).toBeInTheDocument();
  });

  it('displays correct duration format', () => {
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    renderWithProviders(<MediaBin />);
    expect(screen.getByText('2:00')).toBeInTheDocument(); // 120 seconds
    expect(screen.getByText('1:00')).toBeInTheDocument(); // 60 seconds
  });

  it('calls addItems when import button is clicked', async () => {
    const mockAddItems = jest.fn();
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: mockAddItems,
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    renderWithProviders(<MediaBin className="custom-class" />);
    const input = screen.getByTestId('media-import-input');

    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for addItems to be called
    await waitFor(() => {
      expect(mockAddItems).toHaveBeenCalled();
    });
  });

  it('calls selectItem when asset is clicked', () => {
    const mockSelectItem = jest.fn();
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: mockSelectItem
    });

    renderWithProviders(<MediaBin />);

    fireEvent.click(screen.getByText('test-video.mp4'));
    expect(mockSelectItem).toHaveBeenCalledWith(mockAssets[0]);
  });

  it('handles drag start event', () => {
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    const { container } = renderWithProviders(<MediaBin />);
    const asset = screen.getByText('test-video.mp4').parentElement?.parentElement;
    expect(asset).toBeTruthy();

    if (asset) {
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: { setData: jest.fn() }
      });

      fireEvent(asset, dragStartEvent);
      // Verify drag class is added
      expect(asset).toHaveClass('dragging');
    }
  });

  it('handles drag end event', () => {
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    const { container } = renderWithProviders(<MediaBin />);
    const asset = screen.getByText('test-video.mp4').parentElement?.parentElement;
    expect(asset).toBeTruthy();

    if (asset) {
      // Add dragging class
      asset.classList.add('dragging');
      
      fireEvent.dragEnd(asset);
      // Verify drag class is removed
      expect(asset).not.toHaveClass('dragging');
    }
  });

  it('applies custom className when provided', () => {
    jest.spyOn(require('../../contexts/MediaBinContext'), 'useMediaBin').mockReturnValue({
      items: mockAssets,
      selectedItem: null,
      addItems: jest.fn(),
      removeItem: jest.fn(),
      selectItem: jest.fn()
    });

    const { container } = renderWithProviders(<MediaBin className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
