"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/TimelineClip.tsx":
/*!**************************************************!*\
  !*** ./src/renderer/components/TimelineClip.tsx ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineClip: () => (/* binding */ TimelineClip)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _clips_VideoClipContent__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./clips/VideoClipContent */ "./src/renderer/components/clips/VideoClipContent.tsx");
/* harmony import */ var _clips_AudioClipContent__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./clips/AudioClipContent */ "./src/renderer/components/clips/AudioClipContent.tsx");
/* harmony import */ var _clips_CaptionClipContent__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./clips/CaptionClipContent */ "./src/renderer/components/clips/CaptionClipContent.tsx");
/* harmony import */ var _utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/timelineUnits */ "./src/renderer/utils/timelineUnits.ts");
/* harmony import */ var _utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/timelineScale */ "./src/renderer/utils/timelineScale.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _hooks_useRippleEdit__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../hooks/useRippleEdit */ "./src/renderer/hooks/useRippleEdit.ts");
/* harmony import */ var _hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../hooks/useTimelineContext */ "./src/renderer/hooks/useTimelineContext.ts");
/* harmony import */ var _hooks_useTimeline__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../hooks/useTimeline */ "./src/renderer/hooks/useTimeline.ts");
/* harmony import */ var _hooks_useSnapPoints__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ../hooks/useSnapPoints */ "./src/renderer/hooks/useSnapPoints.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _TrimModeTooltip__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./TrimModeTooltip */ "./src/renderer/components/TrimModeTooltip.tsx");














