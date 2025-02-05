# Component Overview

This document provides a detailed overview of the major components, hooks, and utilities in the Remotion Editor project.

## Components

### ActivationDialog
**Location**: `src/renderer/components/ActivationDialog.tsx`

**Purpose**: Provides a modal dialog interface for license key activation, handling user input, validation, and activation state.

**Key Props**:
- `isOpen`: Controls dialog visibility
- `onClose`: Callback for dialog dismissal
- `onActivate`: Callback for license activation
- `error`: Optional error message to display

**Internal State**:
- `licenseKey`: Input value state
- `isActivating`: Loading state during activation
- Input validation state
- Error display state

**Integration Points**:
- Uses useLicensing hook indirectly
- Handles license activation flow
- Manages dialog accessibility
- Provides user feedback

**Test Coverage**:
- Visibility state handling
  - Dialog rendering conditions
  - Open/close behavior
- Input validation
  - Key input updates
  - Whitespace handling
  - Error state display
- Activation flow states
  - Loading state management
  - Success/error handling
  - Input clearing
- Accessibility compliance
  - ARIA attributes
  - Role assignments
  - Error associations
  - Focus management
- Component structure
  - CSS class verification
  - Button states
  - Layout verification

**Known Gaps**:
- No offline activation support
- Limited retry logic
- Missing key format validation
- Could add activation history
- No support for bulk activation

### BezierCurveEditor
**Location**: `src/renderer/components/BezierCurveEditor.tsx`

**Purpose**: Provides a visual editor for creating and modifying bezier curves used in animations and transitions.

**Key Props**:
- `points`: Array of control points
- `onChange`: Callback for point updates
- `width`: Editor width
- `height`: Editor height

**Internal State**:
- Selected point tracking
- Drag state management
- Grid snap calculations
- Point coordinate caching

**Integration Points**:
- Used by transition editor
- Provides curve visualization
- Handles point manipulation
- Exports curve data

**Test Coverage**:
- Point manipulation
  - Drag operations
  - Point selection
  - Coordinate updates
- Grid functionality
  - Snap behavior
  - Grid rendering
  - Scale calculations
- Curve preview
  - Path generation
  - Handle drawing
  - Preview updates
- Interaction handling
  - Mouse events
  - Touch support
  - Keyboard navigation
- Component structure
  - SVG elements
  - Canvas context
  - Style application

**Known Gaps**:
- Limited curve presets
- No animation preview
- Missing undo/redo
- Could add curve library
- No curve comparison
- Missing curve analysis

### CompositeRenderer
**Location**: `src/renderer/components/CompositeRenderer.tsx`

**Purpose**: Renders multiple video tracks and clips onto a canvas with efficient texture caching and performance optimizations for real-time playback.

**Key Props**:
- `tracks`: Array of video tracks to render
- `track`: Single track for isolated rendering
- `zoom`: Timeline zoom level
- `currentTime`: Current playback position
- `isPlaying`: Playback state flag
- `onRenderComplete`: Callback after successful render
- `onRenderError`: Callback for render errors

**Internal State**:
- Canvas context management
- Texture cache utilization
- Animation frame tracking
- Render operation queuing
- Error state handling

**Integration Points**:
- Uses useTextureCache hook
- Manages canvas rendering
- Handles clip positioning
- Coordinates playback
- Processes track data

**Test Coverage**:
- Canvas setup
  - Dimension verification
  - Context initialization
  - Style application
- Track rendering
  - Clip positioning
  - Texture loading
  - Visibility checks
  - Zoom handling
- Performance optimization
  - Animation frame management
  - Texture caching
  - Render batching
  - Memory usage
- Error handling
  - Context failures
  - Texture loading errors
  - Render recovery
  - Error callbacks
- Stress testing
  - Concurrent loading
  - Cache efficiency
  - Memory pressure
  - Rapid updates

**Known Gaps**:
- Limited effect support
- No hardware acceleration
- Missing blend modes
- Could add transitions
- No resolution scaling
- Missing render queue

### EditHistoryPanel
**Location**: `src/renderer/components/EditHistoryPanel.tsx`

**Purpose**: Displays and manages the editing history with undo/redo capabilities, showing track changes, marker updates, and timeline modifications.

**Key Props**:
- `className`: Optional CSS class for styling customization

**Internal State**:
- History state management
- Keyboard shortcut handling
- Undo/redo availability
- Item selection tracking

**Integration Points**:
- Uses TimelineContext
- Handles keyboard shortcuts
- Manages edit history
- Displays state changes

**Test Coverage**:
- History rendering
  - Past items display
  - Present state
  - Future items
- Button functionality
  - Undo enablement
  - Redo enablement
  - Action dispatching
- Keyboard integration
  - Shortcut binding
  - Event handling
  - Cleanup
- Component structure
  - Class application
  - List organization
  - Item rendering
- History items
  - Track counting
  - Clip selection
  - Marker display
  - Point rendering

**Known Gaps**:
- No grouping support
- Limited item details
- Missing search/filter
- Could add descriptions
- No branching history
- Missing state preview

### EffectsPanel
**Location**: `src/renderer/components/EffectsPanel.tsx`

**Purpose**: Manages and displays effect parameters with keyframe animation capabilities, providing an interface for effect configuration and animation.

**Key Props**:
- `effectId`: Unique identifier for the effect
- `name`: Display name of the effect
- `parameters`: Array of parameter configurations (id, name, defaultValue, min, max, step)

**Internal State**:
- Track management via useKeyframes
- Parameter track creation/removal
- Keyframe group organization
- Editor component coordination

**Integration Points**:
- Uses useKeyframes hook
- Integrates with KeyframeEditor
- Integrates with BezierCurveEditor
- Manages parameter tracks
- Coordinates effect animations

**Test Coverage**:
- Parameter rendering
  - Effect name display
  - Parameter list
  - Editor components
- Track management
  - Track creation
  - Track removal
  - Group organization
- Editor integration
  - KeyframeEditor mounting
  - BezierCurveEditor mounting
  - Props validation
- Button functionality
  - Add keyframes
  - Remove keyframes
  - Parameter constraints
- Component structure
  - CSS class verification
  - Layout organization
  - Child component rendering

**Known Gaps**:
- Limited parameter presets
- No effect templates
- Missing batch operations
- Could add parameter groups
- No parameter search
- Missing undo/redo

### ExportOverlay
**Location**: `src/renderer/components/ExportOverlay.tsx`

