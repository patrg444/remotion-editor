"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/TimelineTransition.tsx":
/*!********************************************************!*\
  !*** ./src/renderer/components/TimelineTransition.tsx ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineTransition: () => (/* binding */ TimelineTransition)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _types_transition__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../types/transition */ "./src/renderer/types/transition.ts");
/* harmony import */ var _TransitionRenderer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TransitionRenderer */ "./src/renderer/components/TransitionRenderer.tsx");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");





const TimelineTransition = ({ id, type, startTime, endTime, duration, clipAId, clipBId, clipAThumbnail, clipBThumbnail, direction, onDurationChange }) => {
    const handleDragStart = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.stopPropagation();
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Starting transition handle drag:', {
            id,
            type,
            startTime,
            endTime,
            duration
        });
    }, [id, type, startTime, endTime, duration]);
    const handleDrag = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        if (!e.clientX)
            return; // Ignore invalid drag events
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Dragging transition handle:', {
            clientX: e.clientX,
            duration
        });
    }, [duration]);
    const handleDragEnd = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        if (!e.clientX)
            return;
        const newDuration = Math.max(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_4__.TimelineConstants.Transitions.MIN_DURATION, Math.min(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_4__.TimelineConstants.Transitions.MAX_DURATION, duration + (e.clientX - e.currentTarget.getBoundingClientRect().left) / 100));
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Ending transition handle drag:', {
            id,
            oldDuration: duration,
            newDuration
        });
        onDurationChange(newDuration);
    }, [id, duration, onDurationChange]);
    const getTransitionIcon = () => {
        const transitionType = typeof type === 'string' ? type : _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType[type];
        switch (transitionType) {
            case 'dissolve':
            case 'crossfade':
                return '↔️';
            case 'fade':
                return '🌅';
            case 'wipe':
                return '➡️';
            case 'slide':
                return '⏩';
            case 'zoom':
                return '🔍';
            case 'push':
                return '👉';
            default:
                return '↔️';
        }
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `timeline-transition ${type}`, "data-testid": "timeline-transition", "data-transition-id": id, "data-type": type, "data-duration": Number(duration), "data-direction": direction, style: {
            left: `${startTime * 100}px`,
            width: `${(endTime - startTime) * 100}px`
        } },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-handle left", "data-testid": "timeline-transition-handle", draggable: true, onDragStart: handleDragStart, onDrag: handleDrag, onDragEnd: handleDragEnd }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-preview" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TransitionRenderer__WEBPACK_IMPORTED_MODULE_3__.TransitionRenderer, { transition: {
                    id,
                    type: type,
                    duration: Number(duration),
                    clipAId,
                    clipBId,
                    params: {}
                }, fromClip: {
                    id: clipAId,
                    thumbnail: clipAThumbnail || '/test.webm',
                    duration: 2,
                    startTime: startTime
                }, toClip: {
                    id: clipBId,
                    thumbnail: clipBThumbnail || '/test.webm',
                    duration: 2,
                    startTime: endTime - duration
                }, progress: 0.5, width: 200, height: 20 })),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-icon" }, getTransitionIcon()),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-handle right", "data-testid": "timeline-transition-handle", draggable: true, onDragStart: handleDragStart, onDrag: handleDrag, onDragEnd: handleDragEnd })));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("65453d5f597aa2adc8be")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.b4b083358fb3482965c6.hot-update.js.map