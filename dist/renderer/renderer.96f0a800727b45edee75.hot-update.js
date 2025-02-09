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




const TimelineTransition = ({ id, type, startTime, endTime, duration, onDurationChange }) => {
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
        const newDuration = Math.max(0.1, Math.min(2.0, duration + (e.clientX - e.currentTarget.getBoundingClientRect().left) / 100));
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Ending transition handle drag:', {
            id,
            oldDuration: duration,
            newDuration
        });
        onDurationChange(newDuration);
    }, [id, duration, onDurationChange]);
    const getTransitionIcon = () => {
        switch (type) {
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Dissolve:
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Crossfade:
                return '↔️';
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Fade:
                return '🌅';
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Wipe:
                return '➡️';
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Slide:
                return '⏩';
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Zoom:
                return '🔍';
            case _types_transition__WEBPACK_IMPORTED_MODULE_2__.TransitionType.Push:
                return '👉';
            default:
                return '↔️';
        }
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `timeline-transition ${type}`, "data-testid": "timeline-transition", "data-transition-id": id, "data-type": type, "data-duration": duration.toString(), style: {
            left: `${startTime * 100}px`,
            width: `${(endTime - startTime) * 100}px`
        } },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-handle left", "data-testid": "timeline-transition-handle", draggable: true, onDragStart: handleDragStart, onDrag: handleDrag, onDragEnd: handleDragEnd }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TransitionRenderer__WEBPACK_IMPORTED_MODULE_3__.TransitionRenderer, { transition: {
                id,
                type,
                duration,
                clipAId: '',
                clipBId: '',
                params: {}
            }, fromClip: {
                id: 'preview-from',
                thumbnail: '/test.webm',
                duration: 2,
                startTime: 0
            }, toClip: {
                id: 'preview-to',
                thumbnail: '/test.webm',
                duration: 2,
                startTime: 2
            }, progress: 0.5, width: 200, height: 20 }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-icon" }, getTransitionIcon()),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-handle right", "data-testid": "timeline-transition-handle", draggable: true, onDragStart: handleDragStart, onDrag: handleDrag, onDragEnd: handleDragEnd })));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("65d600af6a4e8b679257")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.96f0a800727b45edee75.hot-update.js.map