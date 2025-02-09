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
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   useTimelineContext: () => (/* binding */ useTimelineContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! immer */ "./node_modules/immer/dist/immer.esm.mjs");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _utils_timelineValidation__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/timelineValidation */ "./src/renderer/utils/timelineValidation.ts");
/* harmony import */ var _types_transition__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../types/transition */ "./src/renderer/types/transition.ts");







// Enable patches for Immer
(0,immer__WEBPACK_IMPORTED_MODULE_6__.enablePatches)();
const TimelineContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);
const useTimelineContext = () => {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(TimelineContext);
    if (!context) {
        throw new Error('useTimelineContext must be used within a TimelineProvider');
    }
    return context;
};
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
const createFreshState = (state) => {
    const freshState = JSON.parse(JSON.stringify(state));
    freshState.tracks = freshState.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => ({
            ...clip,
            layer: clip.layer ?? 0 // Ensure layer property exists
        }))
    }));
    freshState.selectedClipIds = Array.from(freshState.selectedClipIds);
    freshState.history = {
        entries: freshState.history.entries.map(entry => ({
            ...entry,
            patches: JSON.parse(JSON.stringify(entry.patches)),
            inversePatches: JSON.parse(JSON.stringify(entry.inversePatches))
        })),
        currentIndex: freshState.history.currentIndex
    };
    return freshState;
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
                const stateCopy = createFreshState(state);
                // Create final state with both patches and history update
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_6__.produce)(stateCopy, draft => {
                    // Create deep copies of patches to avoid any proxy issues
                    const inversePatchesCopy = JSON.parse(JSON.stringify(entry.inversePatches));
                    // Apply patches and ensure selection state is preserved
                    const prevSelectedClipIds = Array.from(draft.selectedClipIds);
                    (0,immer__WEBPACK_IMPORTED_MODULE_6__.applyPatches)(draft, inversePatchesCopy);
                    // If the selected clip still exists after applying patches, keep it selected
                    const selectedClipsExist = prevSelectedClipIds.some((id) => draft.tracks.some((track) => track.clips.some((clip) => clip.id === id)));
                    if (!selectedClipsExist && draft.tracks.length > 0) {
                        // If no selected clips exist, try to select the first clip
                        const firstTrack = draft.tracks[0];
                        if (firstTrack.clips.length > 0) {
                            draft.selectedClipIds = [firstTrack.clips[0].id];
                        }
                    }
                    // Create a fresh copy of the history entries
                    const newEntries = state.history.entries.map(entry => ({
                        ...entry,
                        patches: JSON.parse(JSON.stringify(entry.patches)),
                        inversePatches: JSON.parse(JSON.stringify(entry.inversePatches))
                    }));
                    // Update history with a new object
                    draft.history = {
                        entries: newEntries,
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
                const stateCopy = createFreshState(state);
                // Create final state with both patches and history update
                const finalState = (0,immer__WEBPACK_IMPORTED_MODULE_6__.produce)(stateCopy, draft => {
                    // Create deep copies of patches to avoid any proxy issues
                    const patchesCopy = JSON.parse(JSON.stringify(entry.patches));
                    // Apply patches and ensure selection state is preserved
                    const prevSelectedClipIds = Array.from(draft.selectedClipIds);
                    (0,immer__WEBPACK_IMPORTED_MODULE_6__.applyPatches)(draft, patchesCopy);
                    // If the selected clip still exists after applying patches, keep it selected
                    const selectedClipsExist = prevSelectedClipIds.some((id) => draft.tracks.some((track) => track.clips.some((clip) => clip.id === id)));
                    if (!selectedClipsExist && draft.tracks.length > 0) {
                        // If no selected clips exist, try to select the first clip
                        const firstTrack = draft.tracks[0];
                        if (firstTrack.clips.length > 0) {
                            draft.selectedClipIds = [firstTrack.clips[0].id];
                        }
                    }
                    // Create a fresh copy of the history entries
                    const newEntries = state.history.entries.map(entry => ({
                        ...entry,
                        patches: JSON.parse(JSON.stringify(entry.patches)),
                        inversePatches: JSON.parse(JSON.stringify(entry.inversePatches))
                    }));
                    // Update history with a new object
                    draft.history = {
                        entries: newEntries,
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
            const [nextState, patches, inversePatches] = (0,immer__WEBPACK_IMPORTED_MODULE_6__.produceWithPatches)(state, draft => {
                switch (action.type) {
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DURATION:
                        draft.duration = action.payload;
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_TRACKS:
                        draft.tracks = action.payload.map((track) => ({
                            ...track,
                            clips: track.clips.map((clip) => ({
                                ...clip,
                                layer: clip.layer ?? 0
                            }))
                        }));
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
                        console.log('ADD_TRACK action:', { payload: action.payload });
                        const newTrack = {
                            ...action.payload.track,
                            transitions: Array.isArray(action.payload.track.transitions) ? action.payload.track.transitions : [],
                            allowTransitions: true,
                            transitionsEnabled: true,
                            showTransitions: true,
                            allowOverlap: true,
                            transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                            transitionDefaults: {
                                duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                direction: 'right'
                            }
                        };
                        console.log('Adding track with transitions:', newTrack);
                        draft.tracks = [...draft.tracks, newTrack];
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_TRACK: {
                        const trackIndex = draft.tracks.findIndex((t) => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            console.log('UPDATE_TRACK action:', { payload: action.payload });
                            const updatedTrack = {
                                ...draft.tracks[trackIndex],
                                ...(action.payload.track || {}),
                                ...(action.payload.updates || {}),
                                transitions: draft.tracks[trackIndex].transitions || [],
                                allowTransitions: true,
                                transitionsEnabled: true,
                                showTransitions: true,
                                allowOverlap: true,
                                transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                transitionDefaults: {
                                    duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                    type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                    direction: 'right'
                                }
                            };
                            console.log('Updated track:', updatedTrack);
                            draft.tracks = [
                                ...draft.tracks.slice(0, trackIndex),
                                updatedTrack,
                                ...draft.tracks.slice(trackIndex + 1)
                            ];
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_TRACK:
                        draft.tracks = draft.tracks.filter((t) => t.id !== action.payload.trackId);
                        break;
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_CLIP: {
                        const trackIndex = draft.tracks.findIndex((t) => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            const trackToAddClip = draft.tracks[trackIndex];
                            const newClip = {
                                ...action.payload.clip,
                                startTime: action.payload.clip.startTime ?? 0,
                                endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
                                layer: action.payload.clip.layer ?? 0
                            };
                            const newClips = [...trackToAddClip.clips, newClip].sort((a, b) => a.startTime - b.startTime);
                            // Create new track with updated clips
                            const updatedTrack = {
                                ...trackToAddClip,
                                clips: newClips,
                                transitions: trackToAddClip.transitions || [],
                                allowTransitions: true,
                                transitionsEnabled: true,
                                showTransitions: true,
                                allowOverlap: true,
                                transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                transitionDefaults: {
                                    duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                    type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                    direction: 'right'
                                }
                            };
                            // Update tracks array
                            draft.tracks = [
                                ...draft.tracks.slice(0, trackIndex),
                                updatedTrack,
                                ...draft.tracks.slice(trackIndex + 1)
                            ];
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_CLIP: {
                        const trackIndex = draft.tracks.findIndex((t) => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            const trackWithClip = draft.tracks[trackIndex];
                            const clipIndex = trackWithClip.clips.findIndex((c) => c.id === action.payload.clipId);
                            if (clipIndex !== -1) {
                                const newClips = [
                                    ...trackWithClip.clips.slice(0, clipIndex),
                                    {
                                        ...trackWithClip.clips[clipIndex],
                                        ...action.payload.clip,
                                        layer: action.payload.clip.layer ?? trackWithClip.clips[clipIndex].layer ?? 0
                                    },
                                    ...trackWithClip.clips.slice(clipIndex + 1)
                                ];
                                // Create new track with updated clips
                                const updatedTrack = {
                                    ...trackWithClip,
                                    clips: newClips,
                                    transitions: trackWithClip.transitions || [],
                                    allowTransitions: true,
                                    transitionsEnabled: true,
                                    showTransitions: true,
                                    allowOverlap: true,
                                    transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                    transitionDefaults: {
                                        duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                        type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                        direction: 'right'
                                    }
                                };
                                // Update tracks array
                                draft.tracks = [
                                    ...draft.tracks.slice(0, trackIndex),
                                    updatedTrack,
                                    ...draft.tracks.slice(trackIndex + 1)
                                ];
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_TRANSITION: {
                        const { transition } = action.payload;
                        console.log('ADD_TRANSITION action:', { payload: action.payload });
                        const trackIndex = draft.tracks.findIndex((t) => t.clips.some((c) => c.id === transition.clipAId) &&
                            t.clips.some((c) => c.id === transition.clipBId));
                        console.log('Found track index:', trackIndex);
                        if (trackIndex !== -1) {
                            // Initialize transitions array if it doesn't exist
                            if (!draft.tracks[trackIndex].transitions) {
                                draft.tracks[trackIndex].transitions = [];
                            }
                            // Create fresh copies of track and clips with transition flags
                            const trackCopy = {
                                ...JSON.parse(JSON.stringify(draft.tracks[trackIndex])),
                                transitions: draft.tracks[trackIndex].transitions || [],
                                allowTransitions: true,
                                transitionsEnabled: true,
                                showTransitions: true,
                                allowOverlap: true,
                                transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                transitionDefaults: {
                                    duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                    type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                    direction: 'right'
                                }
                            };
                            const clipA = JSON.parse(JSON.stringify(trackCopy.clips.find((c) => c.id === transition.clipAId)));
                            const clipB = JSON.parse(JSON.stringify(trackCopy.clips.find((c) => c.id === transition.clipBId)));
                            console.log('Found clips:', { clipA, clipB });
                            // Validate clips exist and are adjacent
                            if (clipA && clipB) {
                                const areAdjacent = Math.abs(clipB.startTime - clipA.endTime) < 0.1;
                                console.log('Clips adjacency check:', { areAdjacent, gap: clipB.startTime - clipA.endTime });
                                if (areAdjacent) {
                                    // Initialize transitions array and transition properties
                                    const updatedTrack = {
                                        ...trackCopy,
                                        transitions: Array.isArray(trackCopy.transitions) ? trackCopy.transitions : [],
                                        allowTransitions: true,
                                        transitionsEnabled: true,
                                        showTransitions: true,
                                        allowOverlap: true,
                                        transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                        transitionDefaults: {
                                            duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                            type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                            direction: 'right'
                                        }
                                    };
                                    // Enforce minimum/maximum duration
                                    const duration = Math.max(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION, Math.min(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MAX_DURATION, transition.duration));
                                    // Create new transition object
                                    const newTransition = {
                                        ...transition,
                                        duration,
                                        id: transition.id,
                                        type: transition.type,
                                        clipAId: transition.clipAId,
                                        clipBId: transition.clipBId,
                                        startTime: clipA.endTime - (duration / 2),
                                        endTime: clipB.startTime + (duration / 2),
                                        params: {
                                            ...transition.params,
                                            duration,
                                            direction: transition.params?.direction || 'right'
                                        }
                                    };
                                    // Add transition to array
                                    updatedTrack.transitions.push(newTransition);
                                    // Update track in draft state
                                    draft.tracks[trackIndex] = updatedTrack;
                                    console.log('Added transition:', {
                                        track: updatedTrack,
                                        transition: newTransition,
                                        allTransitions: updatedTrack.transitions,
                                        trackState: draft.tracks[trackIndex],
                                        trackIndex,
                                        clipA: clipA,
                                        clipB: clipB,
                                        areAdjacent,
                                        gap: clipB.startTime - clipA.endTime
                                    });
                                    // Notify that transition was added
                                    requestAnimationFrame(() => {
                                        window.dispatchEvent(new CustomEvent('timeline:transition-added', {
                                            detail: {
                                                trackId: trackCopy.id,
                                                transitionId: newTransition.id,
                                                transition: newTransition
                                            }
                                        }));
                                    });
                                }
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_TRANSITION: {
                        const { transitionId, params } = action.payload;
                        const trackIndex = draft.tracks.findIndex((track) => track.transitions?.some((t) => t.id === transitionId));
                        if (trackIndex !== -1) {
                            // Create fresh copy of track
                            const trackCopy = JSON.parse(JSON.stringify(draft.tracks[trackIndex]));
                            const transitionIndex = trackCopy.transitions.findIndex((t) => t.id === transitionId);
                            if (transitionIndex !== -1) {
                                // Get clips for this transition
                                const transition = trackCopy.transitions[transitionIndex];
                                const clipA = trackCopy.clips.find((c) => c.id === transition.clipAId);
                                const clipB = trackCopy.clips.find((c) => c.id === transition.clipBId);
                                if (clipA && clipB) {
                                    // Create fresh copy of transition
                                    const updatedTransition = {
                                        ...transition,
                                        params: {
                                            ...transition.params,
                                            ...params
                                        }
                                    };
                                    if (params.duration) {
                                        const duration = params.duration;
                                        updatedTransition.duration = duration;
                                        updatedTransition.startTime = clipA.endTime - (duration / 2);
                                        updatedTransition.endTime = clipB.startTime + (duration / 2);
                                    }
                                    // Update transitions array
                                    trackCopy.transitions[transitionIndex] = updatedTransition;
                                    // Update track in draft
                                    draft.tracks[trackIndex] = trackCopy;
                                    // Notify that transition was updated
                                    requestAnimationFrame(() => {
                                        window.dispatchEvent(new CustomEvent('timeline:transition-updated', {
                                            detail: {
                                                trackId: trackCopy.id,
                                                transitionId,
                                                transition: updatedTransition
                                            }
                                        }));
                                    });
                                }
                            }
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_TRANSITION: {
                        const { transitionId } = action.payload;
                        const trackIndex = draft.tracks.findIndex((track) => track.transitions?.some((t) => t.id === transitionId));
                        if (trackIndex !== -1) {
                            // Create fresh copy of track
                            const trackCopy = JSON.parse(JSON.stringify(draft.tracks[trackIndex]));
                            // Filter out the transition
                            trackCopy.transitions = trackCopy.transitions.filter((t) => t.id !== transitionId);
                            // Update track in draft
                            draft.tracks[trackIndex] = trackCopy;
                            // Notify that transition was removed
                            requestAnimationFrame(() => {
                                window.dispatchEvent(new CustomEvent('timeline:transition-removed', {
                                    detail: {
                                        trackId: trackCopy.id,
                                        transitionId
                                    }
                                }));
                            });
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_CLIP: {
                        const trackIndex = draft.tracks.findIndex((t) => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            const trackToRemoveClip = draft.tracks[trackIndex];
                            const newClips = trackToRemoveClip.clips.filter((c) => c.id !== action.payload.clipId);
                            // Create new track with updated clips
                            const updatedTrack = {
                                ...trackToRemoveClip,
                                clips: newClips,
                                transitions: trackToRemoveClip.transitions || [],
                                allowTransitions: true,
                                transitionsEnabled: true,
                                showTransitions: true,
                                allowOverlap: true,
                                transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                transitionDefaults: {
                                    duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                    type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                    direction: 'right'
                                }
                            };
                            // Update tracks array
                            draft.tracks = [
                                ...draft.tracks.slice(0, trackIndex),
                                updatedTrack,
                                ...draft.tracks.slice(trackIndex + 1)
                            ];
                        }
                        break;
                    }
                    case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SPLIT_CLIP: {
                        const trackIndex = draft.tracks.findIndex((t) => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            const trackToSplit = draft.tracks[trackIndex];
                            const clipToSplit = trackToSplit.clips.find((c) => c.id === action.payload.clipId);
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
                                    layer: clipToSplit.layer ?? 0,
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
                                    layer: clipToSplit.layer ?? 0,
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
                                    .filter((c) => c.id !== clipToSplit.id)
                                    .concat([firstClip, secondClip])
                                    .sort((a, b) => a.startTime - b.startTime);
                                // Create new track with updated clips
                                const updatedTrack = {
                                    ...trackToSplit,
                                    clips: newClips,
                                    transitions: trackToSplit.transitions || [],
                                    allowTransitions: true,
                                    transitionsEnabled: true,
                                    showTransitions: true,
                                    allowOverlap: true,
                                    transitionTypes: [_types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Dissolve, _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Fade],
                                    transitionDefaults: {
                                        duration: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_2__.TimelineConstants.Transitions.MIN_DURATION,
                                        type: _types_transition__WEBPACK_IMPORTED_MODULE_5__.TransitionType.Wipe,
                                        direction: 'right'
                                    }
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
                }
            });
            if (isUndoable(action)) {
                const timestamp = Date.now();
                const newEntry = {
                    type: 'full',
                    timestamp,
                    description: getHistoryDescription(action),
                    patches,
                    inversePatches
                };
                const newHistory = {
                    entries: [
                        ...state.history.entries.slice(0, state.history.currentIndex + 1),
                        newEntry
                    ],
                    currentIndex: state.history.currentIndex + 1
                };
                return {
                    ...nextState,
                    history: newHistory
                };
            }
            return nextState;
        }
    }
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (TimelineContext);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("5786fcc9939ddfaac351")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.ee6840d8c65cebee0508.hot-update.js.map