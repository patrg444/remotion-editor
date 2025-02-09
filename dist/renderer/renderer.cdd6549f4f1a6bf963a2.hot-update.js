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
/* harmony export */   timelineReducer: () => (/* binding */ timelineReducer)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! immer */ "./node_modules/immer/dist/immer.esm.mjs");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");




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
    'SET_SELECTED_CLIP_IDS',
    'SELECT_CLIPS',
    'SET_SELECTED_TRACK_ID',
    'SET_DURATION',
    'CLEAR_STATE'
]);
const CHECKPOINT_ACTIONS = new Set([
    'ADD_TRACK',
    'REMOVE_TRACK',
    'ADD_CLIP',
    'REMOVE_CLIP',
    'SPLIT_CLIP',
    'SET_TRACKS',
    'MOVE_TRACK',
    'MOVE_CLIP'
]);
const timelineReducer = (state, action) => {
    return (0,immer__WEBPACK_IMPORTED_MODULE_3__.produce)(state, draft => {
        // Add explicit handling for CLEAR_STATE
        if (action.type === _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.CLEAR_STATE) {
            return _types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState;
        }
        let shouldCreateHistoryEntry = false;
        let historyDescription = '';
        let beforeState = state;
        let isCheckpoint = false;
        if (!NON_UNDOABLE_ACTIONS.has(action.type)) {
            shouldCreateHistoryEntry = true;
            historyDescription = getHistoryDescription(action);
            beforeState = { ...state };
            isCheckpoint = CHECKPOINT_ACTIONS.has(action.type);
            _utils_logger__WEBPACK_IMPORTED_MODULE_2__.logger.debug('Processing action:', {
                type: action.type,
                isCheckpoint,
                description: historyDescription
            });
        }
        // Rest of the reducer implementation remains the same...
    });
    // Rest of the reducer implementation remains the same...
};
// Rest of the reducer implementation remains the same...


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("c1d9909b0eec6e01c834")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.cdd6549f4f1a6bf963a2.hot-update.js.map