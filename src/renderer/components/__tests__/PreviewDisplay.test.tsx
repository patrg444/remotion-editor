import React from 'react';
import { render, act } from '@testing-library/react';
import { PreviewDisplay } from '../PreviewDisplay';
import { useTextureCache } from '../../hooks/useTextureCache';
import { ProductionClip } from '../../types/timeline';

// Mock the useTextureCache hook
jest.mock('../../hooks/useTextureCache');

describe('PreviewDisplay', () => {
  // Mock texture
  const mockTexture = {
    width: 1920,
    height: 1080,
  } as HTMLImageElement;

  // Mock getTexture function
  const mockGetTexture = jest.fn().mockResolvedValue(mockTexture);

  // Mock animation frame functions
  let requestAnimationFrameSpy: jest.SpyInstance;
  let cancelAnimationFrameSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    
    // Setup animation frame spies
    requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
    cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    
    // Setup useTextureCache mock
    (useTextureCache as jest.Mock).mockReturnValue({
      getTexture: mockGetTexture,
      isLoading: {},
      errors: {},
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const mockClip: ProductionClip = {
    id: 'test-clip',
    type: 'video',
    startTime: 0,
    duration: 10,
    thumbnail: 'test-thumbnail.jpg',
  };

  const renderComponent = (props = {}) => {
    const utils = render(
      <PreviewDisplay
        clip={mockClip}
        width={800}
        height={600}
        currentTime={0}
        isPlaying={false}
        {...props}
      />
    );
    return {
      ...utils,
      canvas: () => utils.container.querySelector('canvas'),
    };
  };

  it('renders canvas with correct dimensions', () => {
    const { canvas } = renderComponent();
    
    expect(canvas()).toBeInTheDocument();
    expect(canvas()?.getAttribute('width')).toBe('800');
    expect(canvas()?.getAttribute('height')).toBe('600');
    expect(canvas()?.classList.contains('preview-display')).toBe(true);
  });

  it('clears canvas and loads texture on mount', async () => {
    await act(async () => {
      renderComponent();
    });
    
    const context = document.createElement('canvas').getContext('2d');
    expect(context?.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(mockGetTexture).toHaveBeenCalledWith(mockClip.thumbnail);
    expect(context?.drawImage).toHaveBeenCalled();
  });

  it('centers image based on aspect ratio', async () => {
    await act(async () => {
      renderComponent();
    });
    
    // Calculate expected dimensions
    const aspectRatio = 1920 / 1080;
    const targetWidth = Math.min(800, 600 * aspectRatio);
    const targetHeight = targetWidth / aspectRatio;
    const x = (800 - targetWidth) / 2;
    const y = (600 - targetHeight) / 2;

    const context = document.createElement('canvas').getContext('2d');
    expect(context?.drawImage).toHaveBeenCalledWith(
      mockTexture,
      x,
      y,
      targetWidth,
      targetHeight
    );
  });

  it('starts animation loop when playing', async () => {
    const onTimeUpdate = jest.fn();

    await act(async () => {
      renderComponent({ isPlaying: true, onTimeUpdate });
    });

    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    
    // Advance timers to trigger animation frame
    await act(async () => {
      jest.advanceTimersByTime(16); // Simulate one frame at 60fps
    });
    
    expect(onTimeUpdate).toHaveBeenCalledWith(1/60);
  });

  it('stops animation loop when not playing', async () => {
    const { rerender } = renderComponent({ isPlaying: true });
    
    await act(async () => {
      rerender(
        <PreviewDisplay
          clip={mockClip}
          width={800}
          height={600}
          currentTime={0}
          isPlaying={false}
        />
      );
    });

    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('handles texture loading errors', async () => {
    const error = new Error('Failed to load texture');
    mockGetTexture.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await act(async () => {
      renderComponent();
      // Wait for error to be logged
      jest.advanceTimersByTime(0);
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Error rendering frame:', error);
    consoleSpy.mockRestore();
  });

  it('cleans up animation frame on unmount', async () => {
    let unmount: () => void;

    // First mount the component with animation enabled
    await act(async () => {
      const result = renderComponent({ isPlaying: true });
      unmount = result.unmount;
      // Let the component mount and start animation
      jest.runOnlyPendingTimers();
    });

    // Verify animation frame was requested
    expect(requestAnimationFrameSpy).toHaveBeenCalled();

    // Now unmount and verify cleanup
    await act(async () => {
      unmount();
    });
    
    expect(cancelAnimationFrameSpy).toHaveBeenCalled();
  });

  it('handles missing thumbnail gracefully', async () => {
    const clipWithoutThumbnail = {
      ...mockClip,
      thumbnail: undefined,
    };

    await act(async () => {
      renderComponent({ clip: clipWithoutThumbnail });
    });
    
    const context = document.createElement('canvas').getContext('2d');
    expect(context?.clearRect).toHaveBeenCalled();
    expect(mockGetTexture).not.toHaveBeenCalled();
    expect(context?.drawImage).not.toHaveBeenCalled();
  });

  it('handles missing canvas context gracefully', async () => {
    // Override the global mock temporarily for this test
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValueOnce(null);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    await act(async () => {
      renderComponent();
    });
    
    expect(mockGetTexture).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