**Purpose**: Displays a modal overlay with progress information during video export operations, providing real-time feedback and cancellation control.

**Key Props**:
- `isVisible`: Controls overlay visibility
- `isExporting`: Export operation state
- `progress`: Export progress value (0-1)
- `filename`: Name of file being exported
- `onCancel`: Callback for canceling export

**Internal State**:
- Progress value clamping
- Percentage calculation
- Button state management
- Accessibility labeling

**Integration Points**:
- Shows export progress
- Displays file details
- Handles cancellation
- Maintains accessibility

**Test Coverage**:
- Visibility handling
  - Display conditions
  - Hidden states
  - Modal rendering
- Progress display
  - Value clamping
  - Percentage formatting
  - Progress bar width
- Cancel button
  - Click handling
  - Disabled states
  - Label updates
- Accessibility
  - ARIA roles
  - Live regions
  - Progress attributes
  - Button labels
- Component structure
  - Class application
  - Layout organization
  - Progress styling

**Known Gaps**:
- No time estimates
- Limited progress details
- Missing file size info
- Could add error states
- No export settings
- Missing progress history

### FrameCounter
**Location**: `src/renderer/components/FrameCounter.tsx`

**Purpose**: Displays current and total frame counts with time conversion and FPS information, providing both numeric and timecode representations.

**Key Props**:
- `currentFrame`: Current frame number
- `totalFrames`: Total number of frames
- `fps`: Frames per second

**Internal State**:
- Frame count formatting
- Time conversion logic
- Value validation
- Display formatting

**Integration Points**:
- Shows frame progress
- Displays timecode
- Indicates frame rate
- Maintains accessibility

**Test Coverage**:
- Frame counting
  - Number padding
  - Large numbers
  - Negative handling
- Time conversion
  - Frame to time
  - Partial seconds
  - Minute handling
- FPS display
  - Minimum value
  - Format validation
- Component structure
  - Class application
  - Layout verification
  - ARIA labeling
- Accessibility
  - Screen reader support
  - Hidden separators
  - Label presence

**Known Gaps**:
- No frame scrubbing
- Limited time formats
- Missing tooltips
- Could add frame markers
- No frame rate presets
- Missing frame jumping

### FrameRateIndicator
**Location**: `src/renderer/components/FrameRateIndicator.tsx`

**Purpose**: Displays current and target frame rates with visual status indicators, providing real-time performance feedback.

**Key Props**:
- `fps`: Current frames per second
- `targetFps`: Target frame rate
- `frameRate`: Playback speed multiplier

**Internal State**:
- Status class calculation
- FPS value formatting
- Performance status tracking
- Accessibility labeling

**Integration Points**:
- Shows performance status
- Indicates playback speed
- Provides visual feedback
- Manages accessibility info

**Test Coverage**:
- FPS value display
- Status class handling
- Value rounding
- Negative value handling
- Status thresholds
- Accessibility labeling
- CSS class verification
- Edge case handling

**Known Gaps**:
- No historical data
- Limited status types
- Missing tooltips
- Could add trends

### GPUMonitor
**Location**: `src/renderer/components/GPUMonitor.tsx`

**Purpose**: Displays real-time GPU statistics including memory usage, utilization, and temperature for performance monitoring.

**Key Props**:
- `className`: Optional CSS class for styling customization

**Internal State**:
- Uses GPU stats from useGPU hook
- Memory calculation and formatting
- Temperature and utilization tracking
- Display value rounding

**Integration Points**:
- Uses useGPU hook for stats
- Shows memory utilization
- Displays GPU temperature
- Monitors GPU performance

**Test Coverage**:
- Initial stats rendering
- Stats update handling
- Value formatting
- Decimal rounding
- Zero value handling
- Class name application
- Memory calculation
- Edge case handling

**Known Gaps**:
- No alert thresholds
- Limited refresh control
- Missing graph view
- Could add trend analysis

### KeyboardShortcut
**Location**: `src/renderer/components/KeyboardShortcut.tsx`

**Purpose**: Renders a keyboard shortcut with its description, providing consistent formatting and semantic markup for keyboard combinations.

**Key Props**:
- `shortcut`: String representing the keyboard shortcut
- `description`: Text description of the shortcut's action

**Internal State**:
- Pure presentational component
- No internal state management
- Semantic HTML structure

**Integration Points**:
- Used by shortcut displays
- Provides consistent formatting
- Maintains accessibility
- Supports documentation

**Test Coverage**:
- Rendering verification
  - Shortcut display
  - Description text
  - HTML structure
- Content handling
  - Multi-key shortcuts
  - Long descriptions
  - Special characters
- Accessibility
  - Semantic markup
  - Whitespace handling
  - Function keys
  - Modifier combinations
- Component structure
  - Class application
  - Element nesting
  - Text formatting

**Known Gaps**:
- No key icons
- Limited styling options
- Missing platform detection
- Could add key symbols
- No shortcut validation
- Missing tooltip support

### LoadingOverlay
**Location**: `src/renderer/components/LoadingOverlay.tsx`

**Purpose**: Provides a modal overlay with loading spinner and optional progress bar for long-running operations.

**Key Props**:
- `isVisible`: Controls overlay visibility
- `isLoading`: Loading state flag
- `message`: Optional loading message
- `progress`: Optional progress value (0-1)

**Internal State**:
- Progress calculation
- Value clamping
- Visibility control
- Accessibility states

**Integration Points**:
- Shows loading status
- Displays progress bar
- Provides status messages
- Manages accessibility info

**Test Coverage**:
- Visibility state handling
- Progress calculation
- Message display
- Progress bar behavior
- Accessibility compliance
- Value clamping
- CSS class verification
- Edge case handling

**Known Gaps**:
- No loading stages
- Limited animation options
- Missing time estimates
- Could add cancel support

### PerformanceMonitor
**Location**: `src/renderer/components/PerformanceMonitor.tsx`

**Purpose**: Displays real-time performance metrics and graphs for monitoring application performance, including FPS, memory usage, and render times.

**Key Props**:
- `enabled`: Controls component visibility
- `showGraph`: Toggles performance graph display
- `onWarning`: Callback for performance warnings

**Internal State**:
- Performance metrics tracking
- Graph rendering state
- Warning state management
- Canvas context handling

**Integration Points**:
- Uses usePerformanceMonitor hook
- Manages performance visualization
- Handles warning notifications
- Provides real-time metrics

