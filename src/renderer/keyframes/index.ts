// Core keyframe functionality exports
export * from './types';
export * from './utils';
export * from './constants';
export { keyframeReducer, createInitialKeyframeState } from './reducer';

// Additional utility functions
export function isValidTimeRange(time: number, duration: number): boolean {
  return time >= 0 && time <= duration;
}
