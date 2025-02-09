"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/contexts/TimelineContext.tsx":
/*!***************************************************!*\
  !*** ./src/renderer/contexts/TimelineContext.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   timelineReducer: () => (/* binding */ timelineReducer)
/* harmony export */ });
// Previous imports remain the same...
const timelineReducer = (state, action) => {
    return produce(state, draft => {
        // Add explicit handling for CLEAR_STATE
        if (action.type === 'CLEAR_STATE') {
            return {
                tracks: [],
                currentTime: 0,
                duration: 0,
                zoom: 1,
                fps: 30,
                isPlaying: false,
                isDragging: false,
                scrollX: 0,
                scrollY: 0,
                scrollLeft: 0,
                selectedClipIds: [],
                selectedCaptionIds: [],
                markers: [],
                history: {
                    entries: [],
                    currentIndex: -1
                },
                rippleState: {},
                isSnappingEnabled: true
            };
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
            logger.debug('Processing action:', {
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
/******/ 	__webpack_require__.h = () => ("0c15eef5c030e2a242eb")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.f888857986706bf4a422.hot-update.js.map