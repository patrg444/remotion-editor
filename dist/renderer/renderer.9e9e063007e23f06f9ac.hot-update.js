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
/* harmony import */ var _utils_timelineUnits__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/timelineUnits */ "./src/renderer/utils/timelineUnits.ts");
/* harmony import */ var _utils_timelineScale__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils/timelineScale */ "./src/renderer/utils/timelineScale.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _hooks_useRippleEdit__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../hooks/useRippleEdit */ "./src/renderer/hooks/useRippleEdit.ts");
/* harmony import */ var _hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../hooks/useTimelineContext */ "./src/renderer/hooks/useTimelineContext.ts");
/* harmony import */ var _hooks_useTimeline__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../hooks/useTimeline */ "./src/renderer/hooks/useTimeline.ts");
/* harmony import */ var _hooks_useSnapPoints__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../hooks/useSnapPoints */ "./src/renderer/hooks/useSnapPoints.ts");
/* harmony import */ var _TrimModeTooltip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./TrimModeTooltip */ "./src/renderer/components/TrimModeTooltip.tsx");









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
    const { rippleDelete, rippleTrim } = (0,_hooks_useRippleEdit__WEBPACK_IMPORTED_MODULE_4__.useRippleEdit)();
    const { state, dispatch } = (0,_hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_5__.useTimelineContext)();
    const timeline = (0,_hooks_useTimeline__WEBPACK_IMPORTED_MODULE_6__.useTimeline)();
    const { getAllSnapPoints, findNearestSnapPoint } = (0,_hooks_useSnapPoints__WEBPACK_IMPORTED_MODULE_7__.useSnapPoints)(fps);
    const clipRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    // Track emissions to handle Strict Mode double-mounting
    const hasEmittedRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(false);
    const lastPropsRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)({ id: clip.id, startTime: clip.startTime, endTime: clip.endTime, layer });
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
            const left = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_2__.timeToPixels)(clip.startTime, zoom);
            const width = (0,_utils_timelineScale__WEBPACK_IMPORTED_MODULE_2__.timeToPixels)(clip.endTime - clip.startTime, zoom);
            const top = layer * _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__.TimelineConstants.UI.TRACK_HEIGHT;
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
    // Rest of the component implementation...
    // (Previous implementation remains the same)
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: clipRef, "data-testid": "timeline-clip", className: `timeline-clip ${clip.type} ${isKeyboardDragging ? 'keyboard-dragging' : ''} ${state.selectedClipIds.includes(clip.id) ? 'selected' : ''}`, style: clipStyle, onPointerDown: handlePointerDown, onKeyDown: handleKeyDown, role: "listitem", "aria-label": `${clip.name} clip from ${startTimeFormatted} to ${endTimeFormatted}, duration ${durationFormatted}`, "aria-grabbed": isKeyboardDragging, "aria-dropeffect": "move", tabIndex: tabIndex, "aria-posinset": posinset, "aria-setsize": setsize, "data-clip-id": clip.id, "data-moving": isDragging || isTrimming ? 'true' : undefined, "data-trimming": isTrimming || undefined, "data-at-limit": isAtLimit || (clip.endTime - clip.startTime) > clip.mediaDuration || undefined, "data-trim-mode": trimMode },
        isTrimming && react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrimModeTooltip__WEBPACK_IMPORTED_MODULE_8__.TrimModeTooltip, { mode: trimMode }),
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
                (0,_utils_timelineUnits__WEBPACK_IMPORTED_MODULE_1__.formatTime)(clip.mediaDuration, { fps, showFrames: true }),
                " source)")))));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("831377de3dad4c2c9e99")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.9e9e063007e23f06f9ac.hot-update.js.map