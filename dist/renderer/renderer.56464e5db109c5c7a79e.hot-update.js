"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/TransitionRenderer.tsx":
/*!********************************************************!*\
  !*** ./src/renderer/components/TransitionRenderer.tsx ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TransitionRenderer: () => (/* binding */ TransitionRenderer),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _hooks_useTextureCache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../hooks/useTextureCache */ "./src/renderer/hooks/useTextureCache.ts");
/* harmony import */ var _transitions_shaders__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../transitions/shaders */ "./src/renderer/transitions/shaders.ts");



const TransitionRenderer = ({ transition, fromClip, toClip, progress, width, height, }) => {
    const canvasRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const glRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const programRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const { getTexture } = (0,_hooks_useTextureCache__WEBPACK_IMPORTED_MODULE_1__.useTextureCache)();
    // Initialize WebGL context and handle context loss/restore
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const gl = canvas.getContext('webgl2', {
            powerPreference: 'high-performance',
            alpha: true,
            depth: false,
            stencil: false,
            antialias: false,
            preserveDrawingBuffer: true,
            premultipliedAlpha: false
        });
        if (!gl) {
            console.error('WebGL2 not supported');
            return;
        }
        if (!gl) {
            console.error('WebGL2 not supported');
            return;
        }
        // Enable alpha blending
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        glRef.current = gl;
        // Handle context loss
        const handleContextLost = (e) => {
            e.preventDefault();
            console.log('WebGL context lost');
            if (programRef.current) {
                gl.deleteProgram(programRef.current);
                programRef.current = null;
            }
        };
        // Handle context restore
        const handleContextRestored = (e) => {
            console.log('WebGL context restored');
            // Context will be reinitialized on next render
        };
        // Add event listeners with proper type casting
        canvas.addEventListener('webglcontextlost', handleContextLost);
        canvas.addEventListener('webglcontextrestored', handleContextRestored);
        // Clean up
        return () => {
            canvas.removeEventListener('webglcontextlost', handleContextLost);
            canvas.removeEventListener('webglcontextrestored', handleContextRestored);
            // Clean up WebGL resources
            if (gl) {
                // Delete any active textures
                const maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
                for (let i = 0; i < maxTextureUnits; i++) {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, null);
                }
                // Delete program if it exists
                if (programRef.current) {
                    gl.deleteProgram(programRef.current);
                    programRef.current = null;
                }
                // Reset state
                gl.bindBuffer(gl.ARRAY_BUFFER, null);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.useProgram(null);
            }
        };
    }, []);
    // Render transition
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const gl = glRef.current;
        if (!gl || !transition.type || !_transitions_shaders__WEBPACK_IMPORTED_MODULE_2__["default"][transition.type]) {
            console.error('Invalid transition type:', transition.type);
            return;
        }
        const transitionDef = _transitions_shaders__WEBPACK_IMPORTED_MODULE_2__["default"][transition.type];
        const renderFrame = async () => {
            try {
                // Load images with error handling
                const [fromImage, toImage] = await Promise.all([
                    fromClip.thumbnail ? getTexture(fromClip.thumbnail).catch(err => {
                        console.error('Failed to load fromClip texture:', err);
                        return null;
                    }) : null,
                    toClip.thumbnail ? getTexture(toClip.thumbnail).catch(err => {
                        console.error('Failed to load toClip texture:', err);
                        return null;
                    }) : null,
                ]);
                if (!fromImage || !toImage) {
                    throw new Error('Failed to load one or both textures');
                }
                // Create WebGL textures from images
                const fromTexture = gl.createTexture();
                const toTexture = gl.createTexture();
                if (!fromTexture || !toTexture)
                    return;
                // Load first texture
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, fromTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, fromImage);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                // Load second texture
                gl.activeTexture(gl.TEXTURE1);
                gl.bindTexture(gl.TEXTURE_2D, toTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, toImage);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                // Create and compile shaders
                const vertexShader = gl.createShader(gl.VERTEX_SHADER);
                const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
                if (!vertexShader || !fragmentShader)
                    return;
                gl.shaderSource(vertexShader, transitionDef.vertexShader);
                gl.shaderSource(fragmentShader, transitionDef.fragmentShader);
                // Compile vertex shader
                gl.compileShader(vertexShader);
                const vertexSuccess = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
                if (!vertexSuccess) {
                    const log = gl.getShaderInfoLog(vertexShader);
                    console.error('Vertex shader compilation failed:', log);
                    window.dispatchEvent(new CustomEvent('timeline:shader-error', {
                        detail: { type: 'vertex', error: log }
                    }));
                    return;
                }
                // Compile fragment shader
                gl.compileShader(fragmentShader);
                const fragmentSuccess = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
                if (!fragmentSuccess) {
                    const log = gl.getShaderInfoLog(fragmentShader);
                    console.error('Fragment shader compilation failed:', log);
                    window.dispatchEvent(new CustomEvent('timeline:shader-error', {
                        detail: { type: 'fragment', error: log }
                    }));
                    return;
                }
                // Create and link program
                const program = gl.createProgram();
                if (!program)
                    return;
                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.error('Program linking failed:', gl.getProgramInfoLog(program));
                    return;
                }
                gl.useProgram(program);
                programRef.current = program;
                // Enable alpha blending
                gl.enable(gl.BLEND);
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                // Set up uniforms
                Object.entries(transitionDef.uniforms).forEach(([name, uniform]) => {
                    const location = gl.getUniformLocation(program, name);
                    if (!location)
                        return;
                    switch (name) {
                        case 'progress':
                            gl.uniform1f(location, progress);
                            break;
                        case 'fromTexture':
                            gl.uniform1i(location, 0);
                            break;
                        case 'toTexture':
                            gl.uniform1i(location, 1);
                            break;
                        case 'direction':
                            const dir = transition.params?.direction || 'right';
                            let vec;
                            switch (dir) {
                                case 'right':
                                    vec = [1, 0];
                                    break;
                                case 'left':
                                    vec = [-1, 0];
                                    break;
                                case 'up':
                                    vec = [0, -1];
                                    break;
                                case 'down':
                                    vec = [0, 1];
                                    break;
                                default:
                                    vec = [1, 0]; // Default to right
                            }
                            gl.uniform2fv(location, new Float32Array(vec));
                            break;
                        case 'scale':
                            if (transition.params?.scale) {
                                gl.uniform1f(location, transition.params.scale);
                            }
                            break;
                    }
                });
                // Set up attributes
                const positionBuffer = gl.createBuffer();
                const positions = new Float32Array([
                    -1, -1,
                    1, -1,
                    -1, 1,
                    1, 1,
                ]);
                gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
                const positionLocation = gl.getAttribLocation(program, 'position');
                gl.enableVertexAttribArray(positionLocation);
                gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
                // Clear and draw
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.viewport(0, 0, width, height);
                // Create and bind framebuffer
                const framebuffer = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
                // Create and attach texture to framebuffer
                const renderTexture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, renderTexture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, renderTexture, 0);
                // Check framebuffer status
                const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                if (status !== gl.FRAMEBUFFER_COMPLETE) {
                    throw new Error(`Framebuffer is not complete: ${status}`);
                }
                gl.viewport(0, 0, width, height);
                gl.clearColor(0, 0, 0, 0);
                gl.clear(gl.COLOR_BUFFER_BIT);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                // Force a flush to ensure pixels are written
                gl.flush();
                gl.finish();
                // Clean up
                gl.deleteBuffer(positionBuffer);
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteTexture(fromTexture);
                gl.deleteTexture(toTexture);
                gl.deleteFramebuffer(framebuffer);
                gl.deleteTexture(renderTexture);
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }
            catch (error) {
                console.error('Error rendering transition:', error);
            }
        };
        renderFrame();
    }, [transition, fromClip, toClip, progress, width, height, getTexture]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("canvas", { ref: canvasRef, width: width, height: height, style: { width: '100%', height: '100%' }, "data-testid": "transition-canvas" }));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TransitionRenderer);


