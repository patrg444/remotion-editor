import { MediaItem } from '../../../src/renderer/types/media-bin';
import { Track, TimelineState, initialTimelineState, VideoClip, AudioClip, ClipWithLayer } from '../../../src/renderer/types/timeline';

interface MediaBinSetupOptions {
  mediaItems?: MediaItem[];
  withTimeline?: boolean;
  tracks?: Track[];
}

interface VideoMediaItem extends MediaItem {
  width?: number;
  height?: number;
  metadata?: {
    fps: number;
    codec: string;
    duration: number;
  };
}

interface TimelineStateWithMediaBin extends TimelineState {
  mediaBin: {
    items: MediaItem[];
    selectedIds: string[];
  };
}

export const createTestMediaItem = (overrides: Partial<VideoMediaItem> = {}): VideoMediaItem => ({
  id: overrides.id || 'test-1',
  name: overrides.name || 'test.mp4',
  type: overrides.type || 'video',
  path: overrides.path || '/test.mp4',
  duration: overrides.duration || 5,
  originalDuration: overrides.originalDuration || 5,
  initialDuration: overrides.initialDuration || 5,
  maxDuration: overrides.maxDuration || 5,
  width: overrides.width || 1920,
  height: overrides.height || 1080,
  thumbnail: overrides.thumbnail || '/test.webm',
  metadata: overrides.metadata || {
    fps: 30,
    codec: 'h264',
    duration: 5
  }
});

export const createDefaultTrack = (overrides: Partial<Track> = {}): Track => ({
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
  height: overrides.height ?? 100
});

export const createTestClip = (
  mediaItem: MediaItem,
  overrides: Partial<VideoClip | AudioClip> = {}
): VideoClip | AudioClip => {
  const baseClip = {
    id: overrides.id || `clip-${Date.now()}`,
    type: mediaItem.type,
    name: overrides.name || mediaItem.name,
    startTime: overrides.startTime || 0,
    endTime: overrides.endTime || mediaItem.duration || 5,
    src: mediaItem.path,
    originalDuration: mediaItem.duration || 5,
    initialDuration: mediaItem.initialDuration || 5,
    maxDuration: mediaItem.maxDuration || 5,
    mediaOffset: overrides.mediaOffset || 0,
    mediaDuration: mediaItem.duration || 5,
    effects: overrides.effects || [],
    layer: overrides.layer || 0,
    thumbnail: mediaItem.thumbnail
  };

  if (mediaItem.type === 'video') {
    return {
      ...baseClip,
      type: 'video' as const,
      transform: {
        scale: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        opacity: 1
      }
    };
  } else {
    return {
      ...baseClip,
      type: 'audio' as const,
      volume: 1,
      isMuted: false
    };
  }
};

