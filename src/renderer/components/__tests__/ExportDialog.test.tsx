import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import ExportDialog from '../ExportDialog';
import { SocialPlatformConfig } from '../../types/export';

const mockPlatforms: SocialPlatformConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube-icon.png',
    isConnected: true,
    supportedFormats: ['mp4', 'webm']
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram-icon.png',
    isConnected: false,
    supportedFormats: ['mp4'],
    maxDuration: 60,
    maxFileSize: 100 * 1024 * 1024 // 100MB
  }
];

describe('ExportDialog', () => {
  const mockHandlers = {
    onClose: jest.fn(),
    onExport: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when not open', () => {
    const { container } = render(
      <ExportDialog
        isOpen={false}
        availablePlatforms={mockPlatforms}
        projectDuration={120}
        {...mockHandlers}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders export dialog when open', () => {
    render(
      <ExportDialog
        isOpen={true}
        availablePlatforms={mockPlatforms}
        projectDuration={120}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('Export Project')).toBeInTheDocument();
    expect(screen.getByText('Export Settings')).toBeInTheDocument();
    expect(screen.getByText('Share To')).toBeInTheDocument();
    expect(screen.getByText('Social Media Details')).toBeInTheDocument();
  });

  describe('Export Settings Form', () => {
    it('handles resolution change', () => {
      render(
        <ExportDialog
          isOpen={true}
          availablePlatforms={mockPlatforms}
          projectDuration={120}
          {...mockHandlers}
        />
      );

      const resolutionSelect = screen.getByLabelText('Resolution');
      fireEvent.change(resolutionSelect, { target: { value: '1280x720' } });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalledWith(
        expect.objectContaining({
          resolution: { width: 1280, height: 720 }
        }),
        expect.any(Object)
      );
    });

    it('handles frame rate change', () => {
      render(
        <ExportDialog
          isOpen={true}
          availablePlatforms={mockPlatforms}
          projectDuration={120}
          {...mockHandlers}
        />
      );

      const frameRateSelect = screen.getByLabelText('Frame Rate');
      fireEvent.change(frameRateSelect, { target: { value: '60' } });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalledWith(
        expect.objectContaining({
          frameRate: 60
        }),
        expect.any(Object)
      );
    });
  });

  describe('Platform Selector', () => {
    it('shows connected and disconnected platforms', () => {
      render(
        <ExportDialog
          isOpen={true}
          availablePlatforms={mockPlatforms}
          projectDuration={120}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('YouTube')).toBeInTheDocument();
      expect(screen.getByText('Instagram')).toBeInTheDocument();

      const youtubeItem = screen.getByText('YouTube').closest('.platform-item');
      const instagramItem = screen.getByText('Instagram').closest('.platform-item');

      expect(youtubeItem).not.toHaveClass('disabled');
      expect(instagramItem).toHaveClass('disabled');
    });

    it('allows toggling connected platforms', () => {
      render(
        <ExportDialog
          isOpen={true}
          availablePlatforms={mockPlatforms}
          projectDuration={120}
          {...mockHandlers}
        />
      );

      const youtubeItem = screen.getByText('YouTube').closest('.platform-item');
      fireEvent.click(youtubeItem!);

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          platforms: expect.objectContaining({
            youtube: expect.objectContaining({ enabled: true })
          })
        })
      );
    });
  });

  describe('Social Metadata Form', () => {
    it('handles title and description changes', () => {
      render(
        <ExportDialog
          isOpen={true}
          availablePlatforms={mockPlatforms}
          projectDuration={120}
          {...mockHandlers}
        />
      );

      const titleInput = screen.getByLabelText('Title');
      const descriptionInput = screen.getByLabelText('Description');

      fireEvent.change(titleInput, { target: { value: 'Test Video' } });
      fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          title: 'Test Video',
          description: 'Test Description'
        })
      );
    });

    it('handles hashtag input', () => {
      render(
        <ExportDialog
          isOpen={true}
          availablePlatforms={mockPlatforms}
          projectDuration={120}
          {...mockHandlers}
        />
      );

      const hashtagInput = screen.getByLabelText('Hashtags');
      fireEvent.change(hashtagInput, { target: { value: '#test #video' } });

      const exportButton = screen.getByText('Export');
      fireEvent.click(exportButton);

      expect(mockHandlers.onExport).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          hashtags: ['#test', '#video']
        })
      );
    });
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ExportDialog
        isOpen={true}
        availablePlatforms={mockPlatforms}
        projectDuration={120}
        {...mockHandlers}
      />
    );

    const closeButton = screen.getByRole('button', { name: '×' });
    fireEvent.click(closeButton);

    expect(mockHandlers.onClose).toHaveBeenCalled();
  });

  it('applies custom className when provided', () => {
    render(
      <ExportDialog
        isOpen={true}
        availablePlatforms={mockPlatforms}
        projectDuration={120}
        className="custom-class"
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('export-dialog-overlay')).toHaveClass('custom-class');
  });
});