**Test Coverage**:
- Basic visibility handling
- Metrics display validation
- Graph rendering tests
- Warning callback tests
- Performance thresholds
- Canvas operations
- CSS class verification
- Edge case handling

**Known Gaps**:
- Limited graph customization
- No data export
- Missing detailed tooltips
- Could add metric presets

### PlaybackControls
**Location**: `src/renderer/components/PlaybackControls.tsx`

**Purpose**: Provides playback control buttons for video timeline, including play/pause and frame stepping functionality.

**Key Props**:
- `className`: Optional CSS class for styling customization

**Internal State**:
- Uses timeline context for playback state
- Keyboard shortcut handling
- Button state management
- Boundary validation

**Integration Points**:
- Uses useTimeline hook
- Uses useTimelineShortcuts hook
- Manages playback controls
- Handles keyboard events

**Test Coverage**:
- Button rendering
  - Play/pause toggle
  - Step forward/back
  - Button order
- State management
  - Playback toggling
  - Frame stepping
  - Boundary handling
- Button states
  - Disabled conditions
  - Text updates
  - Click handling
- Keyboard integration
  - Event binding
  - Cleanup handling
  - Shortcut processing
- Component structure
  - Class application
  - Layout verification
  - Button organization

**Known Gaps**:
- No speed control
- Limited frame jumping
- Missing loop control
- Could add markers
- No custom shortcuts
- Missing preview tooltip

### PreviewDisplay
**Location**: `src/renderer/components/PreviewDisplay.tsx`

**Purpose**: Provides a canvas-based preview display for video clips with aspect ratio preservation and playback control.

**Key Props**:
- `clip`: Production clip metadata
- `width/height`: Canvas dimensions
- `currentTime`: Current playback position
- `isPlaying`: Playback state flag
- `onTimeUpdate`: Callback for time updates

**Internal State**:
- Canvas context management
- Animation frame handling
- Texture loading state
- Aspect ratio calculations

**Integration Points**:
- Uses useTextureCache hook
- Manages frame rendering
- Handles playback timing
- Maintains aspect ratio

**Test Coverage**:
- Canvas setup and dimensions
- Texture loading and display
- Aspect ratio calculations
- Animation frame handling
- Error state handling
- Cleanup verification
- CSS class verification
- Edge case handling

**Known Gaps**:
- No playback controls
- Limited frame caching
- Missing zoom support
- Could add filters

### TextureLoadingIndicator
**Location**: `src/renderer/components/TextureLoadingIndicator.tsx`

**Purpose**: Displays loading state and error feedback for texture loading operations with retry capability.

**Key Props**:
- `isLoading`: Loading state flag
- `error`: Optional error object
- `onRetry`: Optional retry callback

**Internal State**:
- Loading state display
- Error state handling
- Retry functionality
- Accessibility labeling

**Integration Points**:
- Shows loading progress
- Displays error messages
- Handles retry attempts
- Manages accessibility info

**Test Coverage**:
- Loading state display
- Error state handling
- Retry functionality
- CSS class verification
- ARIA attributes
- Component visibility
- Event handling
- Edge case handling

**Known Gaps**:
- No loading progress
- Limited error details
- Missing animations
- Could add timeouts

### TimeDisplay
**Location**: `src/renderer/components/TimeDisplay.tsx`

**Purpose**: Displays current playback time and total duration in a formatted timecode format (MM:SS:FF).

**Key Props**: None (uses TimelineContext)

**Internal State**:
- Time formatting logic
- FPS calculations
- Frame number handling
- Value rounding

**Integration Points**:
- Uses TimelineContext
- Shows current position
- Displays total duration
- Handles frame rates

**Test Coverage**:
- Time value formatting
- FPS handling
- Value rounding
- Negative time handling
- Zero FPS handling
- Padding validation
- CSS class verification
- Edge case handling

**Known Gaps**:
- No millisecond display
- Limited time formats
- Missing tooltips
- Could add time scrubbing

### TimelineRuler
**Location**: `src/renderer/components/TimelineRuler.tsx`

**Purpose**: Provides a visual ruler with time markers and frame divisions for the timeline, adapting to different zoom levels.

**Key Props**:
- `duration`: Total timeline duration
- `fps`: Frames per second
- `zoom`: Current zoom level

**Internal State**:
- Division calculations
- Marker positioning
- Label formatting
- Zoom-based intervals

**Integration Points**:
- Shows time markers
- Displays frame divisions
- Adapts to zoom levels
- Maintains accessibility

**Test Coverage**:
- SVG setup verification
- Marker positioning
- Time formatting
- Frame markers
- Zoom adaptation
- Visual styling
- Accessibility features
- Edge case handling

**Known Gaps**:
- No custom intervals
- Limited marker styles
- Missing tooltips
- Could add scrubbing

### TimelineGroupPanel
**Location**: `src/renderer/components/TimelineGroupPanel.tsx`

**Purpose**: Manages and displays timeline track groups with blend mode controls, opacity settings, and group-level operations.

**Key Props**:
- `className`: Optional CSS class for styling customization

**Internal State**:
- Uses compositing context for group management
- Group selection tracking
- Collapse state handling
- Layer count tracking

**Integration Points**:
- Uses useCompositing hook
- Manages group operations
- Handles blend modes
- Controls group visibility
- Coordinates layer organization

**Test Coverage**:
- Group rendering
  - Initial display
  - State reflection
  - Layer counting
- Control operations
  - Blend mode selection
  - Opacity adjustment
  - Mute/solo toggles
  - Collapse handling
- Group management
  - Selection handling
  - Removal operations
  - State updates
- Component structure
  - Class application
  - Layout verification
  - Control organization
- Event handling
  - Click propagation
  - State updates
  - Control interactions

**Known Gaps**:
- Limited group nesting
- No drag-drop reordering
- Missing group presets
- Could add group effects
- No group templates
- Limited group metadata

### TimelinePlayhead
**Location**: `src/renderer/components/TimelinePlayhead.tsx`

**Purpose**: Provides a draggable playhead indicator for timeline navigation and playback position control.

**Key Props**:
- `duration`: Total timeline duration
- `frameRate`: Frames per second
- `zoom`: Current zoom level
- `currentTime`: Current playback position
- `isPlaying`: Playback state flag
- `onTimeChange`: Callback for position updates

**Internal State**:
- Drag state management
- Position calculations
- Frame snapping logic
- Event handling

**Integration Points**:
- Handles mouse dragging
- Supports keyboard navigation
- Manages frame snapping
- Maintains accessibility

