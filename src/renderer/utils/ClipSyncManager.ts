import { Track, VideoClip, AudioClip, ClipWithLayer } from '../types/timeline';
import { Logger } from '../../main/utils/logger';
import { syncManager } from './SyncManager';

const logger = new Logger('ClipSyncManager');

interface ActiveClip {
  clip: ClipWithLayer;
  track: Track;
  startTime: number;
  endTime: number;
}

export class ClipSyncManager {
  private videoTracks: Track[] = [];
  private audioTracks: Track[] = [];
  private currentTime: number = 0;
  private activeVideoClip: ActiveClip | null = null;
  private activeAudioClip: ActiveClip | null = null;

  constructor() {
    // Subscribe to sync manager updates
    syncManager.subscribe(state => {
      this.currentTime = state.currentTime;
      this.updateActiveClips();
    });
  }

  // Update tracks data
  updateTracks(tracks: Track[]) {
    this.videoTracks = tracks.filter(track => track.type === 'video' && track.isVisible);
    this.audioTracks = tracks.filter(track => track.type === 'audio' && track.isVisible);
    this.updateActiveClips();
  }

  // Find the active clips at the current time
  private updateActiveClips() {
    const time = syncManager.snapToFrame(this.currentTime);

    // Find active video clip
    this.activeVideoClip = this.findActiveClip(this.videoTracks, time);
    
    // Find active audio clip
    this.activeAudioClip = this.findActiveClip(this.audioTracks, time);

    logger.debug('Active clips updated:', {
      time,
      videoClip: this.activeVideoClip?.clip.id,
      audioClip: this.activeAudioClip?.clip.id
    });
  }

  // Find the active clip in the given tracks at the specified time
  private findActiveClip(tracks: Track[], time: number): ActiveClip | null {
    for (const track of tracks) {
      if (!track.isVisible) continue;

      for (const clip of track.clips) {
        if (time >= clip.startTime && time < clip.endTime) {
          return {
            clip: clip as ClipWithLayer,
            track,
            startTime: clip.startTime,
            endTime: clip.endTime
          };
        }
      }
    }
    return null;
  }

  // Get the currently active video clip
  getActiveVideoClip(): ActiveClip | null {
    return this.activeVideoClip;
  }

  // Get the currently active audio clip
  getActiveAudioClip(): ActiveClip | null {
    return this.activeAudioClip;
  }

  // Calculate media offset for a clip at the current time
  getClipOffset(clip: ClipWithLayer): number {
    const time = syncManager.snapToFrame(this.currentTime);
    if (time >= clip.startTime && time < clip.endTime) {
      return clip.mediaOffset + (time - clip.startTime);
    }
    return clip.mediaOffset;
  }

  // Check if we need to preload the next clip
  shouldPreloadNextClip(type: 'video' | 'audio'): boolean {
    const tracks = type === 'video' ? this.videoTracks : this.audioTracks;
    const activeClip = type === 'video' ? this.activeVideoClip : this.activeAudioClip;
    
    if (!activeClip) return false;

    const timeUntilEnd = activeClip.endTime - this.currentTime;
    // Preload when within 1 second of clip end
    return timeUntilEnd <= 1;
  }

  // Find the next clip that should be preloaded
  getNextClip(type: 'video' | 'audio'): ClipWithLayer | null {
    const tracks = type === 'video' ? this.videoTracks : this.audioTracks;
    const activeClip = type === 'video' ? this.activeVideoClip : this.activeAudioClip;

    if (!activeClip) return null;

    let nextClip: ClipWithLayer | null = null;
    let minStartTime = Infinity;

    for (const track of tracks) {
      for (const clip of track.clips) {
        if (clip.startTime > activeClip.endTime && clip.startTime < minStartTime) {
          minStartTime = clip.startTime;
          nextClip = clip as ClipWithLayer;
        }
      }
    }

    return nextClip;
  }

  // Get transition between current and next clip if any
  getActiveTransition(type: 'video' | 'audio'): { fromClip: ClipWithLayer, toClip: ClipWithLayer } | null {
    const activeClip = type === 'video' ? this.activeVideoClip : this.activeAudioClip;
    const nextClip = this.getNextClip(type);

    if (activeClip && nextClip && activeClip.endTime > nextClip.startTime) {
      return {
        fromClip: activeClip.clip,
        toClip: nextClip
      };
    }

    return null;
  }
}

// Create a singleton instance
export const clipSyncManager = new ClipSyncManager();
