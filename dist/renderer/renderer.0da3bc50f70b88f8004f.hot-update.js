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
            if (programRef.current) {
                gl.deleteProgram(programRef.current);
            }
        };
    }, []);
    // Render transition
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const gl = glRef.current;
        if (!gl || !transition.type)
            return;
        const transitionDef = _transitions_shaders__WEBPACK_IMPORTED_MODULE_2__["default"][transition.type];
        if (!transitionDef)
            return;
        const renderFrame = async () => {
            try {
                // Load images
                const [fromImage, toImage] = await Promise.all([
                    fromClip.thumbnail ? getTexture(fromClip.thumbnail) : null,
                    toClip.thumbnail ? getTexture(toClip.thumbnail) : null,
                ]);
                if (!fromImage || !toImage)
                    return;
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
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                // Force a flush to ensure pixels are written
                gl.flush();
                gl.finish();
                // Clean up
                // Clean up
                gl.deleteBuffer(positionBuffer);
                gl.deleteShader(vertexShader);
                gl.deleteShader(fragmentShader);
                gl.deleteTexture(fromTexture);
                gl.deleteTexture(toTexture);
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


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("729b4e5f698ea2c55686")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.0da3bc50f70b88f8004f.hot-update.js.map