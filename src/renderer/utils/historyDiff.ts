import { TimelineState, Track, ClipWithLayer } from '../types/timeline';
import { logger } from './logger';

export interface StateDiff {
  type: 'full' | 'partial';
  snapshot?: TimelineState; // Full state snapshot for checkpoint actions
  changes?: {
    tracks?: {
      added?: Track[];
      removed?: string[];  // Track IDs
      modified?: {
        id: string;
        clips: {
          added?: ClipWithLayer[];
          removed?: string[];  // Clip IDs
          modified?: {
            id: string;
            before: Partial<ClipWithLayer>;
            after: Partial<ClipWithLayer>;
          }[];
        };
      }[];
    };
    currentTime?: number;
    duration?: number;
    zoom?: number;
    fps?: number;
    markers?: {
      added?: { id: string; time: number; label: string }[];
      removed?: string[];  // Marker IDs
      modified?: {
        id: string;
        before: { time: number; label: string };
        after: { time: number; label: string };
      }[];
    };
  };
  timestamp: number;
  description: string;
}

export const createStateDiff = (
  before: TimelineState,
  after: TimelineState,
  description: string,
  isCheckpoint: boolean = false
): StateDiff => {
  const timestamp = Date.now();

  // For checkpoint actions, store full state snapshot
  if (isCheckpoint) {
    logger.debug('Creating checkpoint snapshot:', { description });
    return {
      type: 'full',
      snapshot: { ...after },
      timestamp,
      description
    };
  }

  const changes: StateDiff['changes'] = {};

  // Compare tracks
  if (before.tracks !== after.tracks) {
    changes.tracks = {
      added: after.tracks?.filter(track => 
        !before.tracks?.find(t => t.id === track.id)
      ) || [],
      removed: (before.tracks || [])
        .filter(track => !after.tracks?.find(t => t.id === track.id))
        .map(track => track.id),
      modified: (before.tracks || [])
        .filter(track => after.tracks?.find(t => t.id === track.id))
        .map(track => {
          const afterTrack = after.tracks.find(t => t.id === track.id)!;
          const clipChanges = {
            added: afterTrack.clips.filter(clip => 
              !track.clips.find(c => c.id === clip.id)
            ),
            removed: track.clips
              .filter(clip => !afterTrack.clips.find(c => c.id === clip.id))
              .map(clip => clip.id),
            modified: track.clips
              .filter(clip => afterTrack.clips.find(c => c.id === clip.id))
              .map(clip => {
                const afterClip = afterTrack.clips.find(c => c.id === clip.id)!;
                return {
                  id: clip.id,
                  before: getDiffProperties(clip, afterClip),
                  after: getDiffProperties(afterClip, clip)
                };
              })
              .filter(diff => 
                Object.keys(diff.before).length > 0 || 
                Object.keys(diff.after).length > 0
              )
          };

          return {
            id: track.id,
            clips: clipChanges
          };
        })
        .filter(trackDiff => 
          trackDiff.clips.added?.length || 
          trackDiff.clips.removed?.length || 
          trackDiff.clips.modified?.length
        )
    };
  }

  // Compare scalar properties
  if (before.currentTime !== after.currentTime) changes.currentTime = after.currentTime;
  if (before.duration !== after.duration) changes.duration = after.duration;
  if (before.zoom !== after.zoom) changes.zoom = after.zoom;
  if (before.fps !== after.fps) changes.fps = after.fps;

  // Compare markers
  if (before.markers !== after.markers) {
    changes.markers = {
      added: after.markers.filter(marker => 
        !before.markers.find(m => m.id === marker.id)
      ),
      removed: before.markers
        .filter(marker => !after.markers.find(m => m.id === marker.id))
        .map(marker => marker.id),
      modified: before.markers
        .filter(marker => after.markers.find(m => m.id === marker.id))
        .map(marker => {
          const afterMarker = after.markers.find(m => m.id === marker.id)!;
          return {
            id: marker.id,
            before: {
              time: marker.time,
              label: marker.label
            },
            after: {
              time: afterMarker.time,
              label: afterMarker.label
            }
          };
        })
        .filter(diff => 
          diff.before.time !== diff.after.time || 
          diff.before.label !== diff.after.label
        )
    };
  }

  return {
    type: 'partial',
    changes,
    timestamp,
    description
  };
};

