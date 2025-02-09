"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/utils/historyDiff.ts":
/*!*******************************************!*\
  !*** ./src/renderer/utils/historyDiff.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyStateDiff: () => (/* binding */ applyStateDiff),
/* harmony export */   createStateDiff: () => (/* binding */ createStateDiff)
/* harmony export */ });
/* harmony import */ var _logger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./logger */ "./src/renderer/utils/logger.ts");

const createStateDiff = (before, after, description, isCheckpoint = false) => {
    const timestamp = Date.now();
    // For checkpoint actions, store full state snapshot
    if (isCheckpoint) {
        _logger__WEBPACK_IMPORTED_MODULE_0__.logger.debug('Creating checkpoint snapshot:', { description });
        return {
            type: 'full',
            snapshot: JSON.parse(JSON.stringify(after)),
            timestamp,
            description
        };
    }
    const changes = {};
    // Always compare tracks to catch clip changes
    changes.tracks = {
        added: after.tracks?.filter((track) => !before.tracks?.find((t) => t.id === track.id)) || [],
        removed: (before.tracks || [])
            .filter((track) => !after.tracks?.find((t) => t.id === track.id))
            .map((track) => track.id),
        modified: (before.tracks || [])
            .filter((track) => after.tracks?.find((t) => t.id === track.id))
            .map((track) => {
            const afterTrack = after.tracks.find((t) => t.id === track.id);
            const clipChanges = {
                added: afterTrack.clips.filter((clip) => !track.clips.find((c) => c.id === clip.id)),
                removed: track.clips
                    .filter((clip) => !afterTrack.clips.find((c) => c.id === clip.id))
                    .map((clip) => clip.id),
                modified: track.clips
                    .filter((clip) => afterTrack.clips.find((c) => c.id === clip.id))
                    .map((clip) => {
                    const afterClip = afterTrack.clips.find((c) => c.id === clip.id);
                    // Deep clone to preserve nested objects
                    return {
                        id: clip.id,
                        before: JSON.parse(JSON.stringify(clip)),
                        after: JSON.parse(JSON.stringify(afterClip))
                    };
                })
            };
            return {
                id: track.id,
                clips: clipChanges
            };
        })
            .filter(trackDiff => trackDiff.clips.added?.length ||
            trackDiff.clips.removed?.length ||
            trackDiff.clips.modified?.length)
    };
    // Compare scalar properties
    if (before.currentTime !== after.currentTime)
        changes.currentTime = after.currentTime;
    if (before.duration !== after.duration)
        changes.duration = after.duration;
    if (before.zoom !== after.zoom)
        changes.zoom = after.zoom;
    if (before.fps !== after.fps)
        changes.fps = after.fps;
    if (before.rippleState !== after.rippleState)
        changes.rippleState = after.rippleState;
    if (before.selectedClipIds !== after.selectedClipIds)
        changes.selectedClipIds = after.selectedClipIds;
    // Compare markers
    if (before.markers !== after.markers) {
        changes.markers = {
            added: after.markers.filter((marker) => !before.markers.find((m) => m.id === marker.id)),
            removed: before.markers
                .filter((marker) => !after.markers.find((m) => m.id === marker.id))
                .map((marker) => marker.id),
            modified: before.markers
                .filter((marker) => after.markers.find((m) => m.id === marker.id))
                .map((marker) => {
                const afterMarker = after.markers.find((m) => m.id === marker.id);
                return {
                    id: marker.id,
                    before: {
                        time: marker.time,
                        label: marker.label
                    },
                    after: {
                        time: afterMarker.time,
                        label: afterMarker.label
                    }
                };
            })
                .filter(diff => diff.before.time !== diff.after.time ||
                diff.before.label !== diff.after.label)
        };
    }
    return {
        type: 'partial',
        changes,
        timestamp,
        description
    };
};
const applyStateDiff = (state, diff, reverse = false) => {
    // For checkpoint diffs, directly use the snapshot
    if (diff.type === 'full' && diff.snapshot) {
        _logger__WEBPACK_IMPORTED_MODULE_0__.logger.debug('Restoring from checkpoint:', { description: diff.description });
        if (reverse) {
            return state; // Keep current state when undoing a checkpoint
        }
        return JSON.parse(JSON.stringify(diff.snapshot));
    }
    if (!diff.changes) {
        _logger__WEBPACK_IMPORTED_MODULE_0__.logger.warn('Invalid diff: no changes or snapshot found');
        return state;
    }
    const newState = JSON.parse(JSON.stringify(state));
    // Apply track changes
    if (diff.changes.tracks) {
        const tracks = JSON.parse(JSON.stringify(state.tracks));
        const { added, removed, modified } = diff.changes.tracks;
        if (reverse) {
            // Remove added tracks
            if (added) {
                const addedIds = new Set(added.map(track => track.id));
                newState.tracks = tracks.filter(track => !addedIds.has(track.id));
            }
            // Restore removed tracks
            if (removed) {
                const removedTracks = tracks.filter(track => removed.includes(track.id));
                newState.tracks = [...newState.tracks, ...removedTracks];
            }
        }
        else {
            // Add new tracks
            if (added)
                newState.tracks = [...tracks, ...added];
            // Remove tracks
            if (removed) {
                const removedIds = new Set(removed);
                newState.tracks = tracks.filter(track => !removedIds.has(track.id));
            }
        }
        // Apply track modifications
        if (modified) {
            modified.forEach(trackDiff => {
                const track = newState.tracks.find(t => t.id === trackDiff.id);
                if (!track)
                    return;
                const clips = JSON.parse(JSON.stringify(track.clips));
                const { added: addedClips, removed: removedClips, modified: modifiedClips } = trackDiff.clips;
                // When reversing, first restore removed clips, then remove added ones
                if (reverse) {
                    // First restore removed clips
                    if (removedClips) {
                        const removedClipsList = clips.filter(clip => removedClips.includes(clip.id));
                        track.clips = [...track.clips, ...removedClipsList];
                    }
                    // Then remove added clips
                    if (addedClips) {
                        const addedIds = new Set(addedClips.map(clip => clip.id));
                        track.clips = track.clips.filter(clip => !addedIds.has(clip.id));
                    }
                }
                else {
                    // When going forward, first remove clips, then add new ones
                    if (removedClips) {
                        const removedIds = new Set(removedClips);
                        track.clips = track.clips.filter(clip => !removedIds.has(clip.id));
                    }
                    if (addedClips) {
                        track.clips = [...track.clips, ...addedClips];
                    }
                }
                // Apply clip modifications
                if (modifiedClips) {
                    modifiedClips.forEach(clipDiff => {
                        const clip = track.clips.find(c => c.id === clipDiff.id);
                        if (!clip)
                            return;
                        if (reverse) {
                            // Deep clone to preserve nested objects
                            clip.startTime = clipDiff.before.startTime ?? clip.startTime;
                            clip.endTime = clipDiff.before.endTime ?? clip.endTime;
                            clip.mediaOffset = clipDiff.before.mediaOffset ?? clip.mediaOffset;
                            clip.mediaDuration = clipDiff.before.mediaDuration ?? clip.mediaDuration;
                            if (clipDiff.before.initialBounds) {
                                clip.initialBounds = { ...clipDiff.before.initialBounds };
                            }
                            if (clipDiff.before.handles) {
                                clip.handles = { ...clipDiff.before.handles };
                            }
                        }
                        else {
                            clip.startTime = clipDiff.after.startTime ?? clip.startTime;
                            clip.endTime = clipDiff.after.endTime ?? clip.endTime;
                            clip.mediaOffset = clipDiff.after.mediaOffset ?? clip.mediaOffset;
                            clip.mediaDuration = clipDiff.after.mediaDuration ?? clip.mediaDuration;
                            if (clipDiff.after.initialBounds) {
                                clip.initialBounds = { ...clipDiff.after.initialBounds };
                            }
                            if (clipDiff.after.handles) {
                                clip.handles = { ...clipDiff.after.handles };
                            }
                        }
                    });
                }
            });
        }
    }
    // Store previous values in the diff for scalar properties
    const previousValues = {
        currentTime: state.currentTime,
        duration: state.duration,
        zoom: state.zoom,
        fps: state.fps
    };
    // Apply scalar changes
    if (reverse) {
        if (diff.changes.currentTime !== undefined)
            newState.currentTime = previousValues.currentTime;
        if (diff.changes.duration !== undefined)
            newState.duration = previousValues.duration;
        if (diff.changes.zoom !== undefined)
            newState.zoom = previousValues.zoom;
        if (diff.changes.fps !== undefined)
            newState.fps = previousValues.fps;
        if (diff.changes.rippleState !== undefined)
            newState.rippleState = state.rippleState;
        if (diff.changes.selectedClipIds !== undefined)
            newState.selectedClipIds = state.selectedClipIds;
    }
    else {
        if (diff.changes.currentTime !== undefined)
            newState.currentTime = diff.changes.currentTime;
        if (diff.changes.duration !== undefined)
            newState.duration = diff.changes.duration;
        if (diff.changes.zoom !== undefined)
            newState.zoom = diff.changes.zoom;
        if (diff.changes.fps !== undefined)
            newState.fps = diff.changes.fps;
        if (diff.changes.rippleState !== undefined)
            newState.rippleState = diff.changes.rippleState;
        if (diff.changes.selectedClipIds !== undefined)
            newState.selectedClipIds = diff.changes.selectedClipIds;
    }
    // Apply marker changes
    if (diff.changes.markers) {
        const markers = JSON.parse(JSON.stringify(state.markers));
        const { added, removed, modified } = diff.changes.markers;
        if (reverse) {
            // Remove added markers
            if (added) {
                const addedIds = new Set(added.map(marker => marker.id));
                newState.markers = markers.filter(marker => !addedIds.has(marker.id));
            }
            // Restore removed markers
            if (removed) {
                const removedMarkers = markers.filter(marker => removed.includes(marker.id));
                newState.markers = [...newState.markers, ...removedMarkers];
            }
        }
        else {
            // Add new markers
            if (added)
                newState.markers = [...markers, ...added];
            // Remove markers
            if (removed) {
                const removedIds = new Set(removed);
                newState.markers = markers.filter(marker => !removedIds.has(marker.id));
            }
        }
        // Apply marker modifications
        if (modified) {
            modified.forEach(markerDiff => {
                const marker = newState.markers.find(m => m.id === markerDiff.id);
                if (!marker)
                    return;
                if (reverse) {
                    marker.time = markerDiff.before.time;
                    marker.label = markerDiff.before.label;
                }
                else {
                    marker.time = markerDiff.after.time;
                    marker.label = markerDiff.after.label;
                }
            });
        }
    }
    return newState;
};
const getDiffProperties = (obj1, obj2) => {
    const diff = {};
    for (const key in obj1) {
        if (obj1[key] !== obj2[key]) {
            diff[key] = obj1[key];
        }
    }
    return diff;
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("470a03d4ca8e928fd20a")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.4577864ecfbc4ea8e213.hot-update.js.map