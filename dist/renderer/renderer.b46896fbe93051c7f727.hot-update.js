"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/App.tsx":
/*!******************************!*\
  !*** ./src/renderer/App.tsx ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   App: () => (/* binding */ App),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./contexts/TimelineContext */ "./src/renderer/contexts/TimelineContext.tsx");
/* harmony import */ var _contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _contexts_MediaBinContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./contexts/MediaBinContext */ "./src/renderer/contexts/MediaBinContext.tsx");
/* harmony import */ var _components_TimelineContainer__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./components/TimelineContainer */ "./src/renderer/components/TimelineContainer.tsx");
/* harmony import */ var _components_MediaBin__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./components/MediaBin */ "./src/renderer/components/MediaBin.tsx");
/* harmony import */ var _components_Inspector__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./components/Inspector */ "./src/renderer/components/Inspector.tsx");
/* harmony import */ var _components_PreviewDisplay__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./components/PreviewDisplay */ "./src/renderer/components/PreviewDisplay.tsx");







const App = () => {
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__.TimelineProvider, null,
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_contexts_MediaBinContext__WEBPACK_IMPORTED_MODULE_2__.MediaBinProvider, null,
            react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-container app-root", "data-testid": "app-root" },
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-sidebar" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_MediaBin__WEBPACK_IMPORTED_MODULE_4__["default"], { className: "media-bin" })),
                react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-main" },
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-top" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-inspector" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_Inspector__WEBPACK_IMPORTED_MODULE_5__.Inspector, null)),
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-preview" },
                            react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_PreviewDisplay__WEBPACK_IMPORTED_MODULE_6__.PreviewDisplay, null))),
                    react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { className: "app-timeline" },
                        react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_components_TimelineContainer__WEBPACK_IMPORTED_MODULE_3__.TimelineContainer, null)))))));
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (App);


/***/ }),

/***/ "./src/renderer/contexts/TimelineContext.tsx":
/*!***************************************************!*\
  !*** ./src/renderer/contexts/TimelineContext.tsx ***!
  \***************************************************/
