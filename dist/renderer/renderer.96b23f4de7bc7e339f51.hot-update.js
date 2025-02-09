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
const createFloat = (name, defaultValue = 0) => ({
    type: 'float',
    value: defaultValue,
    defaultValue,
    name
});
const createSampler2D = (name) => ({
    type: 'sampler2D',
    value: null,
    defaultValue: null,
    name
});
const createVec2 = (name, defaultValue = [0, 0]) => ({
    type: 'vec2',
    value: defaultValue,
    defaultValue,
    name
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
/******/ 	__webpack_require__.h = () => ("2c662459a2fb469a2779")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.96b23f4de7bc7e339f51.hot-update.js.map