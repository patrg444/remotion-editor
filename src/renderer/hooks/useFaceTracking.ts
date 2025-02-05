import { useState, useEffect } from 'react';
import { VideoClipWithFaceTracking, SpeakerFaceMapping, FaceTrackingSettings, FaceLayout, LayoutMode } from '../../types/face-tracking';
import { KeyframeTrack } from '../types/keyframe';
import { InterpolationType } from '../keyframes/types';
import { AspectRatio } from '../../types/face-tracking';
import { useKeyframes } from './useKeyframes';

interface FaceTrackingKeyframes {
  trackedFaces: KeyframeTrack<string>;
  layoutMode: KeyframeTrack<string>;
  zoom: KeyframeTrack<number>;
  smoothing: KeyframeTrack<number>;
  speakerMappings: KeyframeTrack<string>;
  neutralZone: KeyframeTrack<string>;
}

interface UseFaceTrackingResult {
  isProcessing: boolean;
  error: string | null;
  settings: FaceTrackingSettings;
  layout: FaceLayout | undefined;
  keyframes: FaceTrackingKeyframes;
  isTracking: boolean;
  diarizationEnabled: boolean;
  speakerMappings: SpeakerFaceMapping[];
  currentTrackedFaces: string[];
  toggleFaceTracking: () => void;
  toggleDiarization: () => void;
  updateSpeakerMapping: (mapping: SpeakerFaceMapping) => void;
  removeSpeakerMapping: (speakerId: string) => void;
  updateTrackedFaces: (faces: string[], time: number) => void;
  updateLayoutMode: (mode: LayoutMode, time: number) => void;
  updateZoom: (zoom: number, time: number) => void;
  updateSmoothing: (smoothing: number, time: number) => void;
  updateLayout: (layout: FaceLayout, time: number) => void;
  updateNeutralZone: (neutralZone: {
    size: number;
    position: { x: number; y: number };
    reframeThreshold: number;
    reframeSpeed: number;
  }, time: number) => void;
  getTrack: (trackId: string) => KeyframeTrack<any>;
}

// Shared state for persistence across clips
const sharedState = {
  diarizationEnabled: false,
  zoom: 1.0,
  smoothing: 0.5,
  layoutMode: 'horizontal' as LayoutMode,
  neutralZone: {
    size: 0.3,
    position: { x: 0.5, y: 0.5 },
    reframeThreshold: 0.2,
    reframeSpeed: 0.5
  }
};

// Default track factory functions
const createDefaultTrack = <T extends string | number>(
  id: string,
  property: string,
  defaultValue: T
): KeyframeTrack<T> => ({
  id,
  paramId: property,
  property,
  defaultValue,
  keyframes: [],
  getValue: () => defaultValue
});

