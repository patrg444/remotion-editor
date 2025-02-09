"use strict";
self["webpackHotUpdateremotion_editor"]("renderer",{

/***/ "./src/renderer/utils/timelineConstants.ts":
/*!*************************************************!*\
  !*** ./src/renderer/utils/timelineConstants.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DEFAULT_FPS: () => (/* binding */ DEFAULT_FPS),
/* harmony export */   DEFAULT_TIME_FORMAT: () => (/* binding */ DEFAULT_TIME_FORMAT),
/* harmony export */   DEFAULT_TIME_OPTIONS: () => (/* binding */ DEFAULT_TIME_OPTIONS),
/* harmony export */   DEFAULT_TRANSITION_DURATION: () => (/* binding */ DEFAULT_TRANSITION_DURATION),
/* harmony export */   DEFAULT_ZOOM: () => (/* binding */ DEFAULT_ZOOM),
/* harmony export */   EFFECT_PREVIEW_RESOLUTION: () => (/* binding */ EFFECT_PREVIEW_RESOLUTION),
/* harmony export */   FRAME_RATE_OPTIONS: () => (/* binding */ FRAME_RATE_OPTIONS),
/* harmony export */   HEADER_HEIGHT: () => (/* binding */ HEADER_HEIGHT),
/* harmony export */   LAYER_SPACING: () => (/* binding */ LAYER_SPACING),
/* harmony export */   MAX_EFFECTS_PER_CLIP: () => (/* binding */ MAX_EFFECTS_PER_CLIP),
/* harmony export */   MAX_FRAME_SNAP_ZOOM: () => (/* binding */ MAX_FRAME_SNAP_ZOOM),
/* harmony export */   MAX_HISTORY_SIZE: () => (/* binding */ MAX_HISTORY_SIZE),
/* harmony export */   MAX_LAYERS: () => (/* binding */ MAX_LAYERS),
/* harmony export */   MAX_TRACK_LENGTH: () => (/* binding */ MAX_TRACK_LENGTH),
/* harmony export */   MAX_TRANSITION_DURATION: () => (/* binding */ MAX_TRANSITION_DURATION),
/* harmony export */   MAX_VISIBLE_CLIPS: () => (/* binding */ MAX_VISIBLE_CLIPS),
/* harmony export */   MAX_ZOOM: () => (/* binding */ MAX_ZOOM),
/* harmony export */   MIN_CLIP_WIDTH: () => (/* binding */ MIN_CLIP_WIDTH),
/* harmony export */   MIN_FRAME_SNAP_SPACING: () => (/* binding */ MIN_FRAME_SNAP_SPACING),
/* harmony export */   MIN_LAYER_HEIGHT: () => (/* binding */ MIN_LAYER_HEIGHT),
/* harmony export */   MIN_TRACK_WIDTH: () => (/* binding */ MIN_TRACK_WIDTH),
/* harmony export */   MIN_TRANSITION_DURATION: () => (/* binding */ MIN_TRANSITION_DURATION),
/* harmony export */   MIN_ZOOM: () => (/* binding */ MIN_ZOOM),
/* harmony export */   PIXELS_PER_SECOND: () => (/* binding */ PIXELS_PER_SECOND),
/* harmony export */   PLAYBACK_UPDATE_INTERVAL: () => (/* binding */ PLAYBACK_UPDATE_INTERVAL),
/* harmony export */   RENDER_QUALITY: () => (/* binding */ RENDER_QUALITY),
/* harmony export */   RULER_HEIGHT: () => (/* binding */ RULER_HEIGHT),
/* harmony export */   SCROLL_THROTTLE: () => (/* binding */ SCROLL_THROTTLE),
/* harmony export */   SNAP_THRESHOLD: () => (/* binding */ SNAP_THRESHOLD),
/* harmony export */   TRACK_HEIGHT: () => (/* binding */ TRACK_HEIGHT),
/* harmony export */   TRANSITION_HANDLE_SIZE: () => (/* binding */ TRANSITION_HANDLE_SIZE),
/* harmony export */   TimelineConstants: () => (/* binding */ TimelineConstants),
/* harmony export */   VIRTUAL_SCROLL_BUFFER: () => (/* binding */ VIRTUAL_SCROLL_BUFFER),
/* harmony export */   WAVEFORM_BACKGROUND: () => (/* binding */ WAVEFORM_BACKGROUND),
/* harmony export */   WAVEFORM_CHUNK_SIZE: () => (/* binding */ WAVEFORM_CHUNK_SIZE),
/* harmony export */   WAVEFORM_COLOR: () => (/* binding */ WAVEFORM_COLOR),
/* harmony export */   WAVEFORM_HEIGHT: () => (/* binding */ WAVEFORM_HEIGHT),
/* harmony export */   WAVEFORM_MAX_CHUNKS: () => (/* binding */ WAVEFORM_MAX_CHUNKS),
/* harmony export */   WAVEFORM_RESOLUTION: () => (/* binding */ WAVEFORM_RESOLUTION),
/* harmony export */   getDuration: () => (/* binding */ getDuration),
/* harmony export */   getEndTime: () => (/* binding */ getEndTime),
/* harmony export */   getScale: () => (/* binding */ getScale),
/* harmony export */   getZoom: () => (/* binding */ getZoom)
/* harmony export */ });
/**
 * Timeline constants and configuration
 */
