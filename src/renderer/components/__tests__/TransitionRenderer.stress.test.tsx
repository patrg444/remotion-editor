import React from 'react';
import { render, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransitionRenderer } from '../TransitionRenderer';
import { useTextureCache } from '../../hooks/useTextureCache';
import { TransitionType } from '../../types/transition';

// Mock useTextureCache hook
jest.mock('../../hooks/useTextureCache', () => ({
  useTextureCache: jest.fn()
}));

// Mock WebGL context
const mockGL = {
  createTexture: jest.fn().mockReturnValue({}),
  activeTexture: jest.fn(),
  bindTexture: jest.fn(),
  texImage2D: jest.fn(),
  texParameteri: jest.fn(),
  createShader: jest.fn().mockReturnValue({}),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn().mockReturnValue({}),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getUniformLocation: jest.fn().mockReturnValue({}),
  uniform1f: jest.fn(),
  uniform1i: jest.fn(),
  uniform2fv: jest.fn(),
  createBuffer: jest.fn().mockReturnValue({}),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  getAttribLocation: jest.fn().mockReturnValue(0),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  viewport: jest.fn(),
  drawArrays: jest.fn(),
  deleteBuffer: jest.fn(),
  deleteShader: jest.fn(),
  deleteTexture: jest.fn(),
  deleteProgram: jest.fn(),
  VERTEX_SHADER: 'VERTEX_SHADER',
  FRAGMENT_SHADER: 'FRAGMENT_SHADER',
  TEXTURE_2D: 'TEXTURE_2D',
  RGBA: 'RGBA',
  UNSIGNED_BYTE: 'UNSIGNED_BYTE',
  TEXTURE0: 'TEXTURE0',
  TEXTURE1: 'TEXTURE1',
  TEXTURE_MIN_FILTER: 'TEXTURE_MIN_FILTER',
  TEXTURE_MAG_FILTER: 'TEXTURE_MAG_FILTER',
  TEXTURE_WRAP_S: 'TEXTURE_WRAP_S',
  TEXTURE_WRAP_T: 'TEXTURE_WRAP_T',
  LINEAR: 'LINEAR',
  CLAMP_TO_EDGE: 'CLAMP_TO_EDGE',
  ARRAY_BUFFER: 'ARRAY_BUFFER',
  STATIC_DRAW: 'STATIC_DRAW',
  FLOAT: 'FLOAT',
  TRIANGLE_STRIP: 'TRIANGLE_STRIP'
} as unknown as WebGL2RenderingContext;

describe('TransitionRenderer Stress Tests', () => {
  let mockGetTexture: jest.Mock;
  let textureLoadCount: number;
  let cacheHitCount: number;
  let textureCache: Map<string, HTMLImageElement>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    textureLoadCount = 0;
    cacheHitCount = 0;
    textureCache = new Map();

    // Mock canvas and WebGL context
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockGL);

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

    // Spy on console.error to suppress expected errors
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const createTransitionProps = (fromId: string, toId: string) => ({
    transition: {
      id: `transition-${fromId}-${toId}`,
      type: TransitionType.Fade,
      duration: 1,
      params: {}
    },
    fromClip: {
      id: `from-${fromId}`,
      thumbnail: `texture-${fromId}`, // Use same texture key for from/to to test caching
      duration: 10,
      startTime: 0
    },
    toClip: {
      id: `to-${toId}`,
      thumbnail: `texture-${toId}`, // Use same texture key for from/to to test caching
      duration: 10,
      startTime: 10
    },
    progress: 0.5,
    width: 1920,
    height: 1080
  });

  it('should efficiently cache textures during rapid transitions', async () => {
    const { rerender } = render(
      <TransitionRenderer {...createTransitionProps('1', '2')} />
    );

    // Wait for initial textures to load
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simulate 30 frames of transition
    for (let i = 0; i < 30; i++) {
      await act(async () => {
        rerender(
          <TransitionRenderer
            {...createTransitionProps('1', '2')}
            progress={i / 30}
          />
        );
        await new Promise(resolve => setTimeout(resolve, 0));
      });
    }

    // Should only load each texture once
    expect(textureLoadCount).toBe(2); // One for each clip
    // Should reuse textures for subsequent frames
    expect(cacheHitCount).toBeGreaterThan(50); // Multiple reuses per frame
  });

  it('should handle multiple transitions with shared clips', async () => {
    // Create transitions that share some clips
    const transitions = [
      ['1', '2'],
      ['2', '3'],
      ['3', '4'],
      ['4', '1']
    ];

    // Render all transitions in a container to maintain cache across transitions
    await act(async () => {
      const transitionElements = transitions.map(([fromId, toId], index) => (
        <TransitionRenderer key={index} {...createTransitionProps(fromId, toId)} />
      ));
      render(<div>{transitionElements}</div>);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should only load 4 unique textures (one per clip)
    expect(textureLoadCount).toBe(4);
    // Should have cache hits for shared clips (each clip is used twice except first and last)
    expect(cacheHitCount).toBe(4); // 2 middle clips used twice
  });

  it('should maintain performance with concurrent transitions', async () => {
    // Render multiple transitions simultaneously
    await act(async () => {
      const transitions = Array.from({ length: 5 }, (_, i) => 
        <TransitionRenderer key={i} {...createTransitionProps(`${i}`, `${i + 1}`)} />
      );

      render(<div>{transitions}</div>);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should load 6 unique textures (5 transitions = 6 unique clips)
    expect(textureLoadCount).toBe(6);
    // Each transition creates 2 WebGL textures, but the last clip is shared with first
    expect(mockGL.createTexture).toHaveBeenCalledTimes(10); // 5 transitions * 2 textures = 10
  });

  it('should handle texture loading errors gracefully', async () => {
    // Mock a texture loading failure
    mockGetTexture.mockRejectedValueOnce(new Error('Failed to load texture'));

    await act(async () => {
      render(<TransitionRenderer {...createTransitionProps('error', 'valid')} />);
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Should attempt to load both textures
    expect(mockGetTexture).toHaveBeenCalledTimes(2);
    // Should not create WebGL textures for failed loads
    expect(mockGL.createTexture).not.toHaveBeenCalled();
    // Should log the error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error rendering transition:',
      expect.any(Error)
    );
  });

  it('should clean up WebGL resources properly', async () => {
    const { unmount } = render(
      <TransitionRenderer {...createTransitionProps('1', '2')} />
    );

    // Wait for textures to load and WebGL resources to be created
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Unmount should trigger cleanup
    unmount();

    // Should clean up WebGL resources
    expect(mockGL.deleteTexture).toHaveBeenCalled();
    expect(mockGL.deleteShader).toHaveBeenCalled();
    expect(mockGL.deleteProgram).toHaveBeenCalled();
  });
});
