"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/Timeline.tsx":
/*!**********************************************!*\
  !*** ./src/renderer/components/Timeline.tsx ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Timeline: () => (/* binding */ Timeline)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _TimelineTracks__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TimelineTracks */ "./src/renderer/components/TimelineTracks.tsx");
/* harmony import */ var _TimelineRuler__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TimelineRuler */ "./src/renderer/components/TimelineRuler.tsx");
/* harmony import */ var _TimelinePlayhead__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TimelinePlayhead */ "./src/renderer/components/TimelinePlayhead.tsx");
/* harmony import */ var _hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hooks/useTimelineContext */ "./src/renderer/hooks/useTimelineContext.ts");
/* harmony import */ var _hooks_useTimelineViewport__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../hooks/useTimelineViewport */ "./src/renderer/hooks/useTimelineViewport.ts");
/* harmony import */ var _utils_throttle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/throttle */ "./src/renderer/utils/throttle.ts");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");









const RULER_HEIGHT = 30;
const Timeline = (0,react__WEBPACK_IMPORTED_MODULE_0__.memo)(({ containerWidth, scrollLeft, onScroll, onTimeUpdate }) => {
    const { state, dispatch } = (0,_hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_4__.useTimelineContext)();
    const { timeToPixels } = (0,_hooks_useTimelineViewport__WEBPACK_IMPORTED_MODULE_5__.useTimelineViewport)();
    const containerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const timelineRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const [contentWidth, setContentWidth] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
    const lastStateRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(state);
    // Update duration based on clips and media duration, but only when not dragging
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!state.isDragging) {
            const maxEndTime = state.tracks.reduce((maxTime, track) => {
                const trackEndTime = track.clips.reduce((trackMax, clip) => {
                    const endTime = clip.endTime;
                    const startTime = clip.startTime;
                    if ((0,_types_timeline__WEBPACK_IMPORTED_MODULE_7__.isMediaClip)(clip)) {
                        const clipDuration = endTime - startTime;
                        const availableDuration = clip.mediaDuration - clip.mediaOffset;
                        return Math.max(trackMax, startTime + Math.min(clipDuration, availableDuration));
                    }
                    return Math.max(trackMax, endTime);
                }, 0);
                return Math.max(maxTime, trackEndTime);
            }, 0);
            // Only update if duration has changed significantly (>0.1s)
            if (Math.abs(maxEndTime - state.duration) > 0.1) {
                dispatch({
                    type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SET_DURATION,
                    payload: Math.max(maxEndTime, 10) // Minimum 10 seconds duration
                });
            }
        }
    }, [state.tracks, dispatch, state.duration, state.isDragging]);
    // Handle state updates and notify components
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const stateChanged = state !== lastStateRef.current;
        lastStateRef.current = state;
        if (stateChanged && containerRef.current) {
            // Force reflow to ensure state changes are applied
            void containerRef.current.offsetHeight;
            // Notify that timeline state has changed
            window.dispatchEvent(new CustomEvent('timeline:state-changed', {
                detail: {
                    tracks: state.tracks.map(t => ({
                        id: t.id,
                        clipCount: t.clips.length,
                        clips: t.clips.map(c => ({
                            id: c.id,
                            startTime: c.startTime,
                            endTime: c.endTime,
                            layer: c.layer
                        }))
                    })),
                    selectedClipIds: state.selectedClipIds,
                    currentTime: state.currentTime,
                    zoom: state.zoom
                }
            }));
            // Wait for next frame to ensure DOM is updated
            requestAnimationFrame(() => {
                // Force another reflow to ensure all updates are applied
                if (containerRef.current) {
                    void containerRef.current.offsetHeight;
                }
            });
        }
    }, [state]);
    // Memoize callback handlers to prevent unnecessary re-renders
    const handleTimeChange = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((time) => {
        _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Time change in Timeline:', {
            time,
            zoom: state.zoom,
            duration: state.duration,
            scrollLeft,
            containerWidth
        });
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SET_CURRENT_TIME,
            payload: time
        });
        onTimeUpdate(time);
    }, [dispatch, onTimeUpdate, state.zoom, state.duration, scrollLeft, containerWidth]);
    const handleSelectTrack = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((trackId) => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SELECT_TRACK,
            payload: { trackId }
        });
    }, [dispatch]);
    const handleSelectClip = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((clipId) => {
        _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Selecting clip:', clipId);
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SELECT_CLIPS,
            payload: { clipIds: [clipId] }
        });
    }, [dispatch]);
    const handleClipDragStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((clipId) => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SET_DRAGGING,
            payload: {
                isDragging: true,
                dragStartX: 0,
                dragStartY: 0
            }
        });
    }, [dispatch]);
    const handleSplitClip = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((clipId, time) => {
        const track = state.tracks.find(t => t.clips.some(c => c.id === clipId));
        if (!track)
            return;
        const clip = track.clips.find(c => c.id === clipId);
        if (!clip)
            return;
        // Only split if time is within clip bounds
        if (time > clip.startTime && time < clip.endTime) {
            dispatch({
                type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SPLIT_CLIP,
                payload: {
                    trackId: track.id,
                    clipId,
                    time
                }
            });
            // Wait for next frame to ensure state is updated
            requestAnimationFrame(() => {
                // Notify that clip was split
                window.dispatchEvent(new CustomEvent('timeline:clip-split', {
                    detail: {
                        trackId: track.id,
                        originalClipId: clipId,
                        splitTime: time,
                        firstClipId: `${clipId}-1`,
                        secondClipId: `${clipId}-2`
                    }
                }));
            });
        }
    }, [state.tracks, dispatch]);
    // Expose for testing
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Exposing timeline functions for testing');
        const timelineFunctions = {
            handleSelectClip,
            handleSplitClip
        };
        window.timelineFunctions = timelineFunctions;
        _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Timeline functions exposed:', {
            isExposed: !!window.timelineFunctions,
            functions: Object.keys(timelineFunctions)
        });
    }, [handleSelectClip, handleSplitClip]);
    const handleClipDragEnd = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SET_DRAGGING,
            payload: {
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0
            }
        });
    }, [dispatch]);
    const handleUpdateTrack = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((trackId, updates) => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.UPDATE_TRACK,
            payload: { trackId, track: updates }
        });
    }, [dispatch]);
    const handleDeleteTrack = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((trackId) => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.REMOVE_TRACK,
            payload: { trackId }
        });
    }, [dispatch]);
    const handleMoveTrack = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((trackId, direction) => {
        const tracks = [...state.tracks];
        const trackIndex = tracks.findIndex((track) => track.id === trackId);
        if (trackIndex === -1)
            return;
        const newIndex = direction === 'up'
            ? Math.max(0, trackIndex - 1)
            : Math.min(tracks.length - 1, trackIndex + 1);
        if (newIndex !== trackIndex) {
            const [movedTrack] = tracks.splice(trackIndex, 1);
            tracks.splice(newIndex, 0, movedTrack);
            dispatch({
                type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.SET_TRACKS,
                payload: tracks
            });
        }
    }, [dispatch, state.tracks]);
    const handleToggleVisibility = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((trackId) => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.UPDATE_TRACK,
            payload: {
                trackId,
                changes: (track) => ({ ...track, isVisible: !track.isVisible })
            }
        });
    }, [dispatch]);
    // Calculate content width based on duration and zoom, but only when not dragging
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (!state.isDragging) {
            const minWidth = containerWidth;
            const durationWidth = state.duration * state.zoom * 100;
            const newWidth = Math.max(minWidth, durationWidth);
            setContentWidth(newWidth);
            _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Timeline content width updated:', {
                containerWidth,
                durationWidth,
                contentWidth: newWidth,
                zoom: state.zoom,
                duration: state.duration,
                isDragging: state.isDragging
            });
        }
    }, [containerWidth, state.duration, state.zoom, state.isDragging]);
    // Handle scroll events with throttling
    const handleScroll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((0,_utils_throttle__WEBPACK_IMPORTED_MODULE_6__.throttle)((e) => {
        const target = e.currentTarget;
        onScroll(target.scrollLeft, target.scrollTop);
    }, _utils_throttle__WEBPACK_IMPORTED_MODULE_6__.THROTTLE.SCROLL), [onScroll]);
    // Sync scroll position from props
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (containerRef.current && containerRef.current.scrollLeft !== scrollLeft) {
            containerRef.current.scrollLeft = scrollLeft;
        }
    }, [scrollLeft]);
    // Focus timeline on mount
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (timelineRef.current) {
            timelineRef.current.focus();
        }
    }, []);
    // Handle keyboard shortcuts
    const handleKeyDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        // Handle undo/redo shortcuts regardless of selection state
        if (e.key === 'z' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            if (e.shiftKey) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Redo shortcut pressed (Cmd/Ctrl + Shift + Z)');
                dispatch({
                    type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.REDO
                });
            }
            else {
                _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Undo shortcut pressed (Cmd/Ctrl + Z)');
                dispatch({
                    type: _types_timeline__WEBPACK_IMPORTED_MODULE_7__.ActionTypes.UNDO
                });
            }
            return;
        }
        // Only handle other shortcuts when a clip is selected
        if (state.selectedClipIds.length === 1) {
            switch (e.key) {
                case 's':
                case 'S':
                    e.preventDefault();
                    _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('Split key pressed:', {
                        selectedClipIds: state.selectedClipIds,
                        currentTime: state.currentTime,
                        tracks: state.tracks
                    });
                    handleSplitClip(state.selectedClipIds[0], state.currentTime);
                    _utils_logger__WEBPACK_IMPORTED_MODULE_8__.logger.debug('After split attempt:', {
                        tracks: state.tracks
                    });
                    break;
            }
        }
    }, [state.selectedClipIds, state.currentTime, handleSplitClip, dispatch]);
    // Handle mouse events to maintain focus
    const handleMouseDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        // Prevent focus loss when clicking inside timeline
        if (timelineRef.current && !timelineRef.current.contains(document.activeElement)) {
            timelineRef.current.focus();
        }
    }, []);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: timelineRef, className: "timeline-wrapper", "data-testid": "timeline", tabIndex: -1, onKeyDown: handleKeyDown, onMouseDown: handleMouseDown },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelineRuler__WEBPACK_IMPORTED_MODULE_2__.TimelineRuler, { currentTime: state.currentTime, duration: state.duration, zoom: state.zoom, fps: state.fps, onTimeChange: handleTimeChange, containerWidth: containerWidth, scrollLeft: scrollLeft, isDragging: state.isDragging }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-body", "data-testid": "timeline-body" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: containerRef, className: "timeline-content", "data-testid": "timeline-content", style: {
                    width: contentWidth,
                    minWidth: '100%',
                    position: 'relative',
                    overflow: 'visible',
                    height: '100%',
                    transform: 'none',
                    transformOrigin: '0 0',
                    willChange: 'transform'
                }, onScroll: handleScroll },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelinePlayhead__WEBPACK_IMPORTED_MODULE_3__.TimelinePlayhead, { currentTime: state.currentTime, isPlaying: state.isPlaying, zoom: state.zoom, fps: state.fps, onTimeUpdate: handleTimeChange, className: "ruler", isDragging: state.isDragging }),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelinePlayhead__WEBPACK_IMPORTED_MODULE_3__.TimelinePlayhead, { currentTime: state.currentTime, isPlaying: state.isPlaying, zoom: state.zoom, fps: state.fps, onTimeUpdate: handleTimeChange, className: "tracks", isDragging: state.isDragging }),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelineTracks__WEBPACK_IMPORTED_MODULE_1__.TimelineTracks, { tracks: state.tracks, selectedTrackId: state.selectedTrackId, selectedClipIds: state.selectedClipIds, onSelectTrack: handleSelectTrack, onSelectClip: handleSelectClip, onClipDragStart: handleClipDragStart, onClipDragEnd: handleClipDragEnd, onUpdateTrack: handleUpdateTrack, onDeleteTrack: handleDeleteTrack, onMoveTrack: handleMoveTrack, onToggleVisibility: handleToggleVisibility, zoom: state.zoom, fps: state.fps })))));
});
Timeline.displayName = 'Timeline';


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("74818fc6e3ab20aa03f1")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.7d509ae62e8188a0068d.hot-update.js.map