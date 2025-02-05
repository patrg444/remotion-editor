import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompositeRenderer } from '../CompositeRenderer';
import { Track, ProductionClip } from '../../types/timeline';
import { useTextureCache } from '../../hooks/useTextureCache';

// Mock useTextureCache hook
jest.mock('../../hooks/useTextureCache', () => ({
  useTextureCache: jest.fn()
}));

// Create mock functions with Jest mock properties
const mockDrawImage = jest.fn();
const mockFillRect = jest.fn();
const mockClearRect = jest.fn();

// Create a partial mock of CanvasRenderingContext2D with only the methods we use
const mockContext = {
  clearRect: mockClearRect,
  drawImage: mockDrawImage,
  fillStyle: '#666',
  fillRect: mockFillRect,
  canvas: {
    width: 1920,
    height: 1080,
    style: {},
  },
  getContextAttributes: () => ({
    alpha: true,
    colorSpace: 'srgb',
    desynchronized: false,
    willReadFrequently: false
  }),
  globalAlpha: 1,
  globalCompositeOperation: 'source-over'
} as unknown as CanvasRenderingContext2D;

describe('CompositeRenderer Stress Tests', () => {
  let mockGetTexture: jest.Mock;
  let textureLoadCount: number;
  let cacheHitCount: number;
  let textureCache: Map<string, HTMLImageElement>;

  beforeEach(() => {
    jest.clearAllMocks();
    textureLoadCount = 0;
    cacheHitCount = 0;
    textureCache = new Map();

    // Setup mock texture cache with proper tracking
    mockGetTexture = jest.fn().mockImplementation(async (source) => {
      const key = typeof source === 'string' ? source : 'imagedata-key';
      
      // Check if texture is already in cache
      const cachedTexture = textureCache.get(key);
      if (cachedTexture) {
        cacheHitCount++;
        return cachedTexture;
      }

      // Create new texture
      textureLoadCount++;
      const img = new Image();
      img.src = key;
      img.width = 100;
      img.height = 100;
      textureCache.set(key, img);
      return img;
    });

    (useTextureCache as jest.Mock).mockReturnValue({
      getTexture: mockGetTexture
    });

    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
  });

  const createTestClip = (id: string): ProductionClip => ({
    id,
    trackId: 'track-1',
    trackStart: 0,
    trackEnd: 10,
    inPoint: 0,
    outPoint: 10,
    duration: 10,
    type: 'video',
    thumbnail: `texture-${id}`,
    source: 'test-source.mp4',
    startTime: 0
  });

  const createTestTrack = (id: string, clips: ProductionClip[]): Track => ({
    id,
    name: 'Test Track',
    type: 'video',
    height: 100,
    clips,
    index: 0,
    duration: Math.max(...clips.map(clip => clip.startTime + clip.duration), 0),
    isLocked: false,
    isVisible: true,
    isMuted: false,
    isSolo: false
  });

  it('should efficiently cache and reuse textures for multiple clips', async () => {
    // Create clips that share some textures
    const clips = Array.from({ length: 25 }, (_, i) => 
      createTestClip(`${Math.floor(i / 5)}`) // Every 5 clips share a texture
    );
    const track = createTestTrack('track-1', clips);

    await act(async () => {
      render(
        <CompositeRenderer
          tracks={[track]}
          currentTime={0}
          isPlaying={false}
          zoom={1}
        />
      );
      // Wait for all textures to load and render
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should only load 5 unique textures
    expect(textureLoadCount).toBe(5);
    // Should have 20 cache hits (25 total - 5 initial loads)
    expect(cacheHitCount).toBe(20);
  });

  it('should maintain texture cache during rapid updates', async () => {
    const clips = Array.from({ length: 10 }, (_, i) => createTestClip(`${i}`));
    const track = createTestTrack('track-1', clips);

    const { rerender } = render(
      <CompositeRenderer
        tracks={[track]}
        currentTime={0}
        isPlaying={true}
        zoom={1}
      />
    );

    // Simulate 1 second of playback at 30fps
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        rerender(
          <CompositeRenderer
            tracks={[track]}
            currentTime={i / 30}
            isPlaying={true}
            zoom={1}
          />
        );
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    // Should only load each texture once
    expect(textureLoadCount).toBe(10);
    // Should reuse textures for subsequent frames
    expect(cacheHitCount).toBeGreaterThan(textureLoadCount);
  });

  it('should handle concurrent texture loading for multiple tracks', async () => {
    const tracks = Array.from({ length: 5 }, (_, trackIndex) => {
      const clips = Array.from(
        { length: 10 },
        (_, clipIndex) => createTestClip(`${trackIndex}-${clipIndex}`)
      );
      return createTestTrack(`track-${trackIndex}`, clips);
    });

    await act(async () => {
      render(
        <CompositeRenderer
          tracks={tracks}
          currentTime={0}
          isPlaying={false}
          zoom={1}
        />
      );
      // Wait for all textures to load and render
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should load all textures concurrently
    expect(textureLoadCount).toBe(50); // 5 tracks * 10 clips
    expect(mockDrawImage).toHaveBeenCalled();
    expect(mockDrawImage.mock.calls.length).toBeGreaterThan(0);
  });

  it('should handle texture loading errors gracefully', async () => {
    // Create a clip that will fail to load its texture
    const failingClip = createTestClip('failing-clip');
    failingClip.thumbnail = 'invalid-texture';
    mockGetTexture.mockRejectedValueOnce(new Error('Failed to load texture'));

    const track = createTestTrack('track-1', [failingClip]);

    await act(async () => {
      render(
        <CompositeRenderer
          tracks={[track]}
          currentTime={0}
          isPlaying={false}
          zoom={1}
        />
      );
      // Wait for error handling to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should attempt to load the texture
    expect(mockGetTexture).toHaveBeenCalledWith('invalid-texture');
    // Should fall back to placeholder rendering
    expect(mockContext.fillStyle).toBe('#666');
    expect(mockFillRect).toHaveBeenCalled();
  });

  it('should maintain performance with texture cache under memory pressure', async () => {
    // Create many clips with some shared textures
    const clips = Array.from({ length: 50 }, (_, i) => 
      createTestClip(`${Math.floor(i / 2)}`) // Every 2 clips share a texture
    );
    const track = createTestTrack('track-1', clips);

    await act(async () => {
      render(
        <CompositeRenderer
          tracks={[track]}
          currentTime={0}
          isPlaying={false}
          zoom={1}
        />
      );
      // Wait for all textures to load and render
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should only load 25 unique textures (50 clips / 2 shared)
    expect(textureLoadCount).toBe(25);
    // Should have 25 cache hits (50 total - 25 initial loads)
    expect(cacheHitCount).toBe(25);
    // Should render all clips
    expect(mockDrawImage).toHaveBeenCalled();
    expect(mockDrawImage.mock.calls.length).toBeGreaterThan(0);
  });
});
