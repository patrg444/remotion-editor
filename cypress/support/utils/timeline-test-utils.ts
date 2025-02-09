import { Track, TimelineState, VideoClip, AudioClip, Clip } from '../../../src/renderer/types/timeline';

// Test-specific types that extend the base types with additional properties
type TestTrack = Track & {
  scrollLeft?: number;
  containerWidth?: number;
};

type TestClip = {
  id: string;
  type: 'video' | 'audio';
  name: string;
  startTime: number;
  endTime: number;
  src: string;
  layer: number;
  originalDuration: number;
  initialDuration: number;
  maxDuration: number;
  mediaOffset: number;
  mediaDuration: number;
  effects: any[];
  thumbnail?: string;
  isVisible?: boolean;
  isLocked?: boolean;
  volume?: number;
  speed?: number;
  transform?: {
    scale: number;
    rotation: number;
    position: { x: number; y: number };
    opacity: number;
  };
};

interface TimelineSetupOptions {
  tracks?: Track[];
  currentTime?: number;
  duration?: number;
  zoom?: number;
  fps?: number;
  isPlaying?: boolean;
  isDragging?: boolean;
  scrollX?: number;
  scrollY?: number;
  selectedClipIds?: string[];
  selectedTrackId?: string | null;
  dragStartX?: number;
  dragStartY?: number;
  error?: string | undefined;
}

export const createDefaultTrack = (overrides: Partial<TestTrack> = {}): Track => {
  const track: TestTrack = {
    id: overrides.id || 'track-1',
    name: overrides.name || 'Video Track',
    type: overrides.type || 'video',
    clips: overrides.clips || [],
    transitions: overrides.transitions || [],
    allowTransitions: overrides.allowTransitions ?? true,
    transitionsEnabled: overrides.transitionsEnabled ?? true,
    showTransitions: overrides.showTransitions ?? true,
    isLocked: overrides.isLocked ?? false,
    isVisible: overrides.isVisible ?? true,
    isMuted: overrides.isMuted ?? false,
    allowOverlap: overrides.allowOverlap ?? false,
    height: overrides.height ?? 100,
    scrollLeft: overrides.scrollLeft ?? 0,
    containerWidth: overrides.containerWidth ?? 900
  };
  return track as Track;
};

export const createDefaultClip = (overrides: Partial<TestClip> = {}): VideoClip | AudioClip => {
  const baseClip: TestClip = {
    id: overrides.id || `clip-${Date.now()}`,
    type: overrides.type || 'video',
    name: overrides.name || 'test.mp4',
    startTime: overrides.startTime || 0,
    endTime: overrides.endTime || 5,
    src: overrides.src || '/test.mp4',
    layer: overrides.layer || 0,
    originalDuration: overrides.originalDuration || 5,
    initialDuration: overrides.initialDuration || 5,
    maxDuration: overrides.maxDuration || 5,
    mediaOffset: overrides.mediaOffset || 0,
    mediaDuration: overrides.mediaDuration || 5,
    effects: overrides.effects || [],
    thumbnail: overrides.thumbnail ?? undefined,
    isVisible: overrides.isVisible ?? true,
    isLocked: overrides.isLocked ?? false,
    volume: overrides.volume ?? 1,
    speed: overrides.speed ?? 1
  };

  if (overrides.type === 'audio') {
    return {
      ...baseClip,
      type: 'audio' as const,
      volume: 1,
      isMuted: false
    } as AudioClip;
  }

  return {
    ...baseClip,
    type: 'video' as const,
    transform: {
      scale: 1,
      rotation: 0,
      position: { x: 0, y: 0 },
      opacity: 1,
      ...(overrides.transform || {})
    }
  } as VideoClip;
};

