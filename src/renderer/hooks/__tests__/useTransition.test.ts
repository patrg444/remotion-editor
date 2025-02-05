import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../useTransition';
import { TransitionInstance, TransitionDefinition, TransitionType, TransitionPreviewData } from '../../types/transition';
import { Logger } from '../../../main/utils/logger';

// Mock WebGL context and functions
const mockGL = {
  VERTEX_SHADER: 'VERTEX_SHADER',
  FRAGMENT_SHADER: 'FRAGMENT_SHADER',
  RGBA: 'RGBA',
  UNSIGNED_BYTE: 'UNSIGNED_BYTE',
  createShader: jest.fn(() => 'shader'),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  createProgram: jest.fn(() => 'program'),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getUniformLocation: jest.fn(() => 'location'),
  uniform1f: jest.fn(),
  uniform2fv: jest.fn(),
  uniform3fv: jest.fn(),
  uniform4fv: jest.fn(),
  uniformMatrix4fv: jest.fn(),
  readPixels: jest.fn((x, y, width, height, format, type, pixels) => {
    // Fill pixels synchronously
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255;     // R
      pixels[i + 1] = 0;   // G
      pixels[i + 2] = 0;   // B
      pixels[i + 3] = 255; // A
    }
    return Promise.resolve();
  }),
  getShaderParameter: jest.fn(() => true),
  getProgramParameter: jest.fn(() => true),
  getShaderInfoLog: jest.fn(() => ''),
  getProgramInfoLog: jest.fn(() => ''),
  createTexture: jest.fn(() => 'texture'),
  bindTexture: jest.fn(),
  texImage2D: jest.fn(),
  texParameteri: jest.fn(),
  createFramebuffer: jest.fn(() => 'framebuffer'),
  bindFramebuffer: jest.fn(),
  framebufferTexture2D: jest.fn(),
  viewport: jest.fn(),
  clear: jest.fn(),
  clearColor: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  blendFunc: jest.fn(),
};

// Shared WebGL context and canvas for reuse
let sharedCanvas: HTMLCanvasElement;
let sharedContext: WebGL2RenderingContext;

// Mock canvas and WebGL context
beforeEach(() => {
  // Create new shared context if it doesn't exist
  if (!sharedContext) {
    sharedContext = mockGL as unknown as WebGL2RenderingContext;
  }

  // Create new shared canvas if it doesn't exist
  if (!sharedCanvas) {
    sharedCanvas = {
      width: 1920,
      height: 1080,
      getContext: jest.fn((contextId: string) => {
        if (contextId === 'webgl2') {
          return sharedContext;
        }
        return null;
      })
    } as unknown as HTMLCanvasElement;
  }
  
  // Mock createElement with proper type handling
  const createElementSpy = jest.spyOn(document, 'createElement');
  const originalCreateElement = createElementSpy.getMockImplementation() || document.createElement.bind(document);
  
  // Use type assertion to handle createElement mock
  (createElementSpy as jest.SpyInstance<HTMLElement, [tagName: string]>).mockImplementation((tagName: string) => {
    if (tagName === 'canvas') {
      return sharedCanvas;
    }
    return originalCreateElement(tagName);
  });

  // Mock requestAnimationFrame to use setTimeout
  global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  
  // Use legacy timers since we're mocking rAF with setTimeout
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
  
  // Reset shared objects for next test
  sharedCanvas = null as unknown as HTMLCanvasElement;
  sharedContext = null as unknown as WebGL2RenderingContext;
});

