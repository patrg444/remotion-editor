import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../useTransition';
import { TransitionInstance, TransitionDefinition, TransitionType } from '../../types/transition';
import { Logger } from '../../../main/utils/logger';

const testLogger = new Logger('TransitionMultipleTest');

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
    testLogger.debug('Mock readPixels called', { width, height });
    // Fill pixels synchronously
    for (let i = 0; i < pixels.length; i += 4) {
      pixels[i] = 255;     // R
      pixels[i + 1] = 0;   // G
      pixels[i + 2] = 0;   // B
      pixels[i + 3] = 255; // A
    }
    return Promise.resolve();
  }),
};

describe('useTransition - Multiple Renders', () => {
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
    
    const mockCanvas = {
      getContext: jest.fn(() => mockGL),
      width: 0,
      height: 0,
    } as unknown as HTMLCanvasElement;
    
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      testLogger.debug('Mock createElement called', { tagName });
      if (tagName === 'canvas') return mockCanvas;
      return document.createElement(tagName);
    });

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

  describe('Sequential Renders', () => {
    // Set longer timeout for sequential render tests
    jest.setTimeout(60000);

    it('handles multiple sequential renders', async () => {
      testLogger.info('Starting multiple renders test');
      const { result } = renderHook(() => useTransition(initialTransition));

      // First render at progress 0
      testLogger.debug('Starting first render');
      await act(async () => {
        // Update params first
        result.current.updateParams({ progress: 0 });
        jest.advanceTimersByTime(16);
        await Promise.resolve();

        // Start render
        const renderPromise = result.current.generatePreview(0) as Promise<void>;
        
        // Advance time in smaller increments
        for (let i = 0; i < 10; i++) {
          jest.advanceTimersByTime(16);
          await Promise.resolve();
        }
        
        await renderPromise;
      });

      // Verify intermediate state
      expect(result.current.renderProgress).toBe(1);
      expect(result.current.isRendering).toBe(false);
      expect(result.current.previewData?.params?.progress).toBe(0);

      // Second render at progress 0.5
      testLogger.debug('Starting second render');
      await act(async () => {
        // Update params first
        result.current.updateParams({ progress: 0.5 });
        jest.advanceTimersByTime(16);
        await Promise.resolve();

        // Start render
        const renderPromise = result.current.generatePreview(0.5) as Promise<void>;
        
        // Advance time in smaller increments
        for (let i = 0; i < 10; i++) {
          jest.advanceTimersByTime(16);
          await Promise.resolve();
        }
        
        await renderPromise;
      });

      // Verify final state
      expect(result.current.renderProgress).toBe(1);
      expect(result.current.isRendering).toBe(false);
      expect(result.current.previewData?.params?.progress).toBe(0.5);
    });
  });

  describe('Rapid Renders', () => {
    // Set longer timeout for rapid render tests
    jest.setTimeout(60000);

    it('handles rapid sequential renders', async () => {
      testLogger.info('Starting rapid renders test');
      const { result } = renderHook(() => useTransition(initialTransition));

      // Start multiple renders in quick succession
      testLogger.debug('Starting multiple renders');
      await act(async () => {
        // Update params for first render
        result.current.updateParams({ progress: 0 });
        jest.advanceTimersByTime(16);
        await Promise.resolve();

        // Start first render
        const promise1 = result.current.generatePreview(0);

        // Update params for second render
        result.current.updateParams({ progress: 0.5 });
        jest.advanceTimersByTime(16);
        await Promise.resolve();

        // Start second render
        const promise2 = result.current.generatePreview(0.5);

        // Update params for final render
        result.current.updateParams({ progress: 1 });
        jest.advanceTimersByTime(16);
        await Promise.resolve();

        // Start final render
        const promise3 = result.current.generatePreview(1);

        // Advance time in smaller increments
        for (let i = 0; i < 20; i++) {
          jest.advanceTimersByTime(16);
          await Promise.resolve();
        }

        await Promise.all([promise1, promise2, promise3]);
      });

      // Only the last render should complete successfully
      expect(result.current.renderProgress).toBe(1);
      expect(result.current.isRendering).toBe(false);
      expect(result.current.previewData?.params?.progress).toBe(1);
      expect(result.current.error).toBeNull();
    });
  });
});
