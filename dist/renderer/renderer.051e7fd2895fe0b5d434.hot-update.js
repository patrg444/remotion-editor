"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/clips.css":
/*!*****************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/clips.css ***!
  \*****************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Base clip styles */
.timeline-clip {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: border-color 0.1s ease, box-shadow 0.1s ease; /* Only transition visual properties */
  overflow: hidden;
  cursor: pointer;
  height: 60px;
  margin: 0;
  transform: translateZ(0); /* Enable hardware acceleration */
  backface-visibility: hidden; /* Prevent flickering */
  perspective: 1000px; /* Improve performance */
  user-select: none;
  touch-action: none;
  pointer-events: auto;
  will-change: transform;
  position: absolute; /* Ensure absolute positioning */
  z-index: 10; /* Higher z-index to ensure visibility */
}

/* Ensure clips don't overlap by giving higher z-index to clips that come later */
.timeline-clip + .timeline-clip {
  z-index: 2;
}

.timeline-clip:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);
}

.timeline-clip:hover {
  border-color: #666;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
}

.timeline-clip.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);
}

.timeline-clip.keyboard-dragging {
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);
}

/* Clip content styles */
.video-clip-content,
.audio-clip-content,
.caption-clip-content {
  height: 60px;
  display: flex;
  flex-direction: column;
  padding: 2px;
  pointer-events: none;
}

.clip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2px;
  min-height: 16px;
}

.clip-title {
  font-size: 11px;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.clip-thumbnail {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 2px;
  background: #1a1a1a;
  min-height: 60px;
}

.clip-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Effect indicators */
.effect-indicators {
  display: flex;
  gap: 4px;
}

.effect-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #555;
}

.effect-indicator.active {
  background: #28a745;
}