describe('useTransition', () => {
  // Simplified transition definition for testing
  const sampleTransition: TransitionDefinition = {
    name: 'test-fade',
    vertexShader: 'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }',
    fragmentShader: 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }',
    uniforms: {
      progress: { type: 'float', value: 0, defaultValue: 0, name: 'progress' },
      smoothness: { type: 'float', value: 0.5, defaultValue: 0.5, name: 'smoothness' }
    },
  };

  // Initial transition instance
  const initialTransition: TransitionInstance = {
    id: 'test-transition',
    type: TransitionType.Fade,
    duration: 1000,
    definition: sampleTransition,
    params: {
      progress: 0,
      smoothness: 0.5,
    },
    gpuPreviewEnabled: true,
    progress: 0,
    clipAId: 'clipA',
    clipBId: 'clipB',
    startTime: 0,
    isActive: true
  };

  describe('Initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useTransition(initialTransition));

      expect(result.current.isRendering).toBe(false);
      expect(result.current.renderProgress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.previewData).toBeNull();
    });

    it('sets up WebGL context correctly', () => {
      renderHook(() => useTransition(initialTransition));

      expect(mockGL.createProgram).toHaveBeenCalled();
      expect(mockGL.createShader).toHaveBeenCalledTimes(2); // Vertex and Fragment shaders
      expect(mockGL.linkProgram).toHaveBeenCalled();
    });
  });

  describe('Progress Updates', () => {
    it('updates progress smoothly', async () => {
      const { result } = renderHook(() => useTransition(initialTransition));

      await act(async () => {
        const renderPromise = result.current.generatePreview(0.5);
        jest.advanceTimersByTime(500); // Half duration
        await renderPromise;
      });

      expect(result.current.renderProgress).toBe(1);
      expect(mockGL.uniform1f).toHaveBeenCalledWith('location', expect.any(Number));
    });

    it('handles rapid progress updates', async () => {
      const { result } = renderHook(() => useTransition(initialTransition));

      await act(async () => {
        const promise1 = result.current.generatePreview(0.3);
        jest.advanceTimersByTime(16);
        const promise2 = result.current.generatePreview(0.6);
        jest.advanceTimersByTime(16);
        await Promise.all([promise1, promise2]);
      });

      expect(result.current.renderProgress).toBe(1);
      expect(mockGL.uniform1f).toHaveBeenCalledWith('location', expect.any(Number));
    });
  });

  describe('Parameter Updates', () => {
    it('updates transition parameters', async () => {
      const { result } = renderHook(() => useTransition(initialTransition));

      await act(async () => {
        result.current.updateParams({ smoothness: 0.8 });
        const renderPromise = result.current.generatePreview(0.5);
        jest.advanceTimersByTime(500);
        await renderPromise;
      });

      expect(mockGL.uniform1f).toHaveBeenCalledWith('location', expect.any(Number));
    });
  });

  describe('Error Handling', () => {
    it('handles shader compilation errors', () => {
      mockGL.getShaderParameter.mockReturnValueOnce(false);
      mockGL.getShaderInfoLog.mockReturnValueOnce('Shader error');

      const { result } = renderHook(() => useTransition(initialTransition));

      expect(result.current.error).toMatch(/Shader error/);
    });

    it('handles program linking errors', () => {
      mockGL.getProgramParameter.mockReturnValueOnce(false);
      mockGL.getProgramInfoLog.mockReturnValueOnce('Linking error');

      const { result } = renderHook(() => useTransition(initialTransition));

      expect(result.current.error).toMatch(/Linking error/);
    });

    it('handles WebGL context loss', async () => {
      const { result } = renderHook(() => useTransition(initialTransition));

      await act(async () => {
        const contextLostEvent = new Event('webglcontextlost');
        sharedCanvas.dispatchEvent(contextLostEvent);
        jest.advanceTimersByTime(16);
        await Promise.resolve();
      });

      expect(result.current.error).toMatch(/WebGL context lost/);
    });
  });

  describe('WebGL Context Management', () => {
    it('reuses WebGL context for subsequent renders', async () => {
      const { result } = renderHook(() => useTransition(initialTransition));

      // First render
      await act(async () => {
        const renderPromise = result.current.generatePreview(0.3);
        jest.advanceTimersByTime(48);
        await renderPromise;
      });

      // Second render
      await act(async () => {
        const renderPromise = result.current.generatePreview(0.6);
        jest.advanceTimersByTime(48);
        await renderPromise;
      });

      expect(sharedCanvas.getContext).toHaveBeenCalledTimes(2);
      expect(mockGL.createProgram).toHaveBeenCalledTimes(1);
    });

    it('cleans up WebGL resources on unmount', () => {
      const deleteProgram = jest.fn();
      const deleteShader = jest.fn();
      const deleteTexture = jest.fn();
      const deleteFramebuffer = jest.fn();

      Object.assign(mockGL, {
        deleteProgram,
        deleteShader,
        deleteTexture,
        deleteFramebuffer
      });

      const { unmount } = renderHook(() => useTransition(initialTransition));

      unmount();

      expect(deleteProgram).toHaveBeenCalled();
      expect(deleteShader).toHaveBeenCalled();
      expect(deleteTexture).toHaveBeenCalled();
      expect(deleteFramebuffer).toHaveBeenCalled();
    });
  });
});
