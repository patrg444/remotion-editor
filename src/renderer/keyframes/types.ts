/**
 * Base interpolation type that defines how values between keyframes are calculated.
 * This is the core type used when creating or updating keyframes, before the interpolation
 * function is added by createKeyframeInterpolation().
 * 
 * There are two possible forms:
 * 1. Simple interpolation: { type: 'linear' | 'step' | 'ease-in' | 'ease-out' | 'ease-in-out' }
 * 2. Bezier interpolation: { type: 'bezier', controlPoints: { in: [x,y], out: [x,y] } }
 * 
 * The Bezier form requires control points to define the curve shape, while other types
 * use predefined interpolation functions.
 */
export type BaseKeyframeInterpolation =
  | { type: Exclude<InterpolationType, InterpolationType.Bezier> }
  | { type: InterpolationType.Bezier; controlPoints: BezierControlPoints };

/**
 * Complete interpolation type with function.
 * This extends BaseKeyframeInterpolation by adding a function property that performs the actual interpolation.
 * The 'fn' property is automatically added by createKeyframeInterpolation() in utils.ts.
 * Do not try to create this type directly - always use createKeyframeInterpolation() to ensure proper setup.
 */
export type KeyframeInterpolation = BaseKeyframeInterpolation & {
  fn: (t: number) => number;
}

/**
 * Available interpolation types for transitions between keyframes
 */
export enum InterpolationType {
  Linear = 'linear',
  Step = 'step',
  EaseIn = 'ease-in',
  EaseOut = 'ease-out',
  EaseInOut = 'ease-in-out',
  Bezier = 'bezier'
}

/**
 * Control points for bezier curve interpolation.
 * Each control point is represented as [x, y] coordinates in normalized space.
 * Both coordinates must be between 0 and 1 inclusive.
 * - The 'in' control point affects how the curve leaves the start point
 * - The 'out' control point affects how the curve approaches the end point
 */
export interface BezierControlPoints {
  in: [number, number];   // [x, y] coordinates for the input control point (0-1)
  out: [number, number];  // [x, y] coordinates for the output control point (0-1)
}

/**
 * State for control point dragging operations
 */
export interface ControlPointDragState {
  point: 'in' | 'out';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isSnapping: boolean;
  isFineControl: boolean;
}

/**
 * Represents a single keyframe with a value at a specific time
 * @template T The type of the keyframe value (defaults to number)
 */
export interface Keyframe<T = number> {
  time: number;
  value: T;
  interpolation: KeyframeInterpolation;
  id?: string;
}

/**
 * Represents a point in the timeline with both screen and timeline coordinates
 */
export interface TimelinePoint {
  x: number;      // Screen X coordinate
  y: number;      // Screen Y coordinate
  time: number;   // Timeline time
  value: number;  // Timeline value
}

/**
 * Represents a keyframe point with screen coordinates and metadata
 */
export interface KeyframePoint {
  x: number;            // Screen X coordinate
  y: number;            // Screen Y coordinate
  time: number;         // Timeline time
  value: number;        // Timeline value
  interpolation: KeyframeInterpolation;  // Interpolation type and settings
}

/**
 * Represents a track of keyframes controlling a single parameter
 * @template T The type of values in the track (defaults to number)
 */
export interface KeyframeTrack<T = number> {
  id: string;
  paramId: string;
  property: string;
  keyframes: Keyframe<T>[];
  defaultValue: T;
  min?: number;  // Always numeric bounds, even for string tracks
  max?: number;  // Always numeric bounds, even for string tracks
  step?: number;
  getValue: (time: number) => T;
}

/**
 * Represents a group of related keyframe tracks
 */
export interface KeyframeGroup {
  id: string;
  name: string;
  tracks: KeyframeTrackReference[];  // Use the reference type directly
  isExpanded: boolean;
}

/**
 * The complete state of the keyframe system
 * @template T The type of values in the tracks (defaults to number)
 */
export interface KeyframeState<T = number> {
  tracks: { [key: string]: KeyframeTrack<T> };
  groups: { [key: string]: KeyframeGroup };
  snapping: boolean;  // Required, default to false in initial state
  duration: number;   // Cached duration of the timeline
  lastModified: number; // Timestamp of last modification for cache invalidation
}

/**
 * Reference to a track within a group
 */
export interface KeyframeTrackReference {
  trackId: string;
  paramId: string;
}

/**
 * Options for control point snapping behavior
 */
export interface ControlPointSnappingOptions {
  enabled: boolean;
  gridSize: number;
  fineControlStep: number;
  shiftMultiplier: number;
}

/**
 * Configuration for Bezier curve visualization
 */
export interface BezierCurveConfig {
  resolution: number;     // Number of points to generate for curve visualization
  handleLength: number;   // Length of control point handle lines
  pointRadius: number;    // Radius of control points
  hitTestRadius: number;  // Radius for hit testing on control points
  gridDivisions: number;  // Number of grid lines to draw
  canvasSize: number;     // Canvas width/height in pixels
  activePointBonus: number; // Extra radius for active points
  tooltipYOffset: number;  // Y offset for tooltip positioning
}

/**
 * Represents the current scroll state of the timeline
 */
export interface ScrollState {
  scrollLeft: number;      // Current horizontal scroll offset
  scrollTop: number;       // Current vertical scroll offset
  containerWidth: number;  // Width of the visible container
  containerHeight: number; // Height of the visible container
  contentWidth: number;    // Total width of the timeline content
  contentHeight: number;   // Total height of the timeline content
}

/**
 * Represents the dimensions and scale of the timeline viewport
 */
export interface ViewportDimensions {
  width: number;          // The total "virtual" width of the timeline
  height: number;         // The total "virtual" height
  pixelsPerSecond: number; // Zoom factor that scales the timeline
}

/**
 * Represents a point in the timeline with time and value coordinates.
 * Used for precise positioning and calculations in the timeline.
 * @template T The type of the value coordinate (defaults to number)
 */
export interface TimelineCoordinates<T extends number | string = number> {
  time: number;  // Time in seconds
  value: T;      // Value at the given time
}

/**
 * Represents a single keyframe operation.
 * This is the base type for all keyframe modifications.
 * @template T The type of values being modified (defaults to number | string)
 */
export type KeyframeOperation<T extends number | string = number | string> = {
  type: 'add' | 'update';
  time: number;
  value: T;
  interpolation: InterpolationType | BaseKeyframeInterpolation;
} | {
  type: 'remove';
  time: number;
};

/**
 * Represents a batch operation for keyframe modifications.
 * Allows multiple keyframe operations to be performed atomically.
 * @template T The type of values being modified (defaults to number | string)
 */
export interface BatchKeyframeOperation<T extends number | string = number | string> {
  trackId: string;
  operations: KeyframeOperation<T>[];
}
