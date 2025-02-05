import React from 'react';
import {
  AIToolsPanelProps,
  AIFeatureCardProps,
  AISegmentListProps,
  AISegment,
  AutoCaptionConfig,
  AutoFramingConfig,
  EmotionDetectionConfig,
  AI_LANGUAGES
} from '../types/ai-tools';
import '../styles/ai-tools.css';

const AIFeatureCard: React.FC<AIFeatureCardProps> = ({
  feature,
  onToggle,
  onSettingsChange
}) => {
  const renderSettings = () => {
    if (!feature.isEnabled) return null;

    switch (feature.id) {
      case 'autoCaption': {
        const config = feature as AutoCaptionConfig;
        return (
          <div className="feature-settings">
            <div className="setting-group">
              <label>Language</label>
              <select
                value={config.settings.language}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  language: e.target.value
                })}
              >
                {AI_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="setting-group">
              <label>Style</label>
              <select
                value={config.settings.style}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  style: e.target.value
                })}
              >
                <option value="subtitle">Subtitle</option>
                <option value="caption">Caption</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Position</label>
              <select
                value={config.settings.position}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  position: e.target.value
                })}
              >
                <option value="bottom">Bottom</option>
                <option value="top">Top</option>
              </select>
            </div>
            <div className="setting-group">
              <label>
                <input
                  type="checkbox"
                  checked={config.settings.autoTranslate}
                  onChange={(e) => onSettingsChange({
                    ...config.settings,
                    autoTranslate: e.target.checked
                  })}
                />
                Auto-translate
              </label>
            </div>
          </div>
        );
      }
      case 'autoFraming': {
        const config = feature as AutoFramingConfig;
        return (
          <div className="feature-settings">
            <div className="setting-group">
              <label>Mode</label>
              <select
                value={config.settings.mode}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  mode: e.target.value
                })}
              >
                <option value="face">Face Tracking</option>
                <option value="object">Object Tracking</option>
                <option value="action">Action Tracking</option>
              </select>
            </div>
            <div className="setting-group">
              <label>Strength: {(config.settings.strength * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.settings.strength}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  strength: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="setting-group">
              <label>Smoothing: {(config.settings.smoothing * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.settings.smoothing}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  smoothing: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>
        );
      }
      case 'emotionDetection': {
        const config = feature as EmotionDetectionConfig;
        return (
          <div className="feature-settings">
            <div className="setting-group">
              <label>Sensitivity: {(config.settings.sensitivity * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.settings.sensitivity}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  sensitivity: parseFloat(e.target.value)
                })}
              />
            </div>
            <div className="setting-group">
              <label>Min. Confidence: {(config.settings.minConfidence * 100).toFixed(0)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={config.settings.minConfidence}
                onChange={(e) => onSettingsChange({
                  ...config.settings,
                  minConfidence: parseFloat(e.target.value)
                })}
              />
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={`ai-feature-card ${feature.isEnabled ? 'enabled' : ''}`}>
      <div className="feature-header">
        <div className="feature-title">
          <h3>{feature.name}</h3>
          <p>{feature.description}</p>
        </div>
        <label className="feature-toggle">
          <input
            type="checkbox"
            checked={feature.isEnabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="toggle-slider" />
        </label>
      </div>
      {feature.isProcessing && (
        <div className="processing-indicator">
          <div className="spinner" />
          <span>Processing...</span>
        </div>
      )}
      {renderSettings()}
      {feature.confidence !== undefined && (
        <div className="confidence-indicator">
          <div className="confidence-bar" style={{ width: `${feature.confidence * 100}%` }} />
          <span>{(feature.confidence * 100).toFixed(0)}% Confidence</span>
        </div>
      )}
    </div>
  );
};

const AISegmentList: React.FC<AISegmentListProps> = ({
  segments,
  onSelect,
  onApply,
  onDismiss
}) => (
  <div className="ai-segment-list">
    <h3>AI Suggestions</h3>
    {segments.length === 0 ? (
      <p className="no-segments">No AI suggestions available</p>
    ) : (
      segments.map(segment => (
        <div
          key={segment.id}
          className={`segment-item ${segment.type}`}
          onClick={() => onSelect(segment.id)}
        >
          <div className="segment-info">
            <span className="segment-category">{segment.category}</span>
            <span className="segment-time">
              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
            </span>
          </div>
          <p className="segment-description">{segment.description}</p>
          <div className="segment-actions">
            <button
              className="apply-button"
              onClick={(e) => {
                e.stopPropagation();
                onApply(segment.id);
              }}
            >
              Apply
            </button>
            <button
              className="dismiss-button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss(segment.id);
              }}
            >
              Dismiss
            </button>
          </div>
          <div
            className="confidence-bar"
            style={{ width: `${segment.confidence * 100}%` }}
          />
        </div>
      ))
    )}
  </div>
);

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AIToolsPanel: React.FC<AIToolsPanelProps> = ({
  features,
  segments,
  onFeatureToggle,
  onFeatureSettingsChange,
  onSegmentSelect,
  onSegmentApply,
  onSegmentDismiss,
  className = ''
}) => {
  return (
    <div className={`ai-tools-panel ${className}`}>
      <div className="ai-tools-content">
        <div className="ai-features">
          <h2>AI Features</h2>
          {features.autoCaption && (
            <AIFeatureCard
              feature={features.autoCaption}
              onToggle={(enabled) => onFeatureToggle('autoCaption', enabled)}
              onSettingsChange={(settings) => onFeatureSettingsChange('autoCaption', settings)}
            />
          )}
          {features.autoFraming && (
            <AIFeatureCard
              feature={features.autoFraming}
              onToggle={(enabled) => onFeatureToggle('autoFraming', enabled)}
              onSettingsChange={(settings) => onFeatureSettingsChange('autoFraming', settings)}
            />
          )}
          {features.emotionDetection && (
            <AIFeatureCard
              feature={features.emotionDetection}
              onToggle={(enabled) => onFeatureToggle('emotionDetection', enabled)}
              onSettingsChange={(settings) => onFeatureSettingsChange('emotionDetection', settings)}
            />
          )}
        </div>
        <AISegmentList
          segments={segments}
          onSelect={onSegmentSelect}
          onApply={onSegmentApply}
          onDismiss={onSegmentDismiss}
        />
      </div>
    </div>
  );
};

export default AIToolsPanel;
