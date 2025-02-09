"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

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
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _utils_timelineValidation__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/timelineValidation */ "./src/renderer/utils/timelineValidation.ts");




const TimelineContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);
// ... (previous code remains the same until TimelineProvider)
const TimelineProvider = ({ children }) => {
    console.log('[TimelineProvider] Mounting...');
    const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(timelineReducer, {
        ..._types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState,
        history: {
            entries: [],
            currentIndex: -1
        }
    });
    const [isInitialized, setIsInitialized] = react__WEBPACK_IMPORTED_MODULE_0___default().useState(false);
    // One-time initialization effect
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        console.log('[TimelineProvider] Mounting (one-time)...');
        try {
            // Step 1: Dispatch initializing event
            window.dispatchEvent(new CustomEvent('timeline:initializing'));
            // Step 2: Set up window properties
            window.timelineDispatch = dispatch;
            window.timelineState = state;
            // Step 3: Dispatch ready event
            window.dispatchEvent(new CustomEvent('timeline:dispatchReady'));
            // Step 4: Set ready flag and dispatch initialized event
            window.timelineReady = true;
            window.dispatchEvent(new CustomEvent('timeline:initialized'));
            setIsInitialized(true);
            _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.debug('[Timeline] Initialization complete');
            // No cleanup to avoid race conditions
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.error('[TimelineProvider] Error initializing timeline:', new Error(errorMessage));
            window.dispatchEvent(new CustomEvent('timeline:error', {
                detail: { error: new Error(errorMessage) }
            }));
        }
    }, []); // Empty deps array for one-time initialization
    // Optional sync effect for development/testing
    if (true) {
        (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
            // Keep window.timelineState and window.timelineDispatch separate
            window.timelineState = state;
            window.timelineDispatch = dispatch;
        }, [state, dispatch]);
    }
    // Separate effect for state validation
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
/******/ 	__webpack_require__.h = () => ("749ef314730fe634b5a1")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.432dbd5b70f91eeea575.hot-update.js.map