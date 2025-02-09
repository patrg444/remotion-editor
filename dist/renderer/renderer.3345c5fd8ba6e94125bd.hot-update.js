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
    // One-time initialization effect
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        console.log('[TimelineProvider] Mounting (one-time)...');
        try {
            // Step 1: Dispatch initializing event
            window.dispatchEvent(new CustomEvent('timeline:initializing'));
            // Step 2: Set up window properties
            window.timelineDispatch = dispatch;
            // Step 3: Dispatch ready event
            window.dispatchEvent(new CustomEvent('timeline:dispatchReady'));
            // Step 4: Set ready flag and dispatch initialized event
            window.timelineReady = true;
            window.dispatchEvent(new CustomEvent('timeline:initialized'));
            setIsInitialized(true);
            _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.debug('[Timeline] Initialization complete');
            // No cleanup to avoid race conditions
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_3__.logger.error('[TimelineProvider] Error initializing timeline:', new Error(errorMessage));
            window.dispatchEvent(new CustomEvent('timeline:error', {
                detail: { error: new Error(errorMessage) }
            }));
        }
    }, []); // Empty deps array for one-time initialization
    // Optional sync effect for development/testing
    if (true) {
        (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
            window.timelineState = { ...state, dispatch };
            window.timelineDispatch = dispatch;
        }, [state, dispatch]);
    }
    // Separate effect for state validation
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


/***/ }),

/***/ "./node_modules/immer/dist/immer.esm.mjs":
/*!***********************************************!*\
  !*** ./node_modules/immer/dist/immer.esm.mjs ***!
  \***********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Immer: () => (/* binding */ un),
