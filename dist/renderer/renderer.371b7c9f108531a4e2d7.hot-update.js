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
/* harmony import */ var _TransitionRenderer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TransitionRenderer */ "./src/renderer/components/TransitionRenderer.tsx");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");




const TimelineTransitionComponent = (props) => {
    const { id, type, startTime, endTime, duration, clipAId, clipBId, clipAThumbnail, clipBThumbnail, direction, params, onDurationChange } = props;
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        console.log('TimelineTransition mounted:', {
            id,
            type,
            startTime,
            endTime,
            duration,
            clipAId,
            clipBId,
            direction,
            params
        });
    }, [id, type, startTime, endTime, duration, clipAId, clipBId, direction, params]);
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
        const newDuration = Math.max(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__.TimelineConstants.Transitions.MIN_DURATION, Math.min(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_3__.TimelineConstants.Transitions.MAX_DURATION, duration + (e.clientX - e.currentTarget.getBoundingClientRect().left) / 100));
        _utils_logger__WEBPACK_IMPORTED_MODULE_1__.logger.debug('Ending transition handle drag:', {
            id,
            oldDuration: duration,
            newDuration
        });
        onDurationChange(newDuration);
    }, [id, duration, onDurationChange]);
    const getTransitionIcon = () => {
        switch (type) {
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
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: `timeline-transition ${type}`, "data-testid": "timeline-transition", "data-transition-id": id, "data-type": type, "data-direction": direction || params?.direction || 'right', "data-easing": params?.easing || 'linear', "data-params": JSON.stringify({
            ...params,
            direction: direction || params?.direction || 'right',
            duration: params?.duration || duration,
            easing: params?.easing || 'linear'
        }), "data-duration": duration.toString(), style: {
            left: `${startTime * 50}px`,
            width: `${(endTime - startTime) * 50}px`,
            top: '50%',
            transform: 'translateY(-50%)',
            position: 'absolute',
            height: '20px',
            backgroundColor: 'rgba(0, 123, 255, 0.3)',
            border: '1px solid rgba(0, 123, 255, 0.5)',
            borderRadius: '4px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        } },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-handle left", "data-testid": "timeline-transition-handle", draggable: true, onDragStart: handleDragStart, onDrag: handleDrag, onDragEnd: handleDragEnd }),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-transition-preview" },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TransitionRenderer__WEBPACK_IMPORTED_MODULE_2__.TransitionRenderer, { transition: {
                    id,
                    type: type,
                    duration: Number(duration),
                    clipAId,
                    clipBId,
                    params: params || {}
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
const TimelineTransition = react__WEBPACK_IMPORTED_MODULE_0___default().memo(TimelineTransitionComponent);


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("bdfd72f9a94fcf20fc8d")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.371b7c9f108531a4e2d7.hot-update.js.map