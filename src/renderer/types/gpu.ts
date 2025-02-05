export interface GPUProgramOptions {
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    [key: string]: {
      type: 'float' | 'vec2' | 'vec3' | 'vec4' | 'sampler2D' | 'mat4';
      value: any;
    };
  };
  attributes?: {
    [key: string]: {
      size: number;
      type: number;
      normalized?: boolean;
      stride?: number;
      offset?: number;
    };
  };
  blendMode?: {
    srcFactor: string;
    dstFactor: string;
    equation: string;
  };
}

export interface GPUProgram {
  id: string;
  program: WebGLProgram;
  uniforms: { [key: string]: WebGLUniformLocation };
  attributes: { [key: string]: number };
  options: GPUProgramOptions;
  use: () => void;
  setUniform: (name: string, value: any) => void;
  dispose: () => void;
}

export interface GPUTexture {
  id: string;
  texture: WebGLTexture;
  width: number;
  height: number;
  format: number;
  type: number;
  dispose: () => void;
}

export interface GPUFramebuffer {
  id: string;
  framebuffer: WebGLFramebuffer;
  texture: GPUTexture;
  width: number;
  height: number;
  dispose: () => void;
}

export interface GPUBuffer {
  id: string;
  buffer: WebGLBuffer;
  target: number;
  size: number;
  usage: number;
  data?: ArrayBuffer;
  dispose: () => void;
}

export interface GPUStats {
  drawCalls: number;
  textureCount: number;
  bufferCount: number;
  framebufferCount: number;
  programCount: number;
  memoryUsage: number;
}

export type GPUResourceType = 
  | 'program'
  | 'texture'
  | 'framebuffer'
  | 'buffer'
  | 'renderbuffer';

export interface GPUResource {
  id: string;
  type: GPUResourceType;
  dispose: () => void;
}

export type GPUFeature = 
  | 'gpu-effects'
  | 'hardware-encoding'
  | 'hardware-decoding'
  | 'float-textures'
  | 'half-float-textures'
  | 'depth-textures'
  | 'vertex-array-objects'
  | 'instanced-arrays'
  | 'multi-draw'
  | 'transform-feedback'
  | 'compute-shaders';

export interface GPUCapabilities {
  maxTextureSize: number;
  maxTextureUnits: number;
  maxVertexAttribs: number;
  maxVaryingVectors: number;
  maxVertexUniformVectors: number;
  maxFragmentUniformVectors: number;
  floatTextureSupport: boolean;
  halfFloatTextureSupport: boolean;
  depthTextureSupport: boolean;
  vertexArrayObjectSupport: boolean;
  instancedArraysSupport: boolean;
  hardwareEncoding: boolean;
  hardwareDecoding: boolean;
  availableMemory: number;
  supportedFeatures: GPUFeature[];
}

export interface GPUPerformanceStats {
  fps: number;
  frameTime: number;
  gpuTime: number;
  cpuTime: number;
  drawCalls: number;
  triangles: number;
  vertices: number;
  buffers: number;
  textures: number;
  shaders: number;
  utilization: number;
  encoderUsage: number;
  decoderUsage?: number;
  temperature?: number;
  powerUsage?: number;
}

export interface GPUMemoryInfo {
  total: number;
  used: number;
  available: number;
  free: number;
  buffers: number;
  textures: number;
  renderbuffers: number;
  other: number;
  dedicated?: number;
  shared?: number;
}

export interface GPUContextOptions {
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  antialias?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: 'default' | 'high-performance' | 'low-power';
}

export type GPUBlendFactor =
  | 'ZERO'
  | 'ONE'
  | 'SRC_COLOR'
  | 'ONE_MINUS_SRC_COLOR'
  | 'DST_COLOR'
  | 'ONE_MINUS_DST_COLOR'
  | 'SRC_ALPHA'
  | 'ONE_MINUS_SRC_ALPHA'
  | 'DST_ALPHA'
  | 'ONE_MINUS_DST_ALPHA'
  | 'CONSTANT_COLOR'
  | 'ONE_MINUS_CONSTANT_COLOR'
  | 'CONSTANT_ALPHA'
  | 'ONE_MINUS_CONSTANT_ALPHA'
  | 'SRC_ALPHA_SATURATE';

export type GPUBlendEquation =
  | 'FUNC_ADD'
  | 'FUNC_SUBTRACT'
  | 'FUNC_REVERSE_SUBTRACT'
  | 'MIN'
  | 'MAX';

export interface GPUBlendMode {
  srcFactor: GPUBlendFactor;
  dstFactor: GPUBlendFactor;
  equation: GPUBlendEquation;
}
