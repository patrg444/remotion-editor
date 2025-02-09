"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/timeline.css":
/*!********************************************************************************!*\
  !*** ./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/timeline.css ***!
  \********************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/sourceMaps.js */ "./node_modules/css-loader/dist/runtime/sourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_clips_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! -!../../../node_modules/css-loader/dist/cjs.js!./clips.css */ "./node_modules/css-loader/dist/cjs.js!./src/renderer/styles/clips.css");
// Imports



var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_clips_css__WEBPACK_IMPORTED_MODULE_2__["default"]);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Timeline Container */
.timeline-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #1a1a1a;
  color: #fff;
  overflow: hidden;
  user-select: none;
}

.timeline-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 60px;
  overflow: hidden;
}

.timeline-tracks-container {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 60px;
}

.timeline-tracks-controls {
  flex: 0 0 100px;
  background: #252525;
  border-right: 2px solid #444;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.timeline-tracks-content {
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
  touch-action: none;
}

/* Timeline Content */
.timeline-content {
  position: relative;
  height: 100%;
  min-height: 60px;
  touch-action: none;
}

/* Ruler Area */
.timeline-ruler {
  flex: 0 0 24px;
  position: sticky;
  top: 0;
  display: flex;
  background: linear-gradient(to bottom, #303030, #2a2a2a);
  border-bottom: 1px solid #444;
  z-index: 100;
}

.timeline-ruler-area {
  flex: 0 0 100px;
  background: #252525;
  border-right: 2px solid #444;
}

.timeline-ruler-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* Tracks Area */
.timeline-body {
  flex: 1;
  min-height: 30px;
  position: relative;
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  touch-action: none;
}

/* Track */
.timeline-track {
  position: relative;
  height: 60px;
  min-height: 60px;
  background: linear-gradient(to bottom, #2d2d2d, #252525);
  border-bottom: 1px solid #444;
  touch-action: none;
}

.timeline-track.selected {
  background: linear-gradient(to bottom, #2d2d2d, #252525);
  border-left: 2px solid #007bff;
}

.timeline-track.empty {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(68, 68, 68, 0.1) 10px,
    rgba(68, 68, 68, 0.1) 20px
  );
}

/* Track Controls */
.track-controls {
  position: relative;
  height: 60px;
  min-height: 60px;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to right, #2a2a2a, #252525);
  border-bottom: 1px solid #444;
}

.track-controls.selected {
  background: linear-gradient(to right, #2d2d2d, #252525);
  border-left: 2px solid #007bff;
}

/* Track Content */
.track-content {
  position: absolute;
  left: 0;
  right: 0;
  height: 60px;
  overflow: visible;
  user-select: none;
  touch-action: none;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  transition: background-color 0.2s ease;
  pointer-events: auto;
  isolation: isolate; /* Create new stacking context */
  z-index: 1; /* Ensure track content is above other elements */
}

/* Ensure clips within track content stack properly */
.track-content > * {
  position: absolute;
  z-index: 1; /* Base z-index for clips */
}

.track-content > *:hover {
  z-index: 2; /* Raise z-index on hover */
}

.track-content > *.selected {
  z-index: 3; /* Highest z-index for selected clips */
}

.track-content.drag-over {
  background-color: rgba(0, 123, 255, 0.1);
  outline: 2px dashed var(--primary-color);
  outline-offset: -2px;
}

/* Playhead */
.timeline-playhead {
  position: absolute;
  width: 2px;
  background: #ff4444;
  pointer-events: none;
  z-index: 1000;
  transform: translate3d(0, 0, 0);
  will-change: transform;
  left: 0;
}

.timeline-playhead.ruler {
  top: 0;
  height: 24px;
  left: 0;
}

.timeline-playhead.tracks {
  top: 24px;
  bottom: 0;
  left: 0;
}

.timeline-playhead-head {
  position: absolute;
  top: -5px;
  left: -4px;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #ff4444;
}

/* Track Controls Elements */
.track-buttons-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px;
}

.track-name {
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  padding: 3px 4px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 18px;
  line-height: 18px;
  letter-spacing: 0.2px;
}

.track-name-input {
  font-size: 12px;
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 2px;
  color: #fff;
  padding: 2px 3px;
  width: calc(100% - 4px);
  height: 18px;
  letter-spacing: 0.2px;
}

.track-buttons-right {
  display: flex;
  gap: 0;
  margin-left: 2px;
}

.track-visibility-toggle,
.track-mute-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 1px;
  padding: 0;
  font-size: 11px;
  line-height: 1;
}

.track-visibility-toggle:hover,
.track-mute-toggle:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.track-visibility-toggle:active,
.track-mute-toggle:active {
  transform: scale(0.95);
}

.track-move-up,
.track-move-down {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 10px;
  height: 10px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 9px;
  padding: 0;
}

.track-move-up:hover,
.track-move-down:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.track-move-up:active,
.track-move-down:active {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(1px);
}

.track-delete-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border: none;
  border-radius: 2px;
  background: transparent;
  color: #ff4444;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 11px;
  padding: 0;
}

.track-delete-button:hover {
  background: rgba(255, 68, 68, 0.15);
  color: #ff6666;
}

