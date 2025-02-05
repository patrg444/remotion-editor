import { GPUProgram } from './gpu';
import { KeyframeTrack } from './keyframe';

export type BlendMode = 
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export interface LayerParameters {
  opacity: number;
  blendMode: BlendMode;
  position: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  anchor: { x: number; y: number };
  crop?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  mask?: {
    type: 'alpha' | 'luma' | 'custom';
    source?: string;
    invert: boolean;
    feather: number;
  };
  effects?: LayerEffect[];
}

export interface LayerEffect {
  id: string;
  type: string;
  enabled: boolean;
  parameters: Record<string, any>;
  keyframeTracks?: {
    [key: string]: KeyframeTrack<any>;
  };
}

export interface LayerKeyframeData {
  opacity?: number;
  position?: { x: number; y: number };
  scale?: { x: number; y: number };
  rotation?: number;
  anchor?: { x: number; y: number };
  [key: string]: any;
}

export interface CompositeLayer {
  id: string;
  trackId: string;
  clipId: string;
  parameters: LayerParameters;
  keyframeTracks: {
    [key: string]: KeyframeTrack<LayerKeyframeData>;
  };
  gpuProgram?: GPUProgram;
  renderOrder: number;
  isEnabled: boolean;
  groupId?: string;
  isNested?: boolean;
  nestedCompositionId?: string;
}

export interface TrackGroup {
  id: string;
  name: string;
  trackIds: string[];
  isCollapsed: boolean;
  blendMode: BlendMode;
  opacity: number;
  isSolo: boolean;
  isMuted: boolean;
}

export interface CompositeOperation {
  type: 'add' | 'update' | 'delete' | 'reorder' | 'group' | 'ungroup';
  layerId: string;
  trackId?: string;
  clipId?: string;
  groupId?: string;
  parameters?: Partial<LayerParameters>;
  keyframeUpdates?: {
    trackId: string;
    keyframes: LayerKeyframeData[];
  }[];
  before: Partial<CompositeLayer | TrackGroup>;
  after: Partial<CompositeLayer | TrackGroup>;
}

export const createCompositeLayer = (
  trackId: string,
  clipId: string,
  renderOrder: number,
  groupId?: string
): CompositeLayer => ({
  id: `layer-${Date.now()}`,
  trackId,
  clipId,
  parameters: {
    opacity: 1,
    blendMode: 'normal',
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
    anchor: { x: 0.5, y: 0.5 },
    effects: []
  },
  keyframeTracks: {},
  renderOrder,
  isEnabled: true,
  groupId
});

export const createTrackGroup = (
  name: string,
  trackIds: string[]
): TrackGroup => ({
  id: `group-${Date.now()}`,
  name,
  trackIds,
  isCollapsed: false,
  blendMode: 'normal',
  opacity: 1,
  isSolo: false,
  isMuted: false
});

export const createCompositeOperation = (
  type: CompositeOperation['type'],
  layerId: string,
  before: Partial<CompositeLayer | TrackGroup>,
  after: Partial<CompositeLayer | TrackGroup>
): CompositeOperation => ({
  type,
  layerId,
  before,
  after
});

export const isLayerKeyframeable = (
  paramName: string
): boolean => {
  const keyframeableParams = new Set([
    'opacity',
    'position',
    'scale',
    'rotation',
    'anchor'
  ]);
  return keyframeableParams.has(paramName);
};

