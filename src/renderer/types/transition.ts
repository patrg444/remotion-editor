export enum TransitionType {
  Dissolve = 'dissolve',
  Crossfade = 'crossfade',
  Fade = 'fade',
  Wipe = 'wipe',
  Slide = 'slide',
  Zoom = 'zoom',
  Push = 'push'
}

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  params?: Record<string, any>;
  clipAId: string;
  clipBId: string;
  progress?: number;
  startTime?: number;
  endTime?: number;
  gpuPreviewEnabled?: boolean;
  isActive?: boolean;
}

export interface TransitionParams {
  direction?: 'left' | 'right' | 'up' | 'down';
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  intensity?: number;
  duration?: number;
  type?: TransitionType;
}

export interface UniformValue {
  type: 'float' | 'sampler2D' | 'vec2';
  value: number | [number, number] | WebGLTexture | null;
  defaultValue: number | [number, number] | WebGLTexture | null;
  name: string;
  min?: number | [number, number];
  max?: number | [number, number];
  step?: number;
  width?: number;
  height?: number;
  format?: number;
  data?: Uint8ClampedArray;
  colorSpace?: string;
}

export interface TransitionShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    [key: string]: UniformValue;
  };
}

export interface TransitionFrameData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: PredefinedColorSpace;
}

export interface TransitionClipData {
  texture: WebGLTexture;
  width: number;
  height: number;
  data?: Uint8ClampedArray;
  colorSpace?: PredefinedColorSpace;
}

export interface TransitionPreviewData {
  fromFrame?: TransitionFrameData;
  toFrame?: TransitionFrameData;
  clipA: TransitionClipData;
  clipB: TransitionClipData;
  progress: number;
  params?: Record<string, any>;
}

export interface TransitionRenderOptions {
  width: number;
  height: number;
  quality?: 'preview' | 'full';
  gpuPreviewEnabled?: boolean;
}

export interface TransitionInstance extends Transition {
  progress: number;
  startTime: number;
  endTime: number;
  gpuPreviewEnabled: boolean;
  definition: TransitionDefinition;
}

export type PredefinedColorSpace = 'srgb' | 'display-p3';

export interface TransitionDefinition {
  name: string;
  type: TransitionType;
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    [key: string]: UniformValue;
  };
  defaultParams?: TransitionParams;
}

export const createFloat = (
  name: string,
  defaultValue: number = 0,
  min?: number | undefined,
  max?: number | undefined,
  step?: number | undefined
): UniformValue => ({
  type: 'float',
  value: defaultValue,
  defaultValue,
  name,
  min: typeof min === 'number' ? min : undefined,
  max: typeof max === 'number' ? max : undefined,
  step: typeof step === 'number' ? step : undefined
});

export const createSampler2D = (
  name: string,
  defaultValue?: WebGLTexture | null,
  width?: number,
  height?: number,
  format?: number
): UniformValue => ({
  type: 'sampler2D',
  value: defaultValue ?? null,
  defaultValue: defaultValue ?? null,
  name,
  width,
  height,
  format
});

export const createVec2 = (
  name: string,
  defaultValue: [number, number] = [0, 0],
  min?: [number, number] | undefined,
  max?: [number, number] | undefined
): UniformValue => {
  // Ensure defaultValue is a valid number array
  const validDefaultValue: [number, number] = Array.isArray(defaultValue) && defaultValue.length === 2 && 
    defaultValue.every(v => typeof v === 'number') ? defaultValue : [0, 0];

  // Validate min/max if provided
  const validMin = Array.isArray(min) && min.length === 2 && min.every(v => typeof v === 'number') ? min : undefined;
  const validMax = Array.isArray(max) && max.length === 2 && max.every(v => typeof v === 'number') ? max : undefined;

  return {
    type: 'vec2',
    value: validDefaultValue,
    defaultValue: validDefaultValue,
    name,
    min: validMin,
    max: validMax
  };
};

export const getUniformType = (uniform: UniformValue): string => {
  switch (uniform.type) {
    case 'float':
      return '1f';
    case 'sampler2D':
      return '1i';
    case 'vec2':
      return '2fv';
    default:
      throw new Error(`Unknown uniform type: ${uniform.type}`);
  }
};
