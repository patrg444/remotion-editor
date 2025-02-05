import { VideoClip } from '../renderer/types/timeline';
import { Keyframe } from '../renderer/types/keyframe';

export type AspectRatio = '16:9' | '9:16' | '1:1';

export type LayoutMode = 'single' | 'horizontal' | 'vertical' | 'grid';

export interface LayoutCell {
  x: number;
  y: number;
  width: number;
  height: number;
  padding: number;
}

export interface FaceLayout {
  mode: LayoutMode;
  rows: number;
  columns: number;
  cells: LayoutCell[];
  aspectRatio: AspectRatio;
  isUserOverride?: boolean;
}

export interface NeutralZoneSettings {
  size: number;        // Size of neutral zone relative to frame (0-1)
  position: {          // Center position of neutral zone
    x: number;        // Relative to frame (0-1)
    y: number;        // Relative to frame (0-1)
  };
  reframeThreshold: number;  // How far face must move outside zone to trigger reframe (0-1)
  reframeSpeed: number;      // How quickly to reframe when threshold exceeded (0-1)
}

export interface FaceTrackingConfig {
  minFaceSize: number;
  maxFaceSize: number;
  minConfidence: number;
  tracking: boolean;
  modelPath: string;
  samplingRate: number;
  useGPU: boolean;
  smoothing: number;
  zoom: number;
  neutralZone: NeutralZoneSettings;
}

export interface FaceTrackingSettings extends FaceTrackingConfig {
  enabled: boolean;
}

export interface FaceTrackingFrame {
  time: number;
  bbox: [number, number, number, number];
  landmarks?: [number, number][];
  confidence: number;
  rotation?: number;
  pitch?: number;
}

export interface FaceData {
  id: string;
  frames: FaceTrackingFrame[];
  thumbnail?: string; // Base64 thumbnail of the face
  confidence: number;
}

export interface SpeakerFaceMapping {
  speakerId: string;
  faceId: string;
  color?: string;
}

export interface FaceTrackingKeyframes {
  trackedFaces: Keyframe<string[]>[];  // Array of face IDs at each keyframe
  layoutMode: Keyframe<LayoutMode>[];
  zoom: Keyframe<number>[];
  smoothing: Keyframe<number>[];
  speakerMappings: Keyframe<SpeakerFaceMapping[]>[]; 
  neutralZone: Keyframe<NeutralZoneSettings>[];  // Neutral zone settings can be keyframed
}

export interface FaceTrackingData {
  faces: FaceData[];
  keyframes: FaceTrackingKeyframes;
  layout?: FaceLayout;
  trackingData?: {
    [key: string]: {
      faces: FaceData[];
      bbox: [number, number, number, number];
      landmarks?: [number, number][];
    };
  };
  speakerMappings?: SpeakerFaceMapping[];
  diarizationEnabled?: boolean;
}

export interface VideoClipWithFaceTracking extends VideoClip {
  faceTracking?: FaceTrackingData & {
    enabled: boolean;
  };
}

export interface FaceTrackingSuccessResult {
  success: true;
  faces: FaceData[];
}

export interface FaceTrackingErrorResult {
  success: false;
  error: string;
}

export type FaceTrackingResult = FaceTrackingSuccessResult | FaceTrackingErrorResult;

export interface FaceTrackingClipData {
  enabled: boolean;
  faces: FaceData[];
  keyframes: FaceTrackingKeyframes;
  layout?: FaceLayout;
  trackingData?: {
    [key: string]: {
      faces: FaceData[];
      bbox: [number, number, number, number];
      landmarks?: [number, number][];
    };
  };
  speakerMappings?: SpeakerFaceMapping[];
  diarizationEnabled?: boolean;
}

// Layout Preview Types
export interface LayoutPreview {
  id: string;
  name: string;
  aspectRatio: AspectRatio;
  numFaces: number;
  layout: FaceLayout;
  thumbnail?: string; // SVG or base64 preview
}

export interface LayoutOptions {
  aspectRatio: AspectRatio;
  numFaces: number;
  mode?: LayoutMode;
  userOverride?: boolean;
  padding?: number;
}

// Inspector Panel Types
export interface FaceTrackingInspectorState {
  enabled: boolean;
  selectedFaces: string[];
  layoutMode: LayoutMode;
  zoom: number;
  smoothing: number;
  isProcessing: boolean;
  error?: string;
  diarizationEnabled: boolean;
  speakerMappings: SpeakerFaceMapping[];
  neutralZone: NeutralZoneSettings;
}

export interface FaceTrackingInspectorActions {
  toggleEnabled: () => void;
  updateSelectedFaces: (faceIds: string[]) => void;
  updateLayoutMode: (mode: LayoutMode) => void;
  updateZoom: (zoom: number) => void;
  updateSmoothing: (smoothing: number) => void;
  addKeyframe: (param: keyof FaceTrackingKeyframes, time: number, value: any) => void;
  removeKeyframe: (param: keyof FaceTrackingKeyframes, time: number) => void;
  toggleDiarization: () => void;
  updateSpeakerMapping: (mapping: SpeakerFaceMapping) => void;
  removeSpeakerMapping: (speakerId: string) => void;
  updateNeutralZone: (settings: Partial<NeutralZoneSettings>) => void;
}