**Test Coverage**:
- Position rendering
- Drag interaction
- Frame snapping
- Keyboard navigation
- Event cleanup
- Accessibility features
- Boundary handling
- Edge case testing

**Known Gaps**:
- No touch support
- Limited visual feedback
- Missing tooltips
- Could add markers

### TimelinePoint
**Location**: `src/renderer/components/TimelinePoint.tsx`

**Purpose**: Renders different types of timeline points (markers, in/out points) with customizable appearance and interaction handlers.

**Key Props**:
- `time`: Point position in timeline
- `type`: Point type (marker/in/out)
- `label`: Optional point label
- `color`: Optional point color
- `isSelected`: Selection state
- `onClick/onDoubleClick/onContextMenu`: Event handlers

**Internal State**:
- Visual state management
- Type-specific rendering
- Selection handling

**Integration Points**:
- Shows point markers
- Displays point labels
- Handles interactions
- Maintains styling

**Test Coverage**:
- Point type rendering
- Color customization
- Event handling
- Selection state
- Label display
- CSS class verification
- Style application
- Edge case handling

**Known Gaps**:
- No drag support
- Limited animations
- Missing tooltips
- Could add grouping

### TimelineShortcutsHelp
**Location**: `src/renderer/components/TimelineShortcutsHelp.tsx`

**Purpose**: Displays a comprehensive list of keyboard shortcuts for timeline operations with descriptions and proper keyboard key formatting.

**Key Props**:
- `isVisible`: Controls component visibility
- `onClose`: Callback for closing the help dialog

**Internal State**:
- Static shortcuts list
- Visibility control
- Modal dialog management

**Integration Points**:
- Shows keyboard shortcuts
- Provides help documentation
- Manages dialog visibility
- Formats key combinations

**Test Coverage**:
- Visibility handling
  - Display conditions
  - Hidden state
  - Modal rendering
- Content verification
  - Shortcut listing
  - Key formatting
  - Description display
- Dialog interaction
  - Close button
  - Event handling
  - State updates
- Component structure
  - Class application
  - Layout organization
  - List formatting
- Accessibility
  - Keyboard navigation
  - ARIA attributes
  - Semantic markup

**Known Gaps**:
- No category grouping
- Limited key customization
- Missing search function
- Could add context hints
- No platform-specific keys
- Missing shortcut conflicts

### TimelineTrack
**Location**: `src/renderer/components/TimelineTrack.tsx`

**Purpose**: Represents a single track in the timeline, managing clips, track controls, and drag-and-drop interactions.

**Key Props**:
- `track`: Track metadata and clips
- `isSelected`: Selection state
- `onTrackClick/onTrackDrop/onClipDrop`: Event handlers
- `onTrackMute/onTrackSolo/onTrackLock`: Track control handlers
- `onTrackResize`: Track height adjustment handler
- `zoom/currentTime/isPlaying`: Timeline state

**Internal State**:
- Drag state management
- Track height handling
- Clip positioning
- Control states

**Integration Points**:
- Uses TimelineClip component
- Handles drag and drop
- Manages track controls
- Maintains accessibility

**Test Coverage**:
- Track display rendering
- Clip positioning
- Control interactions
- Drag and drop handling
- Track resizing
- State management
- Accessibility features
- Edge case handling

**Known Gaps**:
- Limited track effects
- No nested tracks
- Missing track templates
- Could add track groups

### Timeline
**Location**: `src/renderer/components/Timeline.tsx`

**Purpose**: Main timeline interface component that orchestrates the display and interaction of video/audio tracks.

**Key Props**:
- `tracks`: Array of timeline tracks
- `currentTime`: Current playback position
- `duration`: Total timeline duration
- `zoom`: Timeline zoom level
- `fps`: Frames per second
- `isPlaying`: Playback state

**Internal State**:
- Viewport width tracking
- Scroll position management
- Zoom level state

**Integration Points**:
- Integrates with TimelineTrack, TimelineRuler, and TimelinePlayhead
- Handles track reordering via drag and drop
- Manages zoom and scroll synchronization

**Test Coverage**: 
- Basic functionality tests in Timeline.test.tsx
- Integration tests with child components

### TimelineClip
**Location**: `src/renderer/components/TimelineClip.tsx`

**Purpose**: Represents individual media clips within timeline tracks.

**Key Props**:
- `clip`: Clip metadata (id, name, duration, startTime, etc.)
- `zoom`: Current timeline zoom level
- `currentTime`: Current playback position
- `isSelected`: Selection state
- `isPlaying`: Playback state

**Internal State**:
- Thumbnail loading state
- Drag state management
- Trim handle interactions

**Integration Points**:
- Uses useTextureCache for thumbnail management
- Handles drag-and-drop operations
- Manages trim operations

**Test Coverage**:
- Component rendering tests
- Interaction tests for trimming and dragging
- Thumbnail loading tests

### UpgradeDialog
**Location**: `src/renderer/components/UpgradeDialog.tsx`

**Purpose**: Displays a modal dialog promoting premium features and handling upgrade flow, with accessible feature list presentation.

**Key Props**:
- `isOpen`: Controls dialog visibility
- `onClose`: Callback for dismissing dialog
- `onUpgrade`: Callback for initiating upgrade
- `features`: Array of premium feature descriptions

**Internal State**:
- Modal visibility control
- Feature list rendering
- Button state management
- Accessibility labeling

**Integration Points**:
- Manages upgrade flow
- Displays feature list
- Handles user interaction
- Maintains accessibility

**Test Coverage**:
- Visibility handling
  - Display conditions
  - Hidden state
  - Modal rendering
- Feature list
  - Item rendering
  - Checkmark display
  - List formatting
- Button interactions
  - Close handling
  - Upgrade flow
  - State updates
- Component structure
  - Class application
  - Layout organization
  - Button styling
- Accessibility
  - ARIA attributes
  - Modal roles
  - Feature labeling
  - Button labels

**Known Gaps**:
- No feature comparison
- Limited pricing info
- Missing trial option
- Could add screenshots
- No feature demos
- Limited plan options

### WaveformRenderer
**Location**: `src/renderer/components/WaveformRenderer.tsx`

**Purpose**: Renders audio waveform visualization with interactive volume and fade controls using HTML Canvas.

