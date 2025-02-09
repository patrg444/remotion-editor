import { TransitionDefinition, TransitionShader, TransitionType, UniformValue } from '../types/transition';

// Common vertex shader (pass-through)
const commonVertexShader = `#version 300 es
in vec2 position;
out vec2 vUv;

void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}`;

// Core fragment shaders
const dissolveShader = `#version 300 es
precision highp float;

uniform sampler2D fromTexture;
uniform sampler2D toTexture;
uniform float progress;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec4 fromColor = texture(fromTexture, vUv);
    vec4 toColor = texture(toTexture, vUv);
    fragColor = mix(fromColor, toColor, progress);
}`;

const fadeShader = `#version 300 es
precision highp float;

uniform sampler2D fromTexture;
uniform sampler2D toTexture;
uniform float progress;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec4 fromColor = texture(fromTexture, vUv);
    vec4 toColor = texture(toTexture, vUv);
    fromColor.a = 1.0 - progress;
    toColor.a = progress;
    fragColor = mix(fromColor, toColor, progress);
}`;

const slideShader = `#version 300 es
precision highp float;

uniform sampler2D fromTexture;
uniform sampler2D toTexture;
uniform float progress;
uniform vec2 direction;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 p = vUv + progress * direction;
    vec2 f = clamp(p, 0.0, 1.0);
    vec2 t = clamp(p - direction, 0.0, 1.0);
    
    vec4 fromColor = texture(fromTexture, f);
    vec4 toColor = texture(toTexture, t);
    
    fragColor = mix(fromColor, toColor, step(0.0, progress * 2.0 - 1.0));
}`;

const zoomShader = `#version 300 es
precision highp float;

uniform sampler2D fromTexture;
uniform sampler2D toTexture;
uniform float progress;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 fromCoord = center + (vUv - center) * (1.0 - progress);
    vec2 toCoord = center + (vUv - center) * progress;
    
    vec4 fromColor = texture(fromTexture, fromCoord);
    vec4 toColor = texture(toTexture, toCoord);
    
    fragColor = mix(fromColor, toColor, progress);
}`;

const pushShader = `#version 300 es
precision highp float;

uniform sampler2D fromTexture;
uniform sampler2D toTexture;
uniform float progress;
uniform vec2 direction;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec2 p = vUv - progress * direction;
    vec2 f = clamp(p, 0.0, 1.0);
    vec2 t = clamp(p + direction, 0.0, 1.0);
    
    vec4 fromColor = texture(fromTexture, f);
    vec4 toColor = texture(toTexture, t);
    
    fragColor = mix(fromColor, toColor, step(1.0, p.x + p.y));
}`;

const wipeShader = `#version 300 es
precision highp float;

uniform sampler2D fromTexture;
uniform sampler2D toTexture;
uniform float progress;
uniform vec2 direction;

in vec2 vUv;
out vec4 fragColor;

void main() {
    vec4 fromColor = texture(fromTexture, vUv);
    vec4 toColor = texture(toTexture, vUv);
    
    float threshold = dot(vUv - 0.5, normalize(direction));
    float edge = smoothstep(-0.1, 0.1, threshold - progress + 0.5);
    
    fragColor = mix(toColor, fromColor, edge);
}`;

// Import helper functions from types/transition
import { createFloat, createSampler2D, createVec2 } from '../types/transition';

const transitions: Record<TransitionType, TransitionDefinition> = {
    [TransitionType.Dissolve]: {
        name: 'Dissolve',
        type: TransitionType.Dissolve,
        vertexShader: commonVertexShader,
        fragmentShader: dissolveShader,
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture')
        }
    },
    [TransitionType.Fade]: {
        name: 'Fade',
        type: TransitionType.Fade,
        vertexShader: commonVertexShader,
        fragmentShader: fadeShader,
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture')
        }
    },
    [TransitionType.Wipe]: {
        name: 'Wipe',
        type: TransitionType.Wipe,
        vertexShader: commonVertexShader,
        fragmentShader: wipeShader,
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture'),
            direction: createVec2('direction')
        }
    },
    [TransitionType.Slide]: {
        name: 'Slide',
        type: TransitionType.Slide,
        vertexShader: commonVertexShader,
        fragmentShader: slideShader,
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture'),
            direction: createVec2('direction')
        }
    },
    [TransitionType.Crossfade]: {
        name: 'Crossfade',
        type: TransitionType.Crossfade,
        vertexShader: commonVertexShader,
        fragmentShader: dissolveShader, // Crossfade uses the same shader as dissolve
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture')
        }
    },
    [TransitionType.Zoom]: {
        name: 'Zoom',
        type: TransitionType.Zoom,
        vertexShader: commonVertexShader,
        fragmentShader: zoomShader,
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture')
        }
    },
    [TransitionType.Push]: {
        name: 'Push',
        type: TransitionType.Push,
        vertexShader: commonVertexShader,
        fragmentShader: pushShader,
        uniforms: {
            progress: createFloat('progress'),
            fromTexture: createSampler2D('fromTexture'),
            toTexture: createSampler2D('toTexture'),
            direction: createVec2('direction')
        }
    }
};

export default transitions;
