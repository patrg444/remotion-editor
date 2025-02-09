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
/* harmony import */ var _TrimModeTooltip__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./TrimModeTooltip */ "./src/renderer/components/TrimModeTooltip.tsx");













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
    const { rippleDelete, rippleTrim } = (0,_hooks_useRippleEdit__WEBPACK_IMPORTED_MODULE_8__.useRippleEdit)();
    const { state, dispatch } = (0,_hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_9__.useTimelineContext)();
    const timeline = (0,_hooks_useTimeline__WEBPACK_IMPORTED_MODULE_10__.useTimeline)();
    const { getAllSnapPoints, findNearestSnapPoint } = (0,_hooks_useSnapPoints__WEBPACK_IMPORTED_MODULE_11__.useSnapPoints)(fps);
    const clipRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    // Track emissions to handle Strict Mode double-mounting
    const hasEmittedRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
    const lastPropsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({ id: clip.id, startTime: clip.startTime, endTime: clip.endTime, layer });
    // Format times for display
    const startTimeFormatted = (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.startTime, { fps, showFrames: true });
    const endTimeFormatted = (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.endTime, { fps, showFrames: true });
    const durationFormatted = (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_5__.formatTime)(clip.endTime - clip.startTime, { fps, showFrames: true });
    const clipDuration = clip.endTime - clip.startTime;
    // Emit clip events when mounted, positioned, or updated
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const propsChanged = lastPropsRef.current.id !== clip.id ||
            lastPropsRef.current.startTime !== clip.startTime ||
            lastPropsRef.current.endTime !== clip.endTime ||
            lastPropsRef.current.layer !== layer;
        if (propsChanged) {
            hasEmittedRef.current = false;
            lastPropsRef.current = { id: clip.id, startTime: clip.startTime, endTime: clip.endTime, layer };
        }
        if (!hasEmittedRef.current && clipRef.current) {
            // Force a reflow to ensure styles are applied
            void clipRef.current.offsetHeight;
            // Calculate position and dimensions
            const left = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.startTime, zoom);
            const width = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.endTime - clip.startTime, zoom);
            const top = layer * _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.UI.TRACK_HEIGHT;
            // Update styles
            clipRef.current.style.transition = 'none';
            clipRef.current.style.left = `${Math.round(left)}px`;
            clipRef.current.style.width = `${Math.round(width)}px`;
            clipRef.current.style.top = `${top}px`;
            // Force another reflow
            void clipRef.current.offsetHeight;
            clipRef.current.style.transition = '';
            // Dispatch rendered event
            window.dispatchEvent(new CustomEvent('clip:rendered', {
                detail: {
                    clipId: clip.id,
                    startTime: clip.startTime,
                    endTime: clip.endTime,
                    layer,
                    left,
                    width,
                    top
                }
            }));
            // Wait for next frame to ensure styles are applied
            requestAnimationFrame(() => {
                if (!clipRef.current)
                    return;
                // Get final position after styles are applied
                const rect = clipRef.current.getBoundingClientRect();
                // Dispatch positioned event
                window.dispatchEvent(new CustomEvent('clip:positioned', {
                    detail: {
                        clipId: clip.id,
                        left: rect.left,
                        width: rect.width,
                        top: rect.top
                    }
                }));
                hasEmittedRef.current = true;
            });
        }
        return () => {
            // Reset emission flag on cleanup only if props changed
            if (propsChanged) {
                hasEmittedRef.current = false;
            }
        };
    }, [clip.id, clip.startTime, clip.endTime, layer, zoom]);
    const handlePointerDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e, trimSide) => {
        e.preventDefault();
        e.stopPropagation();
        const target = e.currentTarget;
        target.setPointerCapture(e.pointerId);
        const isTrimmingMode = trimSide ? (trimSide === 'trim-start' ? 'start' : 'end') : null;
        setIsDragging(!isTrimmingMode);
        setIsTrimming(isTrimmingMode);
        onSelect();
        onDragStart();
    }, [onSelect, onDragStart]);
    const handleKeyDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
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
        }
    }, [onSelect, rippleDelete, clip, track]);
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
    const clipStyle = {
        position: 'absolute',
        left: `${Math.round((0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.startTime, zoom))}px`,
        width: `${Math.round((0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_6__.timeToPixels)(clip.endTime - clip.startTime, zoom))}px`,
        height: '100%',
        cursor: isKeyboardDragging ? 'move' : isDragging ? 'grabbing' : 'grab',
        top: style?.top,
        willChange: isDragging ? 'transform' : undefined,
        touchAction: 'none',
        userSelect: 'none',
        pointerEvents: 'auto',
        zIndex: isDragging || isTrimming ? 100 : 1,
        opacity: clipDuration > clip.mediaDuration ? 0.7 : 1
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: clipRef, "data-testid": "timeline-clip", className: `timeline-clip ${clip.type} ${isKeyboardDragging ? 'keyboard-dragging' : ''} ${state.selectedClipIds.includes(clip.id) ? 'selected' : ''}`, style: clipStyle, onPointerDown: handlePointerDown, onKeyDown: handleKeyDown, role: "listitem", "aria-label": `${clip.name} clip from ${startTimeFormatted} to ${endTimeFormatted}, duration ${durationFormatted}`, "aria-grabbed": isKeyboardDragging, "aria-dropeffect": "move", tabIndex: tabIndex, "aria-posinset": posinset, "aria-setsize": setsize, "data-clip-id": clip.id, "data-moving": isDragging || isTrimming ? 'true' : undefined, "data-trimming": isTrimming || undefined, "data-at-limit": isAtLimit || (clip.endTime - clip.startTime) > clip.mediaDuration || undefined, "data-trim-mode": trimMode },
        isTrimming && react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrimModeTooltip__WEBPACK_IMPORTED_MODULE_12__.TrimModeTooltip, { mode: trimMode }),
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