export const BLEND_MODE_FUNCTIONS: Record<BlendMode, string> = {
  normal: `
    vec4 blend(vec4 base, vec4 blend) {
      return blend;
    }
  `,
  multiply: `
    vec4 blend(vec4 base, vec4 blend) {
      return base * blend;
    }
  `,
  screen: `
    vec4 blend(vec4 base, vec4 blend) {
      return 1.0 - (1.0 - base) * (1.0 - blend);
    }
  `,
  overlay: `
    float overlayComponent(float base, float blend) {
      return base < 0.5 
        ? 2.0 * base * blend
        : 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
    }
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        overlayComponent(base.r, blend.r),
        overlayComponent(base.g, blend.g),
        overlayComponent(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  darken: `
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        min(base.r, blend.r),
        min(base.g, blend.g),
        min(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  lighten: `
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        max(base.r, blend.r),
        max(base.g, blend.g),
        max(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  'color-dodge': `
    float colorDodgeComponent(float base, float blend) {
      return blend == 1.0 ? blend : min(1.0, base / (1.0 - blend));
    }
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        colorDodgeComponent(base.r, blend.r),
        colorDodgeComponent(base.g, blend.g),
        colorDodgeComponent(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  'color-burn': `
    float colorBurnComponent(float base, float blend) {
      return blend == 0.0 ? blend : 1.0 - min(1.0, (1.0 - base) / blend);
    }
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        colorBurnComponent(base.r, blend.r),
        colorBurnComponent(base.g, blend.g),
        colorBurnComponent(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  'hard-light': `
    float hardLightComponent(float base, float blend) {
      return blend < 0.5
        ? 2.0 * base * blend
        : 1.0 - 2.0 * (1.0 - base) * (1.0 - blend);
    }
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        hardLightComponent(base.r, blend.r),
        hardLightComponent(base.g, blend.g),
        hardLightComponent(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  'soft-light': `
    float softLightComponent(float base, float blend) {
      return blend < 0.5
        ? base - (1.0 - 2.0 * blend) * base * (1.0 - base)
        : base + (2.0 * blend - 1.0) * (sqrt(base) - base);
    }
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        softLightComponent(base.r, blend.r),
        softLightComponent(base.g, blend.g),
        softLightComponent(base.b, blend.b),
        base.a * blend.a
      );
    }
  `,
  difference: `
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        abs(base.r - blend.r),
        abs(base.g - blend.g),
        abs(base.b - blend.b),
        base.a * blend.a
      );
    }
  `,
  exclusion: `
    vec4 blend(vec4 base, vec4 blend) {
      return vec4(
        base.r + blend.r - 2.0 * base.r * blend.r,
        base.g + blend.g - 2.0 * base.g * blend.g,
        base.b + blend.b - 2.0 * base.b * blend.b,
        base.a * blend.a
      );
    }
  `,
  hue: `
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    vec4 blend(vec4 base, vec4 blend) {
      vec3 baseHSV = rgb2hsv(base.rgb);
      vec3 blendHSV = rgb2hsv(blend.rgb);
      return vec4(hsv2rgb(vec3(blendHSV.x, baseHSV.y, baseHSV.z)), base.a * blend.a);
    }
  `,
  saturation: `
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    vec4 blend(vec4 base, vec4 blend) {
      vec3 baseHSV = rgb2hsv(base.rgb);
      vec3 blendHSV = rgb2hsv(blend.rgb);
      return vec4(hsv2rgb(vec3(baseHSV.x, blendHSV.y, baseHSV.z)), base.a * blend.a);
    }
  `,
  color: `
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    vec4 blend(vec4 base, vec4 blend) {
      vec3 baseHSV = rgb2hsv(base.rgb);
      vec3 blendHSV = rgb2hsv(blend.rgb);
      return vec4(hsv2rgb(vec3(blendHSV.x, blendHSV.y, baseHSV.z)), base.a * blend.a);
    }
  `,
  luminosity: `
    vec3 rgb2hsv(vec3 c) {
      vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
      vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
      vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
      float d = q.x - min(q.w, q.y);
      float e = 1.0e-10;
      return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }
    vec3 hsv2rgb(vec3 c) {
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }
    vec4 blend(vec4 base, vec4 blend) {
      vec3 baseHSV = rgb2hsv(base.rgb);
      vec3 blendHSV = rgb2hsv(blend.rgb);
      return vec4(hsv2rgb(vec3(baseHSV.x, baseHSV.y, blendHSV.z)), base.a * blend.a);
    }
  `
};

export const COMPOSITE_SHADER = {
  vertexShader: `
    attribute vec2 position;
    attribute vec2 uv;
    uniform mat4 transform;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = transform * vec4(position, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    uniform sampler2D texture;
    uniform sampler2D mask;
    uniform float opacity;
    uniform int hasMask;
    uniform int maskInvert;
    uniform float maskFeather;
    varying vec2 vUv;

    // Import blend mode function
    ${BLEND_MODE_FUNCTIONS.normal}

    void main() {
      vec4 color = texture2D(texture, vUv);
      
      // Apply mask if present
      if (hasMask == 1) {
        float maskValue = texture2D(mask, vUv).r;
        if (maskInvert == 1) maskValue = 1.0 - maskValue;
        
        // Apply feathering
        if (maskFeather > 0.0) {
          float featherAmount = maskFeather * 0.1;
          maskValue = smoothstep(0.5 - featherAmount, 0.5 + featherAmount, maskValue);
        }
        
        color.a *= maskValue;
      }

      // Apply opacity
      color.a *= opacity;

      gl_FragColor = color;
    }
  `
};
