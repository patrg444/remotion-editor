import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import MediaBin from '../MediaBin';
import { MediaAsset } from '../../types/media-bin';

const mockAssets: MediaAsset[] = [
  {
    id: '1',
    name: 'test-video.mp4',
    type: 'video',
    duration: 120,
    source: 'file://test-video.mp4'
  },
  {
    id: '2',
    name: 'test-audio.mp3',
    type: 'audio',
    duration: 60,
    source: 'file://test-audio.mp3'
  }
];

describe('MediaBin', () => {
  const mockHandlers = {
    onAssetDragStart: jest.fn(),
    onAssetDragEnd: jest.fn(),
    onAssetClick: jest.fn(),
    onImportClick: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no assets are provided', () => {
    render(
      <MediaBin
        assets={[]}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('No media assets')).toBeInTheDocument();
    expect(screen.getByText('Click Import Media to add files')).toBeInTheDocument();
  });

  it('renders list of assets when provided', () => {
    render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('test-audio.mp3')).toBeInTheDocument();
  });

  it('displays correct duration format', () => {
    render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('2:00')).toBeInTheDocument(); // 120 seconds
    expect(screen.getByText('1:00')).toBeInTheDocument(); // 60 seconds
  });

  it('calls onImportClick when import button is clicked', () => {
    render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('Import Media'));
    expect(mockHandlers.onImportClick).toHaveBeenCalled();
  });

  it('calls onAssetClick when asset is clicked', () => {
    render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
      />
    );

    fireEvent.click(screen.getByText('test-video.mp4'));
    expect(mockHandlers.onAssetClick).toHaveBeenCalledWith(mockAssets[0]);
  });

  it('handles drag start event', () => {
    render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
      />
    );

    const asset = screen.getByText('test-video.mp4').parentElement?.parentElement;
    expect(asset).toBeTruthy();

    if (asset) {
      const dragStartEvent = new Event('dragstart', { bubbles: true });
      Object.defineProperty(dragStartEvent, 'dataTransfer', {
        value: { setData: jest.fn() }
      });

      fireEvent(asset, dragStartEvent);
      expect(mockHandlers.onAssetDragStart).toHaveBeenCalledWith(mockAssets[0]);
    }
  });

  it('handles drag end event', () => {
    render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
      />
    );

    const asset = screen.getByText('test-video.mp4').parentElement?.parentElement;
    expect(asset).toBeTruthy();

    if (asset) {
      fireEvent.dragEnd(asset);
      expect(mockHandlers.onAssetDragEnd).toHaveBeenCalled();
    }
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <MediaBin
        assets={mockAssets}
        {...mockHandlers}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