/***/ }),

/***/ "./src/renderer/components/clips/AudioClipContent.tsx":
/*!************************************************************!*\
  !*** ./src/renderer/components/clips/AudioClipContent.tsx ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AudioClipContent: () => (/* binding */ AudioClipContent)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const AudioClipContent = ({ clip, isSelected, zoom, fps }) => {
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `audio-clip-content ${isSelected ? 'selected' : ''}` },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-label" }, clip.name),
        clip.effects.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-effects" }, clip.effects.map(effect => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { key: effect.id, className: `effect ${effect.enabled ? 'enabled' : 'disabled'}` }, effect.type))))),
        clip.mediaOffset > 0 && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "trim-indicator start", style: { left: 0 } })),
        clip.mediaDuration < clip.originalDuration && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "trim-indicator end", style: { right: 0 } })),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "waveform-placeholder" })));
};


/***/ }),

/***/ "./src/renderer/components/clips/CaptionClipContent.tsx":
/*!**************************************************************!*\
  !*** ./src/renderer/components/clips/CaptionClipContent.tsx ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CaptionClipContent: () => (/* binding */ CaptionClipContent)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const CaptionClipContent = ({ clip, isSelected, zoom, fps }) => {
    // Get speaker style for a caption
    const getSpeakerStyle = (caption) => {
        if (!clip.speakerStyles?.speakers || !caption.speakerId)
            return {};
        const style = clip.speakerStyles.speakers[caption.speakerId];
        return style ? {
            color: style.color,
            borderColor: style.color
        } : {};
    };
    // Get speaker name for a caption
    const getSpeakerName = (caption) => {
        if (!clip.speakerStyles?.speakers || !caption.speakerId)
            return 'Unknown';
        const style = clip.speakerStyles.speakers[caption.speakerId];
        return style ? style.name : 'Unknown';
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `caption-clip-content ${isSelected ? 'selected' : ''}` },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "caption-header" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "caption-title" }, clip.name)),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "caption-body" }, clip.captions?.map((caption) => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { key: caption.id, className: "caption-item", style: getSpeakerStyle(caption) },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "speaker-name" },
                getSpeakerName(caption),
                ":"),
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "caption-text" }, caption.text)))))));
};


/***/ }),

/***/ "./src/renderer/components/clips/VideoClipContent.tsx":
/*!************************************************************!*\
  !*** ./src/renderer/components/clips/VideoClipContent.tsx ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VideoClipContent: () => (/* binding */ VideoClipContent)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);

const VideoClipContent = ({ clip, isSelected, zoom, fps }) => {
    // Check if effect is active at current time
    const isEffectActive = (effect, currentTime) => {
        if (!effect.enabled)
            return false;
        // If no time range is specified, effect is always active
        if (!effect.startTime && !effect.endTime)
            return true;
        // If only start time is specified, effect is active from that point on
        if (effect.startTime && !effect.endTime) {
            return currentTime >= effect.startTime;
        }
        // If only end time is specified, effect is active until that point
        if (!effect.startTime && effect.endTime) {
            return currentTime <= effect.endTime;
        }
        // Both start and end times are specified
        return currentTime >= (effect.startTime || 0) && currentTime <= (effect.endTime || Infinity);
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `video-clip-content ${isSelected ? 'selected' : ''}` },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-header" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { className: "clip-title" }, clip.name),
            clip.effects.length > 0 && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "effect-indicators" }, clip.effects.map(effect => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", { key: effect.id, className: `effect-indicator ${effect.enabled ? 'active' : ''}`, title: `${effect.type} (${effect.enabled ? 'Enabled' : 'Disabled'})` })))))),
        clip.thumbnail && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "clip-thumbnail" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("img", { src: clip.thumbnail, alt: clip.name })))));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("633cb876b8980c771787")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.831377de3dad4c2c9e99.hot-update.js.map