.track-delete-button:active {
  background: rgba(255, 68, 68, 0.25);
  transform: translateY(1px);
}

.track-controls-group {
  display: flex;
  align-items: center;
  gap: 1px;
}

.track-arrows {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Ruler Elements */
.ruler-tick {
  position: absolute;
  width: 1px;
  background: #555;
  bottom: 0;
  transition: background 0.2s ease;
}

.ruler-tick.major {
  height: 12px;
  background: #777;
  width: 1px;
}

.ruler-tick.minor {
  height: 8px;
}

.ruler-label {
  position: absolute;
  font-size: 9px;
  color: #aaa;
  bottom: 14px;
  transform: translateX(-50%);
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.ruler-tick:hover {
  background: #666;
}

.ruler-tick.major:hover {
  background: #888;
}

/* Timeline Tools */
.timeline-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #2a2a2a;
  color: #888;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;
}

.tool-button:hover {
  background: #333;
  color: #fff;
  border-color: #555;
}

.tool-button.active {
  background: #007bff;
  color: #fff;
  border-color: #0056b3;
}

.tool-button.active:hover {
  background: #0056b3;
}

/* Import clips.css for clip styles */
`, "",{"version":3,"sources":["webpack://./src/renderer/styles/timeline.css"],"names":[],"mappings":"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","sourcesContent":["/* Timeline Container */\n.timeline-container {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  background: #1a1a1a;\n  color: #fff;\n  overflow: hidden;\n  user-select: none;\n}\n\n.timeline-wrapper {\n  position: relative;\n  width: 100%;\n  height: 100%;\n  display: flex;\n  flex-direction: column;\n  min-height: 60px;\n  overflow: hidden;\n}\n\n.timeline-tracks-container {\n  position: relative;\n  display: flex;\n  flex: 1;\n  min-height: 60px;\n}\n\n.timeline-tracks-controls {\n  flex: 0 0 100px;\n  background: #252525;\n  border-right: 2px solid #444;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n}\n\n.timeline-tracks-content {\n  flex: 1;\n  position: relative;\n  overflow-x: auto;\n  overflow-y: hidden;\n  touch-action: none;\n}\n\n/* Timeline Content */\n.timeline-content {\n  position: relative;\n  height: 100%;\n  min-height: 60px;\n  touch-action: none;\n}\n\n/* Ruler Area */\n.timeline-ruler {\n  flex: 0 0 24px;\n  position: sticky;\n  top: 0;\n  display: flex;\n  background: linear-gradient(to bottom, #303030, #2a2a2a);\n  border-bottom: 1px solid #444;\n  z-index: 100;\n}\n\n.timeline-ruler-area {\n  flex: 0 0 100px;\n  background: #252525;\n  border-right: 2px solid #444;\n}\n\n.timeline-ruler-content {\n  flex: 1;\n  position: relative;\n  overflow: hidden;\n}\n\n/* Tracks Area */\n.timeline-body {\n  flex: 1;\n  min-height: 30px;\n  position: relative;\n  display: flex;\n  overflow-x: auto;\n  overflow-y: hidden;\n  touch-action: none;\n}\n\n/* Track */\n.timeline-track {\n  position: relative;\n  height: 60px;\n  min-height: 60px;\n  background: linear-gradient(to bottom, #2d2d2d, #252525);\n  border-bottom: 1px solid #444;\n  touch-action: none;\n}\n\n.timeline-track.selected {\n  background: linear-gradient(to bottom, #2d2d2d, #252525);\n  border-left: 2px solid #007bff;\n}\n\n.timeline-track.empty {\n  background: repeating-linear-gradient(\n    45deg,\n    transparent,\n    transparent 10px,\n    rgba(68, 68, 68, 0.1) 10px,\n    rgba(68, 68, 68, 0.1) 20px\n  );\n}\n\n/* Track Controls */\n.track-controls {\n  position: relative;\n  height: 60px;\n  min-height: 60px;\n  padding: 0;\n  display: flex;\n  flex-direction: column;\n  background: linear-gradient(to right, #2a2a2a, #252525);\n  border-bottom: 1px solid #444;\n}\n\n.track-controls.selected {\n  background: linear-gradient(to right, #2d2d2d, #252525);\n  border-left: 2px solid #007bff;\n}\n\n/* Track Content */\n.track-content {\n  position: absolute;\n  left: 0;\n  right: 0;\n  height: 60px;\n  overflow: visible;\n  user-select: none;\n  touch-action: none;\n  transform: translate3d(0, 0, 0);\n  will-change: transform;\n  transition: background-color 0.2s ease;\n  pointer-events: auto;\n  isolation: isolate; /* Create new stacking context */\n  z-index: 1; /* Ensure track content is above other elements */\n}\n\n/* Ensure clips within track content stack properly */\n.track-content > * {\n  position: absolute;\n  z-index: 1; /* Base z-index for clips */\n}\n\n.track-content > *:hover {\n  z-index: 2; /* Raise z-index on hover */\n}\n\n.track-content > *.selected {\n  z-index: 3; /* Highest z-index for selected clips */\n}\n\n.track-content.drag-over {\n  background-color: rgba(0, 123, 255, 0.1);\n  outline: 2px dashed var(--primary-color);\n  outline-offset: -2px;\n}\n\n/* Playhead */\n.timeline-playhead {\n  position: absolute;\n  width: 2px;\n  background: #ff4444;\n  pointer-events: none;\n  z-index: 1000;\n  transform: translate3d(0, 0, 0);\n  will-change: transform;\n  left: 0;\n}\n\n.timeline-playhead.ruler {\n  top: 0;\n  height: 24px;\n  left: 0;\n}\n\n.timeline-playhead.tracks {\n  top: 24px;\n  bottom: 0;\n  left: 0;\n}\n\n.timeline-playhead-head {\n  position: absolute;\n  top: -5px;\n  left: -4px;\n  width: 0;\n  height: 0;\n  border-left: 4px solid transparent;\n  border-right: 4px solid transparent;\n  border-top: 5px solid #ff4444;\n}\n\n/* Track Controls Elements */\n.track-buttons-left {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n  padding: 4px;\n}\n\n.track-name {\n  font-size: 12px;\n  font-weight: 600;\n  color: #fff;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n  padding: 3px 4px;\n  border-radius: 2px;\n  background: rgba(0, 0, 0, 0.2);\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  height: 18px;\n  line-height: 18px;\n  letter-spacing: 0.2px;\n}\n\n.track-name-input {\n  font-size: 12px;\n  background: #1a1a1a;\n  border: 1px solid #444;\n  border-radius: 2px;\n  color: #fff;\n  padding: 2px 3px;\n  width: calc(100% - 4px);\n  height: 18px;\n  letter-spacing: 0.2px;\n}\n\n.track-buttons-right {\n  display: flex;\n  gap: 0;\n  margin-left: 2px;\n}\n\n.track-visibility-toggle,\n.track-mute-toggle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 14px;\n  height: 14px;\n  border: none;\n  border-radius: 2px;\n  background: transparent;\n  color: #888;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  margin-left: 1px;\n  padding: 0;\n  font-size: 11px;\n  line-height: 1;\n}\n\n.track-visibility-toggle:hover,\n.track-mute-toggle:hover {\n  background: rgba(255, 255, 255, 0.05);\n  color: #fff;\n}\n\n.track-visibility-toggle:active,\n.track-mute-toggle:active {\n  transform: scale(0.95);\n}\n\n.track-move-up,\n.track-move-down {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 10px;\n  height: 10px;\n  border: none;\n  border-radius: 0;\n  background: transparent;\n  color: #888;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 9px;\n  padding: 0;\n}\n\n.track-move-up:hover,\n.track-move-down:hover {\n  background: rgba(255, 255, 255, 0.1);\n  color: #fff;\n}\n\n.track-move-up:active,\n.track-move-down:active {\n  background: rgba(255, 255, 255, 0.15);\n  transform: translateY(1px);\n}\n\n.track-delete-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 14px;\n  height: 14px;\n  border: none;\n  border-radius: 2px;\n  background: transparent;\n  color: #ff4444;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  font-size: 11px;\n  padding: 0;\n}\n\n.track-delete-button:hover {\n  background: rgba(255, 68, 68, 0.15);\n  color: #ff6666;\n}\n\n.track-delete-button:active {\n  background: rgba(255, 68, 68, 0.25);\n  transform: translateY(1px);\n}\n\n.track-controls-group {\n  display: flex;\n  align-items: center;\n  gap: 1px;\n}\n\n.track-arrows {\n  display: flex;\n  flex-direction: column;\n  gap: 0;\n}\n\n/* Ruler Elements */\n.ruler-tick {\n  position: absolute;\n  width: 1px;\n  background: #555;\n  bottom: 0;\n  transition: background 0.2s ease;\n}\n\n.ruler-tick.major {\n  height: 12px;\n  background: #777;\n  width: 1px;\n}\n\n.ruler-tick.minor {\n  height: 8px;\n}\n\n.ruler-label {\n  position: absolute;\n  font-size: 9px;\n  color: #aaa;\n  bottom: 14px;\n  transform: translateX(-50%);\n  font-weight: 500;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);\n}\n\n.ruler-tick:hover {\n  background: #666;\n}\n\n.ruler-tick.major:hover {\n  background: #888;\n}\n\n/* Timeline Tools */\n.timeline-tools {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin: 0 16px;\n}\n\n.tool-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 28px;\n  height: 28px;\n  border: 1px solid #444;\n  border-radius: 4px;\n  background: #2a2a2a;\n  color: #888;\n  cursor: pointer;\n  transition: all 0.2s ease;\n  padding: 0;\n}\n\n.tool-button:hover {\n  background: #333;\n  color: #fff;\n  border-color: #555;\n}\n\n.tool-button.active {\n  background: #007bff;\n  color: #fff;\n  border-color: #0056b3;\n}\n\n.tool-button.active:hover {\n  background: #0056b3;\n}\n\n/* Import clips.css for clip styles */\n@import './clips.css';\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("eacbc5d2d6ae16501128")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.74e18ce99203760d07db.hot-update.js.map