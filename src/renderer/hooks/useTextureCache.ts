import { useCallback, useRef, useState, useEffect } from 'react';

interface TextureCache {
  [key: string]: {
    image: HTMLImageElement;
    lastUsed: number;
    isLoading: boolean;
    error?: Error;
  };
}

interface TextureCacheOptions {
  maxCacheSize?: number;  // Maximum number of textures to keep in cache
  expirationTime?: number;  // Time in ms after which unused textures are cleared
  disableAutoCleanup?: boolean; // For testing purposes
  maxTextureSize?: number; // Maximum size for individual textures (width/height)
}

const DEFAULT_OPTIONS: Required<Omit<TextureCacheOptions, 'disableAutoCleanup'>> = {
  maxCacheSize: 100,
  expirationTime: 5 * 60 * 1000, // 5 minutes
  maxTextureSize: 4096, // Default max texture size
};

function isValidImageData(data: ImageData | null | undefined): boolean {
  if (!data) return false;
  
  try {
    // Check if it has required properties
    const hasValidProps = 
      'width' in data &&
      'height' in data &&
      'data' in data &&
      typeof data.width === 'number' &&
      typeof data.height === 'number' &&
      data.width > 0 &&
      data.height > 0 &&
      data.data instanceof Uint8ClampedArray;

    if (!hasValidProps) return false;

    // Check data length
    const expectedLength = data.width * data.height * 4;
    return data.data.length === expectedLength;
  } catch (error) {
    console.error('ImageData validation error:', error);
    return false;
  }
}

export function useTextureCache(options: TextureCacheOptions = {}) {
  const cache = useRef<TextureCache>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, Error>>({});
  const cleanupRef = useRef<NodeJS.Timeout>();
  const initialCleanupDone = useRef(false);

  const effectiveOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const cleanup = useCallback(() => {
    const now = Date.now();
    const entries = Object.entries(cache.current);
    
    console.log('Cleanup - Initial cache size:', entries.length);
    console.log('Cleanup - Cache entries:', entries.map(([key, entry]) => ({
      key,
      lastUsed: entry.lastUsed,
      timeSinceLastUse: now - entry.lastUsed
    })));

    // Sort by last used time (most recently used first)
    entries.sort(([, a], [, b]) => b.lastUsed - a.lastUsed);

    // Keep track of removed entries
    const removedKeys: string[] = [];

    // First, remove expired entries
    for (const [key, entry] of entries) {
      if (now - entry.lastUsed > effectiveOptions.expirationTime) {
        console.log('Cleanup - Removing expired entry:', key);
        delete cache.current[key];
        removedKeys.push(key);
      }
    }

    // Then, if we're still over maxCacheSize, remove oldest entries
    const remainingEntries = Object.entries(cache.current);
    console.log('Cleanup - Remaining entries before size check:', remainingEntries.length);
    
    if (remainingEntries.length > effectiveOptions.maxCacheSize) {
      // Re-sort remaining entries by last used time
      remainingEntries.sort(([, a], [, b]) => b.lastUsed - a.lastUsed);
      
      // Keep only the most recently used entries up to maxCacheSize
      const entriesToRemove = remainingEntries.slice(effectiveOptions.maxCacheSize);
      console.log('Cleanup - Entries to remove due to size limit:', entriesToRemove.length);
      
      for (const [key] of entriesToRemove) {
        console.log('Cleanup - Removing entry due to size limit:', key);
        delete cache.current[key];
        removedKeys.push(key);
      }
    }

    // Update loading states and errors if any entries were removed
    if (removedKeys.length > 0) {
      setLoadingStates(prev => {
        const next = { ...prev };
        removedKeys.forEach(key => {
          delete next[key];
        });
        return next;
      });
      setErrors(prev => {
        const next = { ...prev };
        removedKeys.forEach(key => {
          delete next[key];
        });
        return next;
      });
    }

    console.log('Cleanup - Final cache size:', Object.keys(cache.current).length);
  }, [effectiveOptions.maxCacheSize, effectiveOptions.expirationTime]);

  // Clean up expired textures
  useEffect(() => {
    if (options.disableAutoCleanup) {
      return;
    }

    // Clear any existing interval
    if (cleanupRef.current) {
      clearInterval(cleanupRef.current);
    }

    // Set up new interval
    cleanupRef.current = setInterval(cleanup, 60000); // Run cleanup every minute

    // Run cleanup immediately only once
    if (!initialCleanupDone.current) {
      cleanup();
      initialCleanupDone.current = true;
    }

    return () => {
      if (cleanupRef.current) {
        clearInterval(cleanupRef.current);
      }
    };
  }, [cleanup, options.disableAutoCleanup]);

  const getTexture = useCallback(async (source: string | ImageData): Promise<HTMLImageElement> => {
    const key = source instanceof ImageData ? source.data.toString() : source;
    console.log('getTexture - Current cache size:', Object.keys(cache.current).length);
    console.log('getTexture - Loading texture:', key);

    // Check texture size limits first
    if (source instanceof ImageData) {
      if (source.width > effectiveOptions.maxTextureSize || source.height > effectiveOptions.maxTextureSize) {
        const error = new Error(`Texture size exceeds maximum allowed size of ${effectiveOptions.maxTextureSize}px`);
        setErrors(prev => ({ ...prev, [key]: error }));
        throw error;
      }

      // Then validate ImageData
      if (!isValidImageData(source)) {
        const error = new Error('Invalid ImageData provided');
        setErrors(prev => ({ ...prev, [key]: error }));
        throw error;
      }
    }

    // Update last used time if in cache
    if (cache.current[key]) {
      console.log('getTexture - Found in cache:', key);
      cache.current[key].lastUsed = Date.now();
      return cache.current[key].image;
    }

    // Set loading state
    setLoadingStates(prev => ({ ...prev, [key]: true }));

    try {
      let dataUrl = '';
      if (source instanceof ImageData) {
        const canvas = document.createElement('canvas');
        canvas.width = source.width;
        canvas.height = source.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        ctx.putImageData(source, 0, 0);
        dataUrl = canvas.toDataURL();
      } else {
        dataUrl = source;
      }

      // Create and load the image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          // Check texture size limits for loaded image
          if (img.width > effectiveOptions.maxTextureSize || img.height > effectiveOptions.maxTextureSize) {
            reject(new Error(`Texture size exceeds maximum allowed size of ${effectiveOptions.maxTextureSize}px`));
            return;
          }
          resolve();
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${key}`));
        img.src = dataUrl;
      });

      // Cache the loaded image
      cache.current[key] = {
        image: img,
        lastUsed: Date.now(),
        isLoading: false,
      };

      console.log('getTexture - Added to cache:', key);
      console.log('getTexture - New cache size:', Object.keys(cache.current).length);

      setLoadingStates(prev => ({ ...prev, [key]: false }));
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });

      return img;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error loading texture');
      setErrors(prev => ({ ...prev, [key]: err }));
      setLoadingStates(prev => ({ ...prev, [key]: false }));
      throw err;
    }
  }, []);

  const clearCache = useCallback(() => {
    cache.current = {};
    setLoadingStates({});
    setErrors({});
  }, []);

  const refreshTexture = useCallback(async (source: string | ImageData) => {
    const key = source instanceof ImageData ? source.data.toString() : source;
    delete cache.current[key];
    setLoadingStates(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    return getTexture(source);
  }, [getTexture]);

  return {
    getTexture,
    clearCache,
    refreshTexture,
    isLoading: loadingStates,
    errors,
    getCacheSize: () => Object.keys(cache.current).length,
    _cleanup: cleanup, // Expose for testing
  };
}
