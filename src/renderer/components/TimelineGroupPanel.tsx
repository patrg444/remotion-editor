import React from 'react';
import { useCompositing } from '../hooks/useCompositing';
import { BlendMode } from '../types/compositing';

interface TimelineGroupPanelProps {
  className?: string;
}

export function TimelineGroupPanel({ className }: TimelineGroupPanelProps) {
  const {
    groups,
    selectedGroupId,
    setSelectedGroupId,
    updateGroup,
    removeGroup,
    getLayersForGroup
  } = useCompositing();

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handleBlendModeChange = (groupId: string, value: string) => {
    updateGroup(groupId, { blendMode: value as BlendMode });
  };

  const handleOpacityChange = (groupId: string, value: string) => {
    updateGroup(groupId, { opacity: Number(value) / 100 });
  };

  const handleMuteToggle = (groupId: string, currentMuted: boolean) => {
    updateGroup(groupId, { isMuted: !currentMuted });
  };

  const handleSoloToggle = (groupId: string, currentSolo: boolean) => {
    updateGroup(groupId, { isSolo: !currentSolo });
  };

  const handleCollapseToggle = (groupId: string, currentCollapsed: boolean) => {
    updateGroup(groupId, { isCollapsed: !currentCollapsed });
  };

  const handleRemoveGroup = (groupId: string) => {
    removeGroup(groupId);
  };

  return (
    <div className={`timeline-group-panel ${className || ''}`}>
      {groups.map(group => {
        const layers = getLayersForGroup(group.id);
        const isSelected = group.id === selectedGroupId;
        
        return (
          <div
            key={group.id}
            data-testid={`group-${group.id}`}
            className={`timeline-group ${isSelected ? 'selected' : ''} ${group.isCollapsed ? 'collapsed' : ''}`}
            onClick={() => handleGroupClick(group.id)}
          >
            <div className="group-header">
              <button
                className="collapse-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCollapseToggle(group.id, group.isCollapsed);
                }}
              >
                {group.isCollapsed ? '▶' : '▼'}
              </button>
              <span className="group-name">{group.name}</span>
              <div className="group-controls">
                <select
                  value={group.blendMode}
                  onChange={(e) => handleBlendModeChange(group.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="normal">Normal</option>
                  <option value="multiply">Multiply</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                  <option value="color-dodge">Color Dodge</option>
                  <option value="color-burn">Color Burn</option>
                  <option value="hard-light">Hard Light</option>
                  <option value="soft-light">Soft Light</option>
                  <option value="difference">Difference</option>
                  <option value="exclusion">Exclusion</option>
                  <option value="hue">Hue</option>
                  <option value="saturation">Saturation</option>
                  <option value="color">Color</option>
                  <option value="luminosity">Luminosity</option>
                </select>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(group.opacity * 100)}
                  onChange={(e) => handleOpacityChange(group.id, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMuteToggle(group.id, group.isMuted);
                  }}
                >
                  M
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSoloToggle(group.id, group.isSolo);
                  }}
                >
                  S
                </button>
                <button
                  className="remove-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveGroup(group.id);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            {!group.isCollapsed && (
              <div className="group-content">
                <div className="layer-count">
                  {layers.length} layers
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
