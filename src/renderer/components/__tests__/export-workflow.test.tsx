import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MockApp, initialTracks } from './test-utils';

jest.mock('../../hooks/useFileOperations', () => ({
  useFileOperations: () => ({
    validateExportSettings: (settings: any) => {
      if (settings.resolution === '480x360') {
        throw new Error('Resolution too low for selected platform');
      }
      if (settings.title.includes('/')) {
        throw new Error('Invalid characters in filename');
      }
      return true;
    },
    exportVideo: jest.fn(),
    showInFolder: jest.fn(),
    checkDiskSpace: () => ({
      available: 1000000000, // 1GB
      required: 500000000    // 500MB
    })
  })
}));

describe('Export Workflow', () => {
  beforeEach(() => {
    // Reset URL.createObjectURL between tests
    URL.createObjectURL = jest.fn(() => 'mock-url');
    localStorage.clear();
  });

  it('should handle basic export workflow', async () => {
    const mockExport = jest.fn();
    render(<MockApp initialTracks={initialTracks} onExport={mockExport} />);

    // 1. Open export dialog
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // 2. Verify export dialog opens with default settings
    const titleInput = await screen.findByLabelText('Project Title');
    expect(titleInput).toHaveValue('My Video');

    const resolutionSelect = await screen.findByLabelText('Output Resolution');
    expect(resolutionSelect).toHaveValue('1920x1080');

    // 3. Start export process
    const startExportButton = await screen.findByText('Begin Export');
    fireEvent.click(startExportButton);

    // 4. Verify export settings were passed correctly
    await waitFor(() => {
      expect(mockExport).toHaveBeenCalledWith({
        title: 'My Video',
        resolution: '1920x1080'
      });
    });

    // 5. Verify export progress indicators appear
    const progressText = await screen.findByRole('status');
    expect(progressText).toHaveTextContent('Export in Progress...');
    
    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should handle invalid export settings', async () => {
    render(<MockApp initialTracks={initialTracks} />);

    // Open export dialog
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Try setting invalid resolution and filename
    const resolutionSelect = await screen.findByLabelText('Output Resolution');
    fireEvent.change(resolutionSelect, { target: { value: '480x360' } });

    const titleInput = await screen.findByLabelText('Project Title');
    fireEvent.change(titleInput, { target: { value: 'My/Video' } });

    // Try to export
    const startExportButton = await screen.findByText('Begin Export');
    fireEvent.click(startExportButton);

    // Verify error message appears in alert
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent('Resolution too low for selected platform');

    // Verify export didn't start
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('should handle partial export range', async () => {
    render(<MockApp initialTracks={initialTracks} />);

    // Open export dialog
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Set in/out points
    const inPointInput = await screen.findByLabelText('In Point');
    const outPointInput = await screen.findByLabelText('Out Point');
    
    fireEvent.change(inPointInput, { target: { value: '10' } });
    fireEvent.change(outPointInput, { target: { value: '20' } });

    // Start export
    const startExportButton = await screen.findByText('Begin Export');
    fireEvent.click(startExportButton);

    // Verify progress reflects partial range
    await waitFor(() => {
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10'); // 20 - 10 = 10 seconds
    });
  });

  it('should handle export cancellation', async () => {
    render(<MockApp initialTracks={initialTracks} />);

    // Start export
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);
    
    const startExportButton = await screen.findByText('Begin Export');
    fireEvent.click(startExportButton);

    // Cancel export
    const cancelButton = await screen.findByText('Cancel Export');
    fireEvent.click(cancelButton);

    // Verify export stopped
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Verify no partial file
    expect(screen.queryByText(/partial export found/i)).not.toBeInTheDocument();
  });

  it('should handle disk space errors', async () => {
    render(<MockApp initialTracks={initialTracks} />);

    // Open export dialog
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Set title to trigger disk space error
    const titleInput = await screen.findByLabelText('Project Title');
    fireEvent.change(titleInput, { target: { value: 'Disk Space Test' } });

    // Start export
    const startExportButton = await screen.findByText('Begin Export');
    fireEvent.click(startExportButton);

    // Verify disk space error
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent('Insufficient disk space for export');
  });

  it('should handle post-export actions', async () => {
    const mockShowInFolder = jest.fn();
    const mockCopyLink = jest.fn();

    render(
      <MockApp 
        initialTracks={initialTracks} 
        onShowInFolder={mockShowInFolder}
        onCopyLink={mockCopyLink}
      />
    );

    // Open export dialog
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Verify dialog opens
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    // Start export
    const startExportButton = await screen.findByText('Begin Export');
    fireEvent.click(startExportButton);

    // Wait for export to complete
    const completeHeading = await screen.findByRole('heading', { name: 'Export Complete', level: 3 });
    expect(completeHeading).toBeInTheDocument();

    // Test post-export actions
    const showInFolderButton = screen.getByRole('button', { name: 'Show in Folder' });
    fireEvent.click(showInFolderButton);
    await waitFor(() => {
      expect(mockShowInFolder).toHaveBeenCalled();
    });

    const copyLinkButton = screen.getByRole('button', { name: 'Copy Link' });
    fireEvent.click(copyLinkButton);
    await waitFor(() => {
      expect(mockCopyLink).toHaveBeenCalled();
      expect(mockCopyLink).toHaveBeenCalledWith(expect.stringContaining('share.app/v/My Video'));
    });
  });

  it('should recover from incomplete exports', async () => {
    // Simulate previous incomplete export in localStorage
    localStorage.setItem('incompleteExport', JSON.stringify({
      title: 'Interrupted Video',
      progress: 45,
      timestamp: Date.now()
    }));

    render(<MockApp initialTracks={initialTracks} />);

    // Open export dialog
    const exportButton = screen.getByRole('button', { name: 'Export' });
    fireEvent.click(exportButton);

    // Verify dialog opens with incomplete export message
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toBeInTheDocument();

    const incompleteMessage = await screen.findByText('Incomplete export found:');
    expect(incompleteMessage).toBeInTheDocument();
    expect(screen.getByText('Interrupted Video')).toBeInTheDocument();

    // Test resume export
    const resumeButton = await screen.findByRole('button', { name: 'Resume Export' });
    fireEvent.click(resumeButton);

    // Verify export progress is restored
    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '45');
  });
});
