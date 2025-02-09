"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/TimelineContainer.tsx":
/*!*******************************************************!*\
  !*** ./src/renderer/components/TimelineContainer.tsx ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineContainer: () => (/* binding */ TimelineContainer)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _Timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Timeline */ "./src/renderer/components/Timeline.tsx");
/* harmony import */ var _hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useTimelineContext */ "./src/renderer/hooks/useTimelineContext.ts");
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");






const TimelineContainer = () => {
    const { state, dispatch } = (0,_hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_2__.useTimelineContext)();
    const containerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const [containerWidth, setContainerWidth] = (0,react__WEBPACK_IMPORTED_MODULE_0__.useState)(0);
    // Update container width on resize
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setContainerWidth(rect.width);
            }
        };
        updateWidth();
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        window.addEventListener('resize', updateWidth);
        return () => {
            window.removeEventListener('resize', updateWidth);
            resizeObserver.disconnect();
        };
    }, []);
    // Handle scroll events
    const handleScroll = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((scrollLeft, scrollTop) => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_3__.ActionTypes.SET_SCROLL_X,
            payload: scrollLeft
        });
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_3__.ActionTypes.SET_SCROLL_Y,
            payload: scrollTop
        });
        _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.debug('Timeline scrolled:', { scrollLeft, scrollTop });
    }, [dispatch]);
    // Handle time updates
    const handleTimeUpdate = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((time) => {
        console.log('Time update in container:', time);
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_3__.ActionTypes.SET_CURRENT_TIME,
            payload: { time }
        });
        _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.debug('Timeline time updated:', time);
    }, [dispatch]);
    const handleAddTrack = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        dispatch({
            type: _types_timeline__WEBPACK_IMPORTED_MODULE_3__.ActionTypes.ADD_TRACK,
            payload: {
                track: {
                    id: `track-${Date.now()}`,
                    name: `Track ${state.tracks.length + 1}`,
                    type: 'video',
                    clips: [],
                    isLocked: false,
                    isVisible: true
                }
            }
        });
    }, [dispatch, state.tracks.length]);
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: containerRef, className: "timeline-container", "data-testid": "timeline-container", style: {
            position: 'relative',
            width: '100%',
            height: '100%',
            overflowX: 'hidden',
            overflowY: 'hidden',
            userSelect: 'none',
            touchAction: 'none',
            backgroundColor: '#1a1a1a',
            transform: 'translate3d(0, 0, 0)',
            willChange: 'transform'
        }, onMouseMove: (e) => {
            // Log container mouse coordinates for debugging
            _utils_logger__WEBPACK_IMPORTED_MODULE_5__.logger.debug('Container mouse move:', {
                clientX: e.clientX,
                offsetX: e.nativeEvent.offsetX,
                zoom: state.zoom,
                scale: _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_4__.TimelineConstants.Scale.getScale(state.zoom)
            });
        } },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-toolbar", style: {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: '8px',
                backgroundColor: '#2a2a2a'
            } },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("button", { "data-testid": "add-track-button", onClick: handleAddTrack, className: "add-track-button", style: {
                    padding: '4px 8px',
                    backgroundColor: '#3a3a3a',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    cursor: 'pointer'
                } }, "Add Track")),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-content-wrapper", style: {
                position: 'absolute',
                top: 46,
                left: 0,
                right: 0,
                bottom: 0,
                overflowX: 'auto',
                overflowY: 'hidden'
            } },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_Timeline__WEBPACK_IMPORTED_MODULE_1__.Timeline, { containerWidth: Math.max(0, containerWidth - 200), scrollLeft: state.scrollX, onScroll: handleScroll, onTimeUpdate: handleTimeUpdate }),
            state.tracks.length === 0 && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-empty-state", "data-testid": "empty-state", style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#666',
                    pointerEvents: 'none'
                } }, "No tracks to display")))));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("befd4af9729279b890dd")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.ae0108f15b7501df9061.hot-update.js.map