export const setupTimeline = (options: TimelineSetupOptions = {}) => {
  const tracks = options.tracks || [createDefaultTrack()];

  // Set up initial timeline state
  const timelineState: TimelineState = {
    tracks,
    currentTime: options.currentTime ?? 0,
    duration: options.duration ?? 10,
    zoom: options.zoom ?? 1,
    fps: options.fps ?? 30,
    isPlaying: options.isPlaying ?? false,
    isDragging: options.isDragging ?? false,
    scrollX: options.scrollX ?? 0,
    scrollY: options.scrollY ?? 0,
    scrollLeft: 0,
    selectedClipIds: options.selectedClipIds ?? [],
    selectedCaptionIds: [],
    selectedTrackId: options.selectedTrackId ?? undefined,
    markers: [],
    dragStartX: options.dragStartX ?? undefined,
    dragStartY: options.dragStartY ?? undefined,
    error: options.error ?? undefined,
    history: {
      entries: [],
      currentIndex: -1
    },
    aspectRatio: '16:9',
    snapToGrid: true,
    gridSize: 10,
    showWaveforms: true,
    showKeyframes: true,
    showTransitions: true,
    showEffects: true,
    renderQuality: 'preview',
    isSnappingEnabled: true,
    rippleState: {}
  };

  // Set up timeline context with immutable state updates
  const timelineContext = {
    state: timelineState,
    dispatch: (action: { type: string; payload: any }) => {
      if (action.type === 'SET_STATE') {
        timelineContext.state = action.payload;
      } else if (action.type === 'ADD_CLIP') {
        const track = timelineContext.state.tracks.find(t => t.id === action.payload.trackId);
        if (track) {
          // Create new state with immutable updates
          timelineContext.state = {
            ...timelineContext.state,
            tracks: timelineContext.state.tracks.map((t: Track) => {
              if (t.id === track.id) {
                return {
                  ...t,
                  clips: [...(t.clips || []), action.payload.clip]
                };
              }
              return t;
            })
          };
        }
      }

      // Update window state and dispatch events
      cy.window().then(win => {
        win.timelineState = timelineContext.state;
        win.dispatchEvent(new CustomEvent('timelineStateChange', { 
          detail: win.timelineState 
        }));

        // Add clip element to DOM if needed
        if (action.type === 'ADD_CLIP') {
          const track = timelineContext.state.tracks.find(t => t.id === action.payload.trackId);
          if (track) {
            const clip = action.payload.clip;
            const clipElement = document.createElement('div');
            clipElement.className = 'timeline-clip';
            clipElement.setAttribute('data-testid', 'timeline-clip');
            clipElement.setAttribute('aria-label', clip.name);
            clipElement.style.left = `${clip.startTime * timelineContext.state.zoom}px`;
            clipElement.style.width = `${(clip.endTime - clip.startTime) * timelineContext.state.zoom}px`;
            
            // Add to track-clips container
            const trackClipsElement = document.querySelector(`[data-track-id="${track.id}"] .track-clips`);
            if (trackClipsElement) {
              trackClipsElement.appendChild(clipElement.cloneNode(true));
            }

            // Add to React timeline container
            const timelineTrackElement = document.querySelector(`[data-testid="timeline-track"]`);
            if (timelineTrackElement) {
              timelineTrackElement.appendChild(clipElement);
            }

            // Dispatch clip events
            win.dispatchEvent(new CustomEvent('clip:added', {
              detail: {
                trackId: track.id,
                clip
              }
            }));

            win.dispatchEvent(new CustomEvent('track:updated', {
              detail: {
                trackId: track.id,
                updates: { clips: track.clips }
              }
            }));

            win.dispatchEvent(new CustomEvent('clip:render', {
              detail: {
                clipId: clip.id,
                trackId: track.id,
                clip
              }
            }));
          }
        }

        // Force a re-render after state update
        requestAnimationFrame(() => {
          win.dispatchEvent(new CustomEvent('timeline:state-changed', {
            detail: {
              tracks: win.timelineState.tracks.map((t: Track) => ({
                id: t.id,
                clipCount: t.clips.length,
                clips: t.clips.map((c: Clip) => ({
                  id: c.id,
                  startTime: c.startTime,
                  endTime: c.endTime,
                  layer: c.layer
                }))
              }))
            }
          }));
        });
      });
    }
  };

  return {
    tracks,
    timelineContext
  };
};