// Scale and zoom constants
const PIXELS_PER_SECOND = 100; // Base scale at zoom level 1.0
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 10;
const DEFAULT_ZOOM = 1;
// Time formatting defaults
const DEFAULT_FPS = 30;
const DEFAULT_TIME_FORMAT = 'standard';
const DEFAULT_TIME_OPTIONS = {
    fps: DEFAULT_FPS,
    showFrames: true,
    showMilliseconds: false,
    padHours: false,
    compact: false,
    format: DEFAULT_TIME_FORMAT
};
// Clip duration handling
const getDuration = (startTime, endTime) => {
    return endTime - startTime;
};
const getEndTime = (startTime, duration) => {
    return startTime + duration;
};
// Scale conversion helpers
const getScale = (zoom) => {
    return PIXELS_PER_SECOND * zoom;
};
const getZoom = (scale) => {
    return scale / PIXELS_PER_SECOND;
};
// Frame conversion constants
const FRAME_RATE_OPTIONS = [
    23.976,
    24,
    25,
    29.97,
    30,
    50,
    59.94,
    60
];
// Snap point thresholds
const SNAP_THRESHOLD = 5; // pixels
const MIN_FRAME_SNAP_SPACING = 10; // minimum pixels between frame snap points
const MAX_FRAME_SNAP_ZOOM = 4; // maximum zoom level for frame snapping
// Virtual scroll constants
const VIRTUAL_SCROLL_BUFFER = 2.0; // buffer multiplier for virtual scrolling
const MIN_CLIP_WIDTH = 10; // minimum width in pixels to render a clip
const MAX_VISIBLE_CLIPS = 1000; // maximum number of clips to render at once
// History constants
const MAX_HISTORY_SIZE = 100; // maximum number of history entries
// Performance constants
const SCROLL_THROTTLE = 16; // ms (~ 1 frame at 60fps)
const PLAYBACK_UPDATE_INTERVAL = 16; // ms
const WAVEFORM_RESOLUTION = 2048; // samples per waveform chunk
// UI constants
const TRACK_HEIGHT = 60; // pixels
const HEADER_HEIGHT = 40; // pixels
const RULER_HEIGHT = 30; // pixels
const MIN_TRACK_WIDTH = 800; // pixels
const MAX_TRACK_LENGTH = 7200; // seconds (2 hours)
// Layer constants
const MAX_LAYERS = 10; // maximum number of layers per track
const MIN_LAYER_HEIGHT = 60; // minimum height for a layer
const LAYER_SPACING = 2; // pixels between layers
// Transition constants
const MIN_TRANSITION_DURATION = 0.5; // seconds
const MAX_TRANSITION_DURATION = 5.0; // seconds
const DEFAULT_TRANSITION_DURATION = 1.0; // seconds
const TRANSITION_HANDLE_SIZE = 10; // pixels
// Effect constants
const MAX_EFFECTS_PER_CLIP = 10;
const EFFECT_PREVIEW_RESOLUTION = 0.5; // 50% resolution for effect previews
// Waveform constants
const WAVEFORM_HEIGHT = 30; // pixels
const WAVEFORM_COLOR = '#4a9eff';
const WAVEFORM_BACKGROUND = '#2a2a2a';
const WAVEFORM_CHUNK_SIZE = 1024; // samples per chunk for streaming
const WAVEFORM_MAX_CHUNKS = 100; // maximum chunks to keep in memory
// Render quality settings
const RENDER_QUALITY = {
    draft: {
        resolution: 0.5,
        effects: false,
        transitions: false
    },
    preview: {
        resolution: 0.75,
        effects: true,
        transitions: true
    },
    full: {
        resolution: 1.0,
        effects: true,
        transitions: true
    }
};
// Export these grouped constants for easier imports
const TimelineConstants = {
    Scale: {
        PIXELS_PER_SECOND: 100,
        MIN_ZOOM: 0.1,
        MAX_ZOOM: 10,
        DEFAULT_ZOOM: 1,
        getScale: (zoom) => (zoom / 50) * TimelineConstants.Scale.PIXELS_PER_SECOND,
        getZoom: (scale) => (scale / TimelineConstants.Scale.PIXELS_PER_SECOND) * 50
    },
    MIN_DURATION: 0.1,
    MAX_CLIP_DURATION: 1800.0,
    Time: {
        DEFAULT_FPS,
        DEFAULT_TIME_FORMAT,
        DEFAULT_TIME_OPTIONS,
        FRAME_RATE_OPTIONS,
        getDuration,
        getEndTime
    },
    Snapping: {
        SNAP_THRESHOLD,
        MIN_FRAME_SNAP_SPACING,
        MAX_FRAME_SNAP_ZOOM
    },
    VirtualScroll: {
        VIRTUAL_SCROLL_BUFFER,
        MIN_CLIP_WIDTH,
        MAX_VISIBLE_CLIPS
    },
    History: {
        MAX_HISTORY_SIZE
    },
    Performance: {
        SCROLL_THROTTLE,
        PLAYBACK_UPDATE_INTERVAL,
        WAVEFORM_RESOLUTION
    },
    UI: {
        TRACK_HEIGHT,
        HEADER_HEIGHT,
        RULER_HEIGHT,
        MIN_TRACK_WIDTH,
        MAX_TRACK_LENGTH
    },
    Layers: {
        MAX_LAYERS,
        MIN_LAYER_HEIGHT,
        LAYER_SPACING
    },
    Transitions: {
        MIN_DURATION: MIN_TRANSITION_DURATION,
        MAX_DURATION: MAX_TRANSITION_DURATION,
        DEFAULT_DURATION: DEFAULT_TRANSITION_DURATION,
        HANDLE_SIZE: TRANSITION_HANDLE_SIZE,
        ADJACENCY_TOLERANCE: 0.1 // 100ms tolerance for clip adjacency
    },
    Effects: {
        MAX_PER_CLIP: MAX_EFFECTS_PER_CLIP,
        PREVIEW_RESOLUTION: EFFECT_PREVIEW_RESOLUTION
    },
    Waveform: {
        HEIGHT: WAVEFORM_HEIGHT,
        COLOR: WAVEFORM_COLOR,
        BACKGROUND: WAVEFORM_BACKGROUND,
        CHUNK_SIZE: WAVEFORM_CHUNK_SIZE,
        MAX_CHUNKS: WAVEFORM_MAX_CHUNKS
    },
    RenderQuality: RENDER_QUALITY
};


/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ /* webpack/runtime/getFullHash */
/******/ (() => {
/******/ 	__webpack_require__.h = () => ("0a20afaf6c10eb83cdb7")
/******/ })();
/******/ 
/******/ }
);
//# sourceMappingURL=renderer.51743fdd26f653f02978.hot-update.js.map