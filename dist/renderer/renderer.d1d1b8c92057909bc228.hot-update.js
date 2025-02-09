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






// Enable patches for Immer
(0,immer__WEBPACK_IMPORTED_MODULE_5__.enablePatches)();
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
    switch (action.type) {
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.CLEAR_STATE: {
            return {
                ..._types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState,
                history: {
                    entries: [],
                    currentIndex: -1
                }
            };
        }
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_STATE: {
            return {
                ...action.payload,
                history: action.payload.history || state.history
            };
        }
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UNDO: {
            if (state.history.currentIndex > 0) {
                const newIndex = state.history.currentIndex - 1;
                const entry = state.history.entries[newIndex];
                // Create a fresh copy of state before applying patches
                const stateCopy = JSON.parse(JSON.stringify(state));
                // Create final state with both patches and history update
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_5__.produce)(stateCopy, draft => {
                    // Create deep copies of patches to avoid any proxy issues
                    const inversePatchesCopy = JSON.parse(JSON.stringify(entry.inversePatches));
                    // Apply patches and ensure selection state is preserved
                    const prevSelectedClipIds = Array.from(draft.selectedClipIds);
                    (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(draft, inversePatchesCopy);
                    // If the selected clip still exists after applying patches, keep it selected
                    const selectedClipsExist = prevSelectedClipIds.some(id => draft.tracks.some(track => track.clips.some(clip => clip.id === id)));
                    if (!selectedClipsExist && draft.tracks.length > 0) {
                        // If no selected clips exist, try to select the first clip
                        const firstTrack = draft.tracks[0];
                        if (firstTrack.clips.length > 0) {
                            draft.selectedClipIds = [firstTrack.clips[0].id];
                        }
                    }
                    // Update history with a new object
                    draft.history = {
                        entries: Array.from(state.history.entries),
                        currentIndex: newIndex
                    };
                });
                // Notify of undo completion
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent('timeline:undo-complete', {
                        detail: {
                            fromIndex: state.history.currentIndex,
                            toIndex: newIndex,
                            description: state.history.entries[newIndex].description
                        }
                    }));
                });
                return finalState;
            }
            return state;
        }
        case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REDO: {
            if (state.history.currentIndex < state.history.entries.length - 1) {
                const newIndex = state.history.currentIndex + 1;
                const entry = state.history.entries[newIndex];
                // Create a fresh copy of state before applying patches
                const stateCopy = JSON.parse(JSON.stringify(state));
                // Create final state with both patches and history update
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_5__.produce)(stateCopy, draft => {
                    // Create deep copies of patches to avoid any proxy issues
                    const patchesCopy = JSON.parse(JSON.stringify(entry.patches));
                    // Apply patches and ensure selection state is preserved
                    const prevSelectedClipIds = Array.from(draft.selectedClipIds);
                    (0,immer__WEBPACK_IMPORTED_MODULE_5__.applyPatches)(draft, patchesCopy);
                    // If the selected clip still exists after applying patches, keep it selected
                    const selectedClipsExist = prevSelectedClipIds.some(id => draft.tracks.some(track => track.clips.some(clip => clip.id === id)));
                    if (!selectedClipsExist && draft.tracks.length > 0) {
                        // If no selected clips exist, try to select the first clip
                        const firstTrack = draft.tracks[0];
                        if (firstTrack.clips.length > 0) {
                            draft.selectedClipIds = [firstTrack.clips[0].id];
                        }
                    }
                    // Update history with a new object
                    draft.history = {
                        entries: Array.from(state.history.entries),
                        currentIndex: newIndex
                    };
                });
                // Notify of redo completion
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent('timeline:redo-complete', {
                        detail: {
                            fromIndex: state.history.currentIndex,
                            toIndex: newIndex,
                            description: state.history.entries[newIndex].description
                        }
                    }));
                });
                return finalState;
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
                        draft.tracks = [...draft.tracks, action.payload.track];
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_TRACK: {
                        const trackIndex = draft.tracks.findIndex(t => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            draft.tracks = [
                                ...draft.tracks.slice(0, trackIndex),
                                {
                                    ...draft.tracks[trackIndex],
                                    ...action.payload.track
                                },
                                ...draft.tracks.slice(trackIndex + 1)
                            ];
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
                            const newClips = [...trackToAddClip.clips, newClip];
                            newClips.sort((a, b) => a.startTime - b.startTime);
                            trackToAddClip.clips = newClips;
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_CLIP: {
                        const trackWithClip = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackWithClip) {
                            const clipIndex = trackWithClip.clips.findIndex(c => c.id === action.payload.clipId);
                            if (clipIndex !== -1) {
                                trackWithClip.clips = [
                                    ...trackWithClip.clips.slice(0, clipIndex),
                                    {
                                        ...trackWithClip.clips[clipIndex],
                                        ...action.payload.clip
                                    },
                                    ...trackWithClip.clips.slice(clipIndex + 1)
                                ];
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
                        const trackIndex = draft.tracks.findIndex(t => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            const trackToSplit = draft.tracks[trackIndex];
                            const clipToSplit = trackToSplit.clips.find(c => c.id === action.payload.clipId);
                            if (clipToSplit && action.payload.time > clipToSplit.startTime && action.payload.time < clipToSplit.endTime) {
                                const splitPoint = action.payload.time;
                                const firstDuration = splitPoint - clipToSplit.startTime;
                                const originalMediaOffset = clipToSplit.mediaOffset ?? 0;
                                const originalMediaDuration = clipToSplit.mediaDuration ?? (clipToSplit.endTime - clipToSplit.startTime);
                                const firstMediaStart = originalMediaOffset;
                                const firstMediaEnd = originalMediaOffset + firstDuration;
                                const secondMediaStart = originalMediaOffset + firstDuration;
                                const fullMediaDuration = originalMediaDuration;
                                // Create first clip
                                const firstClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-1`,
                                    startTime: clipToSplit.startTime,
                                    endTime: splitPoint,
                                    mediaOffset: firstMediaStart,
                                    mediaDuration: fullMediaDuration,
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
                                    endTime: clipToSplit.endTime,
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
                                // Create new clips array
                                const newClips = trackToSplit.clips
                                    .filter(c => c.id !== clipToSplit.id)
                                    .concat([firstClip, secondClip])
                                    .sort((a, b) => a.startTime - b.startTime);
                                // Create new track with updated clips
                                const updatedTrack = {
                                    ...trackToSplit,
                                    clips: newClips
                                };
                                // Update tracks array
                                draft.tracks = [
                                    ...draft.tracks.slice(0, trackIndex),
                                    updatedTrack,
                                    ...draft.tracks.slice(trackIndex + 1)
                                ];
                                // Update selection
                                draft.selectedClipIds = [firstClip.id];
                                // Notify of split completion
                                requestAnimationFrame(() => {
                                    window.dispatchEvent(new CustomEvent('timeline:clip-split', {
                                        detail: {
                                            trackId: trackToSplit.id,
                                            originalClipId: clipToSplit.id,
                                            splitTime: splitPoint,
                                            firstClipId: firstClip.id,
                                            secondClipId: secondClip.id,
                                            firstClip: {
                                                startTime: firstClip.startTime,
                                                endTime: firstClip.endTime,
                                                mediaOffset: firstClip.mediaOffset,
                                                mediaDuration: firstClip.mediaDuration
                                            },
                                            secondClip: {
                                                startTime: secondClip.startTime,
                                                endTime: secondClip.endTime,
                                                mediaOffset: secondClip.mediaOffset,
                                                mediaDuration: secondClip.mediaDuration
                                            }
                                        }
                                    }));
                                });
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SELECT_CLIPS:
                        draft.selectedClipIds = [...action.payload.clipIds];
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SELECTED_TRACK_ID:
                        draft.selectedTrackId = action.payload;
                        break;
                }
            });
            if (isUndoable(action)) {
                // Create a fresh copy of state before applying patches
                const stateCopy = JSON.parse(JSON.stringify(state));
                // Create final state with both changes and history update
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_5__.produce)(stateCopy, draft => {
                    // Apply the action changes and ensure selection state is preserved
                    const prevSelectedClipIds = Array.from(draft.selectedClipIds);
                    Object.assign(draft, nextState);
                    // If the selected clip still exists after applying changes, keep it selected
                    const selectedClipsExist = prevSelectedClipIds.some(id => draft.tracks.some(track => track.clips.some(clip => clip.id === id)));
                    if (!selectedClipsExist && draft.tracks.length > 0) {
                        // If no selected clips exist, try to select the first clip
                        const firstTrack = draft.tracks[0];
                        if (firstTrack.clips.length > 0) {
                            draft.selectedClipIds = [firstTrack.clips[0].id];
                        }
                    }
                    // Update history
                    // Create deep copies of patches to avoid any proxy issues
                    const patchesCopy = JSON.parse(JSON.stringify(patches));
                    const inversePatchesCopy = JSON.parse(JSON.stringify(inversePatches));
                    // Create history entry
                    const entry = {
                        type: 'partial',
                        timestamp: Date.now(),
                        patches: patchesCopy,
                        inversePatches: inversePatchesCopy,
                        description: getHistoryDescription(action)
                    };
                    // Create new history entries array
                    let newEntries = Array.from(draft.history.entries);
                    // If we're not at the end of the history, truncate the future entries
                    if (draft.history.currentIndex < newEntries.length - 1) {
                        newEntries = newEntries.slice(0, draft.history.currentIndex + 1);
                    }
                    // Add the new entry
                    newEntries.push(entry);
                    // Enforce history size limit
                    if (newEntries.length > _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.History.MAX_HISTORY_SIZE) {
                        const excess = newEntries.length - _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.History.MAX_HISTORY_SIZE;
                        newEntries = newEntries.slice(excess);
                    }
                    // Update history with new object
                    draft.history = {
                        entries: newEntries,
                        currentIndex: newEntries.length - 1
                    };
                });
                return finalState;
            }
            return nextState;
        }
    }
};
const TimelineProvider = ({ children }) => {
    const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(timelineReducer, (() => {
        // Create a fresh copy of the initial state
        const freshState = JSON.parse(JSON.stringify({
            ..._types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState,
            history: {
                entries: [],
                currentIndex: -1
            }
        }));
        // Ensure all arrays are properly initialized
        freshState.tracks = [];
        freshState.selectedClipIds = [];
        freshState.history.entries = [];
        return freshState;
    })());
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


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("09d38f2e7e08d308be45")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.d1d1b8c92057909bc228.hot-update.js.map