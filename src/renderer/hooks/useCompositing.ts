import { useCallback, useRef, useState } from 'react';
import { useKeyframes } from './useKeyframes';
import { useEditHistory } from './useEditHistory';
import {
  CompositeLayer,
  LayerParameters,
  LayerKeyframeData,
  TrackGroup,
  createCompositeLayer,
  createTrackGroup
} from '../types/compositing';
import { createEditOperation } from '../types/edit-history';
import { InterpolationType } from '../keyframes/types';

export function useCompositing() {
  const [layers, setLayers] = useState<CompositeLayer[]>([]);
  const [groups, setGroups] = useState<TrackGroup[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const nextRenderOrder = useRef(0);

  const { addKeyframe, updateKeyframe, removeKeyframe } = useKeyframes();
  const { addOperation } = useEditHistory();

  // Add a new layer or update existing layer
  const addLayer = useCallback((trackId: string, clipId: string, groupId?: string) => {
    // Find existing layer with same trackId and clipId
    const existingLayer = layers.find(l => l.trackId === trackId && l.clipId === clipId);

    // Create new layer or update existing one
    const resultLayer = existingLayer ? {
      ...existingLayer,
      groupId: groupId || existingLayer.groupId
    } : {
      ...createCompositeLayer(trackId, clipId, nextRenderOrder.current++),
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      groupId
    };

    // Add operation after layer is fully configured
    addOperation(createEditOperation(
      'composite',
      existingLayer ? 'update' : 'add',
      `${existingLayer ? 'Update' : 'Add'} layer ${resultLayer.id}`,
      existingLayer || {} as Record<string, any>,
      resultLayer as Record<string, any>
    ));

    // Update layers state
    setLayers(prevLayers => {
      const filteredLayers = existingLayer 
        ? prevLayers.filter(l => l.id !== existingLayer.id) 
        : prevLayers;
      return [...filteredLayers, resultLayer];
    });

    setSelectedLayerId(resultLayer.id);
    return resultLayer;
  }, [layers, addOperation]);

  // Create a new track group
  const createGroup = useCallback((name: string, trackIds: string[]) => {
    const group = createTrackGroup(name, trackIds);

    setGroups(prevGroups => [...prevGroups, group]);
    setSelectedGroupId(group.id);

    // Update layers to reference the new group if they're in the tracks
    // or if they're in a group that's being grouped (for nested groups)
    setLayers(prevLayers => prevLayers.map(layer => {
      const isInTrack = trackIds.includes(layer.trackId);
      const isInGroupBeingGrouped = layer.groupId && trackIds.includes(layer.groupId);
      
      // Update layer if it's in the tracks or in a group being grouped
      if (isInTrack || isInGroupBeingGrouped) {
        return { ...layer, groupId: group.id };
      }
      return layer;
    }));

    addOperation(createEditOperation(
      'composite',
      'add',
      `Create group ${name}`,
      {},
      group
    ));

    return group;
  }, [addOperation]);

  // Update layer parameters
  const updateLayer = useCallback((
    layerId: string,
    updates: Partial<LayerParameters>,
    time?: number
  ) => {
    setLayers(prevLayers => {
      const layerIndex = prevLayers.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return prevLayers;

      const layer = prevLayers[layerIndex];
      const updatedLayer = {
        ...layer,
        parameters: {
          ...layer.parameters,
          ...updates
        }
      };

      // If time is provided create keyframes for the updates
      if (time !== undefined) {
        Object.entries(updates).forEach(([key, value]) => {
          const trackId = `${layerId}-${key}`;
          const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
          addKeyframe(trackId, time, serializedValue as string | number, { type: InterpolationType.Linear });
        });
      }

      const newLayers = [...prevLayers];
      newLayers[layerIndex] = updatedLayer;

      addOperation(createEditOperation(
        'composite',
        'update',
        `Update layer ${layerId} parameters`,
        { parameters: layer.parameters },
        { parameters: updatedLayer.parameters }
      ));

      return newLayers;
    });
  }, [addKeyframe, addOperation]);

  // Update group parameters
  const updateGroup = useCallback((
    groupId: string,
    updates: Partial<TrackGroup>
  ) => {
    setGroups(prevGroups => {
      const groupIndex = prevGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return prevGroups;

      const group = prevGroups[groupIndex];
      const updatedGroup = { ...group, ...updates };

      const newGroups = [...prevGroups];
      newGroups[groupIndex] = updatedGroup;

      addOperation(createEditOperation(
        'composite',
        'update',
        `Update group ${groupId}`,
        group,
        updatedGroup
      ));

      return newGroups;
    });
  }, [addOperation]);

  // Remove a layer
  const removeLayer = useCallback((layerId: string) => {
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }

    setLayers(prevLayers => {
      const layerIndex = prevLayers.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return prevLayers;

      const layer = prevLayers[layerIndex];
      const newLayers = prevLayers.filter(l => l.id !== layerId);

      addOperation(createEditOperation(
        'composite',
        'delete',
        `Delete layer ${layerId}`,
        layer,
        {}
      ));

      return newLayers;
    });
  }, [addOperation, selectedLayerId]);

  // Remove a group
  const removeGroup = useCallback((groupId: string) => {
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null);
    }

    setGroups(prevGroups => {
      const groupIndex = prevGroups.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return prevGroups;

      const group = prevGroups[groupIndex];
      const newGroups = prevGroups.filter(g => g.id !== groupId);

      // Remove group reference from layers and child groups
      setLayers(prevLayers => prevLayers.map(layer => {
        // Remove reference if this is the layer's immediate group
        if (layer.groupId === groupId) {
          return { ...layer, groupId: undefined };
        }
        return layer;
      }));

      addOperation(createEditOperation(
        'composite',
        'delete',
        `Delete group ${groupId}`,
        group,
        {}
      ));

      return newGroups;
    });
  }, [addOperation, selectedGroupId]);

  // Reorder layers
  const reorderLayer = useCallback((layerId: string, newIndex: number) => {
    setLayers(prevLayers => {
      const layerIndex = prevLayers.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return prevLayers;

      const layer = prevLayers[layerIndex];
      const newLayers = [...prevLayers];
      
      // Remove the layer from its current position
      newLayers.splice(layerIndex, 1);
      // Insert it at the new position
      newLayers.splice(newIndex, 0, layer);

      // Update render orders
      const updatedLayers = newLayers.map((l, i) => ({
        ...l,
        renderOrder: i
      }));

      addOperation(createEditOperation(
        'composite',
        'update',
        `Reorder layer ${layerId} to position ${newIndex}`,
        { renderOrder: layer.renderOrder },
        { renderOrder: newIndex }
      ));

      return updatedLayers;
    });
  }, [addOperation]);

  // Toggle layer visibility
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prevLayers => {
      const layerIndex = prevLayers.findIndex(l => l.id === layerId);
      if (layerIndex === -1) return prevLayers;

      const layer = prevLayers[layerIndex];
      const updatedLayer = {
        ...layer,
        isEnabled: !layer.isEnabled
      };

      const newLayers = [...prevLayers];
      newLayers[layerIndex] = updatedLayer;

      addOperation(createEditOperation(
        'composite',
        'update',
        `Toggle layer ${layerId} visibility`,
        { isEnabled: layer.isEnabled },
        { isEnabled: updatedLayer.isEnabled }
      ));

      return newLayers;
    });
  }, [addOperation]);

  // Get layer by ID
  const getLayer = useCallback((layerId: string) => {
    return layers.find(l => l.id === layerId);
  }, [layers]);

  // Get group by ID
  const getGroup = useCallback((groupId: string) => {
    return groups.find(g => g.id === groupId);
  }, [groups]);

  // Get layers for a track
  const getLayersForTrack = useCallback((trackId: string) => {
    return layers.filter(l => l.trackId === trackId);
  }, [layers]);

  // Get layers for a group
  const getLayersForGroup = useCallback((groupId: string) => {
    return layers.filter(l => l.groupId === groupId);
  }, [layers]);

  // Get all parent groups for a group in order from root to leaf
  const getParentGroups = useCallback((groupId: string): TrackGroup[] => {
    const visitedGroups = new Set<string>();
    const parentGroups: TrackGroup[] = [];
    
    let currentId = groupId;
    while (currentId && !visitedGroups.has(currentId)) {
      visitedGroups.add(currentId);
      const parent = groups.find(g => g.trackIds.includes(currentId));
      if (parent) {
        parentGroups.unshift(parent); // Add to front to maintain root-to-leaf order
        currentId = parent.id;
      } else {
        break;
      }
    }
    
    return parentGroups;
  }, [groups]);

  // Get effective layer parameters (considering group settings)
  const getEffectiveParameters = useCallback((layer: CompositeLayer) => {
    let effectiveOpacity = layer.parameters.opacity;
    let effectiveBlendMode = layer.parameters.blendMode;

    if (layer.groupId) {
      // Get immediate group and its parent groups
      const immediateGroup = getGroup(layer.groupId);
      if (immediateGroup) {
        // Get all groups in order from root to leaf
        const allGroups = getParentGroups(layer.trackId);
        
        // Apply all groups in order from root to leaf
        for (const group of allGroups) {
          effectiveOpacity *= group.opacity;
          if (group.blendMode !== 'normal') {
            effectiveBlendMode = group.blendMode;
          }
        }
      }
    }

    return {
      ...layer.parameters,
      opacity: effectiveOpacity,
      blendMode: effectiveBlendMode
    };
  }, [getGroup, getParentGroups]);

  return {
    layers,
    groups,
    selectedLayerId,
    selectedGroupId,
    setSelectedLayerId,
    setSelectedGroupId,
    addLayer,
    createGroup,
    updateLayer,
    updateGroup,
    removeLayer,
    removeGroup,
    reorderLayer,
    toggleLayer,
    getLayer,
    getGroup,
    getLayersForTrack,
    getLayersForGroup,
    getEffectiveParameters
  };
}
