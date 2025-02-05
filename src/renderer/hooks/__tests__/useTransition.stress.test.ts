import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../useTransition';
import { TransitionInstance, TransitionDefinition, UniformDefinition, TransitionType } from '../../types/transition';

describe('useTransition Stress Tests', () => {
  const mockGL = {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    RGBA: 6408,
    UNSIGNED_BYTE: 5121,
    createShader: jest.fn(),
    shaderSource: jest.fn(),
    compileShader: jest.fn(),
    getShaderParameter: jest.fn(() => true),
    createProgram: jest.fn(),
    attachShader: jest.fn(),
    linkProgram: jest.fn(),
    getProgramParameter: jest.fn(() => true),
    useProgram: jest.fn(),
    getUniformLocation: jest.fn(),
    uniform1f: jest.fn(),
    readPixels: jest.fn(() => new Uint8Array(8294400)),
    getError: jest.fn(() => 0),
    deleteProgram: jest.fn(),
  };

  const mockCanvas = {
    getContext: jest.fn(() => mockGL),
    width: 1920,
    height: 1080,
  };

  const mockProgressUniform: UniformDefinition = {
    type: 'float',
    value: 0,
    defaultValue: 0,
    min: 0,
    max: 1,
    name: 'progress',
    description: 'Transition progress',
  };

  const mockTransitionDefinition: TransitionDefinition = {
    name: 'test-fade',
    vertexShader: 'vertex shader source',
    fragmentShader: 'fragment shader source',
    uniforms: {
      progress: mockProgressUniform,
    },
    transitionType: TransitionType.Fade,
  };

  const createMockTransition = (id: string): TransitionInstance => ({
    id,
    type: TransitionType.Fade,
    duration: 1,
    definition: mockTransitionDefinition,
    progress: 0,
    params: { progress: 0 },
    gpuPreviewEnabled: true,
    clipAId: `clipA-${id}`,
    clipBId: `clipB-${id}`,
    startTime: 0,
    isActive: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.document.createElement = jest.fn(() => mockCanvas as any);
  });

  describe('Memory Management', () => {
    // Increase timeout for memory-intensive tests
    jest.setTimeout(30000);

    it('handles rapid transition creation and disposal', async () => {
      const transitions = Array.from({ length: 100 }, (_, i) => 
        createMockTransition(`transition-${i}`)
      );

      for (const transition of transitions) {
        const { result } = renderHook(() => useTransition(transition));

        await act(async () => {
          await result.current.generatePreview(0);
        });
      }

      expect(mockGL.createProgram).toHaveBeenCalledTimes(100);
    });

    it('handles concurrent transitions', async () => {
      const transitions = Array.from({ length: 10 }, (_, i) => 
        createMockTransition(`transition-${i}`)
      );

      await act(async () => {
        const renderPromises = transitions.map(async (transition) => {
          const { result } = renderHook(() => useTransition(transition));
          return result.current.generatePreview(0);
        });

        await Promise.all(renderPromises);
      });

      expect(mockGL.createProgram).toHaveBeenCalledTimes(10);
    });
  });

  describe('Performance', () => {
    // Increase timeout for performance tests
    jest.setTimeout(30000);

    it('handles high-resolution transitions', async () => {
      // Update canvas size to 4K
      const mockCanvas4K = {
        ...mockCanvas,
        width: 3840,
        height: 2160,
      };

      global.document.createElement = jest.fn(() => mockCanvas4K as any);

      const { result } = renderHook(() => useTransition(createMockTransition('high-res')));

      await act(async () => {
        await result.current.generatePreview(0);
      });

      expect(mockGL.readPixels).toHaveBeenCalledWith(
        0,
        0,
        3840,
        2160,
        mockGL.RGBA,
        mockGL.UNSIGNED_BYTE,
        expect.any(Uint8Array)
      );
    });

    it('handles rapid parameter updates', async () => {
      const { result } = renderHook(() => useTransition(createMockTransition('rapid-updates')));

      await act(async () => {
        // Update progress rapidly
        for (let i = 0; i <= 60; i++) {
          result.current.updateParams({ progress: i / 60 });
          await result.current.generatePreview(i / 60);
        }
      });

      expect(mockGL.uniform1f).toHaveBeenCalledTimes(61); // 0 to 60 inclusive
    });
  });

  describe('Error Handling', () => {
    it('handles WebGL context loss', async () => {
      const mockLostContext = {
        ...mockGL,
        isContextLost: jest.fn(() => true),
      };

      const mockCanvasWithLostContext = {
        ...mockCanvas,
        getContext: jest.fn(() => mockLostContext),
      };

      global.document.createElement = jest.fn(() => mockCanvasWithLostContext as any);

      const { result } = renderHook(() => useTransition(createMockTransition('lost-context')));

      await act(async () => {
        await result.current.generatePreview(0);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('handles shader compilation errors', async () => {
      const mockGLWithShaderError = {
        ...mockGL,
        getShaderParameter: jest.fn(() => false),
        getShaderInfoLog: jest.fn(() => 'Shader compilation failed'),
      };

      const mockCanvasWithShaderError = {
        ...mockCanvas,
        getContext: jest.fn(() => mockGLWithShaderError),
      };

      global.document.createElement = jest.fn(() => mockCanvasWithShaderError as any);

      const { result } = renderHook(() => useTransition(createMockTransition('shader-error')));

      await act(async () => {
        await result.current.generatePreview(0);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error?.message).toContain('Failed to create shaders');
    });
  });
});
