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
    min,
    max,
    step
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
const createVec2 = (name, defaultValue = [0, 0], min, max) => ({
    type: 'vec2',
    value: defaultValue,
    defaultValue,
    name,
    min,
    max
});
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
/******/ 	__webpack_require__.h = () => ("bcede7c7ef233bf1db22")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.ceb8b9bb9faaf81f598e.hot-update.js.map