# Application Architecture

## Main Process Architecture

The application follows Electron's main/renderer process architecture, with the main process handling system-level operations.

### Core Modules

1. **Video Processing** (`src/main/video/`)
- `VideoProcessor.ts`: Core video processing engine
- `gpu-ipc-handlers.ts`: GPU acceleration management
- `ipc-handlers.ts`: Video operation IPC handlers
- Effects plugin system for video processing

2. **Licensing System** (`src/main/licensing/`)
- License validation and activation
- Payment processing integration
- Webhook handling for license updates
- Notification management

3. **Utilities** (`src/main/utils/`)
- Logging system
- System resource monitoring
- Error handling utilities

### IPC Communication

The application uses a structured IPC system for main/renderer process communication:

```typescript
// Main Process Handler
ipcMain.handle('process-video', async (event, args) => {
  try {
    const result = await videoProcessor.process(args);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Renderer Process Usage
const result = await window.electron.invoke('process-video', {
  clipId: 'clip1',
  effects: ['blur', 'contrast']
});
```

### Process Initialization

1. **Main Process** (`src/main/index.ts`)
- Window management
- Application lifecycle
- System event handling
- IPC setup

2. **Preload Script** (`src/preload.ts`)
- Secure IPC bridge
- Context isolation
- API exposure to renderer

## Renderer Application Structure

### App Component (`src/renderer/App.tsx`)
The main application component serves as the root container and manages the core video editing state:

**State Management**:
- Tracks (video/audio)
- Current time and playback state
- Zoom level
- Track selection

**Key Operations**:
- Track reordering via drag and drop
- Clip movement between tracks
- Timeline navigation
- Zoom control

Currently, the App component primarily renders the Timeline component, but is structured to support additional panels like MediaBin and Inspector.

## Global State Management

### TimelineContext
Located in `src/renderer/contexts/TimelineContext.tsx`, this is the primary state management system for the editor.

**Core State**:
```typescript
{
  currentTime: number
  duration: number
  zoom: number
  playhead: number
  selectedClipId?: string
  selectedTrackId?: string
  isPlaying: boolean
  tracks: Track[]
  history: {
    past: HistoryState[]
    present: HistoryState
    future: HistoryState[]
    undoStack: Operation[]
  }
}
```

**Key Actions**:
- Timeline Navigation: SET_CURRENT_TIME, SET_PLAYHEAD
- Track Management: ADD_TRACK, REMOVE_TRACK, UPDATE_TRACK
- Clip Operations: ADD_CLIP, REMOVE_CLIP, MOVE_CLIP, TRIM_CLIP, SPLIT_CLIP
- Selection: SELECT_CLIP, DESELECT_CLIP, SELECT_TRACK, DESELECT_TRACK
- History: UNDO, REDO

**Usage Pattern**:
```typescript
const { state, dispatch } = useTimelineContext();
// Access state
const { currentTime, tracks } = state;
// Dispatch actions
dispatch({ type: 'SET_CURRENT_TIME', payload: { time: 10 } });
```

## Type System

The application uses TypeScript with a well-defined type system in `src/renderer/types/`.

### Core Data Models

1. **Timeline Types** (`timeline.ts`)
```typescript
interface Track {
  id: string
  name: string
  type: 'video' | 'audio'
  clips: Clip[]
  duration: number
}

interface Clip {
  id: string
  type: 'video' | 'audio'
  startTime: number
  duration: number
  name?: string
}
```

2. **Compositing Types** (`compositing.ts`)
- Layer management
- Blend mode definitions
- Group configurations

3. **Transition Types** (`transition.ts`)
- Transition configurations
- Effect parameters
- Shader definitions

4. **Keyframe Types** (`keyframe.ts`)
- Animation tracks
- Interpolation methods
- Parameter definitions

### API Interfaces

1. **Component Props** (`components.ts`)
- Strongly typed props for all React components
- Event handler definitions
- Common prop types

2. **Audio Processing** (`audio.ts`)
- Waveform data structures
- Audio parameter types
- Processing configurations

3. **GPU Integration** (`gpu.ts`)
- WebGL context types
- Shader program interfaces
- Performance metrics

### Utility Types

1. **Edit History** (`edit-history.ts`)
```typescript
interface HistoryState {
  data: TimelineState
  timestamp: number
  description: string
}

type Operation = {
  type: string
  payload: any
  merge?: boolean
}
```

2. **Keyboard Controls** (`keyboard.ts`)
- Shortcut definitions
- Key combination types
- Event mappings

3. **Window Extensions** (`window.d.ts`)
- Global type augmentations
- Native API extensions
- Environment declarations

## Styling System

The application uses a modular CSS architecture with component-specific stylesheets in `src/renderer/styles/`.

### Core Style Modules

1. **Timeline Components**
- `timeline.css`: Base timeline layout and variables
- `timeline-clip.css`: Clip styling and interactions
- `timeline-track.css`: Track layout and controls
- `timeline-playhead.css`: Playhead visualization
- `timeline-groups.css`: Track grouping styles
- `timeline-shortcuts.css`: Keyboard shortcut overlay

2. **Editor Components**
- `bezier-editor.css`: Curve editor styling
- `keyframe-editor.css`: Keyframe UI components
- `effects-panel.css`: Effects controls and layout
- `edit-history.css`: History panel styling