/* harmony export */   applyPatches: () => (/* binding */ pn),
/* harmony export */   castDraft: () => (/* binding */ K),
/* harmony export */   castImmutable: () => (/* binding */ $),
/* harmony export */   createDraft: () => (/* binding */ ln),
/* harmony export */   current: () => (/* binding */ R),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   enableAllPlugins: () => (/* binding */ J),
/* harmony export */   enableES5: () => (/* binding */ F),
/* harmony export */   enableMapSet: () => (/* binding */ C),
/* harmony export */   enablePatches: () => (/* binding */ T),
/* harmony export */   finishDraft: () => (/* binding */ dn),
/* harmony export */   freeze: () => (/* binding */ d),
/* harmony export */   immerable: () => (/* binding */ L),
/* harmony export */   isDraft: () => (/* binding */ r),
/* harmony export */   isDraftable: () => (/* binding */ t),
/* harmony export */   nothing: () => (/* binding */ H),
/* harmony export */   original: () => (/* binding */ e),
/* harmony export */   produce: () => (/* binding */ fn),
/* harmony export */   produceWithPatches: () => (/* binding */ cn),
/* harmony export */   setAutoFreeze: () => (/* binding */ sn),
/* harmony export */   setUseProxies: () => (/* binding */ vn)
/* harmony export */ });
function n(n){for(var r=arguments.length,t=Array(r>1?r-1:0),e=1;e<r;e++)t[e-1]=arguments[e];if(true){var i=Y[n],o=i?"function"==typeof i?i.apply(null,t):i:"unknown error nr: "+n;throw Error("[Immer] "+o)}throw Error("[Immer] minified error nr: "+n+(t.length?" "+t.map((function(n){return"'"+n+"'"})).join(","):"")+". Find the full error at: https://bit.ly/3cXEKWf")}function r(n){return!!n&&!!n[Q]}function t(n){var r;return!!n&&(function(n){if(!n||"object"!=typeof n)return!1;var r=Object.getPrototypeOf(n);if(null===r)return!0;var t=Object.hasOwnProperty.call(r,"constructor")&&r.constructor;return t===Object||"function"==typeof t&&Function.toString.call(t)===Z}(n)||Array.isArray(n)||!!n[L]||!!(null===(r=n.constructor)||void 0===r?void 0:r[L])||s(n)||v(n))}function e(t){return r(t)||n(23,t),t[Q].t}function i(n,r,t){void 0===t&&(t=!1),0===o(n)?(t?Object.keys:nn)(n).forEach((function(e){t&&"symbol"==typeof e||r(e,n[e],n)})):n.forEach((function(t,e){return r(e,t,n)}))}function o(n){var r=n[Q];return r?r.i>3?r.i-4:r.i:Array.isArray(n)?1:s(n)?2:v(n)?3:0}function u(n,r){return 2===o(n)?n.has(r):Object.prototype.hasOwnProperty.call(n,r)}function a(n,r){return 2===o(n)?n.get(r):n[r]}function f(n,r,t){var e=o(n);2===e?n.set(r,t):3===e?n.add(t):n[r]=t}function c(n,r){return n===r?0!==n||1/n==1/r:n!=n&&r!=r}function s(n){return X&&n instanceof Map}function v(n){return q&&n instanceof Set}function p(n){return n.o||n.t}function l(n){if(Array.isArray(n))return Array.prototype.slice.call(n);var r=rn(n);delete r[Q];for(var t=nn(r),e=0;e<t.length;e++){var i=t[e],o=r[i];!1===o.writable&&(o.writable=!0,o.configurable=!0),(o.get||o.set)&&(r[i]={configurable:!0,writable:!0,enumerable:o.enumerable,value:n[i]})}return Object.create(Object.getPrototypeOf(n),r)}function d(n,e){return void 0===e&&(e=!1),y(n)||r(n)||!t(n)||(o(n)>1&&(n.set=n.add=n.clear=n.delete=h),Object.freeze(n),e&&i(n,(function(n,r){return d(r,!0)}),!0)),n}function h(){n(2)}function y(n){return null==n||"object"!=typeof n||Object.isFrozen(n)}function b(r){var t=tn[r];return t||n(18,r),t}function m(n,r){tn[n]||(tn[n]=r)}function _(){return false||U||n(0),U}function j(n,r){r&&(b("Patches"),n.u=[],n.s=[],n.v=r)}function g(n){O(n),n.p.forEach(S),n.p=null}function O(n){n===U&&(U=n.l)}function w(n){return U={p:[],l:U,h:n,m:!0,_:0}}function S(n){var r=n[Q];0===r.i||1===r.i?r.j():r.g=!0}function P(r,e){e._=e.p.length;var i=e.p[0],o=void 0!==r&&r!==i;return e.h.O||b("ES5").S(e,r,o),o?(i[Q].P&&(g(e),n(4)),t(r)&&(r=M(e,r),e.l||x(e,r)),e.u&&b("Patches").M(i[Q].t,r,e.u,e.s)):r=M(e,i,[]),g(e),e.u&&e.v(e.u,e.s),r!==H?r:void 0}function M(n,r,t){if(y(r))return r;var e=r[Q];if(!e)return i(r,(function(i,o){return A(n,e,r,i,o,t)}),!0),r;if(e.A!==n)return r;if(!e.P)return x(n,e.t,!0),e.t;if(!e.I){e.I=!0,e.A._--;var o=4===e.i||5===e.i?e.o=l(e.k):e.o,u=o,a=!1;3===e.i&&(u=new Set(o),o.clear(),a=!0),i(u,(function(r,i){return A(n,e,o,r,i,t,a)})),x(n,o,!1),t&&n.u&&b("Patches").N(e,t,n.u,n.s)}return e.o}function A(e,i,o,a,c,s,v){if( true&&c===o&&n(5),r(c)){var p=M(e,c,s&&i&&3!==i.i&&!u(i.R,a)?s.concat(a):void 0);if(f(o,a,p),!r(p))return;e.m=!1}else v&&o.add(c);if(t(c)&&!y(c)){if(!e.h.D&&e._<1)return;M(e,c),i&&i.A.l||x(e,c)}}function x(n,r,t){void 0===t&&(t=!1),!n.l&&n.h.D&&n.m&&d(r,t)}function z(n,r){var t=n[Q];return(t?p(t):n)[r]}function I(n,r){if(r in n)for(var t=Object.getPrototypeOf(n);t;){var e=Object.getOwnPropertyDescriptor(t,r);if(e)return e;t=Object.getPrototypeOf(t)}}function k(n){n.P||(n.P=!0,n.l&&k(n.l))}function E(n){n.o||(n.o=l(n.t))}function N(n,r,t){var e=s(r)?b("MapSet").F(r,t):v(r)?b("MapSet").T(r,t):n.O?function(n,r){var t=Array.isArray(n),e={i:t?1:0,A:r?r.A:_(),P:!1,I:!1,R:{},l:r,t:n,k:null,o:null,j:null,C:!1},i=e,o=en;t&&(i=[e],o=on);var u=Proxy.revocable(i,o),a=u.revoke,f=u.proxy;return e.k=f,e.j=a,f}(r,t):b("ES5").J(r,t);return(t?t.A:_()).p.push(e),e}function R(e){return r(e)||n(22,e),function n(r){if(!t(r))return r;var e,u=r[Q],c=o(r);if(u){if(!u.P&&(u.i<4||!b("ES5").K(u)))return u.t;u.I=!0,e=D(r,c),u.I=!1}else e=D(r,c);return i(e,(function(r,t){u&&a(u.t,r)===t||f(e,r,n(t))})),3===c?new Set(e):e}(e)}function D(n,r){switch(r){case 2:return new Map(n);case 3:return Array.from(n)}return l(n)}function F(){function t(n,r){var t=s[n];return t?t.enumerable=r:s[n]=t={configurable:!0,enumerable:r,get:function(){var r=this[Q];return true&&f(r),en.get(r,n)},set:function(r){var t=this[Q]; true&&f(t),en.set(t,n,r)}},t}function e(n){for(var r=n.length-1;r>=0;r--){var t=n[r][Q];if(!t.P)switch(t.i){case 5:a(t)&&k(t);break;case 4:o(t)&&k(t)}}}function o(n){for(var r=n.t,t=n.k,e=nn(t),i=e.length-1;i>=0;i--){var o=e[i];if(o!==Q){var a=r[o];if(void 0===a&&!u(r,o))return!0;var f=t[o],s=f&&f[Q];if(s?s.t!==a:!c(f,a))return!0}}var v=!!r[Q];return e.length!==nn(r).length+(v?0:1)}function a(n){var r=n.k;if(r.length!==n.t.length)return!0;var t=Object.getOwnPropertyDescriptor(r,r.length-1);if(t&&!t.get)return!0;for(var e=0;e<r.length;e++)if(!r.hasOwnProperty(e))return!0;return!1}function f(r){r.g&&n(3,JSON.stringify(p(r)))}var s={};m("ES5",{J:function(n,r){var e=Array.isArray(n),i=function(n,r){if(n){for(var e=Array(r.length),i=0;i<r.length;i++)Object.defineProperty(e,""+i,t(i,!0));return e}var o=rn(r);delete o[Q];for(var u=nn(o),a=0;a<u.length;a++){var f=u[a];o[f]=t(f,n||!!o[f].enumerable)}return Object.create(Object.getPrototypeOf(r),o)}(e,n),o={i:e?5:4,A:r?r.A:_(),P:!1,I:!1,R:{},l:r,t:n,k:i,o:null,g:!1,C:!1};return Object.defineProperty(i,Q,{value:o,writable:!0}),i},S:function(n,t,o){o?r(t)&&t[Q].A===n&&e(n.p):(n.u&&function n(r){if(r&&"object"==typeof r){var t=r[Q];if(t){var e=t.t,o=t.k,f=t.R,c=t.i;if(4===c)i(o,(function(r){r!==Q&&(void 0!==e[r]||u(e,r)?f[r]||n(o[r]):(f[r]=!0,k(t)))})),i(e,(function(n){void 0!==o[n]||u(o,n)||(f[n]=!1,k(t))}));else if(5===c){if(a(t)&&(k(t),f.length=!0),o.length<e.length)for(var s=o.length;s<e.length;s++)f[s]=!1;else for(var v=e.length;v<o.length;v++)f[v]=!0;for(var p=Math.min(o.length,e.length),l=0;l<p;l++)o.hasOwnProperty(l)||(f[l]=!0),void 0===f[l]&&n(o[l])}}}}(n.p[0]),e(n.p))},K:function(n){return 4===n.i?o(n):a(n)}})}function T(){function e(n){if(!t(n))return n;if(Array.isArray(n))return n.map(e);if(s(n))return new Map(Array.from(n.entries()).map((function(n){return[n[0],e(n[1])]})));if(v(n))return new Set(Array.from(n).map(e));var r=Object.create(Object.getPrototypeOf(n));for(var i in n)r[i]=e(n[i]);return u(n,L)&&(r[L]=n[L]),r}function f(n){return r(n)?e(n):n}var c="add";m("Patches",{$:function(r,t){return t.forEach((function(t){for(var i=t.path,u=t.op,f=r,s=0;s<i.length-1;s++){var v=o(f),p=i[s];"string"!=typeof p&&"number"!=typeof p&&(p=""+p),0!==v&&1!==v||"__proto__"!==p&&"constructor"!==p||n(24),"function"==typeof f&&"prototype"===p&&n(24),"object"!=typeof(f=a(f,p))&&n(15,i.join("/"))}var l=o(f),d=e(t.value),h=i[i.length-1];switch(u){case"replace":switch(l){case 2:return f.set(h,d);case 3:n(16);default:return f[h]=d}case c:switch(l){case 1:return"-"===h?f.push(d):f.splice(h,0,d);case 2:return f.set(h,d);case 3:return f.add(d);default:return f[h]=d}case"remove":switch(l){case 1:return f.splice(h,1);case 2:return f.delete(h);case 3:return f.delete(t.value);default:return delete f[h]}default:n(17,u)}})),r},N:function(n,r,t,e){switch(n.i){case 0:case 4:case 2:return function(n,r,t,e){var o=n.t,s=n.o;i(n.R,(function(n,i){var v=a(o,n),p=a(s,n),l=i?u(o,n)?"replace":c:"remove";if(v!==p||"replace"!==l){var d=r.concat(n);t.push("remove"===l?{op:l,path:d}:{op:l,path:d,value:p}),e.push(l===c?{op:"remove",path:d}:"remove"===l?{op:c,path:d,value:f(v)}:{op:"replace",path:d,value:f(v)})}}))}(n,r,t,e);case 5:case 1:return function(n,r,t,e){var i=n.t,o=n.R,u=n.o;if(u.length<i.length){var a=[u,i];i=a[0],u=a[1];var s=[e,t];t=s[0],e=s[1]}for(var v=0;v<i.length;v++)if(o[v]&&u[v]!==i[v]){var p=r.concat([v]);t.push({op:"replace",path:p,value:f(u[v])}),e.push({op:"replace",path:p,value:f(i[v])})}for(var l=i.length;l<u.length;l++){var d=r.concat([l]);t.push({op:c,path:d,value:f(u[l])})}i.length<u.length&&e.push({op:"replace",path:r.concat(["length"]),value:i.length})}(n,r,t,e);case 3:return function(n,r,t,e){var i=n.t,o=n.o,u=0;i.forEach((function(n){if(!o.has(n)){var i=r.concat([u]);t.push({op:"remove",path:i,value:n}),e.unshift({op:c,path:i,value:n})}u++})),u=0,o.forEach((function(n){if(!i.has(n)){var o=r.concat([u]);t.push({op:c,path:o,value:n}),e.unshift({op:"remove",path:o,value:n})}u++}))}(n,r,t,e)}},M:function(n,r,t,e){t.push({op:"replace",path:[],value:r===H?void 0:r}),e.push({op:"replace",path:[],value:n})}})}function C(){function r(n,r){function t(){this.constructor=n}a(n,r),n.prototype=(t.prototype=r.prototype,new t)}function e(n){n.o||(n.R=new Map,n.o=new Map(n.t))}function o(n){n.o||(n.o=new Set,n.t.forEach((function(r){if(t(r)){var e=N(n.A.h,r,n);n.p.set(r,e),n.o.add(e)}else n.o.add(r)})))}function u(r){r.g&&n(3,JSON.stringify(p(r)))}var a=function(n,r){return(a=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,r){n.__proto__=r}||function(n,r){for(var t in r)r.hasOwnProperty(t)&&(n[t]=r[t])})(n,r)},f=function(){function n(n,r){return this[Q]={i:2,l:r,A:r?r.A:_(),P:!1,I:!1,o:void 0,R:void 0,t:n,k:this,C:!1,g:!1},this}r(n,Map);var o=n.prototype;return Object.defineProperty(o,"size",{get:function(){return p(this[Q]).size}}),o.has=function(n){return p(this[Q]).has(n)},o.set=function(n,r){var t=this[Q];return u(t),p(t).has(n)&&p(t).get(n)===r||(e(t),k(t),t.R.set(n,!0),t.o.set(n,r),t.R.set(n,!0)),this},o.delete=function(n){if(!this.has(n))return!1;var r=this[Q];return u(r),e(r),k(r),r.t.has(n)?r.R.set(n,!1):r.R.delete(n),r.o.delete(n),!0},o.clear=function(){var n=this[Q];u(n),p(n).size&&(e(n),k(n),n.R=new Map,i(n.t,(function(r){n.R.set(r,!1)})),n.o.clear())},o.forEach=function(n,r){var t=this;p(this[Q]).forEach((function(e,i){n.call(r,t.get(i),i,t)}))},o.get=function(n){var r=this[Q];u(r);var i=p(r).get(n);if(r.I||!t(i))return i;if(i!==r.t.get(n))return i;var o=N(r.A.h,i,r);return e(r),r.o.set(n,o),o},o.keys=function(){return p(this[Q]).keys()},o.values=function(){var n,r=this,t=this.keys();return(n={})[V]=function(){return r.values()},n.next=function(){var n=t.next();return n.done?n:{done:!1,value:r.get(n.value)}},n},o.entries=function(){var n,r=this,t=this.keys();return(n={})[V]=function(){return r.entries()},n.next=function(){var n=t.next();if(n.done)return n;var e=r.get(n.value);return{done:!1,value:[n.value,e]}},n},o[V]=function(){return this.entries()},n}(),c=function(){function n(n,r){return this[Q]={i:3,l:r,A:r?r.A:_(),P:!1,I:!1,o:void 0,t:n,k:this,p:new Map,g:!1,C:!1},this}r(n,Set);var t=n.prototype;return Object.defineProperty(t,"size",{get:function(){return p(this[Q]).size}}),t.has=function(n){var r=this[Q];return u(r),r.o?!!r.o.has(n)||!(!r.p.has(n)||!r.o.has(r.p.get(n))):r.t.has(n)},t.add=function(n){var r=this[Q];return u(r),this.has(n)||(o(r),k(r),r.o.add(n)),this},t.delete=function(n){if(!this.has(n))return!1;var r=this[Q];return u(r),o(r),k(r),r.o.delete(n)||!!r.p.has(n)&&r.o.delete(r.p.get(n))},t.clear=function(){var n=this[Q];u(n),p(n).size&&(o(n),k(n),n.o.clear())},t.values=function(){var n=this[Q];return u(n),o(n),n.o.values()},t.entries=function(){var n=this[Q];return u(n),o(n),n.o.entries()},t.keys=function(){return this.values()},t[V]=function(){return this.values()},t.forEach=function(n,r){for(var t=this.values(),e=t.next();!e.done;)n.call(r,e.value,e.value,this),e=t.next()},n}();m("MapSet",{F:function(n,r){return new f(n,r)},T:function(n,r){return new c(n,r)}})}function J(){F(),C(),T()}function K(n){return n}function $(n){return n}var G,U,W="undefined"!=typeof Symbol&&"symbol"==typeof Symbol("x"),X="undefined"!=typeof Map,q="undefined"!=typeof Set,B="undefined"!=typeof Proxy&&void 0!==Proxy.revocable&&"undefined"!=typeof Reflect,H=W?Symbol.for("immer-nothing"):((G={})["immer-nothing"]=!0,G),L=W?Symbol.for("immer-draftable"):"__$immer_draftable",Q=W?Symbol.for("immer-state"):"__$immer_state",V="undefined"!=typeof Symbol&&Symbol.iterator||"@@iterator",Y={0:"Illegal state",1:"Immer drafts cannot have computed properties",2:"This object has been frozen and should not be mutated",3:function(n){return"Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? "+n},4:"An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",5:"Immer forbids circular references",6:"The first or second argument to `produce` must be a function",7:"The third argument to `produce` must be a function or undefined",8:"First argument to `createDraft` must be a plain object, an array, or an immerable object",9:"First argument to `finishDraft` must be a draft returned by `createDraft`",10:"The given draft is already finalized",11:"Object.defineProperty() cannot be used on an Immer draft",12:"Object.setPrototypeOf() cannot be used on an Immer draft",13:"Immer only supports deleting array indices",14:"Immer only supports setting array indices and the 'length' property",15:function(n){return"Cannot apply patch, path doesn't resolve: "+n},16:'Sets cannot have "replace" patches.',17:function(n){return"Unsupported patch operation: "+n},18:function(n){return"The plugin for '"+n+"' has not been loaded into Immer. To enable the plugin, import and call `enable"+n+"()` when initializing your application."},20:"Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available",21:function(n){return"produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '"+n+"'"},22:function(n){return"'current' expects a draft, got: "+n},23:function(n){return"'original' expects a draft, got: "+n},24:"Patching reserved attributes like __proto__, prototype and constructor is not allowed"},Z=""+Object.prototype.constructor,nn="undefined"!=typeof Reflect&&Reflect.ownKeys?Reflect.ownKeys:void 0!==Object.getOwnPropertySymbols?function(n){return Object.getOwnPropertyNames(n).concat(Object.getOwnPropertySymbols(n))}:Object.getOwnPropertyNames,rn=Object.getOwnPropertyDescriptors||function(n){var r={};return nn(n).forEach((function(t){r[t]=Object.getOwnPropertyDescriptor(n,t)})),r},tn={},en={get:function(n,r){if(r===Q)return n;var e=p(n);if(!u(e,r))return function(n,r,t){var e,i=I(r,t);return i?"value"in i?i.value:null===(e=i.get)||void 0===e?void 0:e.call(n.k):void 0}(n,e,r);var i=e[r];return n.I||!t(i)?i:i===z(n.t,r)?(E(n),n.o[r]=N(n.A.h,i,n)):i},has:function(n,r){return r in p(n)},ownKeys:function(n){return Reflect.ownKeys(p(n))},set:function(n,r,t){var e=I(p(n),r);if(null==e?void 0:e.set)return e.set.call(n.k,t),!0;if(!n.P){var i=z(p(n),r),o=null==i?void 0:i[Q];if(o&&o.t===t)return n.o[r]=t,n.R[r]=!1,!0;if(c(t,i)&&(void 0!==t||u(n.t,r)))return!0;E(n),k(n)}return n.o[r]===t&&(void 0!==t||r in n.o)||Number.isNaN(t)&&Number.isNaN(n.o[r])||(n.o[r]=t,n.R[r]=!0),!0},deleteProperty:function(n,r){return void 0!==z(n.t,r)||r in n.t?(n.R[r]=!1,E(n),k(n)):delete n.R[r],n.o&&delete n.o[r],!0},getOwnPropertyDescriptor:function(n,r){var t=p(n),e=Reflect.getOwnPropertyDescriptor(t,r);return e?{writable:!0,configurable:1!==n.i||"length"!==r,enumerable:e.enumerable,value:t[r]}:e},defineProperty:function(){n(11)},getPrototypeOf:function(n){return Object.getPrototypeOf(n.t)},setPrototypeOf:function(){n(12)}},on={};i(en,(function(n,r){on[n]=function(){return arguments[0]=arguments[0][0],r.apply(this,arguments)}})),on.deleteProperty=function(r,t){return true&&isNaN(parseInt(t))&&n(13),on.set.call(this,r,t,void 0)},on.set=function(r,t,e){return true&&"length"!==t&&isNaN(parseInt(t))&&n(14),en.set.call(this,r[0],t,e,r[0])};var un=function(){function e(r){var e=this;this.O=B,this.D=!0,this.produce=function(r,i,o){if("function"==typeof r&&"function"!=typeof i){var u=i;i=r;var a=e;return function(n){var r=this;void 0===n&&(n=u);for(var t=arguments.length,e=Array(t>1?t-1:0),o=1;o<t;o++)e[o-1]=arguments[o];return a.produce(n,(function(n){var t;return(t=i).call.apply(t,[r,n].concat(e))}))}}var f;if("function"!=typeof i&&n(6),void 0!==o&&"function"!=typeof o&&n(7),t(r)){var c=w(e),s=N(e,r,void 0),v=!0;try{f=i(s),v=!1}finally{v?g(c):O(c)}return"undefined"!=typeof Promise&&f instanceof Promise?f.then((function(n){return j(c,o),P(n,c)}),(function(n){throw g(c),n})):(j(c,o),P(f,c))}if(!r||"object"!=typeof r){if(void 0===(f=i(r))&&(f=r),f===H&&(f=void 0),e.D&&d(f,!0),o){var p=[],l=[];b("Patches").M(r,f,p,l),o(p,l)}return f}n(21,r)},this.produceWithPatches=function(n,r){if("function"==typeof n)return function(r){for(var t=arguments.length,i=Array(t>1?t-1:0),o=1;o<t;o++)i[o-1]=arguments[o];return e.produceWithPatches(r,(function(r){return n.apply(void 0,[r].concat(i))}))};var t,i,o=e.produce(n,r,(function(n,r){t=n,i=r}));return"undefined"!=typeof Promise&&o instanceof Promise?o.then((function(n){return[n,t,i]})):[o,t,i]},"boolean"==typeof(null==r?void 0:r.useProxies)&&this.setUseProxies(r.useProxies),"boolean"==typeof(null==r?void 0:r.autoFreeze)&&this.setAutoFreeze(r.autoFreeze)}var i=e.prototype;return i.createDraft=function(e){t(e)||n(8),r(e)&&(e=R(e));var i=w(this),o=N(this,e,void 0);return o[Q].C=!0,O(i),o},i.finishDraft=function(r,t){var e=r&&r[Q]; true&&(e&&e.C||n(9),e.I&&n(10));var i=e.A;return j(i,t),P(void 0,i)},i.setAutoFreeze=function(n){this.D=n},i.setUseProxies=function(r){r&&!B&&n(20),this.O=r},i.applyPatches=function(n,t){var e;for(e=t.length-1;e>=0;e--){var i=t[e];if(0===i.path.length&&"replace"===i.op){n=i.value;break}}e>-1&&(t=t.slice(e+1));var o=b("Patches").$;return r(n)?o(n,t):this.produce(n,(function(n){return o(n,t)}))},e}(),an=new un,fn=an.produce,cn=an.produceWithPatches.bind(an),sn=an.setAutoFreeze.bind(an),vn=an.setUseProxies.bind(an),pn=an.applyPatches.bind(an),ln=an.createDraft.bind(an),dn=an.finishDraft.bind(an);/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (fn);
//# sourceMappingURL=immer.esm.js.map


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("9ad7028d8cc4b9ead3b4")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.3345c5fd8ba6e94125bd.hot-update.js.map