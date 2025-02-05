import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../useTransition';
import { TransitionInstance, TransitionDefinition, TransitionType } from '../../types/transition';
import { Logger } from '../../../main/utils/logger';

const testLogger = new Logger('TransitionErrorTest');

describe('useTransition - Error Handling', () => {
  // Simplified transition for testing
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

  beforeEach(() => {
    testLogger.info('Setting up test environment');
    
    // Mock requestAnimationFrame to use setTimeout
    global.requestAnimationFrame = (cb) => {
      testLogger.debug('Mock requestAnimationFrame called');
      return setTimeout(cb, 16);
    };
    
    jest.useFakeTimers();
  });

  afterEach(() => {
    testLogger.info('Cleaning up test environment');
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('WebGL Context', () => {
    // Set longer timeout for WebGL tests
    jest.setTimeout(60000);

    it('handles WebGL context creation failure', async () => {
      testLogger.info('Starting WebGL context failure test');

      // Mock canvas with broken WebGL context
      const mockCanvas = {
        getContext: jest.fn(() => null),
        width: 0,
        height: 0,
      } as unknown as HTMLCanvasElement;
      
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas;
        return document.createElement(tagName);
      });

      const { result } = renderHook(() => useTransition(initialTransition));

      // Try to render and wait for error
      await act(async () => {
        const renderPromise = result.current.generatePreview(0.5) as Promise<void>;
        
        // Advance time in smaller increments
        for (let i = 0; i < 5; i++) {
          jest.advanceTimersByTime(16);
          await Promise.resolve();
        }
        
        await renderPromise.catch(() => {
          // Expected to fail
        });
      });

      // Verify error state
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('WebGL2 not supported');
      expect(result.current.isRendering).toBe(false);
      expect(result.current.renderProgress).toBe(0);
    });
  });

  describe('Shader Compilation', () => {
    // Set longer timeout for shader tests
    jest.setTimeout(60000);

    it('handles shader compilation failure', async () => {
      testLogger.info('Starting shader compilation failure test');

      // Mock WebGL context with shader failure
      const mockGL = {
        VERTEX_SHADER: 'VERTEX_SHADER',
        FRAGMENT_SHADER: 'FRAGMENT_SHADER',
        RGBA: 'RGBA',
        UNSIGNED_BYTE: 'UNSIGNED_BYTE',
        createShader: jest.fn(() => null),
        shaderSource: jest.fn(),
        compileShader: jest.fn(),
        createProgram: jest.fn(() => 'program'),
        attachShader: jest.fn(),
        linkProgram: jest.fn(),
        useProgram: jest.fn(),
        getUniformLocation: jest.fn(() => 'location'),
      };

      const mockCanvas = {
        getContext: jest.fn(() => mockGL),
        width: 0,
        height: 0,
      } as unknown as HTMLCanvasElement;
      
      jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
        if (tagName === 'canvas') return mockCanvas;
        return document.createElement(tagName);
      });

      const { result } = renderHook(() => useTransition(initialTransition));

      // Try to render and wait for error
      await act(async () => {
        const renderPromise = result.current.generatePreview(0.5) as Promise<void>;
        
        // Advance time in smaller increments
        for (let i = 0; i < 5; i++) {
          jest.advanceTimersByTime(16);
          await Promise.resolve();
        }
        
        await renderPromise.catch(() => {
          // Expected to fail
        });
      });

      // Verify error state
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Failed to create shaders');
      expect(result.current.isRendering).toBe(false);
      expect(result.current.renderProgress).toBe(0);
    });
  });
});