**Key Props**:
- `audioData`: Float32Array of audio samples
- `width/height`: Canvas dimensions
- `zoom`: Zoom level for waveform detail
- `color/backgroundColor`: Visual styling
- `volume/fadeIn/fadeOut`: Audio control parameters
- `selected`: Selection state for showing controls
- `onVolumeChange/onFadeChange`: Control callbacks

**Internal State**:
- Canvas rendering state
- Drag interaction state
- Performance optimization timers
- Sample calculations cache

**Integration Points**:
- Uses usePerformanceMonitor for render optimization
- Provides interactive volume control
- Manages fade in/out controls
- Handles keyboard accessibility

**Test Coverage**:
- Canvas setup and rendering
- Waveform scaling and zooming
- Volume control interaction
- Fade handle positioning and dragging
- Performance optimization testing
- Accessibility features

**Known Gaps**:
- Could add support for multiple waveform styles
- Needs WebGL acceleration for large audio files
- Could improve performance of real-time updates
- Missing waveform selection functionality

### TransitionEditor
**Location**: `src/renderer/components/TransitionEditor.tsx`

**Purpose**: Provides a user interface for configuring and previewing transitions between clips, with support for multiple transition types and parameters.

**Key Props**:
- `transition`: Current transition configuration
- `previewData`: Preview frame data for transition
- `onParamsChange`: Callback for parameter updates
- `onUpdate`: Callback for transition updates
- `onPreviewGenerated`: Callback for preview frame generation
- `renderOptions`: Optional rendering configuration

**Internal State**:
- Parameter state management
- Preview frame handling
- GPU acceleration toggle state

**Integration Points**:
- Uses TransitionPreview for visual preview
- Supports multiple transition types (Dissolve, Fade, Wipe, etc.)
- Integrates with GPU acceleration system
- Handles frame rendering and preview generation

**Test Coverage**:
- Transition type selection and validation
- Duration control testing
- Direction control for supported transitions
- Easing function selection
- GPU preview toggle functionality
- Preview generation and frame handling
- Parameter update validation

**Known Gaps**:
- Could add support for custom transition types
- Preview performance optimization needed
- Missing advanced easing function editor
- Limited transition parameter presets

### TransitionPreview
**Location**: `src/renderer/components/TransitionPreview.tsx`

**Purpose**: Renders a real-time preview of transition effects between two clips using WebGL, with progress tracking and frame callbacks.

**Key Props**:
- `transition`: Transition configuration
- `width/height`: Canvas dimensions
- `clipAUrl/clipBUrl`: Source clip URLs
- `currentTime`: Current playback position
- `onProgress`: Progress update callback
- `onFrameRendered`: Frame rendering callback

**Internal State**:
- Canvas context management
- WebGL rendering state
- Preview data handling
- Error state management

**Integration Points**:
- Uses useTransition hook
- Manages canvas rendering
- Handles frame generation
- Provides progress feedback

**Test Coverage**:
- Canvas initialization
- Frame rendering
- Progress tracking
- Error handling
- Preview generation
- Callback handling
- State management
- Edge case handling

**Known Gaps**:
- Limited preview resolution
- No frame caching
- Missing performance optimizations
- Could add preview controls

### TransitionRenderer
**Location**: `src/renderer/components/TransitionRenderer.tsx`

**Purpose**: Handles the low-level WebGL rendering of transition effects between clips, managing shader programs and texture loading.

**Key Props**:
- `transition`: Transition configuration
- `fromClip/toClip`: Source clip data
- `progress`: Transition progress
- `width/height`: Canvas dimensions

**Internal State**:
- WebGL context management
- Shader program handling
- Texture state management
- Render frame coordination

**Integration Points**:
- Uses useTextureCache hook
- Manages WebGL resources
- Handles shader compilation
- Coordinates texture loading

**Test Coverage**:
- WebGL initialization
- Shader compilation
- Texture loading
- Resource cleanup
- Error handling
- Performance testing
- Stress testing
- Edge case handling

**Known Gaps**:
- Limited shader effects
- No fallback renderer
- Missing texture compression
- Could add shader precompilation

### CompositeRenderer
**Location**: `src/renderer/components/CompositeRenderer.tsx`

**Purpose**: Handles the visual rendering of timeline tracks and clips using HTML Canvas, managing efficient playback and texture caching.

**Key Props**:
- `tracks`: Array of tracks to render
- `track`: Single track for focused rendering
- `zoom`: Current zoom level
- `currentTime`: Current playback position
- `isPlaying`: Playback state
- `onRenderComplete/onRenderError`: Render status callbacks

**Internal State**:
- Canvas context management
- Animation frame handling
- Texture loading and caching

**Integration Points**:
- Uses useTextureCache for efficient image loading
- Handles clip visibility calculations
- Manages aspect ratio and scaling
- Provides render completion callbacks

**Test Coverage**:
- Canvas setup and dimensions
- Track and clip rendering
- Performance optimization tests
- Error handling scenarios
- Playback and animation frame management
- Stress testing with multiple tracks

**Known Gaps**:
- Could benefit from WebGL acceleration for better performance
- Needs optimization for large numbers of tracks
- Could add support for more complex visual effects

### TimelineTransitionHandle
**Location**: `src/renderer/components/TimelineTransitionHandle.tsx`

**Purpose**: Provides a draggable handle for managing transition points in the timeline with snap-to functionality.

**Key Props**:
- `position`: Current position of the handle
- `onPositionChange`: Callback for position updates
- `onDragStart/onDragEnd`: Drag event callbacks
- `snapThreshold`: Distance threshold for snapping (default: 10)

**Internal State**:
- Uses timeline context for markers and tracks
- Manages drag state and snap point calculations

**Integration Points**:
- Uses useSnapPoints hook for snap functionality
- Uses useTimelineContext for timeline state
- Integrates with marker and clip snap points

**Test Coverage**:
- Comprehensive tests for drag behavior
- Snap point functionality testing
- Edge case handling (missing markers/tracks)
- Custom threshold testing

### KeyframeEditor
**Location**: `src/renderer/components/KeyframeEditor.tsx`

**Purpose**: Provides interface for editing keyframe animations and effects.

**Key Props**:
- `effectId`: Identifier for the effect being edited
- `paramId`: Parameter being keyframed
- `min/max`: Value range constraints
- `step`: Value increment size

**Internal State**:
- Keyframe markers
- Selected marker tracking
- Drag state management
- Current value/time tracking

**Integration Points**:
- Uses useKeyframes hook for keyframe management
- Integrates with effect parameter system
- Timeline synchronization