/***/ }),

/***/ "./src/renderer/hooks/useTextureCache.ts":
/*!***********************************************!*\
  !*** ./src/renderer/hooks/useTextureCache.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useTextureCache: () => (/* binding */ useTextureCache)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const DEFAULT_OPTIONS = {
    maxCacheSize: 100,
    expirationTime: 5 * 60 * 1000,
    maxTextureSize: 4096, // Default max texture size
};
function isValidImageData(data) {
    if (!data)
        return false;
    try {
        // Check if it has required properties
        const hasValidProps = 'width' in data &&
            'height' in data &&
            'data' in data &&
            typeof data.width === 'number' &&
            typeof data.height === 'number' &&
            data.width > 0 &&
            data.height > 0 &&
            data.data instanceof Uint8ClampedArray;
        if (!hasValidProps)
            return false;
        // Check data length
        const expectedLength = data.width * data.height * 4;
        return data.data.length === expectedLength;
    }
    catch (error) {
        console.error('ImageData validation error:', error);
        return false;
    }
}
function useTextureCache(options = {}) {
    const cache = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({});
    const [loadingStates, setLoadingStates] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
    const [errors, setErrors] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)({});
    const cleanupRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)();
    const initialCleanupDone = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
    const effectiveOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
    };
    const cleanup = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        const now = Date.now();
        const entries = Object.entries(cache.current);
        console.log('Cleanup - Initial cache size:', entries.length);
        console.log('Cleanup - Cache entries:', entries.map(([key, entry]) => ({
            key,
            lastUsed: entry.lastUsed,
            timeSinceLastUse: now - entry.lastUsed
        })));
        // Sort by last used time (most recently used first)
        entries.sort(([, a], [, b]) => b.lastUsed - a.lastUsed);
        // Keep track of removed entries
        const removedKeys = [];
        // First, remove expired entries
        for (const [key, entry] of entries) {
            if (now - entry.lastUsed > effectiveOptions.expirationTime) {
                console.log('Cleanup - Removing expired entry:', key);
                delete cache.current[key];
                removedKeys.push(key);
            }
        }
        // Then, if we're still over maxCacheSize, remove oldest entries
        const remainingEntries = Object.entries(cache.current);
        console.log('Cleanup - Remaining entries before size check:', remainingEntries.length);
        if (remainingEntries.length > effectiveOptions.maxCacheSize) {
            // Re-sort remaining entries by last used time
            remainingEntries.sort(([, a], [, b]) => b.lastUsed - a.lastUsed);
            // Keep only the most recently used entries up to maxCacheSize
            const entriesToRemove = remainingEntries.slice(effectiveOptions.maxCacheSize);
            console.log('Cleanup - Entries to remove due to size limit:', entriesToRemove.length);
            for (const [key] of entriesToRemove) {
                console.log('Cleanup - Removing entry due to size limit:', key);
                delete cache.current[key];
                removedKeys.push(key);
            }
        }
        // Update loading states and errors if any entries were removed
        if (removedKeys.length > 0) {
            setLoadingStates(prev => {
                const next = { ...prev };
                removedKeys.forEach(key => {
                    delete next[key];
                });
                return next;
            });
            setErrors(prev => {
                const next = { ...prev };
                removedKeys.forEach(key => {
                    delete next[key];
                });
                return next;
            });
        }
        console.log('Cleanup - Final cache size:', Object.keys(cache.current).length);
    }, [effectiveOptions.maxCacheSize, effectiveOptions.expirationTime]);
    // Clean up expired textures
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (options.disableAutoCleanup) {
            return;
        }
        // Clear any existing interval
        if (cleanupRef.current) {
            clearInterval(cleanupRef.current);
        }
        // Set up new interval
        cleanupRef.current = setInterval(cleanup, 60000); // Run cleanup every minute
        // Run cleanup immediately only once
        if (!initialCleanupDone.current) {
            cleanup();
            initialCleanupDone.current = true;
        }
        return () => {
            if (cleanupRef.current) {
                clearInterval(cleanupRef.current);
            }
        };
    }, [cleanup, options.disableAutoCleanup]);
    const getTexture = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (source) => {
        const key = source instanceof ImageData ? source.data.toString() : source;
        console.log('getTexture - Current cache size:', Object.keys(cache.current).length);
        console.log('getTexture - Loading texture:', key);
        // Check texture size limits first
        if (source instanceof ImageData) {
            if (source.width > effectiveOptions.maxTextureSize || source.height > effectiveOptions.maxTextureSize) {
                const error = new Error(`Texture size exceeds maximum allowed size of ${effectiveOptions.maxTextureSize}px`);
                setErrors(prev => ({ ...prev, [key]: error }));
                throw error;
            }
            // Then validate ImageData
            if (!isValidImageData(source)) {
                const error = new Error('Invalid ImageData provided');
                setErrors(prev => ({ ...prev, [key]: error }));
                throw error;
            }
        }
        // Update last used time if in cache
        if (cache.current[key]) {
            console.log('getTexture - Found in cache:', key);
            cache.current[key].lastUsed = Date.now();
            return cache.current[key].image;
        }
        // Set loading state
        setLoadingStates(prev => ({ ...prev, [key]: true }));
        try {
            let dataUrl = '';
            if (source instanceof ImageData) {
                const canvas = document.createElement('canvas');
                canvas.width = source.width;
                canvas.height = source.height;
                const ctx = canvas.getContext('2d');
                if (!ctx)
                    throw new Error('Could not get canvas context');
                ctx.putImageData(source, 0, 0);
                dataUrl = canvas.toDataURL();
            }
            else {
                dataUrl = source;
            }
            // Create and load the image
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // Check texture size limits for loaded image
                    if (img.width > effectiveOptions.maxTextureSize || img.height > effectiveOptions.maxTextureSize) {
                        reject(new Error(`Texture size exceeds maximum allowed size of ${effectiveOptions.maxTextureSize}px`));
                        return;
                    }
                    resolve();
                };
                img.onerror = () => reject(new Error(`Failed to load image: ${key}`));
                img.src = dataUrl;
            });
            // Cache the loaded image
            cache.current[key] = {
                image: img,
                lastUsed: Date.now(),
                isLoading: false,
            };
            console.log('getTexture - Added to cache:', key);
            console.log('getTexture - New cache size:', Object.keys(cache.current).length);
            setLoadingStates(prev => ({ ...prev, [key]: false }));
            setErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
            });
            return img;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error('Unknown error loading texture');
            setErrors(prev => ({ ...prev, [key]: err }));
            setLoadingStates(prev => ({ ...prev, [key]: false }));
            throw err;
        }
    }, []);
    const clearCache = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        cache.current = {};
        setLoadingStates({});
        setErrors({});
    }, []);
    const refreshTexture = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(async (source) => {
        const key = source instanceof ImageData ? source.data.toString() : source;
        delete cache.current[key];
        setLoadingStates(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        setErrors(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
        });
        return getTexture(source);
    }, [getTexture]);
    return {
        getTexture,
        clearCache,
        refreshTexture,
        isLoading: loadingStates,
        errors,
        getCacheSize: () => Object.keys(cache.current).length,
        _cleanup: cleanup, // Expose for testing
    };
}


/***/ }),

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
        name: 'Dissolve',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Dissolve,
        vertexShader: commonVertexShader,
        fragmentShader: dissolveShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Fade]: {
        name: 'Fade',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Fade,
        vertexShader: commonVertexShader,
        fragmentShader: fadeShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Wipe]: {
        name: 'Wipe',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Wipe,
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
        name: 'Slide',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Slide,
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
        name: 'Crossfade',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Crossfade,
        vertexShader: commonVertexShader,
        fragmentShader: dissolveShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Zoom]: {
        name: 'Zoom',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Zoom,
        vertexShader: commonVertexShader,
        fragmentShader: zoomShader,
        uniforms: {
            progress: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createFloat)('progress'),
            fromTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('fromTexture'),
            toTexture: (0,_types_transition__WEBPACK_IMPORTED_MODULE_0__.createSampler2D)('toTexture')
        }
    },
    [_types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Push]: {
        name: 'Push',
        type: _types_transition__WEBPACK_IMPORTED_MODULE_0__.TransitionType.Push,
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
/******/ 	__webpack_require__.h = () => ("ec33db9634f962eaaa1a")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.56464e5db109c5c7a79e.hot-update.js.map