export const applyStateDiff = (
  state: TimelineState,
  diff: StateDiff,
  reverse = false
): TimelineState => {
  // For checkpoint diffs, directly use the snapshot
  if (diff.type === 'full' && diff.snapshot) {
    logger.debug('Restoring from checkpoint:', { description: diff.description });
    if (reverse) {
      return state; // Keep current state when undoing a checkpoint
    }
    return { ...diff.snapshot };
  }

  if (!diff.changes) {
    logger.warn('Invalid diff: no changes or snapshot found');
    return state;
  }

  const newState = { ...state };

  // Apply track changes
  if (diff.changes.tracks) {
    const tracks = [...state.tracks];
    const { added, removed, modified } = diff.changes.tracks;

    if (reverse) {
      // Remove added tracks
      if (added) {
        const addedIds = new Set(added.map(track => track.id));
        newState.tracks = tracks.filter(track => !addedIds.has(track.id));
      }
      // Restore removed tracks
      if (removed) {
        const removedTracks = tracks.filter(track => removed.includes(track.id));
        newState.tracks = [...newState.tracks, ...removedTracks];
      }
    } else {
      // Add new tracks
      if (added) newState.tracks = [...tracks, ...added];
      // Remove tracks
      if (removed) {
        const removedIds = new Set(removed);
        newState.tracks = tracks.filter(track => !removedIds.has(track.id));
      }
    }

    // Apply track modifications
    if (modified) {
      modified.forEach(trackDiff => {
        const track = newState.tracks.find(t => t.id === trackDiff.id);
        if (!track) return;

        const clips = [...track.clips];
        const { added: addedClips, removed: removedClips, modified: modifiedClips } = trackDiff.clips;

        if (reverse) {
          // Remove added clips
          if (addedClips) {
            const addedIds = new Set(addedClips.map(clip => clip.id));
            track.clips = clips.filter(clip => !addedIds.has(clip.id));
          }
          // Restore removed clips
          if (removedClips) {
            const removedClipsList = clips.filter(clip => removedClips.includes(clip.id));
            track.clips = [...track.clips, ...removedClipsList];
          }
        } else {
          // Add new clips
          if (addedClips) track.clips = [...clips, ...addedClips];
          // Remove clips
          if (removedClips) {
            const removedIds = new Set(removedClips);
            track.clips = clips.filter(clip => !removedIds.has(clip.id));
          }
        }

        // Apply clip modifications
        if (modifiedClips) {
          modifiedClips.forEach(clipDiff => {
            const clip = track.clips.find(c => c.id === clipDiff.id);
            if (!clip) return;

            if (reverse) {
              Object.assign(clip, clipDiff.before);
            } else {
              Object.assign(clip, clipDiff.after);
            }
          });
        }
      });
    }
  }

  // Apply scalar changes
  if (reverse) {
    if (diff.changes.currentTime !== undefined) newState.currentTime = state.currentTime;
    if (diff.changes.duration !== undefined) newState.duration = state.duration;
    if (diff.changes.zoom !== undefined) newState.zoom = state.zoom;
    if (diff.changes.fps !== undefined) newState.fps = state.fps;
  } else {
    if (diff.changes.currentTime !== undefined) newState.currentTime = diff.changes.currentTime;
    if (diff.changes.duration !== undefined) newState.duration = diff.changes.duration;
    if (diff.changes.zoom !== undefined) newState.zoom = diff.changes.zoom;
    if (diff.changes.fps !== undefined) newState.fps = diff.changes.fps;
  }

  // Apply marker changes
  if (diff.changes.markers) {
    const markers = [...state.markers];
    const { added, removed, modified } = diff.changes.markers;

    if (reverse) {
      // Remove added markers
      if (added) {
        const addedIds = new Set(added.map(marker => marker.id));
        newState.markers = markers.filter(marker => !addedIds.has(marker.id));
      }
      // Restore removed markers
      if (removed) {
        const removedMarkers = markers.filter(marker => removed.includes(marker.id));
        newState.markers = [...newState.markers, ...removedMarkers];
      }
    } else {
      // Add new markers
      if (added) newState.markers = [...markers, ...added];
      // Remove markers
      if (removed) {
        const removedIds = new Set(removed);
        newState.markers = markers.filter(marker => !removedIds.has(marker.id));
      }
    }

    // Apply marker modifications
    if (modified) {
      modified.forEach(markerDiff => {
        const marker = newState.markers.find(m => m.id === markerDiff.id);
        if (!marker) return;

        if (reverse) {
          marker.time = markerDiff.before.time;
          marker.label = markerDiff.before.label;
        } else {
          marker.time = markerDiff.after.time;
          marker.label = markerDiff.after.label;
        }
      });
    }
  }

  return newState;
};

const getDiffProperties = <T extends object>(
  obj1: T,
  obj2: T
): Partial<T> => {
  const diff: Partial<T> = {};
  for (const key in obj1) {
    if (obj1[key] !== obj2[key]) {
      diff[key] = obj1[key];
    }
  }
  return diff;
};