**Test Coverage**:
- Basic functionality tests
- Keyframe manipulation tests
- Value range validation tests

## Custom Hooks

### useAudioProcessor
**Location**: `src/renderer/hooks/useAudioProcessor.ts`

**Purpose**: Handles audio file processing and waveform generation.

**Key Parameters**:
- `options`: Audio processing configuration (sampleRate, channelCount, maxBlockSize)

**Internal State**:
- AudioContext management
- Processing state tracking
- Error handling

**Behavior**:
- Audio file decoding
- Waveform data generation
- Audio effects application (volume, fade)

**Integration Points**:
- Used by audio clip components
- Integrates with performance monitoring
- Provides data for waveform visualization

**Test Coverage**:
- Audio processing tests
- Error handling tests
- Performance monitoring integration tests

### useEditHistory
**Location**: `src/renderer/hooks/useEditHistory.ts`

**Purpose**: Manages undo/redo functionality for the application, handling operation history with support for operation merging and batching.

**Key Features**:
- Undo/redo stack management
- Operation merging within time windows
- Batch operation support
- Multi-operation handling
- History state tracking

**Internal State**:
- Operations array
- Current index tracking
- Last operation reference
- Operation merging logic

**Integration Points**:
- Used throughout the application for edit operations
- Supports various operation types (keyframe, transition, etc.)
- Provides operation state queries (canUndo/canRedo)
- Handles complex operation merging scenarios

**Test Coverage**:
- Basic operation handling
- Operation merging logic
- Batch operation support
- Multi-operation handling
- Edge case testing
- History truncation
- State management verification

**Known Gaps**:
- No operation compression for memory optimization
- Limited operation metadata tracking
- Could add operation tagging system
- Missing operation search capabilities

### useTransition
**Location**: `src/renderer/hooks/useTransition.ts`

**Purpose**: Manages transition effects between clips using WebGL shaders, handling rendering, parameter updates, and GPU acceleration.

**Key Features**:
- WebGL shader-based transitions
- GPU-accelerated preview rendering
- Parameter management and updates
- Progress tracking and error handling
- Resource cleanup and context management

**Internal State**:
- Transition instance state
- Preview data management
- Render progress tracking
- Error state handling
- WebGL context and resource management

**Integration Points**:
- Uses WebGL2 for shader rendering
- Integrates with GPU acceleration system
- Provides preview data for visualization
- Handles uniform parameter updates

**Test Coverage**:
- Initialization and setup testing
- Progress update handling
- Parameter management
- Error handling scenarios
- WebGL context management
- Resource cleanup verification
- Performance optimization tests

**Known Gaps**:
- Limited shader effect library
- No fallback for WebGL2 unsupported browsers
- Missing transition preset system
- Could improve error recovery mechanisms

### useCompositing
**Location**: `src/renderer/hooks/useCompositing.ts`

**Purpose**: Manages composite layers and track groups, handling layer ordering, grouping, and parameter inheritance.

**Key Features**:
- Layer management (add, remove, update, reorder)
- Group management (create, update, remove)
- Parameter inheritance through group hierarchy
- Layer-group relationship handling
- Selection state management

**Internal State**:
- Layers array with parameters and group associations
- Groups array with track assignments
- Selected layer/group tracking
- Render order management

**Integration Points**:
- Uses useKeyframes for parameter animation
- Uses useEditHistory for operation tracking
- Provides layer parameter calculations
- Manages group hierarchy effects

**Test Coverage**:
- Layer management operations
- Group creation and updates
- Layer-group relationships
- Parameter inheritance
- Selection state handling
- Utility function testing
- Edge case handling

**Known Gaps**:
- Limited blend mode options
- No support for mask layers
- Missing layer effect presets
- Could improve performance for large layer counts

### useKeyboardShortcuts
**Location**: `src/renderer/hooks/useKeyboardShortcuts.ts`

**Purpose**: Manages global keyboard shortcuts for timeline operations, providing unified keyboard interaction handling.

**Key Features**:
- Playback control shortcuts
- Clip deletion handling
- Navigation controls
- History operations
- Track movement
- Selection management
- Modifier key support

**Internal State**:
- Uses timeline context
- Memoized event handler
- Selection tracking
- Boundary validation

**Integration Points**:
- Uses useTimeline hook
- Handles keyboard events
- Controls playback state
- Manages clip operations
- Coordinates track changes

**Test Coverage**:
- Playback control testing
- Clip operation validation
- Navigation handling
- History operations
- Edge case handling
- Selection state testing
- Modifier key scenarios
- Boundary conditions

**Known Gaps**:
- Limited customization
- No shortcut conflicts
- Missing macro support
- Could add combo keys
- Potential duplication with useTimelineShortcuts

**Note**: This hook appears to have overlapping functionality with useTimelineShortcuts. Consider consolidating these hooks to reduce code duplication.

### useTimelineShortcuts
**Location**: `src/renderer/hooks/useTimelineShortcuts.ts`

**Purpose**: Manages keyboard shortcuts for timeline operations, providing a unified interface for keyboard-based interactions.

**Key Features**:
- Playback control shortcuts
- Clip manipulation shortcuts
- Navigation shortcuts
- History operation shortcuts
- Track movement shortcuts
- Selection handling

**Internal State**:
- Uses timeline context
- Memoized event handler
- Selection tracking
- Modifier key handling

**Integration Points**:
- Uses useTimeline hook
- Handles keyboard events
- Controls playback state
- Manages clip operations
- Coordinates track changes

**Test Coverage**:
- Playback control testing
- Clip operation validation
- Movement constraints
- History operations
- Edge case handling
- Selection state testing
- Modifier key scenarios
- Boundary conditions

**Known Gaps**:
- Limited customization
- No shortcut conflicts
- Missing macro support
- Could add combo keys

### useLicensing
**Location**: `src/renderer/hooks/useLicensing.ts`

**Purpose**: Manages application licensing functionality, handling license validation, activation, and upgrades.

**Key Features**:
- License validation
- Activation handling
- Upgrade processing
- Periodic checks
- Status monitoring
- Feature tracking

**Internal State**:
- License status tracking
- Loading indicator
- Validation results
- Feature availability
- Expiration tracking

**Integration Points**:
- Uses Electron IPC
- Integrates with licensing API
- Provides feature access control
- Handles activation flow
- Manages upgrade process

**Test Coverage**:
- Initial state validation
- License check handling
- Activation scenarios
- Upgrade processing
- Periodic check testing
- Error state handling
- Status persistence
- Feature validation

