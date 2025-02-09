"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/utils/timelineScale.ts":
/*!*********************************************!*\
  !*** ./src/renderer/utils/timelineScale.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clampZoom: () => (/* binding */ clampZoom),
/* harmony export */   getContentWidth: () => (/* binding */ getContentWidth),
/* harmony export */   getMinWidth: () => (/* binding */ getMinWidth),
/* harmony export */   getMinZoomLevel: () => (/* binding */ getMinZoomLevel),
/* harmony export */   getOptimalZoom: () => (/* binding */ getOptimalZoom),
/* harmony export */   getPixelsPerFrame: () => (/* binding */ getPixelsPerFrame),
/* harmony export */   getPixelsPerSecond: () => (/* binding */ getPixelsPerSecond),
/* harmony export */   getVisibleDuration: () => (/* binding */ getVisibleDuration),
/* harmony export */   pixelsToTime: () => (/* binding */ pixelsToTime),
/* harmony export */   timeToPixels: () => (/* binding */ timeToPixels)
/* harmony export */ });
/* harmony import */ var _timelineConstants__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./timelineConstants */ "./src/renderer/utils/timelineConstants.ts");

/**
 * Timeline scale utilities for consistent coordinate/time conversions
 */
/**
 * Convert time to pixels based on zoom level
 */
const timeToPixels = (time, zoom) => {
    // Normalize zoom level since test uses zoom: 50
    const normalizedZoom = zoom / 50;
    return time * _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.PIXELS_PER_SECOND * normalizedZoom;
};
/**
 * Convert pixels to time based on zoom level
 */
const pixelsToTime = (pixels, zoom) => {
    return pixels / (_timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.PIXELS_PER_SECOND * zoom);
};
/**
 * Get current pixels per second based on zoom level
 */
const getPixelsPerSecond = (zoom) => {
    return _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.getScale(zoom);
};
/**
 * Get current pixels per frame based on zoom level and fps
 */
const getPixelsPerFrame = (zoom, fps) => {
    return _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.getScale(zoom) / fps;
};
/**
 * Calculate minimum zoom level to fit duration in width
 */
const getMinZoomLevel = (duration, width) => {
    return Math.max(width / (duration * _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.PIXELS_PER_SECOND), _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.MIN_ZOOM);
};
/**
 * Calculate visible duration at current zoom level and width
 */
const getVisibleDuration = (width, zoom) => {
    return width / _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.getScale(zoom);
};
/**
 * Calculate content width for duration at zoom level
 */
const getContentWidth = (duration, zoom) => {
    return duration * _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.getScale(zoom);
};
/**
 * Calculate minimum width needed to display duration at zoom level
 */
const getMinWidth = (duration, zoom) => {
    return Math.max(duration * _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.getScale(zoom), _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.UI.MIN_TRACK_WIDTH);
};
/**
 * Calculate optimal zoom level for a given duration and width
 * with optional padding factor (1.0 = no padding, 1.1 = 10% padding)
 */
const getOptimalZoom = (duration, width, padding = 1.0) => {
    const zoom = (width / (duration * _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.PIXELS_PER_SECOND)) / padding;
    return Math.min(Math.max(zoom, _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.MIN_ZOOM), _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.MAX_ZOOM);
};
/**
 * Clamp zoom level to valid range
 */
const clampZoom = (zoom) => {
    return Math.min(Math.max(zoom, _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.MIN_ZOOM), _timelineConstants__WEBPACK_IMPORTED_MODULE_0__.TimelineConstants.Scale.MAX_ZOOM);
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("aee0cf1f48773e00ecef")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.74818fc6e3ab20aa03f1.hot-update.js.map