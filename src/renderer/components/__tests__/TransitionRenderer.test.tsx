import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransitionRenderer } from '../TransitionRenderer';
import { useTextureCache } from '../../hooks/useTextureCache';
import { Transition } from '../../types/transition';
import transitions from '../../transitions/shaders';

// Mock transitions
jest.mock('../../transitions/shaders', () => ({
  fade: {
    vertexShader: 'vertex shader source',
    fragmentShader: 'fragment shader source',
    uniforms: {
      progress: 'float',
      fromTexture: 'sampler2D',
      toTexture: 'sampler2D',
    },
  },
}));

// Mock the useTextureCache hook
const mockGetTexture = jest.fn().mockResolvedValue(new Image());
jest.mock('../../hooks/useTextureCache', () => ({
  useTextureCache: () => ({
    getTexture: mockGetTexture,
    clearCache: jest.fn(),
    refreshTexture: jest.fn(),
    isLoading: {},
    errors: {},
    getCacheSize: jest.fn(),
    _cleanup: jest.fn(),
  }),
}));

describe('TransitionRenderer', () => {
  const defaultProps = {
    transition: {
      type: 'fade',
      duration: 1,
      params: {},
    } as Transition,
    fromClip: {
      id: 'clip1',
      src: 'test1.mp4',
      duration: 10,
      startTime: 0,
      thumbnail: 'thumb1.jpg',
    },
    toClip: {
      id: 'clip2',
      src: 'test2.mp4',
      duration: 10,
      startTime: 10,
      thumbnail: 'thumb2.jpg',
    },
    progress: 0.5,
    width: 640,
    height: 360,
  };

  // Mock WebGL context
  const mockGL = {
    VERTEX_SHADER: 'VERTEX_SHADER',
    FRAGMENT_SHADER: 'FRAGMENT_SHADER',
    ARRAY_BUFFER: 'ARRAY_BUFFER',
    STATIC_DRAW: 'STATIC_DRAW',
    FLOAT: 'FLOAT',
    TRIANGLE_STRIP: 'TRIANGLE_STRIP',
    TEXTURE_2D: 'TEXTURE_2D',
    RGBA: 'RGBA',
    UNSIGNED_BYTE: 'UNSIGNED_BYTE',
    TEXTURE0: 'TEXTURE0',
    TEXTURE1: 'TEXTURE1',
    LINEAR: 'LINEAR',
    CLAMP_TO_EDGE: 'CLAMP_TO_EDGE',
    createShader: jest.fn(() => ({})),
    createProgram: jest.fn(() => ({})),
    createBuffer: jest.fn(() => ({})),
    createTexture: jest.fn(() => ({})),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    useProgram: jest.fn(),
    getUniformLocation: jest.fn(() => ({})),
    getAttribLocation: jest.fn(() => 0),
    uniform1f: jest.fn(),
    uniform1i: jest.fn(),
    uniform2fv: jest.fn(),
    bindBuffer: jest.fn(),
    bufferData: jest.fn(),
    enableVertexAttribArray: jest.fn(),
    vertexAttribPointer: jest.fn(),
    viewport: jest.fn(),
    drawArrays: jest.fn(),
    deleteBuffer: jest.fn(),
    deleteShader: jest.fn(),
    deleteTexture: jest.fn(),
    deleteProgram: jest.fn(),
    getExtension: jest.fn(),
    enable: jest.fn(),
    disable: jest.fn(),
    activeTexture: jest.fn(),
    bindTexture: jest.fn(),
    texImage2D: jest.fn(),
    texParameteri: jest.fn(),
  } as unknown as WebGL2RenderingContext;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock requestAnimationFrame
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    // Mock canvas getContext
    const getContextMock = jest.fn((contextId: string, _options?: any) => {
      if (contextId === 'webgl2') {
        return mockGL;
      }
      return null;
    });

    // Type assertion to match HTMLCanvasElement's getContext signature
    HTMLCanvasElement.prototype.getContext = getContextMock as typeof HTMLCanvasElement.prototype.getContext;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders canvas element', () => {
      render(<TransitionRenderer {...defaultProps} />);
      const canvas = screen.getByTestId('transition-canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName.toLowerCase()).toBe('canvas');
    });

    it('applies correct dimensions', () => {
      render(<TransitionRenderer {...defaultProps} />);
      const canvas = screen.getByTestId('transition-canvas');
      expect(canvas).toHaveAttribute('width', '640');
      expect(canvas).toHaveAttribute('height', '360');
    });

    it('initializes WebGL context', () => {
      render(<TransitionRenderer {...defaultProps} />);
      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('webgl2');
    });
  });

  describe('Texture Loading', () => {
    it('loads textures for both clips', async () => {
      await act(async () => {
        render(<TransitionRenderer {...defaultProps} />);
        // Wait for next animation frame and microtasks
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(mockGetTexture).toHaveBeenCalledWith('thumb1.jpg');
      expect(mockGetTexture).toHaveBeenCalledWith('thumb2.jpg');
    });

    it('creates WebGL textures after loading images', async () => {
      await act(async () => {
        render(<TransitionRenderer {...defaultProps} />);
        // Wait for next animation frame and microtasks
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(mockGL.createTexture).toHaveBeenCalledTimes(2);
      expect(mockGL.texImage2D).toHaveBeenCalledTimes(2);
    });
  });

  describe('Shader Setup', () => {
    it('creates and compiles shaders', async () => {
      await act(async () => {
        render(<TransitionRenderer {...defaultProps} />);
        // Wait for next animation frame and microtasks
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(mockGL.createShader).toHaveBeenCalledTimes(2);
      expect(mockGL.compileShader).toHaveBeenCalledTimes(2);
      expect(mockGL.shaderSource).toHaveBeenCalledWith(expect.anything(), 'vertex shader source');
      expect(mockGL.shaderSource).toHaveBeenCalledWith(expect.anything(), 'fragment shader source');
    });

    it('creates and links program', async () => {
      await act(async () => {
        render(<TransitionRenderer {...defaultProps} />);
        // Wait for next animation frame and microtasks
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      expect(mockGL.createProgram).toHaveBeenCalled();
      expect(mockGL.linkProgram).toHaveBeenCalled();
      expect(mockGL.useProgram).toHaveBeenCalled();
    });
  });

  describe('Cleanup', () => {
    it('cleans up WebGL resources on unmount', async () => {
      let unmountFn: () => void;
      
      await act(async () => {
        const { unmount } = render(<TransitionRenderer {...defaultProps} />);
        unmountFn = unmount;
        // Wait for next animation frame and microtasks
        await Promise.resolve();
        await new Promise(resolve => setTimeout(resolve, 0));
      });
      
      act(() => {
        unmountFn();
      });

      expect(mockGL.deleteProgram).toHaveBeenCalled();
      expect(mockGL.deleteShader).toHaveBeenCalled();
      expect(mockGL.deleteTexture).toHaveBeenCalled();
      expect(mockGL.deleteBuffer).toHaveBeenCalled();
    });
  });
});
