import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../useTransition';
import { TransitionInstance, TransitionDefinition, TransitionType } from '../../types/transition';

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
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255;     // R
      pixels[i + 1] = 0;   // G
      pixels[i + 2] = 0;   // B
      pixels[i + 3] = 255; // A
    }
    return Promise.resolve();
  }),
};

// Mock canvas and WebGL context
beforeEach(() => {
  const mockCanvas = {
    getContext: jest.fn(() => mockGL),
    width: 0,
    height: 0,
  } as unknown as HTMLCanvasElement;
  
  jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
    if (tagName === 'canvas') return mockCanvas;
    return document.createElement(tagName);
  });

  global.requestAnimationFrame = (cb) => setTimeout(cb, 16);
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});


describe('useTransition Basic Tests', () => {
  const sampleTransition: TransitionDefinition = {
    name: 'test-fade',
    vertexShader: 'void main() { gl_Position = vec4(0.0, 0.0, 0.0, 1.0); }',
    fragmentShader: 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }',
    uniforms: {
      progress: { type: 'float', value: 0, defaultValue: 0, name: 'progress' },
    },
  };

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

  it('initializes with default parameters', () => {
    const { result } = renderHook(() => useTransition(initialTransition));
    expect(result.current.error).toBeNull();
    expect(result.current.isRendering).toBe(false);
    expect(result.current.renderProgress).toBe(0);
    expect(result.current.previewData).toBeNull();
  });

  it('updates parameters without triggering render', () => {
    const { result } = renderHook(() => useTransition(initialTransition));
    act(() => {
      result.current.updateParams({ progress: 0.5 });
    });
    jest.advanceTimersByTime(16);
    expect(result.current.isRendering).toBe(false);
    expect(result.current.previewData?.params?.progress).toBeUndefined();
  });

  describe('Render States', () => {
    // Set longer timeout just for render tests
    jest.setTimeout(60000);

    it('transitions through render states correctly', async () => {
      const { result } = renderHook(() => useTransition(initialTransition));
      
      // Update params first
      act(() => {
        result.current.updateParams({ progress: 0.5 });
      });

      // Let params update flush
      await act(async () => {
        jest.advanceTimersByTime(16);
        await Promise.resolve();
      });

      // Start render and wait for completion
      await act(async () => {
        const renderPromise = result.current.generatePreview(0.5) as Promise<void>;
        
        // Advance time in smaller increments
        for (let i = 0; i < 10; i++) {
          jest.advanceTimersByTime(16);
          await Promise.resolve();
        }
        
        await renderPromise;
        
        // Let final state updates flush
        jest.runOnlyPendingTimers();
        await Promise.resolve();
      });

      // Verify final state
      expect(result.current.isRendering).toBe(false);
      expect(result.current.renderProgress).toBe(1);
      expect(result.current.previewData?.params?.progress).toBe(0.5);
    });
  });
});