/***/ (() => {


// ... (previous imports remain the same)
const timelineReducer = (state, action) => {
    switch (action.type) {
        case ActionTypes.CLEAR_STATE: {
            return {
                ...initialTimelineState,
                history: {
                    entries: [],
                    currentIndex: -1
                }
            };
        }
        case ActionTypes.SET_STATE: {
            return {
                ...action.payload,
                history: action.payload.history || state.history
            };
        }
        case ActionTypes.UNDO: {
            if (state.history.currentIndex > 0) {
                const newIndex = state.history.currentIndex - 1;
                const { inversePatches } = state.history.entries[newIndex];
                // Create a fresh copy of state before applying patches
                const stateCopy = JSON.parse(JSON.stringify(state));
                const undone = applyPatches(stateCopy, inversePatches);
                const finalState = {
                    ...undone,
                    history: {
                        entries: state.history.entries,
                        currentIndex: newIndex
                    }
                };
                // Notify of undo completion
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent('timeline:undo-complete', {
                        detail: {
                            fromIndex: state.history.currentIndex,
                            toIndex: newIndex,
                            description: state.history.entries[newIndex].description
                        }
                    }));
                });
                return finalState;
            }
            return state;
        }
        case ActionTypes.REDO: {
            if (state.history.currentIndex < state.history.entries.length - 1) {
                const newIndex = state.history.currentIndex + 1;
                const { patches } = state.history.entries[newIndex];
                // Create a fresh copy of state before applying patches
                const stateCopy = JSON.parse(JSON.stringify(state));
                const redone = applyPatches(stateCopy, patches);
                const finalState = {
                    ...redone,
                    history: {
                        entries: state.history.entries,
                        currentIndex: newIndex
                    }
                };
                // Notify of redo completion
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent('timeline:redo-complete', {
                        detail: {
                            fromIndex: state.history.currentIndex,
                            toIndex: newIndex,
                            description: state.history.entries[newIndex].description
                        }
                    }));
                });
                return finalState;
            }
            return state;
        }
        default: {
            const [nextState, patches, inversePatches] = produceWithPatches(state, draft => {
                switch (action.type) {
                    case ActionTypes.SET_DURATION:
                        draft.duration = action.payload;
                        break;
                    case ActionTypes.SET_TRACKS:
                        draft.tracks = action.payload;
                        break;
                    case ActionTypes.SET_CURRENT_TIME:
                        draft.currentTime = action.payload;
                        break;
                    case ActionTypes.SET_PLAYING:
                        draft.isPlaying = action.payload;
                        break;
                    case ActionTypes.SET_SCROLL_X:
                        draft.scrollX = action.payload;
                        break;
                    case ActionTypes.SET_SCROLL_Y:
                        draft.scrollY = action.payload;
                        break;
                    case ActionTypes.SET_ZOOM:
                        draft.zoom = action.payload;
                        break;
                    case ActionTypes.SET_FPS:
                        draft.fps = action.payload;
                        break;
                    case ActionTypes.SET_DRAGGING:
                        draft.isDragging = action.payload.isDragging;
                        draft.dragStartX = action.payload.dragStartX;
                        draft.dragStartY = action.payload.dragStartY;
                        break;
                    case ActionTypes.SET_ERROR:
                        draft.error = action.payload;
                        break;
                    case ActionTypes.ADD_TRACK:
                        draft.tracks.push(action.payload.track);
                        break;
                    case ActionTypes.UPDATE_TRACK: {
                        const trackIndex = draft.tracks.findIndex(t => t.id === action.payload.trackId);
                        if (trackIndex !== -1) {
                            draft.tracks[trackIndex] = {
                                ...draft.tracks[trackIndex],
                                ...action.payload.track
                            };
                        }
                        break;
                    }
                    case ActionTypes.REMOVE_TRACK:
                        draft.tracks = draft.tracks.filter(t => t.id !== action.payload.trackId);
                        break;
                    case ActionTypes.ADD_CLIP: {
                        const trackToAddClip = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToAddClip) {
                            const newClip = {
                                ...action.payload.clip,
                                startTime: action.payload.clip.startTime ?? 0,
                                endTime: action.payload.clip.endTime ?? (action.payload.clip.duration ?? 0)
                            };
                            trackToAddClip.clips.push(newClip);
                            trackToAddClip.clips.sort((a, b) => a.startTime - b.startTime);
                        }
                        break;
                    }
                    case ActionTypes.UPDATE_CLIP: {
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
                        break;
                    }
                    case ActionTypes.REMOVE_CLIP: {
                        const trackToRemoveClip = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToRemoveClip) {
                            trackToRemoveClip.clips = trackToRemoveClip.clips.filter(c => c.id !== action.payload.clipId);
                        }
                        break;
                    }
                    case ActionTypes.SPLIT_CLIP: {
                        const trackToSplit = draft.tracks.find(t => t.id === action.payload.trackId);
                        if (trackToSplit) {
                            const clipToSplit = trackToSplit.clips.find(c => c.id === action.payload.clipId);
                            if (clipToSplit && action.payload.time > clipToSplit.startTime && action.payload.time < clipToSplit.endTime) {
                                const splitPoint = action.payload.time;
                                const firstDuration = splitPoint - clipToSplit.startTime;
                                const originalMediaOffset = clipToSplit.mediaOffset ?? 0;
                                const originalMediaDuration = clipToSplit.mediaDuration ?? (clipToSplit.endTime - clipToSplit.startTime);
                                const firstMediaStart = originalMediaOffset;
                                const firstMediaEnd = originalMediaOffset + firstDuration;
                                const secondMediaStart = originalMediaOffset + firstDuration;
                                const fullMediaDuration = originalMediaDuration;
                                // Remove the original clip
                                trackToSplit.clips = trackToSplit.clips.filter(c => c.id !== clipToSplit.id);
                                // Create first clip
                                const firstClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-1`,
                                    startTime: clipToSplit.startTime,
                                    endTime: splitPoint,
                                    mediaOffset: firstMediaStart,
                                    mediaDuration: fullMediaDuration,
                                    handles: {
                                        startPosition: firstMediaStart,
                                        endPosition: firstMediaEnd
                                    },
                                    initialBounds: {
                                        startTime: clipToSplit.startTime,
                                        endTime: splitPoint,
                                        mediaOffset: firstMediaStart,
                                        mediaDuration: fullMediaDuration
                                    }
                                };
                                // Create second clip
                                const secondClip = {
                                    ...clipToSplit,
                                    id: `${clipToSplit.id}-2`,
                                    startTime: splitPoint,
                                    endTime: clipToSplit.endTime,
                                    mediaOffset: secondMediaStart,
                                    mediaDuration: fullMediaDuration,
                                    handles: {
                                        startPosition: secondMediaStart,
                                        endPosition: secondMediaStart + (clipToSplit.endTime - splitPoint)
                                    },
                                    initialBounds: {
                                        startTime: splitPoint,
                                        endTime: clipToSplit.endTime,
                                        mediaOffset: secondMediaStart,
                                        mediaDuration: fullMediaDuration
                                    }
                                };
                                // Add new clips
                                trackToSplit.clips.push(firstClip, secondClip);
                                trackToSplit.clips.sort((a, b) => a.startTime - b.startTime);
                                // Update selection
                                draft.selectedClipIds = [firstClip.id];
                                // Notify of split completion
                                requestAnimationFrame(() => {
                                    window.dispatchEvent(new CustomEvent('timeline:clip-split', {
                                        detail: {
                                            trackId: trackToSplit.id,
                                            originalClipId: clipToSplit.id,
                                            splitTime: splitPoint,
                                            firstClipId: firstClip.id,
                                            secondClipId: secondClip.id,
                                            firstClip: {
                                                startTime: firstClip.startTime,
                                                endTime: firstClip.endTime,
                                                mediaOffset: firstClip.mediaOffset,
                                                mediaDuration: firstClip.mediaDuration
                                            },
                                            secondClip: {
                                                startTime: secondClip.startTime,
                                                endTime: secondClip.endTime,
                                                mediaOffset: secondClip.mediaOffset,
                                                mediaDuration: secondClip.mediaDuration
                                            }
                                        }
                                    }));
                                });
                            }
                        }
                        break;
                    }
                    case ActionTypes.SELECT_CLIPS:
                        draft.selectedClipIds = action.payload.clipIds;
                        break;
                    case ActionTypes.SET_SELECTED_TRACK_ID:
                        draft.selectedTrackId = action.payload;
                        break;
                }
            });
            if (isUndoable(action)) {
                // Create a fresh copy of nextState before applying patches
                const nextStateCopy = JSON.parse(JSON.stringify(nextState));
                const finalState = produce(nextStateCopy, draft => {
                    if (draft.history.currentIndex < draft.history.entries.length - 1) {
                        draft.history.entries = draft.history.entries.slice(0, draft.history.currentIndex + 1);
                    }
                    const entry = {
                        type: 'partial',
                        timestamp: Date.now(),
                        patches: JSON.parse(JSON.stringify(patches)),
                        inversePatches: JSON.parse(JSON.stringify(inversePatches)),
                        description: getHistoryDescription(action)
                    };
                    draft.history.entries.push(entry);
                    draft.history.currentIndex++;
                    if (draft.history.entries.length > TimelineConstants.History.MAX_HISTORY_SIZE) {
                        draft.history.entries = draft.history.entries.slice(-TimelineConstants.History.MAX_HISTORY_SIZE);
                        draft.history.currentIndex = draft.history.entries.length - 1;
                    }
                });
                return finalState;
            }
            return nextState;
        }
    }
};
// ... (rest of the file remains the same)


/***/ }),

/***/ "./src/renderer/hooks/useTimelineContext.ts":
/*!**************************************************!*\
  !*** ./src/renderer/hooks/useTimelineContext.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   useTimelineContext: () => (/* binding */ useTimelineContext)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../contexts/TimelineContext */ "./src/renderer/contexts/TimelineContext.tsx");
/* harmony import */ var _contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__);


const useTimelineContext = () => {
    const context = (0,react__WEBPACK_IMPORTED_MODULE_0__.useContext)(_contexts_TimelineContext__WEBPACK_IMPORTED_MODULE_1__.TimelineContext);
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
/******/ 	__webpack_require__.h = () => ("a2f53cb6b7f5309763c6")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.b46896fbe93051c7f727.hot-update.js.map