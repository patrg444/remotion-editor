import React, { useState, useEffect } from 'react';
import {
  ExportSettings,
  SocialMetadata,
  ExportDialogProps,
  DEFAULT_EXPORT_SETTINGS,
  DEFAULT_SOCIAL_METADATA,
  COMMON_RESOLUTIONS,
  COMMON_FRAME_RATES,
  VIDEO_QUALITIES,
  PlatformSelectorProps,
  ExportSettingsFormProps,
  SocialMetadataFormProps
} from '../types/export';
import { useFileOperations } from '../hooks/useFileOperations';
import '../styles/export-dialog.css';

interface ExportError {
  message: string;
  field?: string;
}

interface ExportProgress {
  percent: number;
  status: string;
}

interface IncompleteExport {
  title: string;
  progress: number;
  timestamp: number;
}

const PlatformSelector: React.FC<PlatformSelectorProps> = ({
  platforms,
  selectedPlatforms,
  onPlatformToggle
}) => (
  <div className="platform-selector">
    <h3>Share To</h3>
    <div className="platform-grid">
      {platforms.map(platform => (
        <div
          key={platform.id}
          className={`platform-item ${platform.isConnected ? '' : 'disabled'}`}
          onClick={() => platform.isConnected && onPlatformToggle(platform.id, !selectedPlatforms[platform.id])}
        >
          <img src={platform.icon} alt={platform.name} />
          <span className="platform-name">{platform.name}</span>
          <input
            type="checkbox"
            checked={selectedPlatforms[platform.id] || false}
            disabled={!platform.isConnected}
            onChange={(e) => platform.isConnected && onPlatformToggle(platform.id, e.target.checked)}
          />
          {!platform.isConnected && (
            <div className="platform-connect">
              <button>Connect</button>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const ExportSettingsForm: React.FC<ExportSettingsFormProps> = ({
  settings,
  onChange,
  platforms
}) => (
  <div className="export-settings-form">
    <h3>Export Settings</h3>
    <div className="settings-grid">
      <div className="setting-group">
        <label htmlFor="project-title">Project Title</label>
        <input
          id="project-title"
          aria-label="Project Title"
          type="text"
          value={settings.title}
          onChange={(e) => onChange({
            ...settings,
            title: e.target.value
          })}
        />
      </div>

      <div className="setting-group">
        <label htmlFor="output-resolution">Output Resolution</label>
        <select
          id="output-resolution"
          aria-label="Output Resolution"
          value={`${settings.resolution.width}x${settings.resolution.height}`}
          onChange={(e) => {
            const [width, height] = e.target.value.split('x').map(Number);
            onChange({
              ...settings,
              resolution: { width, height }
            });
          }}
        >
          {COMMON_RESOLUTIONS.map(res => (
            <option key={res.label} value={`${res.width}x${res.height}`}>
              {res.label} ({res.width}x{res.height})
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="frame-rate">Frame Rate</label>
        <select
          id="frame-rate"
          value={settings.frameRate}
          onChange={(e) => onChange({
            ...settings,
            frameRate: Number(e.target.value)
          })}
        >
          {COMMON_FRAME_RATES.map(fps => (
            <option key={fps} value={fps}>{fps} FPS</option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="format">Format</label>
        <select
          id="format"
          value={settings.format}
          onChange={(e) => onChange({
            ...settings,
            format: e.target.value as ExportSettings['format']
          })}
        >
          <option value="mp4">MP4</option>
          <option value="webm">WebM</option>
          <option value="gif">GIF</option>
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="quality">Quality</label>
        <select
          id="quality"
          value={settings.quality}
          onChange={(e) => onChange({
            ...settings,
            quality: e.target.value as ExportSettings['quality']
          })}
        >
          {VIDEO_QUALITIES.map(quality => (
            <option key={quality.value} value={quality.value}>
              {quality.label}
            </option>
          ))}
        </select>
      </div>

      <div className="setting-group">
        <label htmlFor="in-point">In Point</label>
        <input
          id="in-point"
          aria-label="In Point"
          type="number"
          min="0"
          value={settings.inPoint || 0}
          onChange={(e) => onChange({
            ...settings,
            inPoint: Number(e.target.value)
          })}
        />
      </div>

      <div className="setting-group">
        <label htmlFor="out-point">Out Point</label>
        <input
          id="out-point"
          aria-label="Out Point"
          type="number"
          min="0"
          value={settings.outPoint || settings.duration}
          onChange={(e) => onChange({
            ...settings,
            outPoint: Number(e.target.value)
          })}
        />
      </div>
    </div>
  </div>
);

const SocialMetadataForm: React.FC<SocialMetadataFormProps> = ({
  metadata,
  onChange,
  platforms
}) => (
  <div className="social-metadata-form">
    <h3>Social Media Details</h3>
    <div className="metadata-fields">
      <div className="field-group">
        <label>Title</label>
        <input
          type="text"
          value={metadata.title}
          onChange={(e) => onChange({
            ...metadata,
            title: e.target.value
          })}
          placeholder="Enter video title"
        />
      </div>

      <div className="field-group">
        <label>Description</label>
        <textarea
          value={metadata.description}
          onChange={(e) => onChange({
            ...metadata,
            description: e.target.value
          })}
          placeholder="Enter video description"
          rows={4}
        />
      </div>

      <div className="field-group">
        <label>Hashtags</label>
        <input
          type="text"
          value={metadata.hashtags.join(' ')}
          onChange={(e) => onChange({
            ...metadata,
            hashtags: e.target.value.split(/\s+/).filter(tag => tag.startsWith('#'))
          })}
          placeholder="Enter hashtags (space-separated)"
        />
      </div>

      <div className="field-group">
        <label>Schedule Post</label>
        <input
          type="datetime-local"
          value={metadata.scheduledTime?.toISOString().slice(0, 16) || ''}
          onChange={(e) => onChange({
            ...metadata,
            scheduledTime: e.target.value ? new Date(e.target.value) : undefined
          })}
        />
      </div>
    </div>
  </div>
);

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  defaultSettings,
  defaultMetadata,
  availablePlatforms,
  projectDuration,
  className = ''
}) => {
  const { validateExportSettings, checkDiskSpace } = useFileOperations();
  const [settings, setSettings] = useState<ExportSettings>({
    ...DEFAULT_EXPORT_SETTINGS,
    ...defaultSettings
  });
  const [metadata, setMetadata] = useState<SocialMetadata>({
    ...DEFAULT_SOCIAL_METADATA,
    ...defaultMetadata
  });
  const [errors, setErrors] = useState<ExportError[]>([]);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [incompleteExport, setIncompleteExport] = useState<IncompleteExport | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings({ ...DEFAULT_EXPORT_SETTINGS, ...defaultSettings });
      setMetadata({ ...DEFAULT_SOCIAL_METADATA, ...defaultMetadata });
      setErrors([]);
      setProgress(null);
      setIsComplete(false);

      // Check for incomplete exports
      const savedExport = localStorage.getItem('incompleteExport');
      if (savedExport) {
        setIncompleteExport(JSON.parse(savedExport));
      }
    }
  }, [isOpen, defaultSettings, defaultMetadata]);

  const handleExport = async () => {
    setErrors([]);
    setProgress(null);
    setIsComplete(false);

    try {
      // Validate settings
      validateExportSettings(settings);

      // Check disk space
      const diskSpace = await checkDiskSpace();
      if (diskSpace.available < diskSpace.required) {
        throw new Error('Insufficient disk space for export');
      }

      // Start export
      setProgress({ percent: 0, status: 'Export in Progress...' });

      // Mock export progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (!prev || prev.percent >= 100) {
            clearInterval(interval);
            return prev;
          }
          return {
            percent: prev.percent + 10,
            status: 'Export in Progress...'
          };
        });
      }, 500);

      // Call export function
      await onExport(settings, metadata);

      // Complete export
      setProgress({ percent: 100, status: 'Export Complete' });
      setIsComplete(true);
      localStorage.removeItem('incompleteExport');

    } catch (error) {
      if (error instanceof Error) {
        setErrors([{ message: error.message }]);
      }
    }
  };

  const handleCancel = () => {
    if (progress && progress.percent > 0 && progress.percent < 100) {
      // Save progress
      localStorage.setItem('incompleteExport', JSON.stringify({
        title: settings.title,
        progress: progress.percent,
        timestamp: Date.now()
      }));
    }
    onClose();
  };

  const handlePlatformToggle = (platformId: string, enabled: boolean) => {
    setMetadata({
      ...metadata,
      platforms: {
        ...metadata.platforms,
        [platformId]: {
          ...(metadata.platforms[platformId] || {}),
          enabled
        }
      }
    });
  };

  const handleResumeExport = () => {
    if (incompleteExport) {
      setSettings(prev => ({
        ...prev,
        title: incompleteExport.title
      }));
      setProgress({
        percent: incompleteExport.progress,
        status: 'Export in Progress...'
      });
      setIncompleteExport(null);
      handleExport();
    }
  };

  if (!isOpen) return null;

  if (incompleteExport) {
    return (
      <div className={`export-dialog-overlay ${className}`}>
        <div className="export-dialog">
          <div className="export-dialog-header">
            <h2>Resume Export</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="export-dialog-content">
            <div className="incomplete-export-message">
              <p>Incomplete export found:</p>
              <p>{incompleteExport.title}</p>
              <p>Progress: {incompleteExport.progress}%</p>
            </div>
          </div>
          <div className="export-dialog-footer">
            <button className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button className="primary-button" onClick={handleResumeExport}>
              Resume Export
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`export-dialog-overlay ${className}`}>
      <div className="export-dialog">
        <div className="export-dialog-header">
          <h2>Export Project</h2>
          <button className="close-button" onClick={handleCancel}>×</button>
        </div>

        <div className="export-dialog-content">
          {errors.length > 0 && (
            <div className="error-messages" role="alert">
              {errors.map((error, index) => (
                <div key={index} className="error-message">
                  {error.message}
                </div>
              ))}
            </div>
          )}

          {progress && (
            <div className="export-progress">
              <div role="status">{progress.status}</div>
              <div 
                role="progressbar" 
                aria-valuenow={progress.percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="progress-bar"
              >
                <div 
                  className="progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {isComplete ? (
            <div className="export-complete">
              <h3>Export Complete</h3>
              <div className="complete-actions">
                <button onClick={() => {}}>Show in Folder</button>
                <button onClick={() => {}}>Copy Link</button>
              </div>
            </div>
          ) : (
            <>
              <ExportSettingsForm
                settings={settings}
                onChange={setSettings}
                platforms={availablePlatforms}
              />

              <PlatformSelector
                platforms={availablePlatforms}
                selectedPlatforms={Object.fromEntries(
                  Object.entries(metadata.platforms).map(([id, data]) => [id, data.enabled])
                )}
                onPlatformToggle={handlePlatformToggle}
              />

              <SocialMetadataForm
                metadata={metadata}
                onChange={setMetadata}
                platforms={availablePlatforms}
              />
            </>
          )}
        </div>

        <div className="export-dialog-footer">
          <button className="secondary-button" onClick={handleCancel}>
            {progress ? 'Cancel Export' : 'Cancel'}
          </button>
          {!isComplete && !progress && (
            <button className="primary-button" onClick={handleExport}>
              Begin Export
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
