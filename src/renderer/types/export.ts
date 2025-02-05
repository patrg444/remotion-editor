export interface ExportSettings {
  title: string;
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  format: 'mp4' | 'webm' | 'gif';
  quality: 'low' | 'medium' | 'high';
  bitrate?: number;
  inPoint?: number;
  outPoint?: number;
  duration?: number;
}

export interface SocialPlatformConfig {
  id: string;
  name: string;
  icon: string;
  isConnected: boolean;
  supportedFormats: string[];
  maxDuration?: number;
  maxFileSize?: number;
}

export interface SocialMetadata {
  title: string;
  description: string;
  hashtags: string[];
  thumbnail?: string;
  scheduledTime?: Date;
  platforms: {
    [platformId: string]: {
      enabled: boolean;
      customTitle?: string;
      customDescription?: string;
      customHashtags?: string[];
    };
  };
}

export interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings, metadata: SocialMetadata) => void;
  defaultSettings?: Partial<ExportSettings>;
  defaultMetadata?: Partial<SocialMetadata>;
  availablePlatforms: SocialPlatformConfig[];
  projectDuration: number;
  className?: string;
}

export interface PlatformSelectorProps {
  platforms: SocialPlatformConfig[];
  selectedPlatforms: { [platformId: string]: boolean };
  onPlatformToggle: (platformId: string, enabled: boolean) => void;
}

export interface ExportSettingsFormProps {
  settings: ExportSettings;
  onChange: (settings: ExportSettings) => void;
  platforms: SocialPlatformConfig[];
}

export interface SocialMetadataFormProps {
  metadata: SocialMetadata;
  onChange: (metadata: SocialMetadata) => void;
  platforms: SocialPlatformConfig[];
}

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  title: 'My Video',
  resolution: {
    width: 1920,
    height: 1080
  },
  frameRate: 30,
  format: 'mp4',
  quality: 'high',
  inPoint: 0,
  outPoint: undefined,
  duration: undefined
};

export const DEFAULT_SOCIAL_METADATA: SocialMetadata = {
  title: '',
  description: '',
  hashtags: [],
  platforms: {}
};

export const COMMON_RESOLUTIONS = [
  { width: 1920, height: 1080, label: '1080p' },
  { width: 1280, height: 720, label: '720p' },
  { width: 854, height: 480, label: '480p' },
  { width: 640, height: 360, label: '360p' },
  // Social media specific
  { width: 1080, height: 1920, label: 'Instagram Story' },
  { width: 1080, height: 1080, label: 'Instagram Square' },
  { width: 1200, height: 630, label: 'Facebook Link' }
];

export const COMMON_FRAME_RATES = [24, 30, 60];

export const VIDEO_QUALITIES = [
  { value: 'low', label: 'Low', bitrate: 2500000 },
  { value: 'medium', label: 'Medium', bitrate: 5000000 },
  { value: 'high', label: 'High', bitrate: 8000000 }
];
