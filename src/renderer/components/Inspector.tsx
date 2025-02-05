import React, { useState } from 'react';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { TransitionsPanel } from './TransitionsPanel';
import { ClipWithLayer, Track, TimelineState } from '../types/timeline';
import '../styles/inspector.css';

interface InspectorTab {
  id: 'properties' | 'transitions';
  label: string;
}

const TABS: InspectorTab[] = [
  { id: 'properties', label: 'Properties' },
  { id: 'transitions', label: 'Transitions' }
];

export const Inspector: React.FC = () => {
  const { state } = useTimelineContext();
  const [activeTab, setActiveTab] = useState<InspectorTab['id']>('properties');

  const selectedClip = state.tracks
    .flatMap((t: Track) => t.clips)
    .find(c => state.selectedClipIds.includes(c.id)) as ClipWithLayer | undefined;

  const renderClipProperties = (clip: ClipWithLayer) => (
    <div className="inspector-section">
      <div className="inspector-section-header">
        Clip Properties
      </div>
      <div className="property-group">
        <label>Name</label>
        <div>{clip.name}</div>
      </div>
      <div className="property-group">
        <label>Type</label>
        <div>{clip.type}</div>
      </div>
      <div className="property-group">
        <label>Media Duration</label>
        <div>{clip.mediaDuration}s</div>
      </div>
      <div className="property-group">
        <label>Timeline Duration</label>
        <div style={{ 
          color: (clip.endTime - clip.startTime) > clip.mediaDuration ? '#ff6b6b' : undefined 
        }}>
          {clip.endTime - clip.startTime}s
          {(clip.endTime - clip.startTime) > clip.mediaDuration && (
            <span style={{ marginLeft: '4px', fontSize: '12px' }}>
              (exceeds media length)
            </span>
          )}
        </div>
      </div>
      {clip.type === 'video' && clip.transform && (
        <>
          <div className="property-group">
            <label>Scale</label>
            <div>{clip.transform.scale}x</div>
          </div>
          <div className="property-group">
            <label>Rotation</label>
            <div>{clip.transform.rotation}°</div>
          </div>
          <div className="property-group">
            <label>Position</label>
            <div>X: {clip.transform.position.x}, Y: {clip.transform.position.y}</div>
          </div>
          <div className="property-group">
            <label>Opacity</label>
            <div>{clip.transform.opacity * 100}%</div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="inspector">
      <div className="inspector-header">
        <div className="inspector-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`inspector-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              data-testid={`${tab.id}-panel-button`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="inspector-content">
        {activeTab === 'properties' && selectedClip && renderClipProperties(selectedClip)}
        {activeTab === 'transitions' && <TransitionsPanel />}
      </div>
    </div>
  );
};
