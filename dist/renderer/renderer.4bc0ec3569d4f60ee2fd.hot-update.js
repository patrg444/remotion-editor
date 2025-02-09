"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/App.tsx":
/*!******************************!*\
  !*** ./src/renderer/App.tsx ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   App: () => (/* binding */ App),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contexts/TimelineContext */ "./src/renderer/contexts/TimelineContext.tsx");
/* harmony import */ var _contexts_MediaBinContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contexts/MediaBinContext */ "./src/renderer/contexts/MediaBinContext.tsx");
/* harmony import */ var _components_TimelineContainer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/TimelineContainer */ "./src/renderer/components/TimelineContainer.tsx");
/* harmony import */ var _components_MediaBin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/MediaBin */ "./src/renderer/components/MediaBin.tsx");
/* harmony import */ var _components_Inspector__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/Inspector */ "./src/renderer/components/Inspector.tsx");
/* harmony import */ var _components_PreviewDisplay__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/PreviewDisplay */ "./src/renderer/components/PreviewDisplay.tsx");







const App = () => {
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__.TimelineProvider, null,
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_contexts_MediaBinContext__WEBPACK_IMPORTED_MODULE_2__.MediaBinProvider, null,
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-container app-root", "data-testid": "app-root" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-sidebar" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_MediaBin__WEBPACK_IMPORTED_MODULE_4__["default"], { className: "media-bin" })),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-main" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-top" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-inspector" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_Inspector__WEBPACK_IMPORTED_MODULE_5__.Inspector, null)),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-preview" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_PreviewDisplay__WEBPACK_IMPORTED_MODULE_6__.PreviewDisplay, null))),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-timeline" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_TimelineContainer__WEBPACK_IMPORTED_MODULE_3__.TimelineContainer, null)))))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("c6365ea61b1cdc45bbe8")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.4bc0ec3569d4f60ee2fd.hot-update.js.map