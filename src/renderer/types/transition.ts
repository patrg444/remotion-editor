export enum TransitionType {
  Dissolve = 'dissolve',
  Fade = 'fade',
  Wipe = 'wipe',
  Slide = 'slide',
  Crossfade = 'crossfade',
  Zoom = 'zoom',
  Push = 'push'
}

export interface TransitionParams {
  direction?: 'left' | 'right' | 'up' | 'down';
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  [key: string]: any;
}

export interface Transition {
  id: string;
  type: TransitionType;
  duration: number;
  params?: TransitionParams;
  clipAId?: string;
  clipBId?: string;
  startTime?: number;
  definition?: TransitionDefinition;
  gpuPreviewEnabled?: boolean;
  progress?: number;
  isActive?: boolean;
}

export interface TransitionPreset {
  id: string;
  name: string;
  type: TransitionType;
  defaultDuration: number;
  defaultParams?: TransitionParams;
  thumbnail?: string;
}

export interface TransitionInstance extends Omit<Transition, 'clipAId' | 'clipBId' | 'startTime' | 'progress' | 'isActive'> {
  clipAId: string;
  clipBId: string;
  startTime: number;
  progress: number;
  isActive: boolean;
}

// Base interface for frame data
export interface TransitionFrameData {
  data: Uint8ClampedArray;
  colorSpace: PredefinedColorSpace;
  width: number;
  height: number;
}

// Extended interface for frames that may have additional properties
export interface TransitionFrame extends TransitionFrameData {
  texture?: WebGLTexture;
  imageData?: ImageData;
}

export interface TransitionPreviewData {
  clipA: TransitionFrameData;
  clipB: TransitionFrameData;
  fromFrame?: TransitionFrameData;
  toFrame?: TransitionFrameData;
  progress: number;
  clipATexture?: WebGLTexture;
  clipBTexture?: WebGLTexture;
  params?: TransitionParams;
}

export interface TransitionRenderOptions {
  width: number;
  height: number;
  useGPU?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export type UniformValue = number | number[] | Float32Array | WebGLTexture | null;

export type UniformType = 'float' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D' | 'mat4';

export interface UniformDefinition {
  type: UniformType;
  value: UniformValue;
  defaultValue: UniformValue;
  min?: number;
  max?: number;
  description?: string;
  name: string;
}

export interface ShaderUniforms {
  [key: string]: UniformDefinition;
}

export interface TransitionShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: ShaderUniforms;
}

export interface TransitionDefinition {
  name: string;
  description?: string;
  vertexShader: string;
  fragmentShader: string;
  uniforms: ShaderUniforms;
  defaultParams?: TransitionParams;
  shader?: TransitionShader;
  transitionType?: TransitionType;
  type?: TransitionType; // For backward compatibility
}

// Helper function to convert ImageData to TransitionFrame
export const createTransitionFrame = (imageData: ImageData): TransitionFrame => ({
  width: imageData.width,
  height: imageData.height,
  data: imageData.data,
  colorSpace: imageData.colorSpace || 'srgb',
  imageData,
});

// Helper function to create a basic frame data object
export const createFrameData = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  colorSpace: PredefinedColorSpace = 'srgb'
): TransitionFrameData => ({
  data,
  width,
  height,
  colorSpace,
});

// Helper functions for creating uniform definitions
export const createFloat = (name: string, value: number, min = 0, max = 1, description?: string): UniformDefinition => ({
  type: 'float',
  value,
  defaultValue: value,
  min,
  max,
  name,
  description,
});

export const createVec2 = (name: string, value: [number, number], description?: string): UniformDefinition => ({
  type: 'vec2',
  value,
  defaultValue: value,
  name,
  description,
});

export const createVec3 = (name: string, value: [number, number, number], description?: string): UniformDefinition => ({
  type: 'vec3',
  value,
  defaultValue: value,
  name,
  description,
});

export const createVec4 = (name: string, value: [number, number, number, number], description?: string): UniformDefinition => ({
  type: 'vec4',
  value,
  defaultValue: value,
  name,
  description,
});

export const createSampler2D = (name: string, description?: string): UniformDefinition => ({
  type: 'sampler2D',
  value: null,
  defaultValue: null,
  name,
  description,
});

export const createMat4 = (name: string, value: Float32Array, description?: string): UniformDefinition => ({
  type: 'mat4',
  value,
  defaultValue: value,
  name,
  description,
});

// Helper function to get uniform value
export const getUniformValue = (uniform: UniformDefinition): UniformValue => uniform.value;

// Helper function to get uniform type
export const getUniformType = (uniform: UniformDefinition): UniformType => uniform.type;

// Constants for transition types
export const TRANSITION_TYPES = {
  [TransitionType.Dissolve]: TransitionType.Dissolve,
  [TransitionType.Fade]: TransitionType.Fade,
  [TransitionType.Wipe]: TransitionType.Wipe,
  [TransitionType.Slide]: TransitionType.Slide,
  [TransitionType.Crossfade]: TransitionType.Crossfade,
  [TransitionType.Zoom]: TransitionType.Zoom,
  [TransitionType.Push]: TransitionType.Push,
};
