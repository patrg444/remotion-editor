import React from 'react';
import { useFaceTracking } from '../hooks/useFaceTracking';
import { VideoClipWithFaceTracking, AspectRatio } from '../../types/face-tracking';
import { useTimelineContext } from '../hooks/useTimelineContext';

interface Props {
  clip: VideoClipWithFaceTracking;
}

export const FaceTrackingInspector: React.FC<Props> = ({ clip }) => {
  const { state } = useTimelineContext();
  const {
    isProcessing,
    error,
    settings,
    isTracking,
    diarizationEnabled,
    speakerMappings,
    toggleFaceTracking,
    toggleDiarization,
    updateSpeakerMapping,
    removeSpeakerMapping,
    updateLayoutMode,
    updateZoom,
    updateSmoothing,
    updateNeutralZone,
    updateTrackedFaces,
    getTrack,
    currentTrackedFaces
  } = useFaceTracking(clip, (state.aspectRatio || '16:9') as AspectRatio);

  const layoutTrack = getTrack('face-tracking-layout');
  const zoomTrack = getTrack('face-tracking-zoom');
  const smoothingTrack = getTrack('face-tracking-smoothing');
  const neutralZoneTrack = getTrack('face-tracking-neutral-zone');

  const currentLayoutMode = layoutTrack?.getValue?.(0) ?? 'horizontal';
  const currentZoom = zoomTrack?.getValue?.(0) ?? 1.0;
  const currentSmoothing = smoothingTrack?.getValue?.(0) ?? 0.5;
  const neutralZoneStr = neutralZoneTrack?.getValue?.(0);
  const neutralZone = neutralZoneStr ? JSON.parse(neutralZoneStr) : {
    size: 0.3,
    position: { x: 0.5, y: 0.5 },
    reframeThreshold: 0.2,
    reframeSpeed: 0.5
  };

  return (
    <div className="inspector-section">
      <h3>Face Tracking</h3>
      {error && (
        <div className="inspector-row error">
          <span>{error}</span>
        </div>
      )}
      {isProcessing && (
        <div className="inspector-row">
          <span>Processing...</span>
        </div>
      )}
      <div className="inspector-row">
        <label>
          <input
            type="checkbox"
            checked={isTracking}
            onChange={toggleFaceTracking}
            aria-label="Enable Face Tracking"
          />
          Enable Face Tracking
        </label>
      </div>

      <div className="inspector-row">
        <h4>Layout Mode</h4>
        <select
          value={currentLayoutMode}
          onChange={e => updateLayoutMode(e.target.value as 'horizontal' | 'vertical', 0)}
          aria-label="Layout Mode"
        >
          <option value="horizontal">Side by Side (16:9)</option>
          <option value="vertical">Top and Bottom (9:16)</option>
        </select>
      </div>

      {isTracking && currentTrackedFaces.length > 0 && (
        <div className="inspector-row">
          <h4>Tracked Faces</h4>
          {clip.faceTracking?.faces.map(face => (
            <div key={face.id} className="face-selection">
              <label>
                <input
                  type="checkbox"
                  checked={currentTrackedFaces.includes(face.id)}
                  onChange={() => updateTrackedFaces([face.id], 0)}
                />
                <img
                  src={face.thumbnail}
                  alt={`Face ${face.id}`}
                  className="face-thumbnail"
                />
              </label>
            </div>
          ))}
        </div>
      )}

      <div className="inspector-row">
        <h4>Neutral Zone</h4>
        <div className="neutral-zone-controls">
          <label>
            Neutral Zone Size
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.1"
              value={neutralZone.size}
              onChange={e => {
                updateNeutralZone({
                  ...neutralZone,
                  size: parseFloat(e.target.value)
                }, 0);
              }}
              aria-label="neutral zone size"
            />
            <span>{Math.round(neutralZone.size * 100)}%</span>
          </label>
          <label>
            Reframe Threshold
            <input
              type="range"
              min="0.1"
              max="0.5"
              step="0.1"
              value={neutralZone.reframeThreshold}
              onChange={e => {
                updateNeutralZone({
                  ...neutralZone,
                  reframeThreshold: parseFloat(e.target.value)
                }, 0);
              }}
              aria-label="reframe threshold"
            />
            <span>{Math.round(neutralZone.reframeThreshold * 100)}%</span>
          </label>
          <label>
            Reframe Speed
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={neutralZone.reframeSpeed}
              onChange={e => {
                updateNeutralZone({
                  ...neutralZone,
                  reframeSpeed: parseFloat(e.target.value)
                }, 0);
              }}
              aria-label="reframe speed"
            />
            <span>{Math.round(neutralZone.reframeSpeed * 100)}%</span>
          </label>
        </div>
      </div>

      <div className="inspector-row">
        <h4>Speaker Diarization</h4>
        <label>
          <input
            type="checkbox"
            checked={diarizationEnabled}
            onChange={toggleDiarization}
            aria-label="enable auto-switching"
          />
          Enable Auto-Switching
        </label>
        {diarizationEnabled && speakerMappings.length > 0 && (
          <div className="speaker-mappings">
            {speakerMappings.map(mapping => (
              <div key={mapping.speakerId} className="speaker-mapping">
                <span>Speaker {mapping.speakerId}</span>
                <button onClick={() => removeSpeakerMapping(mapping.speakerId)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="inspector-row">
        <h4>Zoom</h4>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={currentZoom}
          onChange={e => updateZoom(parseFloat(e.target.value), 0)}
          aria-label="zoom level"
        />
        <span>{currentZoom.toFixed(1)}x</span>
      </div>

      <div className="inspector-row">
        <h4>Smoothing</h4>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={currentSmoothing}
          onChange={e => updateSmoothing(parseFloat(e.target.value), 0)}
          aria-label="smoothing level"
        />
        <span>{currentSmoothing}</span>
      </div>
    </div>
  );
};