const KEYBOARD_MOVE_STEP = 1;
const KEYBOARD_MOVE_FAST = 10;
const TRACK_LABEL_WIDTH = 160;
const SNAP_THRESHOLD = 5;
const TimelineClip = ({ clip, track, layer, zoom, fps, onSelect, onDragStart, onDragEnd, tabIndex = 0, 'aria-posinset': posinset, 'aria-setsize': setsize, style }) => {
    const [isKeyboardDragging, setIsKeyboardDragging] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [isAtLimit, setIsAtLimit] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [isDragging, setIsDragging] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
    const [isTrimming, setIsTrimming] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
    const [trimMode, setTrimMode] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)('normal');
    // Handle trim mode change events
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const handleTrimModeChange = (e) => {
            if (isTrimming) {
                const newMode = e.detail?.mode;
                if (newMode && ['normal', 'ripple', 'slip'].includes(newMode)) {
                    _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Setting trim mode from event:', {
                        mode: newMode,
                        isTrimming,
                        currentMode: trimMode
                    });
                    setTrimMode(newMode);
                }
            }
        };
        window.addEventListener('trimModeChange', handleTrimModeChange);
        return () => {
            window.removeEventListener('trimModeChange', handleTrimModeChange);
        };
    }, [isTrimming, trimMode]);
    const { rippleDelete, rippleTrim } = (0,_hooks_useRippleEdit__WEBPACK_IMPORTED_MODULE_8__.useRippleEdit)();
    const { state, dispatch } = (0,_hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_9__.useTimelineContext)();
    const timeline = (0,_hooks_useTimeline__WEBPACK_IMPORTED_MODULE_10__.useTimeline)();
    const { getAllSnapPoints, findNearestSnapPoint } = (0,_hooks_useSnapPoints__WEBPACK_IMPORTED_MODULE_11__.useSnapPoints)(fps);
    const clipRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    // Listen for clip:rendered events
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const handleClipRendered = (e) => {
            if (e.detail.clipId === clip.id && clipRef.current) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Received clip:rendered event:', {
                    clipId: clip.id,
                    detail: e.detail,
                    currentStyle: clipRef.current.style,
                    currentRect: clipRef.current.getBoundingClientRect()
                });
                // Update clip position and dimensions
                const left = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(e.detail.startTime, zoom);
                const width = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(e.detail.endTime - e.detail.startTime, zoom);
                // Force a reflow before updating styles
                void clipRef.current.offsetHeight;
                clipRef.current.style.transition = 'none';
                clipRef.current.style.left = `${Math.round(left)}px`;
                clipRef.current.style.width = `${Math.round(width)}px`;
                clipRef.current.style.top = `${e.detail.layer * _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.UI.TRACK_HEIGHT}px`;
                // Force another reflow
                void clipRef.current.offsetHeight;
                clipRef.current.style.transition = '';
                _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Updated clip style:', {
                    clipId: clip.id,
                    left,
                    width,
                    top: e.detail.layer * _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.UI.TRACK_HEIGHT,
                    zoom
                });
                // Dispatch a custom event to notify that the clip has been positioned
                window.dispatchEvent(new CustomEvent('clip:positioned', {
                    detail: {
                        clipId: clip.id,
                        left,
                        width,
                        top: e.detail.layer * _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.UI.TRACK_HEIGHT
                    }
                }));
            }
        };
        window.addEventListener('clip:rendered', handleClipRendered);
        return () => {
            window.removeEventListener('clip:rendered', handleClipRendered);
        };
    }, [clip.id, clip.startTime, clip.endTime, clip.layer, zoom]);
    // Emit clip rendered event when mounted, positioned, or updated
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        // Immediately emit clip:rendered event when clip properties change
        window.dispatchEvent(new CustomEvent('clip:rendered', {
            detail: {
                clipId: clip.id,
                startTime: clip.startTime,
                endTime: clip.endTime,
                layer
            }
        }));
        // Then wait for next frame to get actual DOM measurements
        if (clipRef.current) {
            requestAnimationFrame(() => {
                const rect = clipRef.current?.getBoundingClientRect();
                if (rect) {
                    _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Clip mounted/updated:', {
                        clipId: clip.id,
                        rect,
                        startTime: clip.startTime,
                        endTime: clip.endTime,
                        layer,
                        style: clipRef.current?.style
                    });
                    window.dispatchEvent(new CustomEvent('clip:rendered', {
                        detail: {
                            clipId: clip.id,
                            height: rect.height,
                            width: rect.width,
                            left: rect.left,
                            top: rect.top,
                            startTime: clip.startTime,
                            endTime: clip.endTime,
                            layer
                        }
                    }));
                }
            });
        }
    }, [clip.id, clip.startTime, clip.endTime, layer, isDragging, isTrimming]);
    const dragStateRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({
        isDragging: false,
        isTrimming: null,
        pointerDownX: 0,
        originalStartPixels: 0,
        originalEndPixels: 0,
        pointerId: -1,
        scrollX: 0,
        lastDeltaPixels: 0,
        maxExtension: 0,
    });
    const handlePointerMove = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        const dragState = dragStateRef.current;
        if (!dragState.isDragging && !dragState.isTrimming)
            return;
        if (e.pointerId !== dragState.pointerId)
            return;
        if (clipRef.current) {
            if (dragState.isDragging) {
                const pointerDelta = (e.clientX - TRACK_LABEL_WIDTH) - dragState.pointerDownX;
                const proposedLeft = dragState.originalStartPixels + pointerDelta;
                let newLeft = Math.max(0, proposedLeft);
                // Apply snapping if enabled
                if (state.isSnappingEnabled) {
                    const currentTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(newLeft, zoom);
                    const snapPoints = getAllSnapPoints(state.tracks, state.markers, currentTime, zoom);
                    const nearestPoint = findNearestSnapPoint(currentTime, snapPoints, 0.1, ['playhead']);
                    if (nearestPoint) {
                        newLeft = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(nearestPoint.time, zoom);
                        _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Snapped to point:', {
                            type: nearestPoint.type,
                            time: nearestPoint.time,
                            source: nearestPoint.source
                        });
                    }
                }
                clipRef.current.style.left = `${Math.round(newLeft)}px`;
                dragStateRef.current.lastDeltaPixels = newLeft - dragState.originalStartPixels;
                setIsAtLimit(newLeft === 0);
            }
            else if (dragState.isTrimming === 'start') {
                const minDurationPixels = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.MIN_DURATION, zoom);
                const minLeftPos = trimMode === 'ripple' ? 0 : (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.mediaOffset, zoom);
                const maxRightPos = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.endTime - _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.MIN_DURATION, zoom);
                const pointerDelta = e.clientX - TRACK_LABEL_WIDTH - dragState.pointerDownX;
                const proposedLeft = dragState.originalStartPixels + pointerDelta;
                let newLeft = Math.max(minLeftPos, Math.min(maxRightPos, proposedLeft));
                // Apply snapping if enabled
                if (state.isSnappingEnabled) {
                    const currentTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(newLeft, zoom);
                    const snapPoints = getAllSnapPoints(state.tracks, state.markers, currentTime, zoom);
                    const nearestPoint = findNearestSnapPoint(currentTime, snapPoints, 0.1, ['playhead']);
                    if (nearestPoint) {
                        newLeft = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(nearestPoint.time, zoom);
                        _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Snapped trim start to point:', {
                            type: nearestPoint.type,
                            time: nearestPoint.time,
                            source: nearestPoint.source
                        });
                    }
                }
                const newDuration = dragState.originalEndPixels - newLeft;
                if (newDuration >= minDurationPixels) {
                    clipRef.current.style.left = `${Math.round(newLeft)}px`;
                    clipRef.current.style.width = `${Math.round(newDuration)}px`;
                    dragStateRef.current.lastDeltaPixels = newLeft - dragState.originalStartPixels;
                    setIsAtLimit(newLeft === minLeftPos);
                }
            }
            else if (dragState.isTrimming === 'end') {
                const minDurationPixels = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.MIN_DURATION, zoom);
                const minLeftPos = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.startTime + _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.MIN_DURATION, zoom);
                // In ripple mode, allow extending up to full media duration
                const maxRightPos = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.mediaOffset + clip.mediaDuration, zoom);
                // Calculate target position
                const pointerDelta = e.clientX - TRACK_LABEL_WIDTH - dragState.pointerDownX;
                const proposedRight = dragState.originalEndPixels + pointerDelta;
                let newRight = Math.max(minLeftPos, Math.min(maxRightPos, proposedRight));
                // Apply snapping if enabled
                if (state.isSnappingEnabled) {
                    const currentTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(newRight, zoom);
                    const snapPoints = getAllSnapPoints(state.tracks, state.markers, currentTime, zoom);
                    const nearestPoint = findNearestSnapPoint(currentTime, snapPoints, 0.1, ['playhead']);
                    if (nearestPoint) {
                        newRight = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(nearestPoint.time, zoom);
                        _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Snapped trim end to point:', {
                            type: nearestPoint.type,
                            time: nearestPoint.time,
                            source: nearestPoint.source
                        });
                    }
                }
                const newWidth = newRight - dragState.originalStartPixels;
                // Calculate time delta based on pixel movement
                const deltaPixels = newRight - dragState.originalEndPixels;
                const deltaTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(deltaPixels, zoom);
                _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Trim move calculation:', {
                    deltaPixels,
                    deltaTime,
                    zoom,
                    newRight,
                    newWidth,
                    originalEndPixels: dragState.originalEndPixels,
                    originalStartPixels: dragState.originalStartPixels
                });
                // Log values for debugging
                _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Trim move:', {
                    newRight,
                    newWidth,
                    originalEndPixels: dragState.originalEndPixels,
                    originalStartPixels: dragState.originalStartPixels,
                    zoom,
                    time: (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(newRight, zoom)
                });
                if (newWidth >= minDurationPixels) {
                    clipRef.current.style.width = `${Math.round(newWidth)}px`;
                    dragStateRef.current.lastDeltaPixels = newRight - dragState.originalEndPixels;
                    setIsAtLimit(newRight === maxRightPos);
                    // Let useRippleEdit handle ripple mode trimming
                }
            }
            clipRef.current.style.transition = 'none';
        }
    }, [clip, zoom, state, trimMode]);
    const handlePointerUp = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        const dragState = dragStateRef.current;
        if (dragState.pointerId === -1)
            return;
        // Release pointer capture
        if (clipRef.current) {
            try {
                clipRef.current.releasePointerCapture(dragState.pointerId);
            }
            catch (err) {
                // Ignore errors if pointer capture was already released
            }
        }
        if (dragState.isDragging) {
            const deltaPixels = dragState.lastDeltaPixels;
            const deltaTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(deltaPixels, zoom);
            if (Math.abs(deltaTime) > 0.01) {
                const newStartTime = clip.startTime + deltaTime;
                const newEndTime = clip.endTime + deltaTime;
                timeline.updateClip(track.id, clip.id, {
                    startTime: newStartTime,
                    endTime: newEndTime,
                    mediaOffset: clip.mediaOffset + deltaTime
                });
            }
        }
        else if (dragState.isTrimming === 'start') {
            const deltaPixels = dragState.lastDeltaPixels;
            const deltaTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(deltaPixels, zoom);
            if (Math.abs(deltaTime) > 0.01) {
                const newStartTime = clip.startTime + deltaTime;
                const newMediaOffset = clip.mediaOffset + deltaTime;
                timeline.trimClip(clip.id, newStartTime, undefined, 1.0, {
                    handles: {
                        startPosition: newMediaOffset,
                        endPosition: newMediaOffset + (clip.endTime - newStartTime)
                    },
                    ripple: trimMode === 'ripple'
                });
            }
        }
        else if (dragState.isTrimming === 'end') {
            const deltaPixels = dragState.lastDeltaPixels;
            const deltaTime = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.pixelsToTime)(deltaPixels, zoom);
            if (Math.abs(deltaTime) > 0.01) {
                // Calculate target end time based on mode
                const targetEndTime = clip.endTime + deltaTime;
                // In ripple mode, constrain to media duration
                if (trimMode === 'ripple') {
                    const maxEndTime = clip.mediaOffset + clip.mediaDuration;
                    const constrainedEndTime = Math.min(targetEndTime, maxEndTime);
                    _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Trim end calculation:', {
                        clipId: clip.id,
                        deltaPixels,
                        deltaTime,
                        clipEndTime: clip.endTime,
                        targetEndTime,
                        constrainedEndTime,
                        zoom,
                        trimMode,
                        ripple: true
                    });
                    timeline.trimClip(clip.id, undefined, constrainedEndTime, 1.0, {
                        handles: {
                            startPosition: clip.mediaOffset,
                            endPosition: clip.mediaOffset + (constrainedEndTime - clip.startTime)
                        },
                        ripple: true
                    });
                }
                else {
                    // In normal mode, just use the delta
                    _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Trim end calculation:', {
                        clipId: clip.id,
                        deltaPixels,
                        deltaTime,
                        clipEndTime: clip.endTime,
                        targetEndTime,
                        zoom,
                        trimMode,
                        ripple: false
                    });
                    timeline.trimClip(clip.id, undefined, targetEndTime, 1.0, {
                        handles: {
                            startPosition: clip.mediaOffset,
                            endPosition: Math.min(clip.mediaOffset + clip.mediaDuration, clip.mediaOffset + (targetEndTime - clip.startTime))
                        },
                        ripple: false
                    });
                }
            }
        }
        // Reset drag state
        dragStateRef.current = {
            isDragging: false,
            isTrimming: null,
            pointerDownX: 0,
            originalStartPixels: 0,
            originalEndPixels: 0,
            pointerId: -1,
            scrollX: 0,
            lastDeltaPixels: 0,
            maxExtension: 0,
        };
        // Reset clip styles
        if (clipRef.current) {
            clipRef.current.style.transition = '';
            clipRef.current.style.transform = '';
            clipRef.current.style.willChange = '';
        }
        setIsDragging(false);
        setIsTrimming(null);
        setIsAtLimit(false);
        onDragEnd();
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DRAGGING,
            payload: {
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0,
            },
        });
    }, [clip, track, zoom, timeline, onDragEnd, dispatch, trimMode]);
    const handlePointerDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e, trimSide) => {
        // Determine trim mode based on modifier keys
        if (trimSide) {
            _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Pointer down with modifiers:', {
                altKey: e.altKey,
                shiftKey: e.shiftKey,
                trimSide
            });
            if (e.altKey) {
                setTrimMode('ripple');
                // Force ripple mode immediately
                setTimeout(() => {
                    setTrimMode('ripple');
                }, 0);
            }
            else if (e.shiftKey) {
                setTrimMode('slip');
            }
            else {
                setTrimMode('normal');
            }
        }
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        const isTrimmingMode = trimSide ? (trimSide === 'trim-start' ? 'start' : 'end') : null;
        // Calculate initial positions based on clip state
        const startPixels = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.startTime, zoom);
        const endPixels = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.endTime, zoom);
        // Store original positions for drag calculations
        const originalStartPixels = startPixels;
        const originalEndPixels = endPixels;
        // Calculate maximum allowed movement based on source media bounds (used for trimming)
        let maxExtension = 0;
        if (isTrimmingMode === 'start') {
            const distanceToSourceStart = clip.startTime - clip.mediaOffset;
            maxExtension = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(distanceToSourceStart, zoom);
        }
        else if (isTrimmingMode === 'end') {
            const sourceEndTime = clip.mediaOffset + clip.mediaDuration;
            const distanceToSourceEnd = sourceEndTime - clip.endTime;
            maxExtension = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(distanceToSourceEnd, zoom);
        }
        else {
            const distanceToSourceStart = clip.startTime - clip.mediaOffset;
            const distanceToSourceEnd = (clip.mediaOffset + clip.mediaDuration) - (clip.startTime + (clip.endTime - clip.startTime));
            maxExtension = Math.min((0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(distanceToSourceStart, zoom), (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(distanceToSourceEnd, zoom));
        }
        dragStateRef.current = {
            isDragging: !isTrimmingMode,
            isTrimming: isTrimmingMode,
            pointerDownX: e.clientX - TRACK_LABEL_WIDTH,
            originalStartPixels,
            originalEndPixels,
            pointerId: e.pointerId,
            scrollX: state.scrollX,
            lastDeltaPixels: 0,
            maxExtension,
        };
        if (clipRef.current) {
            clipRef.current.style.transform = '';
            clipRef.current.style.transition = 'none';
        }
        onSelect();
        onDragStart();
        setIsDragging(!isTrimmingMode);
        setIsTrimming(isTrimmingMode);
        setIsAtLimit(false);
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DRAGGING,
            payload: {
                isDragging: true,
                dragStartX: e.clientX - TRACK_LABEL_WIDTH,
                dragStartY: e.clientY,
            },
        });
    }, [onSelect, onDragStart, clip, state.scrollX, zoom, dispatch]);
    // Handle modifier keys for trim mode switching
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const handleKeyDown = (e) => {
            if (isTrimming) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Key down in trim mode:', {
                    altKey: e.altKey,
                    shiftKey: e.shiftKey,
                    key: e.key,
                    code: e.code
                });
                if (e.altKey) {
                    setTrimMode('ripple');
                    // Force ripple mode immediately
                    setTimeout(() => {
                        setTrimMode('ripple');
                    }, 0);
                }
                else if (e.shiftKey) {
                    setTrimMode('slip');
                }
                else {
                    setTrimMode('normal');
                }
            }
        };
        const handleKeyUp = (e) => {
            if (isTrimming) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Key up in trim mode:', {
                    altKey: e.altKey,
                    shiftKey: e.shiftKey,
                    key: e.key,
                    code: e.code
                });
                if (!e.altKey && !e.shiftKey) {
                    setTrimMode('normal');
                }
                else if (e.altKey) {
                    setTrimMode('ripple');
                }
                else if (e.shiftKey) {
                    setTrimMode('slip');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown, { capture: true });
        window.addEventListener('keyup', handleKeyUp, { capture: true });
        return () => {
            window.removeEventListener('keydown', handleKeyDown, { capture: true });
            window.removeEventListener('keyup', handleKeyUp, { capture: true });
        };
    }, [isTrimming]);
    // Handle window pointer events
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const handleWindowPointerMove = (e) => {
            handlePointerMove(e);
        };
        const handleWindowPointerUp = (e) => {
            handlePointerUp(e);
        };
        const handleWindowMouseUp = (e) => {
            // Also handle mouseup to ensure cleanup happens
            if (dragStateRef.current.pointerId !== -1) {
                handlePointerUp(new PointerEvent('pointerup', {
                    pointerId: dragStateRef.current.pointerId,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    bubbles: true,
                    cancelable: true,
                }));
            }
        };
        window.addEventListener('pointermove', handleWindowPointerMove);
        window.addEventListener('pointerup', handleWindowPointerUp);
        window.addEventListener('mouseup', handleWindowMouseUp);
        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove);
            window.removeEventListener('pointerup', handleWindowPointerUp);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [handlePointerMove, handlePointerUp]);
    const moveClip = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((frameOffset) => {
        const frameDuration = 1 / fps;
        const timeOffset = frameOffset * frameDuration;
        const proposedStartTime = clip.startTime + timeOffset;
        const minStartTime = 0;
        const maxStartTime = timeline.duration - (clip.endTime - clip.startTime);
        const newStartTime = Math.max(minStartTime, Math.min(maxStartTime, proposedStartTime));
        const duration = clip.endTime - clip.startTime;
        timeline.updateClip(track.id, clip.id, {
            startTime: newStartTime,
            endTime: newStartTime + duration,
            mediaOffset: clip.mediaOffset + (newStartTime - clip.startTime)
        });
    }, [clip, track, fps, timeline]);
    const handleKeyDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        // Update trim mode based on modifier keys or specific keys when trimming
        if (isTrimming) {
            _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.debug('Key down in clip:', {
                key: e.key,
                code: e.code,
                altKey: e.altKey,
                shiftKey: e.shiftKey,
                isTrimming
            });
            if (e.key === 'r' || e.key === 'R') {
                e.preventDefault();
                e.stopPropagation();
                setTrimMode('ripple');
                // Force ripple mode immediately and ensure it stays in ripple mode
                setTimeout(() => {
                    setTrimMode('ripple');
                    // Dispatch a custom event to ensure ripple mode is set
                    window.dispatchEvent(new CustomEvent('trimModeChange', {
                        detail: { mode: 'ripple' }
                    }));
                }, 0);
            }
            else if (e.altKey) {
                setTrimMode('ripple');
            }
            else if (e.shiftKey) {
                setTrimMode('slip');
            }
            else {
                setTrimMode('normal');
            }
        }
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                onSelect();
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                rippleDelete(clip, track);
                break;
            case 'm':
                if (!isKeyboardDragging) {
                    e.preventDefault();
                    setIsKeyboardDragging(true);
                    onDragStart();
                }
                break;
            case 'ArrowLeft':
                if (isKeyboardDragging) {
                    e.preventDefault();
                    moveClip(e.shiftKey ? -KEYBOARD_MOVE_FAST : -KEYBOARD_MOVE_STEP);
                }
                break;
            case 'ArrowRight':
                if (isKeyboardDragging) {
                    e.preventDefault();
                    moveClip(e.shiftKey ? KEYBOARD_MOVE_FAST : KEYBOARD_MOVE_STEP);
                }
                break;
            case 'Escape':
                if (isKeyboardDragging) {
                    e.preventDefault();
                    setIsKeyboardDragging(false);
                    onDragEnd();
                }
                break;
            case 'r':
            case 'R':
                if (isTrimming) {
                    e.preventDefault();
                    e.stopPropagation();
                    setTrimMode('ripple');
                    // Force ripple mode immediately
                    setTimeout(() => {
                        setTrimMode('ripple');
                    }, 0);
                }
                break;
            case 's':
            case 'S':
                if (isTrimming) {
                    e.preventDefault();
                    setTrimMode('slip');
                }
                else {
                    e.preventDefault();
                    dispatch({
                        type: _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_SNAPPING,
                        payload: !state.isSnappingEnabled
                    });
                }
                break;
            case 'n':
            case 'N':
                if (isTrimming) {
                    e.preventDefault();
                    setTrimMode('normal');
                }
                break;
        }
    }, [isKeyboardDragging, onSelect, onDragStart, onDragEnd, moveClip, clip, track, rippleDelete, isTrimming]);
    const renderClipContent = () => {
        if ((0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.isVideoClip)(clip)) {
            return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_clips_VideoClipContent__WEBPACK_IMPORTED_MODULE_2__.VideoClipContent, { clip: clip, isSelected: state.selectedClipIds.includes(clip.id), zoom: zoom, fps: fps }));
        }
        if ((0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.isAudioClip)(clip)) {
            return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_clips_AudioClipContent__WEBPACK_IMPORTED_MODULE_3__.AudioClipContent, { clip: clip, isSelected: state.selectedClipIds.includes(clip.id), zoom: zoom, fps: fps }));
        }
        if ((0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.isCaptionClip)(clip)) {
            return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_clips_CaptionClipContent__WEBPACK_IMPORTED_MODULE_4__.CaptionClipContent, { clip: clip, isSelected: state.selectedClipIds.includes(clip.id), zoom: zoom, fps: fps }));
        }
        return null;
    };
    const startTimeFormatted = (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.startTime, { fps, showFrames: true });
    const endTimeFormatted = (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.endTime, { fps, showFrames: true });
    const durationFormatted = (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.endTime - clip.startTime, { fps, showFrames: true });
    const clipDuration = clip.endTime - clip.startTime;
    const sourceStart = clip.mediaOffset;
    const sourceEnd = clip.mediaOffset + clip.mediaDuration;
    const clipStart = Math.max(clip.startTime, sourceStart);
    const clipEnd = Math.min(clip.endTime, sourceEnd);
    // In ripple mode, allow the clip to extend beyond its media duration
    const currentDuration = trimMode === 'ripple' ? clipDuration : Math.min(clipDuration, clip.mediaDuration);
    const widthPixels = Math.max(0, Math.round((0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(currentDuration, zoom)));
    if (clipDuration > clip.mediaDuration) {
        _utils_logger__WEBPACK_IMPORTED_MODULE_12__.logger.warn('Clip exceeds source media duration:', {
            clipId: clip.id,
            duration: clipDuration,
            sourceStart,
            sourceEnd,
            mediaDuration: clip.mediaDuration
        });
    }
    const initialLeft = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.startTime, zoom);
    const clipStyle = {
        position: 'absolute',
        left: `${Math.round(initialLeft)}px`,
        width: `${widthPixels}px`,
        height: '100%',
        cursor: isKeyboardDragging ? 'move' : dragStateRef.current.isTrimming ? 'col-resize' : isDragging ? 'grabbing' : 'grab',
        top: style?.top,
        willChange: isDragging ? 'transform' : undefined,
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: 'auto',
        zIndex: isDragging || isTrimming ? 100 : 1,
        opacity: clipDuration > clip.mediaDuration ? 0.7 : 1
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: clipRef, "data-testid": "timeline-clip", className: `timeline-clip ${clip.type} ${isKeyboardDragging ? 'keyboard-dragging' : ''} ${state.selectedClipIds.includes(clip.id) ? 'selected' : ''}`, style: clipStyle, onPointerDown: handlePointerDown, onKeyDown: handleKeyDown, role: "listitem", "aria-label": `${clip.name} clip from ${startTimeFormatted} to ${endTimeFormatted}, duration ${durationFormatted}`, "aria-grabbed": isKeyboardDragging, "aria-dropeffect": "move", tabIndex: tabIndex, "aria-posinset": posinset, "aria-setsize": setsize, "data-clip-id": clip.id, "data-moving": isDragging || isTrimming ? 'true' : undefined, "data-trimming": isTrimming || undefined, "data-at-limit": isAtLimit || (clip.endTime - clip.startTime) > clip.mediaDuration || undefined, "data-trim-mode": trimMode },
        isTrimming && react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrimModeTooltip__WEBPACK_IMPORTED_MODULE_13__.TrimModeTooltip, { mode: trimMode }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-handle left clip-trim-start", onPointerDown: (e) => {
                e.stopPropagation();
                handlePointerDown(e, 'trim-start');
            }, style: {
                position: 'absolute',
                left: -8,
                width: 16,
                height: '100%',
                cursor: 'col-resize',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.15s ease'
            } }),
        renderClipContent(),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-handle right clip-trim-end", onPointerDown: (e) => {
                e.stopPropagation();
                handlePointerDown(e, 'trim-end');
            }, style: {
                position: 'absolute',
                right: -8,
                width: 16,
                height: '100%',
                cursor: 'col-resize',
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.1)',
                opacity: 0,
                transition: 'opacity 0.15s ease'
            } }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-duration" },
            durationFormatted,
            clipDuration > clip.mediaDuration && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { style: { fontSize: '0.8em', opacity: 0.7, marginLeft: '4px', color: '#ff6b6b' } },
                "(",
                (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.mediaDuration, { fps, showFrames: true }),
                " source)")))));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("f0ec52fcb0b85025fe15")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.d18148fb9e18f2b3ef3f.hot-update.js.map