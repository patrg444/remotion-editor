import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompositeRenderer } from '../CompositeRenderer';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { ProductionClip, Track } from '../../types/timeline';
import { MockCanvasContext, createMockContext, getMockContext } from '../../../setupTests';
import { useTextureCache } from '../../hooks/useTextureCache';

// Mock useTextureCache hook
jest.mock('../../hooks/useTextureCache', () => ({
  useTextureCache: jest.fn()
}));

describe('CompositeRenderer', () => {
  let requestAnimationFrameSpy: jest.SpyInstance;
  let cancelAnimationFrameSpy: jest.SpyInstance;
  let mockContext: MockCanvasContext;
  let mockGetTexture: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    // Create spies for animation frame functions
    requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
    cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');

    // Create new mock context
    mockContext = createMockContext();
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);

    // Setup mock texture cache
    mockGetTexture = jest.fn().mockImplementation(async (source) => {
      const img = new Image();
      img.src = typeof source === 'string' ? source : 'data:image/png;base64,mockdata';
      img.width = 100;
      img.height = 100;
      return img;
    });
    (useTextureCache as jest.Mock).mockReturnValue({
      getTexture: mockGetTexture
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
  });

  const mockClip: ProductionClip = {
    id: 'clip1',
    type: 'video',
    startTime: 0,
    duration: 10,
    thumbnail: 'data:image/png;base64,test1'
  };

  const mockTrack: Track = {
    id: 'track1',
    name: 'Video Track 1',
    type: 'video',
    clips: [mockClip],
    duration: 10
  };

  const defaultProps = {
    tracks: [mockTrack],
    currentTime: 0,
    zoom: 1,
    isPlaying: false,
    onRenderComplete: jest.fn(),
    onRenderError: jest.fn()
  };

  const renderComposite = async (props = {}) => {
    const result = render(
      <TimelineProvider>
        <CompositeRenderer {...defaultProps} {...props} />
      </TimelineProvider>
    );
    
    // Let effects run
    await act(async () => {
      jest.runAllTimers();
      await Promise.resolve();
    });

    return result;
  };

  describe('Canvas Setup', () => {
    it('creates canvas with correct dimensions', async () => {
      await renderComposite();
      const canvas = screen.getByTestId('clip-renderer');
      expect(canvas).toBeInTheDocument();
      expect(canvas).toHaveAttribute('width', '1920');
      expect(canvas).toHaveAttribute('height', '1080');
    });

    it('applies responsive styles', async () => {
      await renderComposite();
      const canvas = screen.getByTestId('clip-renderer');
      expect(canvas).toHaveStyle({
        width: '100%',
        height: '100%'
      });
    });
  });

  describe('Track Rendering', () => {
    it('renders tracks with clips', async () => {
      await renderComposite();
      expect(mockGetTexture).toHaveBeenCalledWith(mockClip.thumbnail);
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('handles single track rendering', async () => {
      await renderComposite({ tracks: [mockTrack] });
      expect(mockGetTexture).toHaveBeenCalledTimes(1);
      expect(mockContext.drawImage).toHaveBeenCalledTimes(1);
    });

    it('positions clips based on zoom', async () => {
      await renderComposite({ zoom: 2 });
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('adjusts clip position based on current time', async () => {
      await renderComposite({ currentTime: 5 });
      expect(mockContext.drawImage).toHaveBeenCalled();
    });

    it('only renders visible clips', async () => {
      const offscreenClip: ProductionClip = {
        ...mockClip,
        startTime: 2000 // Beyond canvas width when scaled
      };
      await renderComposite({
        tracks: [{
          ...mockTrack,
          clips: [offscreenClip]
        }]
      });
      expect(mockGetTexture).not.toHaveBeenCalled();
      expect(mockContext.drawImage).not.toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('uses requestAnimationFrame during playback', async () => {
      await renderComposite({ isPlaying: true });
      expect(requestAnimationFrameSpy).toHaveBeenCalled();
    });

    it('cancels animation on unmount', async () => {
      const { unmount } = await renderComposite({ isPlaying: true });
      unmount();
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
    });

    it('handles rapid updates efficiently', async () => {
      const { rerender } = await renderComposite();
      
      // Simulate rapid updates
      for (let i = 0; i < 20; i++) {
        rerender(
          <TimelineProvider>
            <CompositeRenderer {...defaultProps} currentTime={i} />
          </TimelineProvider>
        );
        await act(async () => {
          jest.runAllTimers();
          await Promise.resolve();
        });
      }

      // Should batch renders efficiently
      expect(mockContext.clearRect).toHaveBeenCalledTimes(20);
    });

    it('maintains performance with multiple tracks', async () => {
      const manyTracks = Array(10).fill(mockTrack).map((track, i) => ({
        ...track,
        id: `track${i + 1}`,
        name: `Video Track ${i + 1}`
      }));
      await renderComposite({ tracks: manyTracks });
      expect(mockGetTexture).toHaveBeenCalledTimes(10);
      expect(mockContext.drawImage).toHaveBeenCalledTimes(10);
    });
  });

  describe('Error Handling', () => {
    it('calls onRenderError when context is missing', async () => {
      const onRenderError = jest.fn();
      // Set up null context before render
      HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(null);
      await renderComposite({ onRenderError });
      expect(onRenderError).toHaveBeenCalled();
    });

    it('handles texture loading errors', async () => {
      mockGetTexture.mockRejectedValueOnce(new Error('Failed to load texture'));
      await renderComposite();
      expect(mockContext.fillStyle).toBe('#666');
      expect(mockContext.fillRect).toHaveBeenCalled();
    });

    it('recovers from rendering errors', async () => {
      const onRenderError = jest.fn();
      mockContext.drawImage.mockImplementationOnce(() => {
        throw new Error('Render error');
      });

      await renderComposite({ onRenderError });
      expect(onRenderError).toHaveBeenCalled();
      expect(mockGetTexture).toHaveBeenCalledTimes(1);
    });
  });

  describe('Render Callbacks', () => {
    it('calls onRenderComplete after successful render', async () => {
      const onRenderComplete = jest.fn();
      await renderComposite({ onRenderComplete });
      expect(onRenderComplete).toHaveBeenCalled();
    });

    it('calls onRenderComplete for each frame during playback', async () => {
      const onRenderComplete = jest.fn();
      await renderComposite({
        isPlaying: true,
        onRenderComplete
      });

      // Trigger animation frames
      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });
      
      expect(onRenderComplete).toHaveBeenCalledTimes(2);
    });
  });
});
