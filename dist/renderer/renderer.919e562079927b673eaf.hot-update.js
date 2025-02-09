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
/* harmony export */   timelineReducer: () => (/* binding */ timelineReducer),
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
    'SET_STATE'
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
    switch (action.type) {
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.CLEAR_STATE: {
            // Create a fresh copy of initial state with empty history
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
            // If the payload has a history property, use it, otherwise preserve the current history
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
                // Create a deep copy of state to avoid modifying history
                const stateCopy = JSON.parse(JSON.stringify(state));
                const undone = (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(stateCopy, inversePatches);
                // Preserve original history
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
                // Create a deep copy of state to avoid modifying history
                const stateCopy = JSON.parse(JSON.stringify(state));
                const redone = (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(stateCopy, patches);
                // Preserve original history
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
                        draft.currentTime = action.payload.time;
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
                            trackToAddClip.clips = trackToAddClip.clips.filter(c => c.id !== action.payload.clip.id);
                            const newClip = {
                                ...action.payload.clip,
                                startTime: action.payload.clip.startTime ?? 0,
                                endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
                                initialBounds: action.payload.clip.initialBounds || {
                                    startTime: action.payload.clip.startTime ?? 0,
                                    endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
                                    mediaOffset: action.payload.clip.mediaOffset ?? 0,
                                    mediaDuration: action.payload.clip.mediaDuration ?? ((action.payload.clip.endTime ?? 0) - (action.payload.clip.startTime ?? 0))
                                }
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
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.MOVE_CLIP: {
                        const sourceTrack = draft.tracks.find(t => t.id === action.payload.sourceTrackId);
                        const targetTrack = draft.tracks.find(t => t.id === action.payload.targetTrackId);
                        if (sourceTrack && targetTrack) {
                            const clipToMove = sourceTrack.clips.find(c => c.id === action.payload.clipId);
                            if (clipToMove) {
                                const desiredStart = Math.max(0, action.payload.newTime);
                                const delta = desiredStart - clipToMove.startTime;
                                const newStartTime = clipToMove.startTime + delta;
                                const newEndTime = clipToMove.endTime + delta;
                                const updatedClip = {
                                    ...clipToMove,
                                    startTime: newStartTime,
                                    endTime: newEndTime,
                                    mediaOffset: clipToMove.mediaOffset + delta,
                                    handles: {
                                        startPosition: (clipToMove.handles?.startPosition ?? clipToMove.mediaOffset) + delta,
                                        endPosition: (clipToMove.handles?.endPosition ?? (clipToMove.mediaOffset + (clipToMove.endTime - clipToMove.startTime))) + delta
                                    },
                                    initialBounds: {
                                        ...clipToMove.initialBounds,
                                        startTime: newStartTime,
                                        endTime: newEndTime,
                                        mediaOffset: (clipToMove.initialBounds?.mediaOffset ?? clipToMove.mediaOffset) + delta,
                                        mediaDuration: clipToMove.initialBounds?.mediaDuration ?? clipToMove.mediaDuration
                                    }
                                };
                                if (sourceTrack.id === targetTrack.id) {
                                    const clipIndex = sourceTrack.clips.findIndex(c => c.id === clipToMove.id);
                                    if (clipIndex !== -1) {
                                        sourceTrack.clips[clipIndex] = updatedClip;
                                    }
                                }
                                else {
                                    sourceTrack.clips = sourceTrack.clips.filter(c => c.id !== clipToMove.id);
                                    targetTrack.clips.push(updatedClip);
                                }
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.TRIM_CLIP: {
                        for (const track of draft.tracks) {
                            const clipToTrim = track.clips.find(c => c.id === action.payload.clipId);
                            if (clipToTrim) {
                                const oldEndTime = clipToTrim.endTime;
                                const clipIndex = track.clips.findIndex(c => c.id === clipToTrim.id);
                                const effectiveMax = ((clipToTrim.initialBounds?.mediaOffset ?? clipToTrim.mediaOffset) + (clipToTrim.initialBounds?.mediaDuration ?? clipToTrim.mediaDuration)) - clipToTrim.mediaOffset;
                                const maxEndTime = clipToTrim.startTime + effectiveMax;
                                const minEndTime = clipToTrim.startTime + 0.1;
                                let newEndTime = oldEndTime;
                                if (action.payload.ripple) {
                                    const dragTargetEndTime = action.payload.endTime ?? oldEndTime;
                                    const dragDirection = Math.sign(dragTargetEndTime - oldEndTime);
                                    const currentDuration = oldEndTime - clipToTrim.startTime;
                                    const isInitialState = Math.abs(currentDuration - 2) < 0.01;
                                    if (!draft.rippleState) {
                                        draft.rippleState = {};
                                    }
                                    if (!(clipToTrim.id in draft.rippleState)) {
                                        draft.rippleState[clipToTrim.id] = { initialExtensionDone: false };
                                    }
                                    if (dragDirection > 0) {
                                        if (isInitialState && !draft.rippleState[clipToTrim.id].initialExtensionDone) {
                                            newEndTime = Math.min(dragTargetEndTime, maxEndTime);
                                            if (newEndTime > oldEndTime) {
                                                draft.rippleState[clipToTrim.id].initialExtensionDone = true;
                                            }
                                        }
                                        else if (draft.rippleState[clipToTrim.id].initialExtensionDone || !isInitialState) {
                                            newEndTime = Math.min(dragTargetEndTime, maxEndTime);
                                        }
                                    }
                                    else {
                                        newEndTime = Math.max(dragTargetEndTime, minEndTime);
                                    }
                                }
                                else {
                                    newEndTime = action.payload.endTime !== undefined
                                        ? Math.min(action.payload.endTime, maxEndTime)
                                        : clipToTrim.endTime;
                                }
                                track.clips[clipIndex] = {
                                    ...clipToTrim,
                                    endTime: newEndTime,
                                    handles: action.payload.handles || {
                                        startPosition: clipToTrim.mediaOffset,
                                        endPosition: clipToTrim.mediaOffset + (newEndTime - clipToTrim.startTime)
                                    }
                                };
                                if (action.payload.ripple) {
                                    const deltaTime = newEndTime - oldEndTime;
                                    const subsequentClips = track.clips
                                        .slice(clipIndex + 1)
                                        .filter(c => c.startTime >= oldEndTime);
                                    subsequentClips.forEach((clipToMove) => {
                                        const idx = track.clips.findIndex(c => c.id === clipToMove.id);
                                        if (idx !== -1) {
                                            const duration = clipToMove.endTime - clipToMove.startTime;
                                            const newStart = clipToMove.startTime + deltaTime;
                                            track.clips[idx] = {
                                                ...clipToMove,
                                                startTime: newStart,
                                                endTime: newStart + duration,
                                                mediaOffset: clipToMove.mediaOffset + deltaTime,
                                                handles: {
                                                    startPosition: (clipToMove.handles?.startPosition ?? clipToMove.mediaOffset) + deltaTime,
                                                    endPosition: (clipToMove.handles?.endPosition ?? (clipToMove.mediaOffset + duration)) + deltaTime
                                                },
                                                initialBounds: {
                                                    ...clipToMove.initialBounds,
                                                    startTime: newStart,
                                                    endTime: newStart + duration,
                                                    mediaOffset: (clipToMove.initialBounds?.mediaOffset ?? clipToMove.mediaOffset) + deltaTime,
                                                    mediaDuration: clipToMove.initialBounds?.mediaDuration ?? clipToMove.mediaDuration
                                                }
                                            };
                                        }
                                    });
                                    track.clips.sort((a, b) => a.startTime - b.startTime);
                                }
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SPLIT_CLIP: {
                        const trackToSplit = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToSplit) {
                            const clipToSplit = trackToSplit.clips.find(c => c.id === action.payload.clipId);
                            if (clipToSplit && action.payload.time > clipToSplit.startTime && action.payload.time < clipToSplit.endTime) {
                                const splitPoint = action.payload.time;
                                const firstDuration = splitPoint - clipToSplit.startTime;
                                const originalMediaOffset = clipToSplit.initialBounds?.mediaOffset ?? clipToSplit.mediaOffset;
                                const originalMediaDuration = clipToSplit.initialBounds?.mediaDuration ?? clipToSplit.mediaDuration;
                                const firstMediaStart = originalMediaOffset;
                                const firstMediaEnd = originalMediaOffset + firstDuration;
                                const secondMediaStart = originalMediaOffset + firstDuration;
                                const fullMediaDuration = originalMediaDuration;
                                // Remove the original clip
                                trackToSplit.clips = trackToSplit.clips.filter(c => c.id !== clipToSplit.id);
                                // Create first clip
                                const firstClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-1`,
                                    endTime: splitPoint,
                                    mediaDuration: fullMediaDuration,
                                    mediaOffset: firstMediaStart,
                                    handles: {
                                        startPosition: firstMediaStart,
                                        endPosition: firstMediaEnd
                                    },
                                    initialBounds: {
                                        startTime: clipToSplit.startTime,
                                        endTime: splitPoint,
                                        mediaOffset: firstMediaStart,
                                        mediaDuration: fullMediaDuration
                                    }
                                };
                                // Create second clip
                                const secondClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-2`,
                                    startTime: splitPoint,
                                    mediaOffset: secondMediaStart,
                                    mediaDuration: fullMediaDuration,
                                    handles: {
                                        startPosition: secondMediaStart,
                                        endPosition: secondMediaStart + (clipToSplit.endTime - splitPoint)
                                    },
                                    initialBounds: {
                                        startTime: splitPoint,
                                        endTime: clipToSplit.endTime,
                                        mediaOffset: secondMediaStart,
                                        mediaDuration: fullMediaDuration
                                    }
                                };
                                // Add new clips
                                trackToSplit.clips.push(firstClip, secondClip);
                                trackToSplit.clips.sort((a, b) => a.startTime - b.startTime);
                                // Update ripple state
                                if (draft.rippleState && draft.rippleState[clipToSplit.id]) {
                                    delete draft.rippleState[clipToSplit.id];
                                }
                                if (!draft.rippleState) {
                                    draft.rippleState = {};
                                }
                                draft.rippleState[firstClip.id] = { initialExtensionDone: false };
                                draft.rippleState[secondClip.id] = { initialExtensionDone: false };
                                // Update selection
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
            // Create a new state with the patches applied
            const stateAfterPatches = (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(state, patches);
            // Only create history entry for undoable actions
            if (isUndoable(action)) {
                // Create a new state with history updates
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_5__.produce)(stateAfterPatches, draft => {
                    // If we've undone before, truncate future entries
                    if (draft.history.currentIndex < draft.history.entries.length - 1) {
                        draft.history.entries = draft.history.entries.slice(0, draft.history.currentIndex + 1);
                    }
                    // Create a deep copy of patches to avoid reference issues
                    const entry = {
                        type: 'partial',
                        timestamp: Date.now(),
                        patches: JSON.parse(JSON.stringify(patches)),
                        inversePatches: JSON.parse(JSON.stringify(inversePatches)),
                        description: getHistoryDescription(action)
                    };
                    // If we're at the end of history, just push
                    if (draft.history.currentIndex === draft.history.entries.length - 1) {
                        draft.history.entries.push(entry);
                        draft.history.currentIndex++;
                    }
                    else {
                        // Otherwise, truncate and push
                        draft.history.entries = draft.history.entries.slice(0, draft.history.currentIndex + 1);
                        draft.history.entries.push(entry);
                        draft.history.currentIndex = draft.history.entries.length - 1;
                    }
                    // Trim history if it exceeds max size
                    if (draft.history.entries.length > _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.History.MAX_HISTORY_SIZE) {
                        draft.history.entries = draft.history.entries.slice(-_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.History.MAX_HISTORY_SIZE);
                        draft.history.currentIndex = draft.history.entries.length - 1;
                    }
                });
                _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.debug('Added history entry:', {
                    description: getHistoryDescription(action),
                    currentIndex: finalState.history.currentIndex,
                    totalEntries: finalState.history.entries.length
                });
                return finalState;
            }
            return stateAfterPatches;
        }
    }
};
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
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        console.log('[TimelineProvider] Effect running...');
        try {
            // First validate the state
            const validationErrors = (0,_utils_timelineValidation__WEBPACK_IMPORTED_MODULE_4__.validateTimelineState)(state);
            const detail = {
                state,
                dispatch,
                isValid: validationErrors.length === 0,
                errors: validationErrors
            };
            // Then set up window properties
            window.timelineState = state;
            window.timelineDispatch = dispatch;
            // Signal initialization is starting
            window.dispatchEvent(new CustomEvent('timeline:initializing', { detail }));
            // Wait for next frame to ensure properties are set
            requestAnimationFrame(() => {
                // Set ready flag and dispatch ready event
                window.timelineReady = true;
                window.dispatchEvent(new CustomEvent('timeline:dispatchReady', {
                    detail: { dispatch }
                }));
                // Wait another frame to ensure ready flag is set
                requestAnimationFrame(() => {
                    // Finally dispatch initialized event
                    window.dispatchEvent(new CustomEvent('timeline:initialized', { detail }));
                    setIsInitialized(true);
                    _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.debug('[Timeline] Initialization complete:', detail);
                });
            });
            return () => {
                window.timelineReady = false;
                window.timelineState = undefined;
                window.timelineDispatch = undefined;
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.error('[Timeline] Initialization failed:', new Error(errorMessage));
            window.dispatchEvent(new CustomEvent('timeline:error', {
                detail: { error: new Error(errorMessage), state }
            }));
        }
    }, [state, dispatch]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(TimelineContext.Provider, { value: { state, dispatch } }, children));
};
const useTimelineContext = () => {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(TimelineContext);
    if (!context) {
        throw new Error('useTimelineContext must be used within a TimelineProvider');
    }
    return context;
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("548f3e61e58162e54d25")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.919e562079927b673eaf.hot-update.js.map