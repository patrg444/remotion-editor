"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/types/transition.ts":
/*!******************************************!*\
  !*** ./src/renderer/types/transition.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TransitionType: () => (/* binding */ TransitionType),
/* harmony export */   createFloat: () => (/* binding */ createFloat),
/* harmony export */   createSampler2D: () => (/* binding */ createSampler2D),
/* harmony export */   createVec2: () => (/* binding */ createVec2),
/* harmony export */   getUniformType: () => (/* binding */ getUniformType)
/* harmony export */ });
var TransitionType;
(function (TransitionType) {
    TransitionType["Dissolve"] = "dissolve";
    TransitionType["Crossfade"] = "crossfade";
    TransitionType["Fade"] = "fade";
    TransitionType["Wipe"] = "wipe";
    TransitionType["Slide"] = "slide";
    TransitionType["Zoom"] = "zoom";
    TransitionType["Push"] = "push";
})(TransitionType || (TransitionType = {}));
const createFloat = (name, defaultValue = 0, min, max, step) => ({
    type: 'float',
    value: defaultValue,
    defaultValue,
    name,
    min: typeof min === 'number' ? min : undefined,
    max: typeof max === 'number' ? max : undefined,
    step: typeof step === 'number' ? step : undefined
});
const createSampler2D = (name, defaultValue, width, height, format) => ({
    type: 'sampler2D',
    value: defaultValue ?? null,
    defaultValue: defaultValue ?? null,
    name,
    width,
    height,
    format
});
const createVec2 = (name, defaultValue = [0, 0], min, max) => {
    // Ensure defaultValue is a valid number array
    const validDefaultValue = Array.isArray(defaultValue) && defaultValue.length === 2 &&
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
const getUniformType = (uniform) => {
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


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("d483a135f3fbb4d678c4")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.0437878c82776808e17a.hot-update.js.map