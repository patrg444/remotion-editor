"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/transitions/shaders.ts":
/*!*********************************************!*\
  !*** ./src/renderer/transitions/shaders.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _types_transition__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../types/transition */ "./src/renderer/types/transition.ts");

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

const transitions = {
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Dissolve]: {
        vertexShader: commonVertexShader,
        fragmentShader: dissolveShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Fade]: {
        vertexShader: commonVertexShader,
        fragmentShader: fadeShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Wipe]: {
        vertexShader: commonVertexShader,
        fragmentShader: wipeShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture'),
            direction: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createVec2)('direction')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Slide]: {
        vertexShader: commonVertexShader,
        fragmentShader: slideShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture'),
            direction: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createVec2)('direction')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Crossfade]: {
        vertexShader: commonVertexShader,
        fragmentShader: dissolveShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Zoom]: {
        vertexShader: commonVertexShader,
        fragmentShader: zoomShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Push]: {
        vertexShader: commonVertexShader,
        fragmentShader: pushShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture'),
            direction: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createVec2)('direction')
        }
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (transitions);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("f1e01ca244d18be85f73")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.33cd9a82b92cb56712aa.hot-update.js.map