"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/components/TimelineTrack.tsx":
/*!***************************************************!*\
  !*** ./src/renderer/components/TimelineTrack.tsx ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TimelineTrack: () => (/* binding */ TimelineTrack)
/* harmony export */ });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "./node_modules/react/index.js");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _types_timeline__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/timeline */ "./src/renderer/types/timeline.ts");
/* harmony import */ var _hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../hooks/useTimelineContext */ "./src/renderer/hooks/useTimelineContext.ts");
/* harmony import */ var _TimelineClip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./TimelineClip */ "./src/renderer/components/TimelineClip.tsx");
/* harmony import */ var _TimelineTransition__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./TimelineTransition */ "./src/renderer/components/TimelineTransition.tsx");
/* harmony import */ var _hooks_useLayerManagement__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../hooks/useLayerManagement */ "./src/renderer/hooks/useLayerManagement.ts");
/* harmony import */ var _utils_logger__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils/logger */ "./src/renderer/utils/logger.ts");
/* harmony import */ var _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils/timelineConstants */ "./src/renderer/utils/timelineConstants.ts");








const TimelineTrack = ({ track, isSelected, zoom, fps, onSelectTrack, onSelectClip, onClipDragStart, onClipDragEnd, onToggleVisibility, onUpdateTrack, onDeleteTrack, onMoveTrack }) => {
    const containerRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const trackContentRef = (0,react__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);
    const { assignLayers, getTrackHeight, getClipTop } = (0,_hooks_useLayerManagement__WEBPACK_IMPORTED_MODULE_5__.useLayerManagement)();
    const { state, dispatch } = (0,_hooks_useTimelineContext__WEBPACK_IMPORTED_MODULE_2__.useTimelineContext)();
    // Get clips with optimized layer assignments and notify track ready
    const clipsWithLayers = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)(() => {
        const layeredClips = assignLayers(track.clips, track);
        // Notify that track is ready with current clip count
        requestAnimationFrame(() => {
            window.dispatchEvent(new CustomEvent('track:ready', {
                detail: {
                    trackId: track.id,
                    clipCount: layeredClips.length,
                    clips: layeredClips.map(c => ({
                        id: c.id,
                        startTime: c.startTime,
                        endTime: c.endTime,
                        layer: c.layer
                    }))
                }
            }));
        });
        return layeredClips;
    }, [track, assignLayers]);
    // Handle clip updates
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        const handleClipRendered = (e) => {
            const { clipId } = e.detail;
            if (track.clips.some(c => c.id === clipId)) {
                requestAnimationFrame(() => {
                    window.dispatchEvent(new CustomEvent('track:ready', {
                        detail: {
                            trackId: track.id,
                            clipCount: track.clips.length,
                            clips: track.clips.map(c => ({
                                id: c.id,
                                startTime: c.startTime,
                                endTime: c.endTime,
                                layer: c.layer
                            }))
                        }
                    }));
                });
            }
        };
        window.addEventListener('clip:rendered', handleClipRendered);
        return () => {
            window.removeEventListener('clip:rendered', handleClipRendered);
        };
    }, [track.id, track.clips]);
    // Handle track updates and positioning
    (0,react__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
        if (containerRef.current && trackContentRef.current) {
            const height = getTrackHeight(clipsWithLayers());
            containerRef.current.style.height = `${height}px`;
            trackContentRef.current.style.height = `${height}px`;
            // Force reflow to ensure height is applied
            void containerRef.current.offsetHeight;
            void trackContentRef.current.offsetHeight;
            // Notify that track is ready
            window.dispatchEvent(new CustomEvent('track:ready', {
                detail: {
                    trackId: track.id,
                    height,
                    clipCount: track.clips.length
                }
            }));
            // Wait for next frame to ensure DOM is updated
            requestAnimationFrame(() => {
                if (containerRef.current && trackContentRef.current) {
                    // Get final dimensions after styles are applied
                    const containerRect = containerRef.current.getBoundingClientRect();
                    const contentRect = trackContentRef.current.getBoundingClientRect();
                    // Notify that track is positioned
                    window.dispatchEvent(new CustomEvent('track:positioned', {
                        detail: {
                            trackId: track.id,
                            containerHeight: containerRect.height,
                            contentHeight: contentRect.height,
                            clipCount: track.clips.length
                        }
                    }));
                    _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.debug('[TimelineTrack] Track positioned:', {
                        trackId: track.id,
                        containerRect,
                        contentRect,
                        clipCount: track.clips.length
                    });
                }
            });
        }
    }, [track.id, track.clips.length, clipsWithLayers, getTrackHeight]);
    const handleTrackClick = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        if (e.currentTarget === e.target) {
            onSelectTrack(track.id);
        }
    }, [track.id, onSelectTrack]);
    const handleDragEnter = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.debug('Track drag enter:', {
            target: e.target,
            currentTarget: e.currentTarget,
            className: e.currentTarget.className
        });
        e.currentTarget.classList.add('drag-over');
    }, []);
    const handleDragOver = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.debug('Track drag over:', {
            target: e.target,
            currentTarget: e.currentTarget,
            className: e.currentTarget.className
        });
        e.currentTarget.classList.add('drag-over');
    }, []);
    const handleDragLeave = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.debug('Track drag leave:', {
            target: e.target,
            currentTarget: e.currentTarget,
            className: e.currentTarget.className
        });
        e.currentTarget.classList.remove('drag-over');
    }, []);
    const handleDrop = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('drag-over');
        try {
            _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.debug('Drop event:', {
                types: e.dataTransfer.types,
                data: e.dataTransfer.getData('application/json'),
                target: e.currentTarget.className,
                currentTarget: e.currentTarget.className,
                clientX: e.clientX,
                clientY: e.clientY
            });
            const jsonData = e.dataTransfer.getData('application/json');
            if (!jsonData) {
                _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.error('No JSON data in drop event');
                return;
            }
            const data = JSON.parse(jsonData);
            _utils_logger__WEBPACK_IMPORTED_MODULE_6__.logger.debug('Parsed drop data:', data);
            if (data) {
                // Calculate time position based on drop coordinates
                const trackRect = e.currentTarget.getBoundingClientRect();
                const dropX = e.clientX - trackRect.left;
                const timeScale = _utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.Scale.getScale(state.zoom);
                const startTime = Math.max(0, (dropX + state.scrollX) / timeScale); // Convert to time, accounting for scroll
                // Create clip using helper
                let clip;
                // Create clip with proper duration properties
                const initialDuration = data.duration;
                const baseProps = {
                    name: data.name,
                    startTime,
                    endTime: startTime + initialDuration,
                    mediaOffset: 0,
                    mediaDuration: initialDuration,
                    originalDuration: initialDuration,
                    initialDuration: initialDuration,
                    effects: []
                };
                switch (data.type) {
                    case 'video': {
                        const videoClip = (0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.createClip)('video', {
                            ...baseProps,
                            src: data.path,
                            transform: {
                                scale: 1,
                                rotation: 0,
                                position: { x: 0, y: 0 },
                                opacity: 1
                            }
                        });
                        clip = { ...videoClip, layer: 0 };
                        break;
                    }
                    case 'audio': {
                        const audioClip = (0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.createClip)('audio', {
                            ...baseProps,
                            src: data.path,
                            volume: 1,
                            isMuted: false
                        });
                        clip = { ...audioClip, layer: 0 };
                        break;
                    }
                    case 'caption': {
                        const captionClip = (0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.createClip)('caption', {
                            ...baseProps,
                            text: '',
                            captions: []
                        });
                        clip = { ...captionClip, layer: 0 };
                        break;
                    }
                    default:
                        throw new Error(`Unsupported clip type: ${data.type}`);
                }
                // Ensure track type matches clip type
                if ((track.type === 'video' && data.type === 'video') ||
                    (track.type === 'audio' && data.type === 'audio') ||
                    (track.type === 'caption' && data.type === 'caption')) {
                    // Update track with new clip
                    const updatedClips = [...(track.clips || []), clip];
                    onUpdateTrack(track.id, { clips: updatedClips });
                    // Update timeline duration if needed
                    const maxEndTime = Math.max(...updatedClips.map(c => c.endTime));
                    if (maxEndTime > state.duration) {
                        dispatch({
                            type: _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.SET_DURATION,
                            payload: Math.max(maxEndTime, 10)
                        });
                    }
                    // Wait for next frame to ensure clip is added
                    requestAnimationFrame(() => {
                        // Notify that clip was added
                        window.dispatchEvent(new CustomEvent('track:clip-added', {
                            detail: {
                                trackId: track.id,
                                clipId: clip.id,
                                startTime,
                                endTime: startTime + initialDuration
                            }
                        }));
                    });
                }
                else {
                    console.error(`Track type (${track.type}) does not match clip type (${data.type})`);
                    return;
                }
            }
        }
        catch (error) {
            console.error('Error handling drop:', error);
        }
    }, [track.id, track.clips, onUpdateTrack, state, dispatch, state.zoom]);
    const handleKeyDown = (0,react__WEBPACK_IMPORTED_MODULE_0__.useCallback)((e) => {
        switch (e.key) {
            case 'Enter':
            case ' ':
                e.preventDefault();
                onSelectTrack(track.id);
                break;
            case 'ArrowUp':
                e.preventDefault();
                // Focus previous track
                const prevTrack = containerRef.current?.previousElementSibling;
                if (prevTrack instanceof HTMLElement) {
                    prevTrack.focus();
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                // Focus next track
                const nextTrack = containerRef.current?.nextElementSibling;
                if (nextTrack instanceof HTMLElement) {
                    nextTrack.focus();
                }
                break;
            case 'Tab':
                // Let default tab behavior work, but ensure clips are in tab order
                if (e.shiftKey && isSelected) {
                    // When shift+tab on selected track, focus last clip
                    const clips = containerRef.current?.querySelectorAll('.timeline-clip');
                    const lastClip = clips?.[clips.length - 1];
                    if (lastClip instanceof HTMLElement) {
                        e.preventDefault();
                        lastClip.focus();
                    }
                }
                break;
        }
    }, [track.id, onSelectTrack, isSelected]);
    const layeredClips = clipsWithLayers();
    const trackHeight = Math.max(_utils_timelineConstants__WEBPACK_IMPORTED_MODULE_7__.TimelineConstants.UI.TRACK_HEIGHT, getTrackHeight(layeredClips));
    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: containerRef, "data-testid": "timeline-track", "data-track-id": track.id, className: `timeline-track ${isSelected ? 'selected' : ''} ${track.type} ${!track.clips?.length ? 'empty' : ''}`, onClick: handleTrackClick, onKeyDown: handleKeyDown, role: "region", "aria-label": `${track.name} track`, "aria-selected": isSelected, tabIndex: 0, style: {
            opacity: track.isVisible ? 1 : 0.5,
            height: `${trackHeight}px`
        } },
        react__WEBPACK_IMPORTED_MODULE_0___default().createElement("div", { ref: trackContentRef, "data-testid": "track-content", className: "track-content", role: "list", "aria-label": `Clips in ${track.name}`, onDragEnter: handleDragEnter, onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onMouseDown: (e) => {
                if (e.target === e.currentTarget) {
                    handleTrackClick(e);
                }
            }, style: {
                height: `${trackHeight}px`
            } },
            (() => {
                cy.log('Track state before rendering transitions:', {
                    id: track.id,
                    type: track.type,
                    allowTransitions: track.allowTransitions,
                    transitionsEnabled: track.transitionsEnabled,
                    showTransitions: track.showTransitions,
                    transitions: track.transitions,
                    clips: track.clips.map(c => ({
                        id: c.id,
                        startTime: c.startTime,
                        endTime: c.endTime
                    })),
                    layeredClips: layeredClips.map(c => ({
                        id: c.id,
                        startTime: c.startTime,
                        endTime: c.endTime,
                        layer: c.layer
                    }))
                });
                // Initialize transitions array if not present
                if (!track.transitions) {
                    track.transitions = [];
                }
                // Ensure transitions is an array
                if (!Array.isArray(track.transitions)) {
                    console.log('Track transitions is not an array:', track.transitions);
                    track.transitions = [];
                }
                if (!track.transitions?.length) {
                    cy.log('No transitions found in track');
                    return null;
                }
                if (!track.allowTransitions || !track.transitionsEnabled || !track.showTransitions) {
                    cy.log('Transitions are disabled:', {
                        allowTransitions: track.allowTransitions,
                        transitionsEnabled: track.transitionsEnabled,
                        showTransitions: track.showTransitions
                    });
                    return null;
                }
                cy.log('Rendering transitions:', {
                    transitions: track.transitions,
                    allowTransitions: track.allowTransitions,
                    transitionsEnabled: track.transitionsEnabled,
                    showTransitions: track.showTransitions
                });
                return track.transitions.map((transition) => {
                    if (!transition) {
                        cy.log('Invalid transition:', transition);
                        return null;
                    }
                    console.log('Rendering transition:', {
                        transition,
                        clipA: layeredClips.find(c => c.id === transition.clipAId),
                        clipB: layeredClips.find(c => c.id === transition.clipBId)
                    });
                    const clipA = layeredClips.find(c => c.id === transition.clipAId);
                    const clipB = layeredClips.find(c => c.id === transition.clipBId);
                    if (!clipA || !clipB) {
                        cy.log('Could not find clips for transition:', {
                            transition,
                            clipAFound: !!clipA,
                            clipBFound: !!clipB,
                            availableClips: layeredClips.map(c => c.id)
                        });
                        return null;
                    }
                    return (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelineTransition__WEBPACK_IMPORTED_MODULE_4__.TimelineTransition, { key: transition.id, id: transition.id, type: transition.type, startTime: clipA.endTime - transition.duration, endTime: clipB.startTime + transition.duration, duration: transition.duration, clipAId: clipA.id, clipBId: clipB.id, clipAThumbnail: (0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.isVideoClip)(clipA) ? clipA.thumbnail : undefined, clipBThumbnail: (0,_types_timeline__WEBPACK_IMPORTED_MODULE_1__.isVideoClip)(clipB) ? clipB.thumbnail : undefined, direction: transition.params?.direction || 'right', params: transition.params, onDurationChange: (newDuration) => {
                            dispatch({
                                type: _types_timeline__WEBPACK_IMPORTED_MODULE_1__.ActionTypes.UPDATE_TRANSITION,
                                payload: {
                                    transitionId: transition.id,
                                    params: { duration: newDuration }
                                }
                            });
                        } }));
                });
            })(),
            layeredClips.map((clip, index) => (react__WEBPACK_IMPORTED_MODULE_0___default().createElement(_TimelineClip__WEBPACK_IMPORTED_MODULE_3__.TimelineClip, { key: clip.id, clip: clip, track: track, layer: clip.layer, zoom: state.zoom, fps: state.fps, onSelect: () => onSelectClip(clip.id), onDragStart: () => onClipDragStart(clip.id), onDragEnd: onClipDragEnd, tabIndex: isSelected ? 0 : -1, "aria-posinset": index + 1, "aria-setsize": layeredClips.length, style: {
                    top: getClipTop(clip.layer)
                } }))))));
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("ae263533daf8be5f7cba")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.0a20afaf6c10eb83cdb7.hot-update.js.map