**Known Gaps**:
- Limited offline support
- No license caching
- Missing grace period
- Could add usage analytics

### useFileOperations
**Location**: `src/renderer/hooks/useFileOperations.ts`

**Purpose**: Manages file system operations for opening and saving video files, handling native dialogs and metadata extraction.

**Key Features**:
- File open dialog handling
- File save dialog handling
- Video metadata extraction
- Loading state management
- Error handling
- File type filtering

**Internal State**:
- Loading indicator
- Error state tracking
- Dialog configurations
- File path management

**Integration Points**:
- Uses Electron dialog API
- Handles video metadata
- Integrates with logging system
- Provides operation feedback
- Manages file system access

**Test Coverage**:
- Dialog operation testing
- Metadata handling
- Error state management
- Dialog cancellation
- Loading state tracking
- File type validation
- Error recovery testing
- State persistence

**Known Gaps**:
- Limited file type support
- No batch operations
- Missing progress tracking
- Could add recent files

### useAudioKeyframes
**Location**: `src/renderer/hooks/useAudioKeyframes.ts`

**Purpose**: Manages audio parameter animation through keyframes, providing volume and pan automation for audio clips.

**Key Features**:
- Volume/pan automation
- Keyframe management
- Value interpolation
- Parameter clamping
- Stereo panning support
- Automation curve generation

**Internal State**:
- Volume track reference
- Pan track reference
- Parameter constraints
- Default values
- Track configurations

**Integration Points**:
- Uses useKeyframes hook
- Processes audio samples
- Provides automation curves
- Supports effect visualization
- Handles stereo processing

**Test Coverage**:
- Track creation validation
- Parameter clamping
- Interpolation types
- Effect application
- Stereo handling
- Curve generation
- Edge case handling
- Missing track scenarios

**Known Gaps**:
- Limited automation types
- No surround sound support
- Missing curve presets
- Could add more parameters

### useClipTrimming
**Location**: `src/renderer/hooks/useClipTrimming.ts`

**Purpose**: Manages clip trimming operations in the timeline, providing functionality for adjusting clip boundaries, splitting clips, and handling clip dragging.

**Key Features**:
- Start/end point trimming
- Clip splitting functionality
- Drag position handling
- Boundary constraints
- Timeline synchronization

**Internal State**:
- Pure functional implementation
- Uses timeline context
- Memoized handlers
- Position constraints

**Integration Points**:
- Uses useTimeline hook
- Provides clip editing handlers
- Manages clip boundaries
- Enforces timeline constraints
- Coordinates track changes

**Test Coverage**:
- Start/end trim validation
- Split point handling
- Drag constraints testing
- Boundary condition checks
- Zero duration handling
- Timeline limit testing
- Edge case validation
- Track change verification

**Known Gaps**:
- No multi-clip trimming
- Limited trim snapping
- Missing trim preview
- Could add trim history

### useMediaDuration
**Location**: `src/renderer/hooks/useMediaDuration.ts`

**Purpose**: Manages video metadata loading and extraction, providing duration and frame rate information for timeline media clips.

**Key Features**:
- Video metadata extraction
- Frame rate detection
- Loading state management
- Error handling
- Default value fallbacks
- Path change handling

**Internal State**:
- Duration tracking
- Frame rate calculation
- Loading indicator
- Error state management
- Video element lifecycle

**Integration Points**:
- Used by media clip components
- Provides timeline duration info
- Supports playback configuration
- Handles video path changes
- Integrates with logging system

**Test Coverage**:
- Default state initialization
- Metadata loading process
- Frame rate calculation
- Error state handling
- Path change handling
- Loading state management
- Fallback behavior testing
- Edge case validation

**Known Gaps**:
- Limited codec support
- No audio duration handling
- Missing metadata caching
- Could add format validation

### useTimelineScroll
**Location**: `src/renderer/hooks/useTimelineScroll.ts`

**Purpose**: Manages horizontal scrolling state and behavior for the timeline interface, providing smooth scroll position tracking and event handling.

**Key Features**:
- Scroll position tracking
- Event handling
- Position validation
- Stable callback reference
- Logging integration

**Internal State**:
- Current scroll position
- Memoized scroll handler
- Position bounds checking

**Integration Points**:
- Used by Timeline component
- Provides scroll event handling
- Maintains scroll state
- Supports timeline navigation
- Integrates with logging system

**Test Coverage**:
- Initial state verification
- Scroll event handling
- Position validation
- Multiple event handling
- State persistence
- Callback stability
- Edge case handling
- Render consistency

**Known Gaps**:
- No smooth scrolling
- Limited scroll animation
- Missing scroll to position
- Could add scroll markers

### useSnapPoints
**Location**: `src/renderer/hooks/useSnapPoints.ts`

**Purpose**: Provides snapping functionality for timeline interactions, helping align clips, markers, and playhead positions.

**Key Features**:
- Marker snap point generation
- Clip boundary snapping
- Playhead position snapping
- Nearest point calculation
- Threshold-based snapping

**Internal State**:
- Pure functional implementation
- No internal state management
- Memoized calculations

**Integration Points**:
- Used by timeline interaction components
- Supports clip positioning
- Handles marker alignment
- Integrates with playhead movement
- Provides drag operation assistance

**Test Coverage**:
- Marker snap point generation
- Clip boundary calculations
- Playhead snap point handling
- Nearest point finding
- Multiple track scenarios
- Empty state handling
- Threshold validation
- Edge case testing

**Known Gaps**:
- No multi-point snapping
- Limited snap point types
- Missing grid snapping
- Could add magnetic strength

### usePlayhead
**Location**: `src/renderer/hooks/usePlayhead.ts`

**Purpose**: Manages timeline playback state and controls, providing smooth playback, frame stepping, and keyboard shortcuts.

**Key Features**:
- Playback speed control
- Frame-accurate stepping
- Position clamping
- Drag state handling
- Keyboard shortcuts
- Animation frame management

**Internal State**:
- Current position
- Playback speed
- Drag state
- Animation frame tracking
- Last update timestamp

**Integration Points**:
- Provides position updates
- Handles speed changes
- Supports frame-based navigation
- Manages playback animation
- Integrates keyboard controls

**Test Coverage**:
- Position control and clamping
- Playback speed management
- Frame stepping accuracy
- Keyboard shortcut handling
- Animation frame updates
- Drag state management
- Performance timing
- Edge case handling