export const useFaceTracking = (clip: VideoClipWithFaceTracking, aspectRatio: AspectRatio): UseFaceTrackingResult => {
  const {
    createTrack,
    addKeyframe,
    getTrack: getKeyframeTrack,
    keyframeState
  } = useKeyframes();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<FaceTrackingSettings>({
    enabled: false,
    minFaceSize: 0.1,
    maxFaceSize: 0.5,
    minConfidence: 0.8,
    tracking: true,
    modelPath: '/path/to/model',
    samplingRate: 30,
    useGPU: false,
    smoothing: sharedState.smoothing,
    zoom: sharedState.zoom,
    neutralZone: sharedState.neutralZone
  });
  const [diarizationEnabled, setDiarizationEnabled] = useState(sharedState.diarizationEnabled);
  const [speakerMappings, setSpeakerMappings] = useState<SpeakerFaceMapping[]>([]);
  const [currentTrackedFaces, setCurrentTrackedFaces] = useState<string[]>([]);
  const [currentLayoutMode, setCurrentLayoutMode] = useState<LayoutMode>(sharedState.layoutMode);
  const [currentZoom, setCurrentZoom] = useState(sharedState.zoom);
  const [currentSmoothing, setCurrentSmoothing] = useState(sharedState.smoothing);
  const [currentNeutralZone, setCurrentNeutralZone] = useState(sharedState.neutralZone);

  // Update layout mode when aspect ratio changes
  useEffect(() => {
    if (settings.enabled && currentTrackedFaces.length > 1) {
      const newMode = aspectRatio === '9:16' ? 'vertical' : 'horizontal';
      setCurrentLayoutMode(newMode);
      sharedState.layoutMode = newMode;
    }
  }, [aspectRatio, settings.enabled, currentTrackedFaces.length]);

  // Initialize tracks
  useEffect(() => {
    if (!keyframeState.tracks['face-tracking-layout']) {
      createTrack<string>('face-tracking-layout', 'layout', sharedState.layoutMode);
      addKeyframe('face-tracking-layout', 0, sharedState.layoutMode, InterpolationType.Step);
    }
    if (!keyframeState.tracks['face-tracking-zoom']) {
      createTrack<number>('face-tracking-zoom', 'zoom', sharedState.zoom, 0.1, 5.0, 0.1);
      addKeyframe('face-tracking-zoom', 0, sharedState.zoom, InterpolationType.Linear);
    }
    if (!keyframeState.tracks['face-tracking-smoothing']) {
      createTrack<number>('face-tracking-smoothing', 'smoothing', sharedState.smoothing, 0, 1, 0.1);
      addKeyframe('face-tracking-smoothing', 0, sharedState.smoothing, InterpolationType.Linear);
    }
    if (!keyframeState.tracks['face-tracking-neutral-zone']) {
      createTrack<string>('face-tracking-neutral-zone', 'neutral-zone', JSON.stringify(sharedState.neutralZone));
      addKeyframe('face-tracking-neutral-zone', 0, JSON.stringify(sharedState.neutralZone), InterpolationType.Linear);
    }
    if (!keyframeState.tracks['face-tracking-speaker-mappings']) {
      createTrack<string>('face-tracking-speaker-mappings', 'speaker-mappings', '[]');
      addKeyframe('face-tracking-speaker-mappings', 0, '[]', InterpolationType.Step);
    }
    if (!keyframeState.tracks['face-tracking-tracked-faces']) {
      createTrack<string>('face-tracking-tracked-faces', 'tracked-faces', JSON.stringify([]));
      addKeyframe('face-tracking-tracked-faces', 0, JSON.stringify([]), InterpolationType.Step);
    }
  }, [createTrack, addKeyframe, keyframeState]);

  // Update layout mode based on aspect ratio
  useEffect(() => {
    if (aspectRatio && settings.enabled && currentTrackedFaces.length > 1) {
      const newMode = aspectRatio === '9:16' ? 'vertical' : 'horizontal';
      sharedState.layoutMode = newMode;
      addKeyframe('face-tracking-layout', 0, newMode, InterpolationType.Step);
    }
  }, [aspectRatio, settings.enabled, currentTrackedFaces.length, addKeyframe]);

  // Wrapper for getTrack that provides default tracks
  const getTrack = (trackId: string): KeyframeTrack<any> => {
    const track = getKeyframeTrack(trackId);
    if (track) return track;

    // Return default tracks if not found
    switch (trackId) {
      case 'face-tracking-layout':
        return createDefaultTrack('face-tracking-layout', 'layout', sharedState.layoutMode);
      case 'face-tracking-zoom':
        return createDefaultTrack('face-tracking-zoom', 'zoom', sharedState.zoom);
      case 'face-tracking-smoothing':
        return createDefaultTrack('face-tracking-smoothing', 'smoothing', sharedState.smoothing);
      case 'face-tracking-neutral-zone':
        return createDefaultTrack('face-tracking-neutral-zone', 'neutral-zone', JSON.stringify(sharedState.neutralZone));
      case 'face-tracking-speaker-mappings':
        return createDefaultTrack('face-tracking-speaker-mappings', 'speaker-mappings', '[]');
      case 'face-tracking-tracked-faces':
        return createDefaultTrack('face-tracking-tracked-faces', 'tracked-faces', JSON.stringify([]));
      default:
        return createDefaultTrack(trackId, trackId, '');
    }
  };

  return {
    isProcessing,
    error,
    settings,
    layout: undefined,
    keyframes: {
      trackedFaces: getTrack('face-tracking-tracked-faces') as KeyframeTrack<string>,
      layoutMode: getTrack('face-tracking-layout') as KeyframeTrack<string>,
      zoom: getTrack('face-tracking-zoom') as KeyframeTrack<number>,
      smoothing: getTrack('face-tracking-smoothing') as KeyframeTrack<number>,
      speakerMappings: getTrack('face-tracking-speaker-mappings') as KeyframeTrack<string>,
      neutralZone: getTrack('face-tracking-neutral-zone') as KeyframeTrack<string>
    },
    isTracking: settings.enabled,
    diarizationEnabled,
    speakerMappings,
    currentTrackedFaces,
    toggleFaceTracking: () => {
      setSettings(prev => {
        const enabled = !prev.enabled;
        if (enabled) {
          setCurrentTrackedFaces(clip.faceTracking?.faces?.map(f => f.id) ?? []);
          const newMode = aspectRatio === '9:16' ? 'vertical' : 'horizontal';
          setCurrentLayoutMode(newMode);
          sharedState.layoutMode = newMode;
        } else {
          setCurrentTrackedFaces([]);
        }
        return { ...prev, enabled };
      });
    },
    toggleDiarization: () => {
      const newValue = !diarizationEnabled;
      setDiarizationEnabled(newValue);
      sharedState.diarizationEnabled = newValue;
    },
    updateSpeakerMapping: (mapping: SpeakerFaceMapping, time: number = 0) => {
      setSpeakerMappings(prev => {
        const filtered = prev.filter(m => m.speakerId !== mapping.speakerId);
        const newMappings = [...filtered, mapping];
        addKeyframe('face-tracking-speaker-mappings', time, JSON.stringify(newMappings), InterpolationType.Step);
        return newMappings;
      });
    },
    removeSpeakerMapping: (speakerId: string, time: number = 0) => {
      setSpeakerMappings(prev => {
        const newMappings = prev.filter(m => m.speakerId !== speakerId);
        addKeyframe('face-tracking-speaker-mappings', time, JSON.stringify(newMappings), InterpolationType.Step);
        return newMappings;
      });
    },
    updateTrackedFaces: (faces: string[], time: number = 0) => {
      setCurrentTrackedFaces(faces);
      if (faces.length > 1) {
        const newMode = aspectRatio === '9:16' ? 'vertical' : 'horizontal';
        setCurrentLayoutMode(newMode);
        sharedState.layoutMode = newMode;
        addKeyframe('face-tracking-layout', time, newMode, InterpolationType.Step);
      }
      addKeyframe('face-tracking-tracked-faces', time, JSON.stringify(faces), InterpolationType.Step);
    },
    updateLayoutMode: (mode: LayoutMode, time: number = 0) => {
      setCurrentLayoutMode(mode);
      sharedState.layoutMode = mode;
      addKeyframe('face-tracking-layout', time, mode, InterpolationType.Step);
    },
    updateZoom: (zoom: number, time: number = 0) => {
      setCurrentZoom(zoom);
      sharedState.zoom = zoom;
      setSettings(prev => ({
        ...prev,
        zoom
      }));
      addKeyframe('face-tracking-zoom', time, zoom, InterpolationType.Linear);
    },
    updateSmoothing: (smoothing: number, time: number = 0) => {
      setCurrentSmoothing(smoothing);
      sharedState.smoothing = smoothing;
      setSettings(prev => ({
        ...prev,
        smoothing
      }));
      addKeyframe('face-tracking-smoothing', time, smoothing, InterpolationType.Linear);
    },
    updateLayout: (layout: FaceLayout, time: number) => {
      // Layout updates are handled through layoutMode changes
    },
    updateNeutralZone: (neutralZone: typeof sharedState.neutralZone, time: number = 0) => {
      setCurrentNeutralZone(neutralZone);
      sharedState.neutralZone = neutralZone;
      setSettings(prev => ({
        ...prev,
        neutralZone
      }));
      addKeyframe('face-tracking-neutral-zone', time, JSON.stringify(neutralZone), InterpolationType.Linear);
    },
    getTrack
  };
};

export default useFaceTracking;
