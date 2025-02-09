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
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! immer */ "./node_modules/immer/dist/immer.esm.mjs");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _utils_timelineValidation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/timelineValidation */ "./src/renderer/utils/timelineValidation.ts");






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
const timelineReducer = (state, action) => {
    _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.debug('[TimelineReducer]', {
        type: action.type,
        payload: action.payload,
        isUndoable: isUndoable(action),
        currentState: {
            tracks: state.tracks.map(t => ({
                id: t.id,
                clips: t.clips.map(c => ({
                    id: c.id,
                    startTime: c.startTime,
                    endTime: c.endTime,
                    layer: c.layer
                }))
            }))
        }
    });
    switch (action.type) {
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.CLEAR_STATE: {
            const freshState = {
                ..._types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState,
                history: {
                    entries: [],
                    currentIndex: -1
                }
            };
            return freshState;
        }
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_STATE: {
            const newState = {
                ...action.payload,
                history: action.payload.history || state.history
            };
            return newState;
        }
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UNDO: {
            if (state.history.currentIndex > 0) {
                const newIndex = state.history.currentIndex - 1;
                const { inversePatches } = state.history.entries[newIndex];
                const undone = (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(state, inversePatches);
                return {
                    ...undone,
                    history: {
                        entries: state.history.entries,
                        currentIndex: newIndex
                    }
                };
            }
            return state;
        }
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REDO: {
            if (state.history.currentIndex < state.history.entries.length - 1) {
                const newIndex = state.history.currentIndex + 1;
                const { patches } = state.history.entries[newIndex];
                const redone = (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(state, patches);
                return {
                    ...redone,
                    history: {
                        entries: state.history.entries,
                        currentIndex: newIndex
                    }
                };
            }
            return state;
        }
        default: {
            const [nextState, patches, inversePatches] = (0,immer__WEBPACK_IMPORTED_MODULE_5__.produceWithPatches)(state, draft => {
                switch (action.type) {
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DURATION:
                        draft.duration = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_TRACKS:
                        draft.tracks = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_CURRENT_TIME:
                        draft.currentTime = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_PLAYING:
                        draft.isPlaying = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SCROLL_X:
                        draft.scrollX = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SCROLL_Y:
                        draft.scrollY = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_ZOOM:
                        draft.zoom = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_FPS:
                        draft.fps = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DRAGGING:
                        draft.isDragging = action.payload.isDragging;
                        draft.dragStartX = action.payload.dragStartX;
                        draft.dragStartY = action.payload.dragStartY;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_ERROR:
                        draft.error = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_TRACK:
                        draft.tracks.push(action.payload.track);
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_TRACK: {
                        const trackIndex = draft.tracks.findIndex(t => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            draft.tracks[trackIndex] = {
                                ...draft.tracks[trackIndex],
                                ...action.payload.track
                            };
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_TRACK:
                        draft.tracks = draft.tracks.filter(t => t.id !== action.payload.trackId);
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_CLIP: {
                        const trackToAddClip = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToAddClip) {
                            const newClip = {
                                ...action.payload.clip,
                                startTime: action.payload.clip.startTime ?? 0,
                                endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0)
                            };
                            trackToAddClip.clips.push(newClip);
                            trackToAddClip.clips.sort((a, b) => a.startTime - b.startTime);
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_CLIP: {
                        const trackWithClip = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackWithClip) {
                            const clipIndex = trackWithClip.clips.findIndex(c => c.id === action.payload.clipId);
                            if (clipIndex !== -1) {
                                trackWithClip.clips[clipIndex] = {
                                    ...trackWithClip.clips[clipIndex],
                                    ...action.payload.clip
                                };
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_CLIP: {
                        const trackToRemoveClip = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToRemoveClip) {
                            trackToRemoveClip.clips = trackToRemoveClip.clips.filter(c => c.id !== action.payload.clipId);
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SPLIT_CLIP: {
                        const trackToSplit = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToSplit) {
                            const clipToSplit = trackToSplit.clips.find(c => c.id === action.payload.clipId);
                            if (clipToSplit && action.payload.time > clipToSplit.startTime && action.payload.time < clipToSplit.endTime) {
                                const splitPoint = action.payload.time;
                                trackToSplit.clips = trackToSplit.clips.filter(c => c.id !== clipToSplit.id);
                                const firstClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-1`,
                                    endTime: splitPoint
                                };
                                const secondClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-2`,
                                    startTime: splitPoint
                                };
                                trackToSplit.clips.push(firstClip, secondClip);
                                trackToSplit.clips.sort((a, b) => a.startTime - b.startTime);
                                draft.selectedClipIds = [firstClip.id];
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SELECT_CLIPS:
                        draft.selectedClipIds = action.payload.clipIds;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SELECTED_TRACK_ID:
                        draft.selectedTrackId = action.payload;
                        break;
                }
            });
            if (isUndoable(action)) {
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_5__.produce)(nextState, draft => {
                    if (draft.history.currentIndex < draft.history.entries.length - 1) {
                        draft.history.entries = draft.history.entries.slice(0, draft.history.currentIndex + 1);
                    }
                    const entry = {
                        type: 'partial',
                        timestamp: Date.now(),
                        patches: JSON.parse(JSON.stringify(patches)),
                        inversePatches: JSON.parse(JSON.stringify(inversePatches)),
                        description: getHistoryDescription(action)
                    };
                    draft.history.entries.push(entry);
                    draft.history.currentIndex++;
                    if (draft.history.entries.length > _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.History.MAX_HISTORY_SIZE) {
                        draft.history.entries = draft.history.entries.slice(-_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.History.MAX_HISTORY_SIZE);
                        draft.history.currentIndex = draft.history.entries.length - 1;
                    }
                });
                return finalState;
            }
            return nextState;
        }
    }
};
const TimelineProvider = ({ children }) => {
    const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(timelineReducer, {
        ..._types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState,
        history: {
            entries: [],
            currentIndex: -1
        }
    });
    const [isInitialized, setIsInitialized] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        try {
            window.dispatchEvent(new CustomEvent('timeline:initializing'));
            window.timelineDispatch = dispatch;
            window.timelineState = state;
            window.dispatchEvent(new CustomEvent('timeline:dispatchReady'));
            window.timelineReady = true;
            window.dispatchEvent(new CustomEvent('timeline:initialized'));
            setIsInitialized(true);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.error('[TimelineProvider] Error initializing timeline:', new Error(errorMessage));
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
            const validationErrors = (0,_utils_timelineValidation__WEBPACK_IMPORTED_MODULE_4__.validateTimelineState)(state);
            if (validationErrors.length > 0) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.warn('[Timeline] State validation errors:', validationErrors);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.error('[Timeline] State validation failed:', new Error(errorMessage));
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
/******/ 	__webpack_require__.h = () => ("9258e196ec2b175cb32a")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.746d75b71c1539b2682d.hot-update.js.map