**Known Gaps**:
- Limited variable speed support
- No frame blending
- Missing frame caching
- Could add custom shortcuts

### useRippleEdit
**Location**: `src/renderer/hooks/useRippleEdit.ts`

**Purpose**: Manages ripple editing operations in the timeline, automatically adjusting clip positions when inserting, deleting, or trimming clips.

**Key Features**:
- Ripple delete functionality
- Ripple insert operations
- Ripple trim handling
- Automatic clip repositioning
- Timeline synchronization

**Internal State**:
- Uses timeline context for operations
- Tracks clip positions and bounds
- Manages clip relationships

**Integration Points**:
- Uses useTimeline for operations
- Coordinates with clip management
- Handles track modifications
- Maintains timeline continuity

**Test Coverage**:
- Ripple delete scenarios
- Insert operation testing
- Trim operation validation
- Position calculations
- Edge case handling (first/last clips)
- Track modification verification
- Timeline state consistency

**Known Gaps**:
- No multi-track ripple support
- Missing undo grouping
- Could add ripple move operations
- Limited nested operation support

### useGPU
**Location**: `src/renderer/hooks/useGPU.ts`

**Purpose**: Manages GPU monitoring and statistics tracking, providing real-time updates on GPU resource utilization.

**Key Features**:
- GPU memory monitoring
- Utilization tracking
- Temperature monitoring
- Real-time stats updates
- Subscription management

**Internal State**:
- Current GPU statistics
- Update callback reference
- Subscription status
- Initial stats configuration

**Integration Points**:
- Integrates with system GPU API
- Provides stats to monitoring components
- Supports multiple subscribers
- Handles IPC communication

**Test Coverage**:
- Stats initialization testing
- Update callback verification
- Multiple instance handling
- Subscription cleanup
- Independent callback testing
- Stats update propagation

**Known Gaps**:
- Limited GPU vendor support
- No fallback for missing GPU stats
- Missing error recovery mechanisms
- Could add prediction analytics

### useTextureCache
**Location**: `src/renderer/hooks/useTextureCache.ts`

**Purpose**: Manages efficient loading, caching, and cleanup of image textures for the application, supporting both URL and ImageData sources.

**Key Features**:
- Texture loading and caching
- Automatic cache cleanup
- Size limit enforcement
- Error handling and validation
- Loading state tracking
- Cache refresh capabilities

**Internal State**:
- Texture cache with last-used timestamps
- Loading states for each texture
- Error tracking per texture
- Cleanup interval management
- Cache size monitoring

**Integration Points**:
- Used by components needing image loading
- Supports canvas-based image processing
- Handles texture size constraints
- Provides loading state feedback
- Manages memory through cleanup

**Test Coverage**:
- Texture loading from URLs and ImageData
- Cache management and limits
- Error handling scenarios
- Automatic cleanup behavior
- Size limit enforcement
- Cache refresh functionality
- Loading state tracking

**Known Gaps**:
- No WebGL texture support
- Limited format support
- Missing progressive loading
- Could add compression options

### useKeyframes
**Location**: `src/renderer/hooks/useKeyframes.ts`

**Purpose**: Manages keyframe animation state and operations, providing track management, value interpolation, and grouping functionality.

**Key Features**:
- Track creation and management
- Keyframe addition, removal, and updates
- Linear and step interpolation
- Value clamping and validation
- Group management and organization
- Real-time value computation

**Internal State**:
- Track definitions and parameters
- Keyframe arrays with timestamps
- Group configurations
- Interpolation settings
- Value constraints (min/max/step)

**Integration Points**:
- Used by KeyframeEditor for UI interaction
- Provides value interpolation for animations
- Supports effect parameter system
- Enables track grouping and organization
- Handles numeric and non-numeric values

**Test Coverage**:
- Track management operations
- Keyframe ordering and sorting
- Value interpolation methods
- Group creation and updates
- Edge case handling
- Parameter validation
- Non-numeric value handling

**Known Gaps**:
- Limited interpolation types (only linear and step)
- No bezier curve support
- Missing keyframe bulk operations
- Could improve performance for large keyframe sets

## Known Gaps / TODOs

1. **Audio Processing**:
   - Implement real-time audio effects processing
   - Add support for multi-track audio mixing
   - Optimize large file handling

2. **Timeline Performance**:
   - Optimize rendering for large numbers of clips
   - Implement virtual scrolling for long timelines
   - Add caching for waveform data

3. **Keyframe Editor**:
   - Add support for bezier curve interpolation
   - Implement keyframe copying/pasting
   - Add multi-select for keyframes

4. **General Improvements**:
   - Implement undo/redo for all operations
   - Add keyboard shortcuts for common operations
   - Improve accessibility features

## Layout and Utility Files

### TimelineContext
**Location**: `src/renderer/contexts/TimelineContext.tsx`

**Purpose**: Provides shared timeline state and operations to child components.

**Integration Points**:
- Used by all timeline-related components
- Manages global timeline state
- Coordinates between components

**Test Coverage**:
- Context provider tests
- Integration tests with consumers
- State management tests

### usePerformanceMonitor
**Location**: `src/renderer/hooks/usePerformanceMonitor.ts`

**Purpose**: Provides comprehensive performance monitoring and metrics tracking for the application, including frame rates, memory usage, and render times.

**Key Features**:
- FPS measurement
- Frame time tracking
- Memory usage monitoring
- Texture cache tracking
- Active clip counting
- Render time profiling
- Performance history
- Warning generation
- Metric reset capability

**Internal State**:
- Current metrics tracking
- Performance history
- Frame counting
- Timing references
- Warning thresholds
- History length limits

**Integration Points**:
- Used by rendering components
- Provides performance warnings
- Tracks resource usage
- Monitors render times
- Supports debugging tools

**Test Coverage**:
- Frame timing accuracy
- Metrics update handling
- Render time measurement
- History management
- Warning generation
- Reset functionality
- Edge case handling
- Performance thresholds

**Known Gaps**:
- Limited GPU metrics
- No memory leak detection
- Missing thread monitoring
- Could add custom thresholds

## Test Coverage Summary

The project maintains comprehensive test coverage across components and hooks:

- Unit tests for individual components and hooks
- Integration tests for component interactions
- Stress tests for performance-critical features
- Error handling and edge case coverage
- Mock implementations for external dependencies

Key test files are organized in `__tests__` directories alongside their implementation files, with additional stress tests for performance-critical features.
