import { StateDiff } from '../utils/historyDiff';

export type Effect = {
  id: string;
  type: string;
  parameters: Record<string, any>;
  enabled?: boolean;
  startTime?: number;
  endTime?: number;
  keyframes?: {
    time: number;
    value: any;
  }[];
};

export type Transition = {
  id: string;
  type: string;
  duration: number;
  params: Record<string, any>;
  keyframes?: {
    time: number;
    value: any;
  }[];
};

export type Layer = {
  id: string;
  index: number;
  visible: boolean;
  locked: boolean;
};

export type WaveformData = {
  peaks: number[];
  resolution: number;
  sampleRate: number;
  loaded: boolean;
  error?: string;
};

export type VideoClip = {
  id: string;
  type: 'video';
  name: string;
  startTime: number;
  endTime: number;
  src: string;
  originalDuration?: number;
  initialDuration?: number;
  maxDuration?: number;
  initialBounds?: {
    startTime: number;
    endTime: number;
    mediaOffset: number;
    mediaDuration: number;
  };
  handles?: {
    startPosition: number;
    endPosition: number;
  };
  effects: Effect[];
  thumbnail?: string;
  mediaOffset: number;
  mediaDuration: number;
  layer?: number;
  transition?: {
    in?: Transition;
    out?: Transition;
  };
  transform?: {
    scale: number;
    rotation: number;
    position: { x: number; y: number };
    opacity: number;
  };
};

export type AudioClip = {
  id: string;
  type: 'audio';
  name: string;
  startTime: number;
  endTime: number;
  src: string;
  originalDuration: number;
  initialDuration?: number;
  maxDuration?: number;
  initialBounds?: {
    startTime: number;
    endTime: number;
    mediaOffset: number;
    mediaDuration: number;
  };
  handles?: {
    startPosition: number;
    endPosition: number;
  };
  effects: Effect[];
  mediaOffset: number;
  mediaDuration: number;
  volume?: number;
  isMuted?: boolean;
  waveform?: WaveformData;
  layer?: number;
  transition?: {
    in?: Transition;
    out?: Transition;
  };
};

export type CaptionClip = {
  id: string;
  type: 'caption';
  name: string;
  startTime: number;
  endTime: number;
  text: string;
  effects: Effect[];
  captions?: Caption[];
  speakerStyles?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    speakers?: Record<string, Speaker>;
  };
  layer?: number;
  mediaOffset: number;
  mediaDuration: number;
  originalDuration: number;
  initialDuration?: number;
  maxDuration?: number;
  initialBounds?: {
    startTime: number;
    endTime: number;
    mediaOffset: number;
    mediaDuration: number;
  };
  handles?: {
    startPosition: number;
    endPosition: number;
  };
};

export type Clip = VideoClip | AudioClip | CaptionClip;
export type ClipWithLayer = Clip & { layer: number };
export type ProductionClip = VideoClip | AudioClip | CaptionClip;

// Action creator for updating clip transform
export const createUpdateClipTransformAction = (clipId: string, transform: {
  scale?: number;
  rotation?: number;
  position?: { x: number; y: number };
  opacity?: number;
}): TimelineAction => ({
  type: ActionTypes.UPDATE_CLIP,
  payload: {
    clipId,
    clip: { transform }
  }
});

export type TrackType = 'video' | 'audio' | 'caption';

export type Track = {
  id: string;
  name: string;
  type: TrackType;
  clips: ClipWithLayer[];
  isLocked?: boolean;
  isVisible?: boolean;
  isMuted?: boolean;
  layers?: Layer[];
  allowOverlap?: boolean;
  height?: number;
  color?: string;
  isEditing?: boolean;
  transitions?: TrackTransition[];
};

export type Speaker = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
};

export type Caption = {
  id: string;
  text: string;
  start: number;
  end: number;
  startTime?: number;
  endTime?: number;
  speakerId?: string;
  conf?: number;
};

export type TrackTransition = {
  id: string;
  type: string;
  clipAId: string;
  clipBId: string;
  duration: number;
};

export type Marker = {
  id: string;
  time: number;
  label: string;
  color?: string;
  type?: string;
};

export type TimelineMarker = {
  id: string;
  time: number;
  label: string;
  type: string;
  color?: string;
};

export type SnapPoint = {
  time: number;
  type: 'clip-start' | 'clip-end' | 'playhead' | 'marker';
  source: string;
};

export type ClipEffect = {
  id: string;
  type: string;
  parameters: Record<string, any>;
  keyframes?: Array<{
    time: number;
    value: any;
  }>;
};

export interface CaptionStyle {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  backgroundColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  speakers?: Record<string, Speaker>;
}

export type TimelineState = {
  tracks: Track[];
  currentTime: number;
  duration: number;
  zoom: number;
  fps: number;
  isPlaying: boolean;
  isDragging: boolean;
  scrollX: number;
  scrollY: number;
  scrollLeft: number;
  selectedClipIds: string[];
  selectedCaptionIds: string[];
  selectedTrackId?: string;
  markers: Marker[];
  dragStartX?: number;
  dragStartY?: number;
  error?: string;
  history: {
    entries: StateDiff[];
    currentIndex: number;
  };
  aspectRatio?: string;
  snapToGrid?: boolean;
  gridSize?: number;
  showWaveforms?: boolean;
  showKeyframes?: boolean;
  showTransitions?: boolean;
  showEffects?: boolean;
  renderQuality?: 'draft' | 'preview' | 'full';
  isSnappingEnabled: boolean;
};

export const ActionTypes = {
  // Timeline state
  SET_STATE: 'SET_STATE',
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
} as const;

export type ActionTypes = typeof ActionTypes[keyof typeof ActionTypes];

export type TimelineAction = {
  type: ActionTypes;
  payload?: any & {
    ripple?: boolean;
    handles?: {
      startPosition: number;
      endPosition: number;
    };
  };
};

export type TrimOptions = {
  ripple?: boolean;
  handles?: {
    startPosition: number;
    endPosition: number;
  };
};

export type TimelineContextType = {
  state: TimelineState;
  dispatch: (action: TimelineAction) => void;
};

// Re-export TimelineContextType as TimelineContextValue for backward compatibility
export type TimelineContextValue = TimelineContextType;

export const isVideoClip = (clip: Clip): clip is VideoClip => clip.type === 'video';
export const isAudioClip = (clip: Clip): clip is AudioClip => clip.type === 'audio';
export const isCaptionClip = (clip: Clip): clip is CaptionClip => clip.type === 'caption';
export const isMediaClip = (clip: Clip): clip is VideoClip | AudioClip | CaptionClip =>
  clip.type === 'video' || clip.type === 'audio' || clip.type === 'caption';

export const getMediaBounds = (clip: Clip): { offset: number; duration: number } => ({
  offset: clip.mediaOffset,
  duration: clip.mediaDuration
});

export const initialTimelineState: TimelineState = {
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
  isSnappingEnabled: true
};

export const createClip = (type: 'video' | 'audio' | 'caption', props: any): Clip => {
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