/* Clip type specific styles */
.timeline-clip.video {
  background: linear-gradient(to bottom, #2d2d2d, #222);
  border-color: #3a3a3a;
}

.timeline-clip.audio {
  background: linear-gradient(to bottom, #1e3e4e, #152a3a);
  border-color: #2a4a5a;
}

.timeline-clip.caption {
  background: linear-gradient(to bottom, #3d2d3d, #2a1a2a);
  border-color: #4a3a4a;
}

.timeline-clip.video:hover {
  background: linear-gradient(to bottom, #333, #282828);
  border-color: #444;
}

.timeline-clip.audio:hover {
  background: linear-gradient(to bottom, #244454, #1a3040);
  border-color: #305a6a;
}

.timeline-clip.caption:hover {
  background: linear-gradient(to bottom, #433343, #302030);
  border-color: #5a4a5a;
}

.timeline-clip.selected {
  border-color: #007bff;
  box-shadow: 0 0 0 1px #007bff, 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* Clip handles for trimming */
.clip-trim-start,
.clip-trim-end {
  position: absolute;
  top: 0;
  width: 16px; /* Wider handle area */
  height: 100%;
  cursor: col-resize;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.15s ease;
  opacity: 0;
  z-index: 10;
  pointer-events: auto;
  touch-action: none;
}

.timeline-clip:hover .clip-trim-start,
.timeline-clip:hover .clip-trim-end,
.clip-trim-start.visible,
.clip-trim-end.visible {
  opacity: 1;
}

.clip-trim-start:hover,
.clip-trim-end:hover {
  background: rgba(255, 255, 255, 0.3);
  width: 20px; /* Even wider on hover for better targeting */
}

.clip-trim-start:after,
.clip-trim-end:after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.5);
  pointer-events: none;
}

.clip-trim-start {
  left: -8px; /* Increased offset to prevent overlap */
  border-radius: 4px 0 0 4px;
  padding-right: 8px; /* Add padding to improve hit area */
}

.clip-trim-end {
  right: -8px; /* Increased offset to prevent overlap */
  border-radius: 0 4px 4px 0;
  padding-left: 8px; /* Add padding to improve hit area */
}

.clip-trim-start:after {
  right: 8px; /* Position indicator line */
}

.clip-trim-end:after {
  left: 8px; /* Position indicator line */
}

/* Add visual feedback for trim mode */
.timeline-clip[data-trimming="start"] .clip-handle.left,
.timeline-clip[data-trimming="start"] .clip-trim-start,
.timeline-clip[data-trimming="end"] .clip-handle.right,
.timeline-clip[data-trimming="end"] .clip-trim-end {
  background: rgba(0, 123, 255, 0.3);
  opacity: 1;
}

/* Visual feedback for extension limits */
.timeline-clip[data-at-limit="true"] .clip-handle,
.timeline-clip[data-at-limit="true"] .clip-trim-start,
.timeline-clip[data-at-limit="true"] .clip-trim-end {
  background: rgba(255, 68, 68, 0.3) !important;
}

.timeline-clip[data-at-limit="true"] .clip-handle:after,
.timeline-clip[data-at-limit="true"] .clip-trim-start:after,
.timeline-clip[data-at-limit="true"] .clip-trim-end:after {
  background: rgba(255, 68, 68, 0.7);
}

.timeline-clip[data-at-limit="true"] {
  border-color: #ff4444;
}

/* Optimize for dragging */
.timeline-clip[data-moving="true"] {
  transition: none !important;
  z-index: 100;
}

/* Optimize for movement end */
.timeline-clip:not([data-moving="true"]) {
  transition: transform 0.1s ease-out;
}

/* Clip duration label */
.clip-duration {
  position: absolute;
  bottom: 4px;
  right: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.6);
  padding: 2px 6px;
  border-radius: 3px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transform: translateY(2px);
  transition: all 0.2s ease;
  pointer-events: none;
}

.timeline-clip:hover .clip-duration {
  opacity: 1;
  transform: translateY(0);
}

/* Tooltip styles */
.trim-mode-tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 1000;
}

.timeline-clip[data-trimming] .trim-mode-tooltip {
  opacity: 1;
}

/* Trim mode indicators */
.timeline-clip[data-trim-mode="ripple"] {
  outline: 2px solid #28a745;
}

.timeline-clip[data-trim-mode="ripple"] .clip-handle,
.timeline-clip[data-trim-mode="ripple"] .clip-trim-start,
.timeline-clip[data-trim-mode="ripple"] .clip-trim-end {
  background: rgba(40, 167, 69, 0.3);
}

.timeline-clip[data-trim-mode="ripple"] .clip-handle:after,
.timeline-clip[data-trim-mode="ripple"] .clip-trim-start:after,
.timeline-clip[data-trim-mode="ripple"] .clip-trim-end:after {
  background: rgba(40, 167, 69, 0.7);
}

.timeline-clip[data-trim-mode="slip"] {
  outline: 2px solid #ffc107;
}

.timeline-clip[data-trim-mode="slip"] .clip-handle,
.timeline-clip[data-trim-mode="slip"] .clip-trim-start,
.timeline-clip[data-trim-mode="slip"] .clip-trim-end {
  background: rgba(255, 193, 7, 0.3);
}

.timeline-clip[data-trim-mode="slip"] .clip-handle:after,
.timeline-clip[data-trim-mode="slip"] .clip-trim-start:after,
.timeline-clip[data-trim-mode="slip"] .clip-trim-end:after {
  background: rgba(255, 193, 7, 0.7);
}
`, "",{"version":3,"sources":["webpack://./src/renderer/styles/clips.css"],"names":[],"mappings":"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","sourcesContent":["/* Base clip styles */\n.timeline-clip {\n  background: #2a2a2a;\n  border: 1px solid #444;\n  border-radius: 4px;\n  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);\n  transition: border-color 0.1s ease, box-shadow 0.1s ease; /* Only transition visual properties */\n  overflow: hidden;\n  cursor: pointer;\n  height: 60px;\n  margin: 0;\n  transform: translateZ(0); /* Enable hardware acceleration */\n  backface-visibility: hidden; /* Prevent flickering */\n  perspective: 1000px; /* Improve performance */\n  user-select: none;\n  touch-action: none;\n  pointer-events: auto;\n  will-change: transform;\n  position: absolute; /* Ensure absolute positioning */\n  z-index: 10; /* Higher z-index to ensure visibility */\n}\n\n/* Ensure clips don't overlap by giving higher z-index to clips that come later */\n.timeline-clip + .timeline-clip {\n  z-index: 2;\n}\n\n.timeline-clip:before {\n  content: '';\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  height: 1px;\n  background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.1), transparent);\n}\n\n.timeline-clip:hover {\n  border-color: #666;\n  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);\n}\n\n.timeline-clip.selected {\n  border-color: #007bff;\n  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3);\n}\n\n.timeline-clip.keyboard-dragging {\n  border-color: #28a745;\n  box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.3);\n}\n\n/* Clip content styles */\n.video-clip-content,\n.audio-clip-content,\n.caption-clip-content {\n  height: 60px;\n  display: flex;\n  flex-direction: column;\n  padding: 2px;\n  pointer-events: none;\n}\n\n.clip-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 2px;\n  min-height: 16px;\n}\n\n.clip-title {\n  font-size: 11px;\n  font-weight: 500;\n  color: #fff;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  margin-right: 8px;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n\n.clip-thumbnail {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n  border-radius: 2px;\n  background: #1a1a1a;\n  min-height: 60px;\n}\n\n.clip-thumbnail img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n/* Effect indicators */\n.effect-indicators {\n  display: flex;\n  gap: 4px;\n}\n\n.effect-indicator {\n  width: 8px;\n  height: 8px;\n  border-radius: 50%;\n  background: #555;\n}\n\n.effect-indicator.active {\n  background: #28a745;\n}\n\n/* Clip type specific styles */\n.timeline-clip.video {\n  background: linear-gradient(to bottom, #2d2d2d, #222);\n  border-color: #3a3a3a;\n}\n\n.timeline-clip.audio {\n  background: linear-gradient(to bottom, #1e3e4e, #152a3a);\n  border-color: #2a4a5a;\n}\n\n.timeline-clip.caption {\n  background: linear-gradient(to bottom, #3d2d3d, #2a1a2a);\n  border-color: #4a3a4a;\n}\n\n.timeline-clip.video:hover {\n  background: linear-gradient(to bottom, #333, #282828);\n  border-color: #444;\n}\n\n.timeline-clip.audio:hover {\n  background: linear-gradient(to bottom, #244454, #1a3040);\n  border-color: #305a6a;\n}\n\n.timeline-clip.caption:hover {\n  background: linear-gradient(to bottom, #433343, #302030);\n  border-color: #5a4a5a;\n}\n\n.timeline-clip.selected {\n  border-color: #007bff;\n  box-shadow: 0 0 0 1px #007bff, 0 2px 4px rgba(0, 0, 0, 0.3);\n}\n\n/* Clip handles for trimming */\n.clip-trim-start,\n.clip-trim-end {\n  position: absolute;\n  top: 0;\n  width: 16px; /* Wider handle area */\n  height: 100%;\n  cursor: col-resize;\n  background: rgba(255, 255, 255, 0.1);\n  transition: all 0.15s ease;\n  opacity: 0;\n  z-index: 10;\n  pointer-events: auto;\n  touch-action: none;\n}\n\n.timeline-clip:hover .clip-trim-start,\n.timeline-clip:hover .clip-trim-end,\n.clip-trim-start.visible,\n.clip-trim-end.visible {\n  opacity: 1;\n}\n\n.clip-trim-start:hover,\n.clip-trim-end:hover {\n  background: rgba(255, 255, 255, 0.3);\n  width: 20px; /* Even wider on hover for better targeting */\n}\n\n.clip-trim-start:after,\n.clip-trim-end:after {\n  content: '';\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  width: 2px;\n  background: rgba(255, 255, 255, 0.5);\n  pointer-events: none;\n}\n\n.clip-trim-start {\n  left: -8px; /* Increased offset to prevent overlap */\n  border-radius: 4px 0 0 4px;\n  padding-right: 8px; /* Add padding to improve hit area */\n}\n\n.clip-trim-end {\n  right: -8px; /* Increased offset to prevent overlap */\n  border-radius: 0 4px 4px 0;\n  padding-left: 8px; /* Add padding to improve hit area */\n}\n\n.clip-trim-start:after {\n  right: 8px; /* Position indicator line */\n}\n\n.clip-trim-end:after {\n  left: 8px; /* Position indicator line */\n}\n\n/* Add visual feedback for trim mode */\n.timeline-clip[data-trimming=\"start\"] .clip-handle.left,\n.timeline-clip[data-trimming=\"start\"] .clip-trim-start,\n.timeline-clip[data-trimming=\"end\"] .clip-handle.right,\n.timeline-clip[data-trimming=\"end\"] .clip-trim-end {\n  background: rgba(0, 123, 255, 0.3);\n  opacity: 1;\n}\n\n/* Visual feedback for extension limits */\n.timeline-clip[data-at-limit=\"true\"] .clip-handle,\n.timeline-clip[data-at-limit=\"true\"] .clip-trim-start,\n.timeline-clip[data-at-limit=\"true\"] .clip-trim-end {\n  background: rgba(255, 68, 68, 0.3) !important;\n}\n\n.timeline-clip[data-at-limit=\"true\"] .clip-handle:after,\n.timeline-clip[data-at-limit=\"true\"] .clip-trim-start:after,\n.timeline-clip[data-at-limit=\"true\"] .clip-trim-end:after {\n  background: rgba(255, 68, 68, 0.7);\n}\n\n.timeline-clip[data-at-limit=\"true\"] {\n  border-color: #ff4444;\n}\n\n/* Optimize for dragging */\n.timeline-clip[data-moving=\"true\"] {\n  transition: none !important;\n  z-index: 100;\n}\n\n/* Optimize for movement end */\n.timeline-clip:not([data-moving=\"true\"]) {\n  transition: transform 0.1s ease-out;\n}\n\n/* Clip duration label */\n.clip-duration {\n  position: absolute;\n  bottom: 4px;\n  right: 4px;\n  font-size: 10px;\n  color: rgba(255, 255, 255, 0.9);\n  background: rgba(0, 0, 0, 0.6);\n  padding: 2px 6px;\n  border-radius: 3px;\n  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);\n  opacity: 0;\n  transform: translateY(2px);\n  transition: all 0.2s ease;\n  pointer-events: none;\n}\n\n.timeline-clip:hover .clip-duration {\n  opacity: 1;\n  transform: translateY(0);\n}\n\n/* Tooltip styles */\n.trim-mode-tooltip {\n  position: absolute;\n  top: -30px;\n  left: 50%;\n  transform: translateX(-50%);\n  background: rgba(0, 0, 0, 0.8);\n  color: white;\n  padding: 4px 8px;\n  border-radius: 4px;\n  font-size: 12px;\n  white-space: nowrap;\n  pointer-events: none;\n  opacity: 0;\n  transition: opacity 0.2s ease;\n  z-index: 1000;\n}\n\n.timeline-clip[data-trimming] .trim-mode-tooltip {\n  opacity: 1;\n}\n\n/* Trim mode indicators */\n.timeline-clip[data-trim-mode=\"ripple\"] {\n  outline: 2px solid #28a745;\n}\n\n.timeline-clip[data-trim-mode=\"ripple\"] .clip-handle,\n.timeline-clip[data-trim-mode=\"ripple\"] .clip-trim-start,\n.timeline-clip[data-trim-mode=\"ripple\"] .clip-trim-end {\n  background: rgba(40, 167, 69, 0.3);\n}\n\n.timeline-clip[data-trim-mode=\"ripple\"] .clip-handle:after,\n.timeline-clip[data-trim-mode=\"ripple\"] .clip-trim-start:after,\n.timeline-clip[data-trim-mode=\"ripple\"] .clip-trim-end:after {\n  background: rgba(40, 167, 69, 0.7);\n}\n\n.timeline-clip[data-trim-mode=\"slip\"] {\n  outline: 2px solid #ffc107;\n}\n\n.timeline-clip[data-trim-mode=\"slip\"] .clip-handle,\n.timeline-clip[data-trim-mode=\"slip\"] .clip-trim-start,\n.timeline-clip[data-trim-mode=\"slip\"] .clip-trim-end {\n  background: rgba(255, 193, 7, 0.3);\n}\n\n.timeline-clip[data-trim-mode=\"slip\"] .clip-handle:after,\n.timeline-clip[data-trim-mode=\"slip\"] .clip-trim-start:after,\n.timeline-clip[data-trim-mode=\"slip\"] .clip-trim-end:after {\n  background: rgba(255, 193, 7, 0.7);\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("e5bc87460224ff07b0af")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.051e7fd2895fe0b5d434.hot-update.js.map