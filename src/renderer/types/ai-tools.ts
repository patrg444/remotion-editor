export interface AIFeatureConfig {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  isProcessing?: boolean;
  confidence?: number;
  settings?: Record<string, any>;
}

export interface AutoCaptionConfig extends AIFeatureConfig {
  settings: {
    language: string;
    style: 'subtitle' | 'caption';
    position: 'bottom' | 'top';
    autoTranslate: boolean;
  };
}

export interface AutoFramingConfig extends AIFeatureConfig {
  settings: {
    mode: 'face' | 'object' | 'action';
    strength: number;
    smoothing: number;
    padding: number;
  };
}

export interface EmotionDetectionConfig extends AIFeatureConfig {
  settings: {
    sensitivity: number;
    minConfidence: number;
    highlightIntensity: number;
  };
}

export interface AISegment {
  id: string;
  type: 'highlight' | 'suggestion' | 'warning';
  startTime: number;
  endTime: number;
  confidence: number;
  category: string;
  description: string;
  metadata: Record<string, any>;
}

export interface AIToolsPanelProps {
  features: {
    autoCaption?: AutoCaptionConfig;
    autoFraming?: AutoFramingConfig;
    emotionDetection?: EmotionDetectionConfig;
  };
  segments: AISegment[];
  onFeatureToggle: (featureId: string, enabled: boolean) => void;
  onFeatureSettingsChange: (featureId: string, settings: Record<string, any>) => void;
  onSegmentSelect: (segmentId: string) => void;
  onSegmentApply: (segmentId: string) => void;
  onSegmentDismiss: (segmentId: string) => void;
  className?: string;
}

export interface AIFeatureCardProps {
  feature: AIFeatureConfig;
  onToggle: (enabled: boolean) => void;
  onSettingsChange: (settings: Record<string, any>) => void;
}

export interface AISegmentListProps {
  segments: AISegment[];
  onSelect: (segmentId: string) => void;
  onApply: (segmentId: string) => void;
  onDismiss: (segmentId: string) => void;
}

export const AI_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' }
];

export const DEFAULT_AUTO_CAPTION_CONFIG: AutoCaptionConfig = {
  id: 'autoCaption',
  name: 'Auto Caption',
  description: 'Automatically generate and sync captions',
  isEnabled: false,
  settings: {
    language: 'en',
    style: 'subtitle',
    position: 'bottom',
    autoTranslate: false
  }
};

export const DEFAULT_AUTO_FRAMING_CONFIG: AutoFramingConfig = {
  id: 'autoFraming',
  name: 'Smart Framing',
  description: 'Automatically adjust framing for subjects',
  isEnabled: false,
  settings: {
    mode: 'face',
    strength: 0.5,
    smoothing: 0.3,
    padding: 0.1
  }
};

export const DEFAULT_EMOTION_DETECTION_CONFIG: EmotionDetectionConfig = {
  id: 'emotionDetection',
  name: 'Emotion Detection',
  description: 'Detect and highlight emotional moments',
  isEnabled: false,
  settings: {
    sensitivity: 0.7,
    minConfidence: 0.6,
    highlightIntensity: 0.5
  }
};