export const setupMediaBin = (options: MediaBinSetupOptions = {}) => {
  const mediaItems = options.mediaItems || [createTestMediaItem()];
  const tracks = options.tracks || [createDefaultTrack()];

  // Mock require function
  const mockRequire = Object.assign(
    (path: string) => path.endsWith('.css') ? {} : null,
    {
      cache: {},
      extensions: {
        '.js': (module: any, filename: string) => module.exports,
        '.json': (module: any, filename: string) => module.exports,
        '.node': (module: any, filename: string) => module.exports
      },
      main: {
        id: '.',
        filename: '',
        loaded: true,
        parent: null,
        children: [],
        paths: [],
        exports: {},
        require: (id: string) => ({}),
        path: '',
        isPreloading: false
      },
      resolve: Object.assign(
        (id: string) => '',
        {
          paths: (request: string) => ['/node_modules'],
          sync: (id: string) => '',
          isCore: (id: string) => false
        }
      )
    }
  );

  // Set up logger
  const logger = {
    debug: (...args: any[]) => {
      console.log('DEBUG:', ...args);
      return undefined;
    },
    error: (...args: any[]) => {
      console.error('ERROR:', ...args);
      return undefined;
    }
  };

  // Set up initial timeline state
  const timelineState: TimelineStateWithMediaBin = {
    ...initialTimelineState,
    tracks,
    mediaBin: {
      items: mediaItems,
      selectedIds: []
    }
  };

  // Set up timeline context with immutable state updates
  const timelineContext = {
    state: timelineState,
    dispatch: (action: any) => {
      if (action.type === 'SET_STATE') {
        timelineContext.state = action.payload;
      } else if (action.type === 'ADD_CLIP') {
        const trackIndex = timelineContext.state.tracks.findIndex(t => t.id === action.payload.trackId);
        if (trackIndex !== -1) {
          // Create new state with immutable updates
          timelineContext.state = {
            ...timelineContext.state,
            tracks: timelineContext.state.tracks.map((track, index) => {
              if (index === trackIndex) {
                return {
                  ...track,
                  clips: [...track.clips, action.payload.clip]
                };
              }
              return track;
            })
          };
        }
      }

      // Update window state and dispatch event
      cy.window().then(win => {
        win.timelineState = {
          ...timelineContext.state,
          mediaBin: {
            items: mediaItems,
            selectedIds: []
          }
        };
        win.dispatchEvent(new CustomEvent('timelineStateChange', { 
          detail: win.timelineState 
        }));

        // Force a re-render after state update
        requestAnimationFrame(() => {
          win.dispatchEvent(new CustomEvent('timeline:state-changed', {
            detail: {
              tracks: win.timelineState.tracks.map((t: Track) => ({
                id: t.id,
                clipCount: t.clips.length,
                clips: t.clips.map((c: ClipWithLayer) => ({
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

  // Set up media bin context with proper initialization
  const mediaBinValue: {
    items: MediaItem[];
    selectedItem: MediaItem | null;
    addItems: ReturnType<typeof cy.stub>;
    removeItem: ReturnType<typeof cy.stub>;
    selectItem: (item: MediaItem | null) => void;
  } = {
    items: mediaItems.map(item => ({
      ...item,
      type: item.type || 'video',
      duration: item.duration || 5,
      path: item.path || '/test.mp4'
    })),
    selectedItem: null,
    addItems: cy.stub().as('addItems'),
    removeItem: cy.stub().as('removeItem'),
    selectItem: (item: MediaItem | null) => {
      mediaBinValue.selectedItem = item;
      cy.window().then(win => {
        win.mediaBinContext.selectedItem = item;
        win.mediaBinContext = { ...win.mediaBinContext };
      });
    }
  };

  // Mock useFileOperations hook
  const mockUseFileOperations = () => ({
    validateFile: cy.stub().resolves(true),
    processFile: cy.stub().resolves(createTestMediaItem({
      id: 'test-2',
      name: 'test2.mp4',
      path: '/test2.mp4',
      duration: 10
    }))
  });

  // Visit test page and set up window context
  cy.visit('http://localhost:3000/cypress/fixtures/media-bin.html', {
    onBeforeLoad(win) {
      win.require = mockRequire;
      Object.defineProperty(win, 'logger', {
        value: logger,
        writable: true,
        configurable: true
      });
      // Set up window state
      Object.defineProperty(win, 'timelineState', {
        value: timelineState,
        writable: true,
        configurable: true,
        enumerable: true
      });
      Object.assign(win, {
        timelineDispatch: timelineContext.dispatch,
        useFileOperations: mockUseFileOperations,
        mediaBinContext: mediaBinValue,
        useMediaBin: () => mediaBinValue,
        timelineReady: true
      });

      // Ensure mediaBinContext is properly initialized
      Object.defineProperty(win.mediaBinContext, 'items', {
        value: mediaItems,
        writable: true,
        configurable: true,
        enumerable: true
      });
    }
  });

  // Create and render app root
  cy.document().then(doc => {
    // Remove any existing root element
    const existingRoot = doc.getElementById('root');
    if (existingRoot) {
      existingRoot.remove();
    }

    const mediaItemElements = mediaItems.map(item => `
      <div class="media-asset-item" data-testid="media-bin-item" role="button" aria-selected="false" tabindex="0" data-clip-id="${item.id}" draggable="true">
        <div class="media-asset-thumbnail">
          <div class="media-asset-placeholder" aria-label="Video">🎥</div>
        </div>
        <div class="media-asset-info">
          <div class="media-asset-name">${item.name}</div>
          <div class="media-asset-duration">${item.duration}:00</div>
        </div>
      </div>
    `).join('');

    const root = doc.createElement('div');
    root.id = 'root';
    root.setAttribute('data-testid', 'app-root');
    root.innerHTML = `
      <div data-testid="media-bin" role="region" aria-label="Media Bin">
        <div data-testid="media-bin-content">
          ${mediaItemElements}
        </div>
      </div>
      <div data-testid="timeline">
        <div data-testid="timeline-tracks">
          <div data-testid="timeline-track" data-track-id="track-1"></div>
        </div>
      </div>
    `;
    doc.body.appendChild(root);

    // Add click and keyboard handlers
    doc.querySelectorAll('[data-testid="media-bin-item"]').forEach((item, index) => {
      const handleSelect = () => {
        mediaBinValue.selectItem(mediaItems[index]);
        doc.querySelectorAll('[data-testid="media-bin-item"]').forEach(el => {
          el.classList.remove('selected');
          el.setAttribute('aria-selected', 'false');
        });
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
      };

      item.addEventListener('click', handleSelect);
      (item as HTMLElement).addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleSelect();
        }
      });
    });
  });

  // Return context for test use
  return {
    mediaItems,
    tracks,
    timelineContext,
    mediaBinValue
  };
};
