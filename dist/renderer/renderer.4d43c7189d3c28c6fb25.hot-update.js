"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/TimelineTracks.tsx":
/*!****************************************************!*\
  !*** ./src/renderer/components/TimelineTracks.tsx ***!
  \****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineTracks: () => (/* binding */ TimelineTracks)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");
/* harmony import */ var _TimelineTrack__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./TimelineTrack */ "./src/renderer/components/TimelineTrack.tsx");
/* harmony import */ var _TrackControls__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TrackControls */ "./src/renderer/components/TrackControls.tsx");




const TimelineTracks = ({ tracks, selectedTrackId, selectedClipIds, onSelectTrack, onSelectClip, onClipDragStart, onClipDragEnd, onToggleVisibility, onUpdateTrack, onDeleteTrack, onMoveTrack, zoom, fps }) => {
    const tracksRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    // Handle track updates and positioning
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        // Update tracks when state changes
        if (tracksRef.current) {
            const height = tracks.length * _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_1__.TimelineConstants.UI.TRACK_HEIGHT;
            tracksRef.current.style.height = `${height}px`;
            // Force reflow to ensure height is applied
            void tracksRef.current.offsetHeight;
            // Notify that tracks container is ready
            window.dispatchEvent(new CustomEvent('tracks:ready', {
                detail: {
                    height,
                    trackCount: tracks.length
                }
            }));
            // Wait for next frame to ensure DOM is updated
            requestAnimationFrame(() => {
                if (tracksRef.current) {
                    // Get final dimensions after styles are applied
                    const rect = tracksRef.current.getBoundingClientRect();
                    // Notify that tracks are positioned
                    window.dispatchEvent(new CustomEvent('tracks:positioned', {
                        detail: {
                            height: rect.height,
                            trackCount: tracks.length
                        }
                    }));
                }
            });
        }
    }, [tracks.length]);
    const handleContainerClick = (e) => {
        // Only deselect if clicking directly on the container (not on tracks)
        if (e.target === e.currentTarget || e.target.classList.contains('timeline-tracks-background')) {
            onSelectTrack('');
        }
    };
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-tracks-container" },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-tracks-controls" }, tracks.map((track) => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TrackControls__WEBPACK_IMPORTED_MODULE_3__.TrackControls, { key: track.id, track: track, isSelected: track.id === selectedTrackId, onSelect: onSelectTrack, onUpdateTrack: onUpdateTrack, onDeleteTrack: onDeleteTrack, onMoveTrack: onMoveTrack, onToggleVisibility: onToggleVisibility })))),
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: tracksRef, className: "timeline-tracks-content", "data-testid": "timeline-tracks-content", onClick: handleContainerClick },
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-tracks-background", style: {
                    position: 'absolute',
                    inset: 0,
                    zIndex: -1,
                    minHeight: '100%'
                } }),
            tracks.map((track) => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelineTrack__WEBPACK_IMPORTED_MODULE_2__.TimelineTrack, { key: track.id, track: track, isSelected: track.id === selectedTrackId, zoom: zoom, fps: fps, onSelectTrack: onSelectTrack, onSelectClip: onSelectClip, onClipDragStart: onClipDragStart, onClipDragEnd: onClipDragEnd, onUpdateTrack: onUpdateTrack, onDeleteTrack: onDeleteTrack, onMoveTrack: onMoveTrack, onToggleVisibility: onToggleVisibility }))),
            tracks.length === 0 && (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "timeline-tracks-empty" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("span", null, "No tracks to display"))))));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("8ede800ad2a0fe693ab6")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.4d43c7189d3c28c6fb25.hot-update.js.map