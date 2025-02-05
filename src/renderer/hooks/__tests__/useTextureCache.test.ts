import { renderHook, act } from '@testing-library/react-hooks';
import { useTextureCache } from '../useTextureCache';

describe('useTextureCache', () => {
  // Mock canvas and context
  let mockContext: any;
  let mockCanvas: any;

  // Mock Image class
  let mockImage: any;
  let imageLoadCallback: Function;
  let imageErrorCallback: Function;

  beforeEach(() => {
    jest.useFakeTimers();

    // Mock canvas context
    mockContext = {
      putImageData: jest.fn(),
    };

    // Mock canvas
    mockCanvas = {
      getContext: jest.fn().mockReturnValue(mockContext),
      toDataURL: jest.fn().mockReturnValue('data:image/png;base64,mockdata'),
      width: 0,
      height: 0,
    };

    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement;
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'canvas') return mockCanvas as HTMLCanvasElement;
      return originalCreateElement.call(document, tagName);
    });

    // Mock Image class
    class MockImage {
      private _onload: Function | null = null;
      private _onerror: Function | null = null;
      public src: string = '';
      public width: number = 100;
      public height: number = 100;

      set onload(cb: Function) {
        this._onload = cb;
        imageLoadCallback = cb;
      }

      set onerror(cb: Function) {
        this._onerror = cb;
        imageErrorCallback = cb;
      }

      get onload(): Function {
        return this._onload!;
      }

      get onerror(): Function {
        return this._onerror!;
      }
    }

    mockImage = MockImage;
    (global as any).Image = mockImage;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('Texture Loading', () => {
    it('loads texture from URL', async () => {
      const { result } = renderHook(() => useTextureCache());
      const textureUrl = 'texture.png';

      const loadPromise = result.current.getTexture(textureUrl);
      
      // Simulate successful image load
      act(() => {
        imageLoadCallback();
      });

      const texture = await loadPromise;
      expect(texture).toBeDefined();
      expect(result.current.isLoading[textureUrl]).toBe(false);
      expect(result.current.errors[textureUrl]).toBeUndefined();
    });

    it('loads texture from ImageData', async () => {
      const { result } = renderHook(() => useTextureCache());
      const imageData = new ImageData(new Uint8ClampedArray(400), 10, 10);

      const loadPromise = result.current.getTexture(imageData);
      
      // Simulate successful image load
      act(() => {
        imageLoadCallback();
      });

      const texture = await loadPromise;
      expect(texture).toBeDefined();
      expect(mockContext.putImageData).toHaveBeenCalledWith(imageData, 0, 0);
    });

    it('reuses cached textures', async () => {
      const { result } = renderHook(() => useTextureCache());
      const textureUrl = 'texture.png';

      // Load texture first time
      const loadPromise1 = result.current.getTexture(textureUrl);
      act(() => {
        imageLoadCallback();
      });
      await loadPromise1;

      // Load same texture again
      const loadPromise2 = result.current.getTexture(textureUrl);
      const texture2 = await loadPromise2;

      // Should not create new Image instance
      expect(Image).toHaveBeenCalledTimes(1);
      expect(texture2).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('respects maxCacheSize option', async () => {
      const { result } = renderHook(() => useTextureCache({ maxCacheSize: 2 }));

      // Load three textures
      for (let i = 0; i < 3; i++) {
        const loadPromise = result.current.getTexture(`texture${i}.png`);
        act(() => {
          imageLoadCallback();
        });
        await loadPromise;
      }

      // Force cleanup
      act(() => {
        result.current._cleanup();
      });

      expect(result.current.getCacheSize()).toBe(2);
    });

    it('handles texture expiration', async () => {
      const { result } = renderHook(() => 
        useTextureCache({ expirationTime: 1000, disableAutoCleanup: true })
      );

      // Load texture
      const loadPromise = result.current.getTexture('texture.png');
      act(() => {
        imageLoadCallback();
      });
      await loadPromise;

      // Advance time past expiration
      act(() => {
        jest.advanceTimersByTime(1500);
        result.current._cleanup();
      });

      expect(result.current.getCacheSize()).toBe(0);
    });

    it('clears cache on demand', async () => {
      const { result } = renderHook(() => useTextureCache());

      // Load texture
      const loadPromise = result.current.getTexture('texture.png');
      act(() => {
        imageLoadCallback();
      });
      await loadPromise;

      // Clear cache
      act(() => {
        result.current.clearCache();
      });

      expect(result.current.getCacheSize()).toBe(0);
      expect(result.current.isLoading).toEqual({});
      expect(result.current.errors).toEqual({});
    });
  });

  describe('Error Handling', () => {
    it('handles loading errors', async () => {
      const { result } = renderHook(() => useTextureCache());
      const textureUrl = 'invalid.png';

      const loadPromise = result.current.getTexture(textureUrl);
      
      // Simulate load error
      act(() => {
        imageErrorCallback();
      });

      await expect(loadPromise).rejects.toThrow('Failed to load image');
      expect(result.current.isLoading[textureUrl]).toBe(false);
      expect(result.current.errors[textureUrl]).toBeDefined();
    });

    it('handles invalid ImageData', async () => {
      const { result } = renderHook(() => useTextureCache());
      const invalidImageData = new ImageData(new Uint8ClampedArray(100), 10, 10); // Wrong data length

      await expect(result.current.getTexture(invalidImageData)).rejects.toThrow('Invalid ImageData');
    });

    it('handles texture size limits', async () => {
      const { result } = renderHook(() => useTextureCache({ maxTextureSize: 64 }));
      const largeImageData = new ImageData(new Uint8ClampedArray(400 * 400 * 4), 400, 400);

      await expect(result.current.getTexture(largeImageData)).rejects.toThrow('Texture size exceeds maximum');
    });
  });

  describe('Refresh Functionality', () => {
    it('refreshes existing texture', async () => {
      const { result } = renderHook(() => useTextureCache());
      const textureUrl = 'texture.png';

      // Load texture initially
      const loadPromise1 = result.current.getTexture(textureUrl);
      act(() => {
        imageLoadCallback();
      });
      await loadPromise1;

      // Refresh texture
      const refreshPromise = result.current.refreshTexture(textureUrl);
      act(() => {
        imageLoadCallback();
      });
      await refreshPromise;

      // Should create new Image instance
      expect(Image).toHaveBeenCalledTimes(2);
    });
  });

  describe('Automatic Cleanup', () => {
    it('runs cleanup on interval', () => {
      const { result } = renderHook(() => useTextureCache({ expirationTime: 1000 }));

      // Advance timer to trigger cleanup
      act(() => {
        jest.advanceTimersByTime(60000);
      });

      // Cleanup should have run
      expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
    });

    it('cleans up interval on unmount', () => {
      const { unmount } = renderHook(() => useTextureCache());

      unmount();

      expect(clearInterval).toHaveBeenCalled();
    });
  });
});