3. **Visualization Components**
- `composite-renderer.css`: Main preview renderer
- `waveform-renderer.css`: Audio visualization
- `performance-monitor.css`: Performance metrics display
- `gpu-monitor.css`: GPU stats visualization

4. **Common UI Elements**
- `buttons.css`: Shared button styles
- `indicators.css`: Loading and status indicators
- `overlays.css`: Modal and overlay styles
- `texture-loading.css`: Asset loading states

### Color System
```css
:root {
  /* Background Colors */
  --timeline-bg: #1e1e1e
  --timeline-tracks-bg: #2d2d2d
  --ruler-bg: #252525
  
  /* Border Colors */
  --ruler-border-color: #3a3a3a
  --division-color: #666
  
  /* Text Colors */
  --text-primary: #fff
  --text-secondary: #999
  
  /* Interactive Elements */
  --playhead-handle-color: #ff5f5f
  --playhead-handle-hover: #ff7f7f
  --playhead-handle-active: #ff3f3f
  
  /* UI Controls */
  --scrollbar-track-bg: #1e1e1e
  --scrollbar-thumb-bg: #4a4a4a
  --scrollbar-thumb-hover-bg: #5a5a5a
}
```

### Layout Patterns

1. **Timeline Layout**
```css
.timeline-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-x: auto;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  min-width: 100%;
}

.timeline-tracks {
  flex: 1;
  overflow-y: auto;
}
```

2. **Component Containers**
```css
.panel {
  background: var(--timeline-bg);
  border: 1px solid var(--ruler-border-color);
  border-radius: 4px;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
}
```

### Typography
```css
:root {
  /* Font Families */
  --mono-font: 'SF Mono', Monaco, Menlo, Consolas, 'Ubuntu Mono', monospace;
  --system-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Font Sizes */
  --text-xs: 10px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;
}
```

### Animation System
```css
:root {
  /* Transitions */
  --transition-fast: 100ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}

/* Common Animations */
.fade-enter {
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.fade-enter-active {
  opacity: 1;
}
```

## Component Integration

### Core Component Relationships

1. **Timeline Hierarchy**:
```
Timeline
├── TimelineRuler
├── TimelinePlayhead
└── TimelineTracks
    └── TimelineTrack
        ├── TimelineClip
        └── TimelineTransitionHandle
```

2. **Preview System**:
```
PreviewDisplay
├── CompositeRenderer
└── TransitionRenderer
    └── TransitionPreview
```

### Hook Integration

Key hooks and their primary consumers:

```
useTimelineContext
├── Timeline
├── TimelineTrack
└── TimelinePlayhead

useTextureCache
├── CompositeRenderer
├── PreviewDisplay
└── TransitionRenderer

useKeyframes
├── KeyframeEditor
└── EffectsPanel
```

## Test Coverage

### Integration Tests

1. **Timeline + Track Integration**
- Track ordering and selection
- Clip movement between tracks
- Zoom and scroll synchronization

2. **Renderer Integration**
- CompositeRenderer + TextureCache
- Performance with multiple tracks
- Error recovery and boundary conditions

3. **Transition System**
- TransitionRenderer + Preview
- Shader compilation and cleanup
- Resource management

### Key Test Files
- `CompositeRenderer.test.tsx`: Canvas rendering and performance
- `Timeline.test.tsx`: Core timeline functionality
- `useTransition.test.tsx`: Transition effects and WebGL

### Test Gaps
1. End-to-end export workflow
2. Complex multi-track operations
3. Performance under heavy load
4. Cross-component drag and drop

## Planned Improvements

### UI/UX Enhancements
1. MediaBin panel for asset management
2. Inspector panel for clip/track properties
3. Enhanced keyboard shortcuts
4. Improved transition previews

### Technical Improvements
1. WebGL acceleration for CompositeRenderer
2. Virtual scrolling for timeline tracks
3. Improved undo/redo granularity
4. Expanded test coverage

### New Features
1. Effect presets system
2. Advanced audio mixing
3. Marker and annotation system
4. Enhanced export options

## Social Media Content Page

Currently in planning phase. Key considerations:

1. **Layout Structure**
```
ContentPage
├── TemplateSelector
├── MediaLibrary
└── PreviewPanel
    └── ResponsivePreview
```

2. **Required Components**
- Template browsing/selection
- Media asset management
- Format-specific preview
- Export settings

3. **Integration Points**
- Timeline editing capabilities
- Asset management system
- Export workflow
- Template system

This page will need to integrate with the existing timeline editing capabilities while providing specialized tools for social media content creation.

## Build & Development Configuration

### Build System

1. **Webpack Configuration**
- `webpack.config.js`: Base configuration
- `webpack.main.config.js`: Main process build
- `webpack.preload.config.js`: Preload script build

2. **TypeScript Configuration**
- `tsconfig.json`: Base configuration
- `tsconfig.main.json`: Main process config
- `tsconfig.renderer.json`: Renderer process config
- `tsconfig.test.json`: Test environment config

### Development Tools

1. **Testing Setup**
- Jest configuration in `jest.config.js`
- Test utilities in `src/test-utils.tsx`
- Mock implementations in `src/__mocks__/`

2. **Code Quality**
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- PostCSS processing

### Build Scripts

Key npm scripts for development:
```json
{
  "dev": "Start development server",
  "build": "Build production bundle",
  "test": "Run test suite",
  "lint": "Run linting"
}
```
