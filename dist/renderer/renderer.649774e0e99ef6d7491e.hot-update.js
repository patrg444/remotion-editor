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
/* harmony import */ var immer__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! immer */ "./node_modules/immer/dist/immer.esm.mjs");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_historyDiff__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/historyDiff */ "./src/renderer/utils/historyDiff.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _utils_timelineValidation__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/timelineValidation */ "./src/renderer/utils/timelineValidation.ts");







const TimelineContext = (0,react__WEBPACK_IMPORTED_MODULE_0__.createContext)(undefined);
const NON_UNDOABLE_ACTIONS = new Set([
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_CURRENT_TIME,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_PLAYING,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SCROLL_X,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SCROLL_Y,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DRAGGING,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_ERROR,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.RESTORE_SNAPSHOT,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_IS_PLAYING,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_IS_DRAGGING,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SELECTED_CLIP_IDS,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SELECT_CLIPS,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SELECTED_TRACK_ID,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DURATION
]);
const CHECKPOINT_ACTIONS = new Set([
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_TRACK,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_TRACK,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_CLIP,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_CLIP,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SPLIT_CLIP,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_TRACKS,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.MOVE_TRACK,
    _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.MOVE_CLIP
]);
const timelineReducer = (state, action) => {
    return (0,immer__WEBPACK_IMPORTED_MODULE_6__.produce)(state, draft => {
        let shouldCreateHistoryEntry = false;
        let historyDescription = '';
        let beforeState = state;
        let isCheckpoint = false;
        if (!NON_UNDOABLE_ACTIONS.has(action.type)) {
            shouldCreateHistoryEntry = true;
            historyDescription = getHistoryDescription(action);
            beforeState = { ...state };
            isCheckpoint = CHECKPOINT_ACTIONS.has(action.type);
            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('Processing action:', {
                type: action.type,
                isCheckpoint,
                description: historyDescription
            });
        }
        switch (action.type) {
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_STATE:
                return action.payload;
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
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_TRACK:
                {
                    const trackIndex = draft.tracks.findIndex(t => t.id === action.payload.trackId);
                    if (trackIndex !== -1) {
                        draft.tracks[trackIndex] = {
                            ...draft.tracks[trackIndex],
                            ...action.payload.track
                        };
                    }
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_TRACK:
                draft.tracks = draft.tracks.filter(t => t.id !== action.payload.trackId);
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.ADD_CLIP:
                {
                    const trackToAddClip = draft.tracks.find(t => t.id === action.payload.trackId);
                    if (trackToAddClip) {
                        // Remove any existing clip with the same ID
                        trackToAddClip.clips = trackToAddClip.clips.filter(c => c.id !== action.payload.clip.id);
                        // Create new clip with provided values
                        // Here we ensure that if initialBounds isn't already provided, we set it.
                        const newClip = {
                            ...action.payload.clip,
                            startTime: action.payload.clip.startTime ?? 0,
                            endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
                            // Preserve or create the reference to the source media
                            initialBounds: action.payload.clip.initialBounds || {
                                startTime: action.payload.clip.startTime ?? 0,
                                endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0),
                                mediaOffset: action.payload.clip.mediaOffset ?? 0,
                                mediaDuration: action.payload.clip.mediaDuration ?? ((action.payload.clip.endTime ?? 0) - (action.payload.clip.startTime ?? 0))
                            }
                        };
                        if (!trackToAddClip.clips.some(c => c.id === newClip.id)) {
                            trackToAddClip.clips.push(newClip);
                            trackToAddClip.clips.sort((a, b) => a.startTime - b.startTime);
                        }
                    }
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_CLIP:
                {
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
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.REMOVE_CLIP:
                {
                    const trackToRemoveClip = draft.tracks.find(t => t.id === action.payload.trackId);
                    if (trackToRemoveClip) {
                        trackToRemoveClip.clips = trackToRemoveClip.clips.filter(c => c.id !== action.payload.clipId);
                    }
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.MOVE_CLIP:
                {
                    const sourceTrack = draft.tracks.find(t => t.id === action.payload.sourceTrackId);
                    const targetTrack = draft.tracks.find(t => t.id === action.payload.targetTrackId);
                    if (sourceTrack && targetTrack) {
                        const clipToMove = sourceTrack.clips.find(c => c.id === action.payload.clipId);
                        if (clipToMove) {
                            const desiredStart = Math.max(0, action.payload.newTime);
                            const delta = desiredStart - clipToMove.startTime;
                            const newStartTime = clipToMove.startTime + delta;
                            const newEndTime = clipToMove.endTime + delta;
                            // Update clip while preserving media references
                            const updatedClip = {
                                ...clipToMove,
                                startTime: newStartTime,
                                endTime: newEndTime,
                                mediaOffset: clipToMove.mediaOffset + delta,
                                // Update handles to maintain relative positions
                                handles: {
                                    startPosition: (clipToMove.handles?.startPosition ?? clipToMove.mediaOffset) + delta,
                                    endPosition: (clipToMove.handles?.endPosition ?? (clipToMove.mediaOffset + (clipToMove.endTime - clipToMove.startTime))) + delta
                                },
                                // Update initial bounds to reflect new timeline position while preserving media duration
                                initialBounds: {
                                    ...clipToMove.initialBounds,
                                    startTime: newStartTime,
                                    endTime: newEndTime,
                                    mediaOffset: (clipToMove.initialBounds?.mediaOffset ?? clipToMove.mediaOffset) + delta,
                                    mediaDuration: clipToMove.initialBounds?.mediaDuration ?? clipToMove.mediaDuration
                                }
                            };
                            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('Move clip:', {
                                id: clipToMove.id,
                                oldStartTime: clipToMove.startTime,
                                oldEndTime: clipToMove.endTime,
                                newStartTime,
                                newEndTime,
                                delta,
                                mediaOffset: updatedClip.mediaOffset,
                                handles: updatedClip.handles,
                                initialBounds: updatedClip.initialBounds
                            });
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
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.TRIM_CLIP:
                {
                    for (const track of draft.tracks) {
                        const clipToTrim = track.clips.find(c => c.id === action.payload.clipId);
                        if (clipToTrim) {
                            const oldEndTime = clipToTrim.endTime;
                            const clipIndex = track.clips.findIndex(c => c.id === clipToTrim.id);
                            // In ripple mode, allow extending to full media duration
                            const maxEndTime = clipToTrim.startTime + clipToTrim.mediaDuration;
                            const minEndTime = clipToTrim.startTime + 0.1; // Minimum duration
                            // Calculate new end time based on mode
                            let newEndTime = oldEndTime;
                            if (action.payload.ripple) {
                                // In ripple mode, allow extending up to full media duration
                                const targetEndTime = action.payload.endTime ?? oldEndTime;
                                // Calculate the target change
                                const totalChange = maxEndTime - oldEndTime;
                                const requestedChange = targetEndTime - oldEndTime;
                                // Calculate current duration
                                const currentDuration = oldEndTime - clipToTrim.startTime;
                                const targetDuration = 4.0; // Target 4s duration
                                const maxDuration = clipToTrim.mediaDuration; // Maximum possible duration
                                // Calculate the target end time based on the drag operation
                                const dragTargetEndTime = action.payload.endTime ?? oldEndTime;
                                const dragDirection = Math.sign(dragTargetEndTime - oldEndTime);
                                // Track if we're at initial state (2s)
                                const isInitialState = Math.abs(currentDuration - 2) < 0.01;
                                const hasReachedTarget = currentDuration >= targetDuration;
                                // Initialize ripple state if needed
                                if (!draft.rippleState) {
                                    draft.rippleState = {};
                                }
                                if (!(clipToTrim.id in draft.rippleState)) {
                                    draft.rippleState[clipToTrim.id] = { initialExtensionDone: false };
                                }
                                if (dragDirection > 0) {
                                    // Calculate total available extension and progress
                                    const totalExtension = maxEndTime - clipToTrim.startTime;
                                    const firstStepTarget = clipToTrim.startTime + targetDuration;
                                    const dragProgress = dragTargetEndTime - oldEndTime;
                                    const halfwayPoint = 1.0; // Require 1 second of drag for first extension
                                    if (isInitialState && !draft.rippleState[clipToTrim.id].initialExtensionDone) {
                                        if (dragProgress >= halfwayPoint) {
                                            // First step: Extend to 4s
                                            newEndTime = firstStepTarget;
                                            draft.rippleState[clipToTrim.id].initialExtensionDone = true;
                                            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('First extension to 4s:', {
                                                clipId: clipToTrim.id,
                                                currentDuration,
                                                targetDuration,
                                                newEndTime,
                                                dragProgress,
                                                halfwayPoint,
                                                oldEndTime,
                                                maxEndTime
                                            });
                                        }
                                        else {
                                            // Not dragged far enough yet, maintain current end time
                                            newEndTime = oldEndTime;
                                        }
                                    }
                                    else if (draft.rippleState[clipToTrim.id].initialExtensionDone || !isInitialState) {
                                        // Second step: Allow extending beyond 4s up to media duration
                                        newEndTime = Math.min(dragTargetEndTime, maxEndTime);
                                        _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('Extending beyond 4s:', {
                                            clipId: clipToTrim.id,
                                            dragTargetEndTime,
                                            maxEndTime,
                                            newEndTime,
                                            dragProgress,
                                            halfwayPoint
                                        });
                                    }
                                }
                                else {
                                    // Handle trimming shorter
                                    newEndTime = Math.max(dragTargetEndTime, minEndTime);
                                    _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('Trimming shorter:', {
                                        clipId: clipToTrim.id,
                                        dragTargetEndTime,
                                        minEndTime,
                                        newEndTime
                                    });
                                }
                                // Log detailed ripple trim info
                                _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('Ripple trim calculation:', {
                                    currentDuration,
                                    targetDuration,
                                    dragTargetEndTime,
                                    newEndTime,
                                    oldEndTime,
                                    maxEndTime,
                                    minEndTime,
                                    clipStartTime: clipToTrim.startTime,
                                    clipId: clipToTrim.id,
                                    mediaDuration: clipToTrim.mediaDuration,
                                    dragDirection
                                });
                            }
                            else {
                                // In normal mode, use provided end time
                                newEndTime = action.payload.endTime !== undefined
                                    ? Math.min(action.payload.endTime, maxEndTime)
                                    : clipToTrim.endTime;
                            }
                            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('TRIM_CLIP action:', {
                                clipId: clipToTrim.id,
                                oldEndTime,
                                newEndTime,
                                maxEndTime,
                                ripple: action.payload.ripple,
                                mediaDuration: clipToTrim.mediaDuration,
                                startTime: clipToTrim.startTime,
                                handles: action.payload.handles
                            });
                            // Update the clip being trimmed
                            track.clips[clipIndex] = {
                                ...clipToTrim,
                                endTime: newEndTime,
                                handles: action.payload.handles || {
                                    startPosition: clipToTrim.mediaOffset,
                                    endPosition: clipToTrim.mediaOffset + (newEndTime - clipToTrim.startTime)
                                }
                            };
                            // If ripple mode is enabled, shift subsequent clips accordingly.
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
                                        // Update clip while preserving media references
                                        track.clips[idx] = {
                                            ...clipToMove,
                                            startTime: newStart,
                                            endTime: newStart + duration,
                                            mediaOffset: clipToMove.mediaOffset + deltaTime,
                                            // Update handles to maintain relative positions
                                            handles: {
                                                startPosition: (clipToMove.handles?.startPosition ?? clipToMove.mediaOffset) + deltaTime,
                                                endPosition: (clipToMove.handles?.endPosition ?? (clipToMove.mediaOffset + duration)) + deltaTime
                                            },
                                            // Update initial bounds to reflect new timeline position while preserving media duration
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
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SPLIT_CLIP:
                {
                    const trackToSplit = draft.tracks.find(t => t.id === action.payload.trackId);
                    if (trackToSplit) {
                        const clipToSplit = trackToSplit.clips.find(c => c.id === action.payload.clipId);
                        if (clipToSplit && action.payload.time > clipToSplit.startTime && action.payload.time < clipToSplit.endTime) {
                            const splitPoint = action.payload.time;
                            const firstDuration = splitPoint - clipToSplit.startTime;
                            const secondDuration = clipToSplit.endTime - splitPoint;
                            // Use initialBounds as the reference for the source media.
                            const originalMediaOffset = clipToSplit.initialBounds?.mediaOffset ?? clipToSplit.mediaOffset;
                            const originalMediaDuration = clipToSplit.initialBounds?.mediaDuration ?? clipToSplit.mediaDuration;
                            // Calculate media positions relative to original source
                            const firstMediaStart = originalMediaOffset;
                            const firstMediaEnd = originalMediaOffset + firstDuration;
                            const secondMediaStart = originalMediaOffset + firstDuration;
                            const secondMediaEnd = originalMediaOffset + originalMediaDuration;
                            // Get full media duration from source clip
                            const fullMediaDuration = originalMediaDuration;
                            // Create first clip with full media duration for proper extension
                            const firstClip = {
                                ...clipToSplit,
                                id: `${clipToSplit.id}-1`,
                                endTime: splitPoint,
                                // Set full media duration so TRIM_CLIP can allow extension up to the full source length
                                mediaDuration: fullMediaDuration,
                                mediaOffset: firstMediaStart,
                                handles: {
                                    startPosition: firstMediaStart,
                                    endPosition: firstMediaEnd
                                },
                                // Set reference bounds for first segment
                                initialBounds: {
                                    startTime: clipToSplit.startTime,
                                    endTime: splitPoint,
                                    mediaOffset: firstMediaStart,
                                    mediaDuration: fullMediaDuration
                                }
                            };
                            // Create second clip with full media duration for proper extension
                            const secondClip = {
                                ...clipToSplit,
                                id: `${clipToSplit.id}-2`,
                                startTime: splitPoint,
                                mediaOffset: secondMediaStart,
                                // Keep full media duration for the second clip
                                mediaDuration: fullMediaDuration,
                                handles: {
                                    startPosition: secondMediaStart,
                                    endPosition: secondMediaEnd
                                },
                                // Set reference bounds for second segment
                                initialBounds: {
                                    startTime: splitPoint,
                                    endTime: clipToSplit.endTime,
                                    mediaOffset: secondMediaStart,
                                    mediaDuration: fullMediaDuration
                                }
                            };
                            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('Split clip:', {
                                original: {
                                    id: clipToSplit.id,
                                    startTime: clipToSplit.startTime,
                                    endTime: clipToSplit.endTime,
                                    mediaOffset: originalMediaOffset,
                                    mediaDuration: originalMediaDuration,
                                    initialBounds: clipToSplit.initialBounds
                                },
                                first: {
                                    id: firstClip.id,
                                    startTime: firstClip.startTime,
                                    endTime: firstClip.endTime,
                                    mediaOffset: firstClip.mediaOffset,
                                    mediaDuration: firstClip.mediaDuration,
                                    initialBounds: firstClip.initialBounds,
                                    handles: firstClip.handles
                                },
                                second: {
                                    id: secondClip.id,
                                    startTime: secondClip.startTime,
                                    endTime: secondClip.endTime,
                                    mediaOffset: secondClip.mediaOffset,
                                    mediaDuration: secondClip.mediaDuration,
                                    initialBounds: secondClip.initialBounds,
                                    handles: secondClip.handles
                                }
                            });
                            trackToSplit.clips = trackToSplit.clips.filter(c => c.id !== clipToSplit.id);
                            trackToSplit.clips.push(firstClip, secondClip);
                            trackToSplit.clips.sort((a, b) => a.startTime - b.startTime);
                            draft.selectedClipIds = [firstClip.id, secondClip.id];
                        }
                    }
                }
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SELECT_CLIPS:
                draft.selectedClipIds = action.payload.clipIds;
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SELECTED_CLIP_IDS:
                draft.selectedClipIds = action.payload;
                break;
            case _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SELECTED_TRACK_ID:
                draft.selectedTrackId = action.payload;
                break;
        }
        if (shouldCreateHistoryEntry) {
            const diff = (0,_utils_historyDiff__WEBPACK_IMPORTED_MODULE_2__.createStateDiff)(beforeState, draft, historyDescription, isCheckpoint);
            draft.history.entries.push(diff);
            if (draft.history.entries.length > _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__.TimelineConstants.History.MAX_HISTORY_SIZE) {
                draft.history.entries = draft.history.entries.slice(-_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__.TimelineConstants.History.MAX_HISTORY_SIZE);
            }
            draft.history.currentIndex = draft.history.entries.length - 1;
        }
    });
};
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
const TimelineProvider = ({ children }) => {
    const [state, dispatch] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useReducer)(timelineReducer, _types_timeline__WEBPACK_IMPORTED_MODULE_1__.initialTimelineState);
    const [isInitialized, setIsInitialized] = react__WEBPACK_IMPORTED_MODULE_0___default().useState(false);
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        try {
            const validationErrors = (0,_utils_timelineValidation__WEBPACK_IMPORTED_MODULE_5__.validateTimelineState)(state);
            window.timelineState = {
                ...state,
                dispatch
            };
            window.timelineDispatch = dispatch;
            setIsInitialized(true);
            window.timelineReady = true;
            const detail = {
                state,
                dispatch,
                isValid: validationErrors.length === 0,
                errors: validationErrors
            };
            window.dispatchEvent(new CustomEvent('timeline:initializing', { detail }));
            requestAnimationFrame(() => {
                window.dispatchEvent(new CustomEvent('timeline:initialized', { detail }));
            });
            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.debug('[Timeline] Initialization complete:', detail);
            return () => {
                window.timelineReady = false;
                window.timelineState = undefined;
                window.timelineDispatch = undefined;
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            _utils_logger__WEBPACK_IMPORTED_MODULE_4__.logger.error('[Timeline] Initialization failed:', new Error(errorMessage));
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
/******/ 	__webpack_require__.h = () => ("ea5f9374eaff980728c4")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.649774e0e99ef6d7491e.hot-update.js.map