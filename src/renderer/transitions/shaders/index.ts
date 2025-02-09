import { TransitionDefinition, TransitionType, createFloat, createSampler2D, createVec2 } from '../../types/transition';

const defaultVertexShader = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position;
    gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
  }
`;

export const transitions: Record<TransitionType, TransitionDefinition> = {
  [TransitionType.Dissolve]: {
    name: 'Dissolve',
    type: TransitionType.Dissolve,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      uniform float noiseScale;
      varying vec2 vUv;

      float random(vec2 co) {
        return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
      }

      void main() {
        vec4 fromColor = texture2D(fromTexture, vUv);
        vec4 toColor = texture2D(toTexture, vUv);
        float r = random(vUv * noiseScale);
        float mixRatio = step(r, progress);
        gl_FragColor = mix(fromColor, toColor, mixRatio);
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      noiseScale: createFloat('noiseScale', 50),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
    },
    defaultParams: {
      easing: 'linear',
      intensity: 50
    },
  },

  [TransitionType.Fade]: {
    name: 'Fade',
    type: TransitionType.Fade,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      varying vec2 vUv;

      void main() {
        vec4 fromColor = texture2D(fromTexture, vUv);
        vec4 toColor = texture2D(toTexture, vUv);
        float fadeProgress = smoothstep(0.0, 1.0, progress);
        gl_FragColor = mix(fromColor, toColor, fadeProgress);
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
    },
    defaultParams: {
      easing: 'linear'
    },
  },

  [TransitionType.Wipe]: {
    name: 'Wipe',
    type: TransitionType.Wipe,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      uniform vec2 direction;
      varying vec2 vUv;

      void main() {
        vec2 p = vUv - vec2(0.5);
        float angle = atan(direction.y, direction.x);
        float len = length(direction);
        float d = dot(normalize(p), vec2(cos(angle), sin(angle))) * len;
        float wipeProgress = step(d, (progress - 0.5) * 2.0);
        vec4 fromColor = texture2D(fromTexture, vUv);
        vec4 toColor = texture2D(toTexture, vUv);
        gl_FragColor = mix(fromColor, toColor, wipeProgress);
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      direction: createVec2('direction', [1, 0] as [number, number]),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
    },
    defaultParams: {
      direction: 'right',
      easing: 'linear'
    },
  },

  [TransitionType.Slide]: {
    name: 'Slide',
    type: TransitionType.Slide,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      uniform vec2 direction;
      varying vec2 vUv;

      void main() {
        vec2 translateVec = direction * progress;
        vec2 fromUv = vUv - translateVec;
        vec2 toUv = vUv + direction * (1.0 - progress);
        
        vec4 fromColor = vec4(0.0);
        vec4 toColor = vec4(0.0);
        
        if (fromUv.x >= 0.0 && fromUv.x <= 1.0 && fromUv.y >= 0.0 && fromUv.y <= 1.0) {
          fromColor = texture2D(fromTexture, fromUv);
        }
        if (toUv.x >= 0.0 && toUv.x <= 1.0 && toUv.y >= 0.0 && toUv.y <= 1.0) {
          toColor = texture2D(toTexture, toUv);
        }
        
        gl_FragColor = fromColor + toColor;
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      direction: createVec2('direction', [1, 0] as [number, number]),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
    },
    defaultParams: {
      direction: 'right',
      easing: 'linear'
    },
  },

  [TransitionType.Crossfade]: {
    name: 'Crossfade',
    type: TransitionType.Crossfade,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      varying vec2 vUv;
      void main() {
        vec4 fromColor = texture2D(fromTexture, vUv);
        vec4 toColor = texture2D(toTexture, vUv);
        gl_FragColor = mix(fromColor, toColor, progress);
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
    },
    defaultParams: {
      easing: 'linear'
    },
  },

  [TransitionType.Zoom]: {
    name: 'Zoom',
    type: TransitionType.Zoom,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      uniform vec2 direction;
      uniform float scale;
      varying vec2 vUv;
      void main() {
        vec2 zoomCenter = vec2(0.5, 0.5);
        vec2 fromUv = (vUv - zoomCenter) * (1.0 + progress * (scale - 1.0)) + zoomCenter;
        vec2 toUv = (vUv - zoomCenter) * (1.0 + (1.0 - progress) * (scale - 1.0)) + zoomCenter;
        vec4 fromColor = texture2D(fromTexture, fromUv);
        vec4 toColor = texture2D(toTexture, toUv);
        gl_FragColor = mix(fromColor, toColor, progress);
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
      direction: createVec2('direction', [0, 0] as [number, number]),
      scale: createFloat('scale', 2),
    },
    defaultParams: {
      direction: 'right',
      easing: 'linear',
      intensity: 2
    },
  },

  [TransitionType.Push]: {
    name: 'Push',
    type: TransitionType.Push,
    vertexShader: defaultVertexShader,
    fragmentShader: `
      precision mediump float;
      uniform sampler2D fromTexture;
      uniform sampler2D toTexture;
      uniform float progress;
      uniform vec2 direction;
      varying vec2 vUv;
      void main() {
        vec2 p = vUv + progress * direction;
        vec2 f = fract(p);
        vec4 fromColor = texture2D(fromTexture, f);
        vec4 toColor = texture2D(toTexture, f);
        gl_FragColor = mix(fromColor, toColor, step(0.5, progress));
      }
    `,
    uniforms: {
      progress: createFloat('progress', 0),
      fromTexture: createSampler2D('fromTexture'),
      toTexture: createSampler2D('toTexture'),
      direction: createVec2('direction', [1, 0] as [number, number]),
    },
    defaultParams: {
      direction: 'right',
      easing: 'linear'
    },
  },
};

export default transitions;
