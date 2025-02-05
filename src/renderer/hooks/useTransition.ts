import { useCallback, useReducer } from 'react';
import { TransitionInstance, TransitionPreviewData, TransitionParams, TransitionRenderOptions, getUniformType } from '../types/transition';
import { Logger } from '../../main/utils/logger';

const logger = new Logger('useTransition');

export function useTransition(initialTransition: TransitionInstance) {
  interface TransitionState {
    transition: TransitionInstance;
    previewData: TransitionPreviewData | null;
    isRendering: boolean;
    renderProgress: number;
    error: Error | null;
  }

  type TransitionAction = 
    | { type: 'START_RENDER' }
    | { type: 'COMPLETE_RENDER'; previewData: TransitionPreviewData }
    | { type: 'ERROR'; error: Error }
    | { type: 'RESET_PROGRESS' }
    | { type: 'UPDATE_PARAMS'; params: Partial<TransitionParams> }
    | { type: 'TOGGLE_GPU_PREVIEW' };

  const transitionReducer = (state: TransitionState, action: TransitionAction): TransitionState => {
    logger.debug(`Reducer: Processing action ${action.type}`, { 
      currentState: {
        isRendering: state.isRendering,
        renderProgress: state.renderProgress,
        hasError: !!state.error,
        params: state.transition.params,
        gpuPreviewEnabled: state.transition.gpuPreviewEnabled
      }
    });

    let newState: TransitionState;
    switch (action.type) {
      case 'START_RENDER':
        newState = {
          ...state,
          error: null,
          isRendering: true,
          renderProgress: 0
        };
        logger.info('Starting new render', { 
          params: newState.transition.params,
          gpuEnabled: newState.transition.gpuPreviewEnabled
        });
        break;

      case 'COMPLETE_RENDER':
        newState = {
          ...state,
          previewData: action.previewData,
          renderProgress: 1,
          isRendering: false
        };
        logger.info('Render completed', {
          previewDataSize: action.previewData?.clipA.data.length,
          finalParams: action.previewData?.params
        });
        break;

      case 'ERROR':
        newState = {
          ...state,
          error: action.error,
          renderProgress: 0,
          isRendering: false
        };
        logger.error('Render failed', {
          error: action.error,
          state: {
            params: state.transition.params,
            gpuEnabled: state.transition.gpuPreviewEnabled
          }
        });
        break;

      case 'RESET_PROGRESS':
        newState = {
          ...state,
          renderProgress: 0
        };
        logger.debug('Progress reset');
        break;

      case 'UPDATE_PARAMS':
        newState = {
          ...state,
          transition: {
            ...state.transition,
            params: { ...state.transition.params, ...action.params },
          }
        };
        logger.info('Parameters updated', {
          oldParams: state.transition.params,
          newParams: action.params,
          finalParams: newState.transition.params
        });
        break;

      case 'TOGGLE_GPU_PREVIEW':
        newState = {
          ...state,
          transition: {
            ...state.transition,
            gpuPreviewEnabled: !state.transition.gpuPreviewEnabled,
          }
        };
        logger.info('GPU preview toggled', {
          oldValue: state.transition.gpuPreviewEnabled,
          newValue: newState.transition.gpuPreviewEnabled
        });
        break;

      default:
        newState = state;
        logger.warn('Unknown action type', { action });
    }

    logger.debug('State updated', {
      action: action.type,
      changes: {
        isRendering: newState.isRendering !== state.isRendering,
        renderProgress: newState.renderProgress !== state.renderProgress,
        hasError: !!newState.error !== !!state.error,
        paramsChanged: newState.transition.params !== state.transition.params,
        gpuPreviewChanged: newState.transition.gpuPreviewEnabled !== state.transition.gpuPreviewEnabled
      }
    });

    return newState;
  };

  const [state, dispatch] = useReducer(transitionReducer, {
    transition: initialTransition,
    previewData: null,
    isRendering: false,
    renderProgress: 0,
    error: null
  });

  const updateParams = useCallback((params: Partial<TransitionParams>) => {
    dispatch({ type: 'UPDATE_PARAMS', params });
  }, []);

  const toggleGPUPreview = useCallback(() => {
    dispatch({ type: 'TOGGLE_GPU_PREVIEW' });
  }, []);

  const renderTransition = useCallback(async (options: TransitionRenderOptions = {
    width: 1920,
    height: 1080,
    quality: 'medium',
    useGPU: true,
  }) => {
    if (!state.transition.definition) return;

    try {
      logger.info(`Starting transition render with options:`, options);
      logger.debug(`Current transition state:`, {
        definition: state.transition.definition.name,
        params: state.transition.params,
        progress: state.transition.progress
      });

      // Start render
      dispatch({ type: 'START_RENDER' });

      // Wait for state update
      await new Promise(resolve => requestAnimationFrame(resolve));

      const width = options.width || 1920;
      const height = options.height || 1080;

      logger.debug('Setting up WebGL context', { width, height });
      // Create WebGL context and set up shaders
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const gl = canvas.getContext('webgl2');
      if (!gl) {
        logger.error('WebGL2 not supported by browser');
        throw new Error('WebGL2 not supported');
      }
      logger.debug('WebGL2 context created successfully');

      logger.debug('Creating shaders', {
        vertexShaderLength: state.transition.definition.vertexShader.length,
        fragmentShaderLength: state.transition.definition.fragmentShader.length
      });
      // Set up vertex and fragment shaders
      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      if (!vertexShader || !fragmentShader) {
        logger.error('Failed to create shader objects');
        throw new Error('Failed to create shaders');
      }

      gl.shaderSource(vertexShader, state.transition.definition.vertexShader);
      gl.shaderSource(fragmentShader, state.transition.definition.fragmentShader);
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      logger.debug('Creating shader program');
      // Create shader program
      const program = gl.createProgram();
      if (!program) {
        logger.error('Failed to create WebGL program object');
        throw new Error('Failed to create shader program');
      }

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      logger.debug('Setting up uniforms with params:', state.transition.params);
      // Set up uniforms using params instead of definition values
      Object.entries(state.transition.definition.uniforms).forEach(([name, uniform]) => {
        const location = gl.getUniformLocation(program, name);
        if (location) {
          // Use param value if available, fall back to default value
          const value = state.transition.params?.[name] ?? uniform.defaultValue;
          logger.debug(`Setting uniform ${name}:`, { value, type: uniform.type });
          const type = getUniformType(uniform);
          
          switch (type) {
            case 'float':
              gl.uniform1f(location, value as number);
              break;
            case 'vec2':
              gl.uniform2fv(location, value as number[]);
              break;
            case 'vec3':
              gl.uniform3fv(location, value as number[]);
              break;
            case 'vec4':
              gl.uniform4fv(location, value as number[]);
              break;
            case 'mat4':
              gl.uniformMatrix4fv(location, false, value as Float32Array);
              break;
            case 'sampler2D':
              // Handle texture uniforms
              break;
          }
        }
      });

      logger.debug('Reading pixels from WebGL context', {
        width,
        height,
        format: 'RGBA',
        type: 'UNSIGNED_BYTE',
        expectedSize: width * height * 4
      });
      // Render to texture
      const pixels = new Uint8ClampedArray(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      logger.debug('Creating ImageData', {
        pixelsLength: pixels.length,
        nonZeroPixels: pixels.filter(x => x !== 0).length
      });
      const imageData = new ImageData(pixels, width, height, { colorSpace: 'srgb' });

      logger.info('Render completed successfully');
      // Complete render
      dispatch({
        type: 'COMPLETE_RENDER',
        previewData: {
          clipA: {
            data: imageData.data,
            width,
            height,
            colorSpace: 'srgb',
          },
          clipB: {
            data: imageData.data,
            width,
            height,
            colorSpace: 'srgb',
          },
          progress: state.transition.progress,
          params: state.transition.params,
        }
      });

      // Wait for state update
      await new Promise(resolve => requestAnimationFrame(resolve));
    } catch (err) {
      logger.error('Render failed:', err);
      // Handle error
      dispatch({
        type: 'ERROR',
        error: err instanceof Error ? err : new Error('Unknown error')
      });

      // Wait for state update
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
  }, [state.transition]);

  const generatePreview = useCallback(async (time: number) => {
    if (!state.transition.definition) return;
    dispatch({ type: 'RESET_PROGRESS' });
    await renderTransition();
  }, [state.transition, renderTransition]);

  return {
    previewData: state.previewData,
    isRendering: state.isRendering,
    renderProgress: state.renderProgress,
    error: state.error,
    generatePreview,
    updateParams,
    toggleGPUPreview,
  };
}
