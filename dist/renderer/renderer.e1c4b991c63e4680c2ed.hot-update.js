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
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_sourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.timeline-transition {
  position: absolute;
  height: 20px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: all;
  z-index: 2;
}

.timeline-transition-handle {
  position: absolute;
  width: 8px;
  height: 100%;
  background: rgba(255, 255, 255, 0.3);
  cursor: ew-resize;
  z-index: 3;
}

.timeline-transition-handle.left {
  left: 0;
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.timeline-transition-handle.right {
  right: 0;
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.timeline-transition-icon {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}

.timeline-transition-preview {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.timeline-transition canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.1);
}
`, "",{"version":3,"sources":["webpack://./src/renderer/styles/timeline.css"],"names":[],"mappings":"AAAA;EACE,kBAAkB;EAClB,YAAY;EACZ,8BAA8B;EAC9B,0CAA0C;EAC1C,kBAAkB;EAClB,aAAa;EACb,mBAAmB;EACnB,uBAAuB;EACvB,mBAAmB;EACnB,UAAU;AACZ;;AAEA;EACE,kBAAkB;EAClB,UAAU;EACV,YAAY;EACZ,oCAAoC;EACpC,iBAAiB;EACjB,UAAU;AACZ;;AAEA;EACE,OAAO;EACP,2BAA2B;EAC3B,8BAA8B;AAChC;;AAEA;EACE,QAAQ;EACR,4BAA4B;EAC5B,+BAA+B;AACjC;;AAEA;EACE,eAAe;EACf,+BAA+B;EAC/B,oBAAoB;AACtB;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,WAAW;EACX,YAAY;EACZ,gBAAgB;EAChB,oBAAoB;AACtB;;AAEA;EACE,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,WAAW;EACX,YAAY;EACZ,oBAAoB;EACpB,8BAA8B;AAChC","sourcesContent":[".timeline-transition {\n  position: absolute;\n  height: 20px;\n  background: rgba(0, 0, 0, 0.2);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n  border-radius: 4px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  pointer-events: all;\n  z-index: 2;\n}\n\n.timeline-transition-handle {\n  position: absolute;\n  width: 8px;\n  height: 100%;\n  background: rgba(255, 255, 255, 0.3);\n  cursor: ew-resize;\n  z-index: 3;\n}\n\n.timeline-transition-handle.left {\n  left: 0;\n  border-top-left-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\n\n.timeline-transition-handle.right {\n  right: 0;\n  border-top-right-radius: 4px;\n  border-bottom-right-radius: 4px;\n}\n\n.timeline-transition-icon {\n  font-size: 14px;\n  color: rgba(255, 255, 255, 0.8);\n  pointer-events: none;\n}\n\n.timeline-transition-preview {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n  pointer-events: none;\n}\n\n.timeline-transition canvas {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  pointer-events: none;\n  background: rgba(0, 0, 0, 0.1);\n}\n"],"sourceRoot":""}]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("a95e86c2b8e0249b9507")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.e1c4b991c63e4680c2ed.hot-update.js.map