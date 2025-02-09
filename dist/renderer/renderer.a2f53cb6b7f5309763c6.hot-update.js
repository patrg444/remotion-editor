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


/***/ }),

/***/ "./src/renderer/contexts/TimelineContext.tsx":
/*!***************************************************!*\
  !*** ./src/renderer/contexts/TimelineContext.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineContext: () => (/* binding */ TimelineContext),
/* harmony export */   TimelineProvider: () => (/* binding */ TimelineProvider),
/* harmony export */   useTimelineContext: () => (/* binding */ useTimelineContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! immer */ "./node_modules/immer/dist/immer.esm.mjs");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _utils_timelineValidation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/timelineValidation */ "./src/renderer/utils/timelineValidation.ts");





// Enable patches for Immer
(0,immer__WEBPACK_IMPORTED_MODULE_4__.enablePatches)();
const TimelineContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);
const NON_UNDOABLE_ACTIONS = new Set([
    'SET_CURRENT_TIME',
    'SET_PLAYING',
    'SET_SCROLL_X',
    'SET_SCROLL_Y',
    'SET_DRAGGING',
    'SET_ERROR',
    'RESTORE_SNAPSHOT',
    'SET_IS_PLAYING',
    'SET_IS_DRAGGING',
    'SELECT_CLIPS',
    'SET_SELECTED_TRACK_ID',
    'SET_DURATION',
    'CLEAR_STATE',
    'SET_STATE',
    'SET_TRACKS',
    'SET_SHOW_WAVEFORMS',
    'SET_SHOW_KEYFRAMES',
    'SET_SHOW_TRANSITIONS',
    'SET_SHOW_EFFECTS',
    'SET_RENDER_QUALITY',
    'SET_SNAPPING',
    'SELECT_TRACK',
    'SELECT_CAPTIONS',
    'PUSH_HISTORY',
    'SET_HISTORY_INDEX',
    'CLEAR_HISTORY'
]);
const getHistoryDescription = (action) => {
    switch (action.type) {
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_TRACK:
            return 'Add track';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_TRACK:
            return 'Remove track';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_CLIP:
            return 'Add clip';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_CLIP:
            return 'Remove clip';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.MOVE_CLIP:
            return 'Move clip';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SPLIT_CLIP:
            return 'Split clip';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.TRIM_CLIP:
            return 'Trim clip';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_ZOOM:
            return 'Change zoom';
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_FPS:
            return 'Change FPS';
        default:
            return action.type;
    }
};
const isUndoable = (action) => {
    return !NON_UNDOABLE_ACTIONS.has(action.type);
};
// ... (rest of the file remains the same as in your previous update)
const TimelineProvider = ({ children }) => {
    const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(timelineReducer, {
        ..._types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState,
        history: {
            entries: [],
            currentIndex: -1
        }
    });
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        try {
            window.dispatchEvent(new CustomEvent('timeline:initializing'));
            window.timelineDispatch = dispatch;
            window.timelineState = state;
            window.dispatchEvent(new CustomEvent('timeline:dispatchReady'));
            window.timelineReady = true;
            window.dispatchEvent(new CustomEvent('timeline:initialized'));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.error('[TimelineProvider] Error initializing timeline:', new Error(errorMessage));
            window.dispatchEvent(new CustomEvent('timeline:error', {
                detail: { error: new Error(errorMessage) }
            }));
        }
    }, []);
    if (true) {
        (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
            window.timelineState = state;
            window.timelineDispatch = dispatch;
        }, [state, dispatch]);
    }
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        try {
            const validationErrors = (0,_utils_timelineValidation__WEBPACK_IMPORTED_MODULE_3__.validateTimelineState)(state);
            if (validationErrors.length > 0) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.warn('[Timeline] State validation errors:', validationErrors);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.error('[Timeline] State validation failed:', new Error(errorMessage));
        }
    }, [state]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(TimelineContext.Provider, { value: { state, dispatch } }, children));
};
const useTimelineContext = () => {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(TimelineContext);
    if (!context) {
        throw new Error('useTimelineContext must be used within a TimelineProvider');
    }
    return context;
};


/***/ }),

/***/ "./src/renderer/hooks/useTimelineContext.ts":
/*!**************************************************!*\
  !*** ./src/renderer/hooks/useTimelineContext.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useTimelineContext: () => (/* binding */ useTimelineContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contexts/TimelineContext */ "./src/renderer/contexts/TimelineContext.tsx");


const useTimelineContext = () => {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__.TimelineContext);
    if (!context) {
        throw new Error('useTimelineContext must be used within a TimelineProvider');
    }
    return context;
};


/***/ }),

/***/ "./src/renderer/utils/timelineValidation.ts":
/*!**************************************************!*\
  !*** ./src/renderer/utils/timelineValidation.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   validateTimelineState: () => (/* binding */ validateTimelineState)
/* harmony export */ });
/**
 * Validates the timeline state structure and returns any validation errors
 */
function validateTimelineState(state) {
    const errors = [];
    // Check required properties
    if (!state) {
        errors.push('Timeline state is undefined');
        return errors;
    }
    // Check tracks array
    if (!Array.isArray(state.tracks)) {
        errors.push('Tracks must be an array');
    }
    else {
        // Validate each track
        state.tracks.forEach((track, index) => {
            if (!track.id) {
                errors.push(`Track at index ${index} is missing id`);
            }
            if (!track.name) {
                errors.push(`Track at index ${index} is missing name`);
            }
            if (!track.type) {
                errors.push(`Track at index ${index} is missing type`);
            }
            if (!Array.isArray(track.clips)) {
                errors.push(`Track at index ${index} clips must be an array`);
            }
        });
    }
    // Check numeric properties
    if (typeof state.currentTime !== 'number') {
        errors.push('currentTime must be a number');
    }
    if (typeof state.duration !== 'number') {
        errors.push('duration must be a number');
    }
    if (typeof state.zoom !== 'number') {
        errors.push('zoom must be a number');
    }
    if (typeof state.fps !== 'number') {
        errors.push('fps must be a number');
    }
    if (typeof state.scrollX !== 'number') {
        errors.push('scrollX must be a number');
    }
    if (typeof state.scrollY !== 'number') {
        errors.push('scrollY must be a number');
    }
    // Check boolean properties
    if (typeof state.isPlaying !== 'boolean') {
        errors.push('isPlaying must be a boolean');
    }
    if (typeof state.isDragging !== 'boolean') {
        errors.push('isDragging must be a boolean');
    }
    // Check arrays
    if (!Array.isArray(state.selectedClipIds)) {
        errors.push('selectedClipIds must be an array');
    }
    if (!Array.isArray(state.selectedCaptionIds)) {
        errors.push('selectedCaptionIds must be an array');
    }
    if (!Array.isArray(state.markers)) {
        errors.push('markers must be an array');
    }
    // Check history
    if (!state.history) {
        errors.push('history is missing');
    }
    else {
        if (!Array.isArray(state.history.entries)) {
            errors.push('history.entries must be an array');
        }
        if (typeof state.history.currentIndex !== 'number') {
            errors.push('history.currentIndex must be a number');
        }
    }
    return errors;
}


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("2ab1f8d422e75aa749ff")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.a2f53cb6b7f5309763c6.hot-update.js.map