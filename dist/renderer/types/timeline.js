"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClip = exports.createUpdateClipTransformAction = exports.initialTimelineState = exports.getMediaBounds = exports.isMediaClip = exports.isCaptionClip = exports.isAudioClip = exports.isVideoClip = exports.ActionTypes = void 0;
exports.ActionTypes = {
    // Timeline state
    SET_STATE: 'SET_STATE',
    CLEAR_STATE: 'CLEAR_STATE',
    SET_CURRENT_TIME: 'SET_CURRENT_TIME',
    SET_DURATION: 'SET_DURATION',
    SET_ZOOM: 'SET_ZOOM',
    SET_FPS: 'SET_FPS',
    SET_IS_PLAYING: 'SET_IS_PLAYING',
    SET_IS_DRAGGING: 'SET_IS_DRAGGING',
    SET_SCROLL_X: 'SET_SCROLL_X',
    SET_SCROLL_Y: 'SET_SCROLL_Y',
    SET_ERROR: 'SET_ERROR',
    SET_SNAPPING: 'SET_SNAPPING',
    // Selection
    SET_SELECTED_CLIP_IDS: 'SET_SELECTED_CLIP_IDS',
    SET_SELECTED_TRACK_ID: 'SET_SELECTED_TRACK_ID',
    SELECT_TRACK: 'SELECT_TRACK',
    SELECT_CLIPS: 'SELECT_CLIPS',
    SELECT_CAPTIONS: 'SELECT_CAPTIONS',
    // Tracks
    SET_TRACKS: 'SET_TRACKS',
    ADD_TRACK: 'ADD_TRACK',
    UPDATE_TRACK: 'UPDATE_TRACK',
    REMOVE_TRACK: 'REMOVE_TRACK',
    MOVE_TRACK: 'MOVE_TRACK',
    // Clips
    ADD_CLIP: 'ADD_CLIP',
    UPDATE_CLIP: 'UPDATE_CLIP',
    REMOVE_CLIP: 'REMOVE_CLIP',
    MOVE_CLIP: 'MOVE_CLIP',
    SPLIT_CLIP: 'SPLIT_CLIP',
    TRIM_CLIP: 'TRIM_CLIP',
    // Effects and Transitions
    ADD_EFFECT: 'ADD_EFFECT',
    UPDATE_EFFECT: 'UPDATE_EFFECT',
    REMOVE_EFFECT: 'REMOVE_EFFECT',
    ADD_TRANSITION: 'ADD_TRANSITION',
    UPDATE_TRANSITION: 'UPDATE_TRANSITION',
    REMOVE_TRANSITION: 'REMOVE_TRANSITION',
    // Markers
    SET_MARKERS: 'SET_MARKERS',
    ADD_MARKER: 'ADD_MARKER',
    UPDATE_MARKER: 'UPDATE_MARKER',
    REMOVE_MARKER: 'REMOVE_MARKER',
    // History
    PUSH_HISTORY: 'PUSH_HISTORY',
    SET_HISTORY_INDEX: 'SET_HISTORY_INDEX',
    CLEAR_HISTORY: 'CLEAR_HISTORY',
    UNDO: 'UNDO',
    REDO: 'REDO',
    RESTORE_SNAPSHOT: 'RESTORE_SNAPSHOT',
    // UI State
    SET_PLAYING: 'SET_PLAYING',
    SET_DRAGGING: 'SET_DRAGGING',
    SET_SHOW_WAVEFORMS: 'SET_SHOW_WAVEFORMS',
    SET_SHOW_KEYFRAMES: 'SET_SHOW_KEYFRAMES',
    SET_SHOW_TRANSITIONS: 'SET_SHOW_TRANSITIONS',
    SET_SHOW_EFFECTS: 'SET_SHOW_EFFECTS',
    SET_RENDER_QUALITY: 'SET_RENDER_QUALITY',
    UPDATE_CAPTION_STYLES: 'UPDATE_CAPTION_STYLES'
};
const isVideoClip = (clip) => clip.type === 'video';
exports.isVideoClip = isVideoClip;
const isAudioClip = (clip) => clip.type === 'audio';
exports.isAudioClip = isAudioClip;
const isCaptionClip = (clip) => clip.type === 'caption';
exports.isCaptionClip = isCaptionClip;
const isMediaClip = (clip) => clip.type === 'video' || clip.type === 'audio' || clip.type === 'caption';
exports.isMediaClip = isMediaClip;
const getMediaBounds = (clip) => ({
    offset: clip.mediaOffset,
    duration: clip.mediaDuration
});
exports.getMediaBounds = getMediaBounds;
exports.initialTimelineState = {
    tracks: [],
    currentTime: 0,
    duration: 0,
    zoom: 1,
    fps: 30,
    isPlaying: false,
    isDragging: false,
    scrollX: 0,
    scrollY: 0,
    scrollLeft: 0,
    selectedClipIds: [],
    selectedCaptionIds: [],
    selectedTrackId: undefined,
    markers: [],
    dragStartX: undefined,
    dragStartY: undefined,
    error: undefined,
    history: {
        entries: [],
        currentIndex: -1
    },
    aspectRatio: '16:9',
    snapToGrid: true,
    gridSize: 10,
    showWaveforms: true,
    showKeyframes: true,
    showTransitions: true,
    showEffects: true,
    renderQuality: 'preview',
    isSnappingEnabled: true,
    rippleState: {}
};
const createUpdateClipTransformAction = (trackId, clipId, transform) => ({
    type: exports.ActionTypes.UPDATE_CLIP,
    payload: {
        trackId,
        clipId,
        clip: { transform }
    }
});
exports.createUpdateClipTransformAction = createUpdateClipTransformAction;
const createClip = (type, props) => {
    const duration = props.endTime - props.startTime;
    const mediaDuration = props.mediaDuration || duration;
    const initialDuration = props.initialDuration || duration;
    const mediaOffset = props.mediaOffset || 0;
    const baseClip = {
        id: props.id || `clip-${Date.now()}`,
        name: props.name || 'Untitled Clip',
        startTime: props.startTime,
        endTime: props.endTime,
        mediaOffset,
        mediaDuration,
        originalDuration: props.originalDuration || mediaDuration,
        initialDuration,
        maxDuration: initialDuration,
        initialBounds: {
            startTime: props.startTime,
            endTime: props.endTime,
            mediaOffset,
            mediaDuration
        },
        handles: {
            startPosition: mediaOffset,
            endPosition: mediaOffset + (props.endTime - props.startTime)
        },
        effects: props.effects || []
    };
    switch (type) {
        case 'video':
            return {
                ...baseClip,
                type: 'video',
                src: props.src || '',
                transform: props.transform || {
                    scale: 1,
                    rotation: 0,
                    position: { x: 0, y: 0 },
                    opacity: 1
                }
            };
        case 'audio':
            return {
                ...baseClip,
                type: 'audio',
                src: props.src || '',
                volume: props.volume || 1,
                isMuted: props.isMuted || false
            };
        case 'caption':
            return {
                ...baseClip,
                type: 'caption',
                text: props.text || '',
                captions: props.captions || []
            };
        default:
            throw new Error(`Unsupported clip type: ${type}`);
    }
};
exports.createClip = createClip;
