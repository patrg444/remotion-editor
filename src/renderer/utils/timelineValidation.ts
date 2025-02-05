import { TimelineState } from '../types/timeline';

/**
 * Validates the timeline state structure and returns any validation errors
 */
export function validateTimelineState(state: TimelineState): string[] {
  const errors: string[] = [];

  // Check required properties
  if (!state) {
    errors.push('Timeline state is undefined');
    return errors;
  }

  // Check tracks array
  if (!Array.isArray(state.tracks)) {
    errors.push('Tracks must be an array');
  } else {
    // Validate each track
    state.tracks.forEach((track, index) => {
      if (!track.id) {
        errors.push(`Track at index ${index} is missing id`);
      }
      if (!track.name) {
        errors.push(`Track at index ${index} is missing name`);
      }
      if (!track.type) {
        errors.push(`Track at index ${index} is missing type`);
      }
      if (!Array.isArray(track.clips)) {
        errors.push(`Track at index ${index} clips must be an array`);
      }
    });
  }

  // Check numeric properties
  if (typeof state.currentTime !== 'number') {
    errors.push('currentTime must be a number');
  }
  if (typeof state.duration !== 'number') {
    errors.push('duration must be a number');
  }
  if (typeof state.zoom !== 'number') {
    errors.push('zoom must be a number');
  }
  if (typeof state.fps !== 'number') {
    errors.push('fps must be a number');
  }
  if (typeof state.scrollX !== 'number') {
    errors.push('scrollX must be a number');
  }
  if (typeof state.scrollY !== 'number') {
    errors.push('scrollY must be a number');
  }

  // Check boolean properties
  if (typeof state.isPlaying !== 'boolean') {
    errors.push('isPlaying must be a boolean');
  }
  if (typeof state.isDragging !== 'boolean') {
    errors.push('isDragging must be a boolean');
  }

  // Check arrays
  if (!Array.isArray(state.selectedClipIds)) {
    errors.push('selectedClipIds must be an array');
  }
  if (!Array.isArray(state.selectedCaptionIds)) {
    errors.push('selectedCaptionIds must be an array');
  }
  if (!Array.isArray(state.markers)) {
    errors.push('markers must be an array');
  }

  // Check history
  if (!state.history) {
    errors.push('history is missing');
  } else {
    if (!Array.isArray(state.history.entries)) {
      errors.push('history.entries must be an array');
    }
    if (typeof state.history.currentIndex !== 'number') {
      errors.push('history.currentIndex must be a number');
    }
  }

  return errors;
}
