import { TimelineState, Effect, Speaker, Clip, Track } from './timeline';
import { KeyframeTrack } from './keyframe';

export interface TimelineDisplayProps {
  currentTime: number;
  duration: number;
  fps: number;
}

export interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward?: () => void;
  onStepBackward?: () => void;
  onTimeChange?: (time: number) => void;
  currentTime: number;
  duration: number;
}

export interface TimelineRulerProps {
  scale: number;
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  zoom: number;
  fps: number;
  containerWidth: number;
  scrollLeft: number;
  type?: 'main' | 'mini';
}

export interface TimelinePlayheadProps {
  currentTime: number;
  scale: number;
  onTimeChange: (time: number) => void;
  isPlaying: boolean;
}

export interface TimelinePointProps {
  time: number;
  scale: number;
  type: 'marker' | 'clip' | 'playhead';
  label?: string;
  color?: string;
  isSelected?: boolean;
  zoom: number;
  onClick?: (time: number) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export interface TimelineTransitionHandleProps {
  position: number;
  onPositionChange: (position: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  snapThreshold?: number;
}

export interface TimelineContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  items: {
    label: string;
    action: () => void;
    disabled?: boolean;
    shortcut?: string;
  }[];
}

export interface TimelineShortcutsHelpProps {
  onClose: () => void;
  shortcuts: {
    key: string;
    description: string;
    category: string;
  }[];
}

export interface TimelineHeaderProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  fps: number;
  onFpsChange: (fps: number) => void;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
}

export interface TimelineClipContentProps {
  clip: Clip;
  scale: number;
  isSelected: boolean;
}

export interface TimelineTrackProps {
  track: Track;
  selectedClipIds: string[];
  onSelectClip: (clipId: string) => void;
  onClipDragStart: (clipId: string) => void;
  onClipDragEnd: () => void;
  scale: number;
  fps: number;
}

export interface TimelineTracksProps {
  tracks: Track[];
  selectedTrackId?: string;
  selectedClipIds: string[];
  onTrackSelect: (trackId: string) => void;
  onClipSelect: (clipId: string) => void;
  onClipDragStart: (clipId: string) => void;
  onClipDragEnd: () => void;
  scale: number;
  fps: number;
}

export interface ActivationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: (key: string) => Promise<void>;
  error?: string;
}

export interface CompositeRendererProps {
  width: number;
  height: number;
  currentTime: number;
  tracks: Track[];
  zoom: number;
  fps: number;
  track?: Track;
  isPlaying?: boolean;
  onRenderComplete?: () => void;
  onRenderError?: (error: Error) => void;
}

export interface FrameCounterProps {
  currentFrame: number;
  totalFrames: number;
  fps: number;
}

export interface FrameRateIndicatorProps {
  frameRate: number;
  targetFrameRate?: number;
}

export interface LoadingOverlayProps {
  message?: string;
  progress?: number;
  isVisible?: boolean;
  isLoading?: boolean;
}

export interface ExportOverlayProps {
  progress: number;
  currentFrame: number;
  totalFrames: number;
  onCancel: () => void;
  isVisible?: boolean;
  isExporting?: boolean;
  filename?: string;
}

export interface UpgradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  features: string[];
  onUpgrade: () => void;
}

export interface VolumeEnvelopeProps {
  clipId: string;
  duration: number;
  playheadTime: number;
  onVolumeChange?: (volume: number) => void;
  isSelected: boolean;
}

export interface Transform {
  scale: number;
  rotation: number;
  position: { x: number; y: number };
  opacity: number;
}

export interface CaptionStyle {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  strokeWidth?: number;
  strokeColor?: string;
  speakers?: Record<string, Speaker>;
}

export interface TimelineProps {
  state: TimelineState;
  dispatch: (action: any) => void;
  width?: number;
  height?: number;
}

export interface TimelineClipProps {
  clip: Clip;
  isSelected: boolean;
  scale: number;
  onSelect: (clipId: string) => void;
  onDragStart: (clipId: string) => void;
  onDragEnd: () => void;
}

export interface KeyframeEditorProps<T = any> {
  track: KeyframeTrack<T>;
  currentTime: number;
  duration: number;
  onChange: (track: KeyframeTrack<T>) => void;
}

export interface WaveformRendererProps {
  audioBuffer: AudioBuffer;
  width: number;
  height: number;
  color?: string;
  style?: React.CSSProperties;
}

export interface GPUMonitorProps {
  onClose?: () => void;
}

export interface PerformanceMonitorProps {
  onClose?: () => void;
}
