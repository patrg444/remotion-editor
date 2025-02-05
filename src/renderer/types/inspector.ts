import type { ClipEffect, ProductionClip, Track, Transition } from './timeline';

// Additional inspector-specific types
export interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export interface ToggleInputProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export interface EffectParameter {
  id: string;
  name: string;
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface KeyframeControlsProps {
  effectId: string;
  paramId: string;
  min?: number;
  max?: number;
  step?: number;
  onRemoveTrack: () => void;
}

export interface EffectInspectorProps {
  effect: ClipEffect;
  parameters: EffectParameter[];
  onUpdate: (updates: Partial<ClipEffect>) => void;
  onAddKeyframeTrack: (paramId: string, defaultValue: number, min?: number, max?: number, step?: number) => void;
  onRemoveKeyframeTrack: (paramId: string) => void;
}

export interface ClipInspectorProps {
  clip: ProductionClip;
  onUpdate: (updates: Partial<ProductionClip>) => void;
  onEffectUpdate: (effectId: string, updates: Partial<ClipEffect>) => void;
}

export interface TrackInspectorProps {
  track: Track;
  onUpdate: (updates: Partial<Track>) => void;
}

export interface InspectorProps {
  selectedClip?: ProductionClip;
  selectedTrack?: Track;
  selectedTransition?: Transition;
  onClipUpdate: (clipId: string, updates: Partial<ProductionClip>) => void;
  onTrackUpdate: (trackId: string, updates: Partial<Track>) => void;
  onEffectUpdate: (clipId: string, effectId: string, updates: Partial<ClipEffect>) => void;
  onTransitionUpdate?: (transitionId: string, updates: Partial<Transition> | null) => void;
  className?: string;
  progress?: number;
}
