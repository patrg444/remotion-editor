import { createStateDiff, applyStateDiff } from '../historyDiff';
import { TimelineState, Track, ClipWithLayer } from '../../types/timeline';

describe('historyDiff', () => {
  const mockClip: ClipWithLayer = {
    id: 'clip1',
    type: 'video',
    name: 'Test Video',
    startTime: 0,
    endTime: 10,
    src: 'test.mp4',
    originalDuration: 10,
    effects: [],
    layer: 0
  };

  const mockTrack: Track = {
    id: 'track1',
    name: 'Video Track',
    type: 'video',
    clips: [mockClip]
  };

  const baseState: TimelineState = {
    tracks: [mockTrack],
    currentTime: 0,
    duration: 100,
    zoom: 1,
    fps: 30,
    isPlaying: false,
    isDragging: false,
    scrollX: 0,
    scrollY: 0,
    selectedClipIds: [],
    markers: [],
    history: {
      entries: [],
      currentIndex: -1
    }
  };

  describe('createStateDiff', () => {
    it('detects added tracks', () => {
      const newTrack: Track = {
        id: 'track2',
        name: 'Audio Track',
        type: 'audio',
        clips: []
      };

      const newState = {
        ...baseState,
        tracks: [...baseState.tracks, newTrack]
      };

      const diff = createStateDiff(baseState, newState, 'Add track');
      expect(diff.type).toBe('partial');
      expect(diff.changes.tracks?.added).toHaveLength(1);
      expect(diff.changes.tracks?.added?.[0].id).toBe('track2');
    });

    it('detects removed tracks', () => {
      const newState = {
        ...baseState,
        tracks: []
      };

      const diff = createStateDiff(baseState, newState, 'Remove track');
      expect(diff.type).toBe('partial');
      expect(diff.changes.tracks?.removed).toHaveLength(1);
      expect(diff.changes.tracks?.removed?.[0]).toBe('track1');
    });

    it('detects modified clips', () => {
      const modifiedClip = {
        ...mockClip,
        startTime: 5,
        endTime: 15
      };

      const newState = {
        ...baseState,
        tracks: [{
          ...mockTrack,
          clips: [modifiedClip]
        }]
      };

      const diff = createStateDiff(baseState, newState, 'Modify clip');
      expect(diff.type).toBe('partial');
      expect(diff.changes.tracks?.modified?.[0].clips.modified?.[0].before).toEqual({
        startTime: 0,
        endTime: 10
      });
      expect(diff.changes.tracks?.modified?.[0].clips.modified?.[0].after).toEqual({
        startTime: 5,
        endTime: 15
      });
    });

    it('detects scalar property changes', () => {
      const newState = {
        ...baseState,
        currentTime: 10,
        zoom: 2
      };

      const diff = createStateDiff(baseState, newState, 'Update properties');
      expect(diff.type).toBe('partial');
      expect(diff.changes.currentTime).toBe(10);
      expect(diff.changes.zoom).toBe(2);
    });

    it('creates full diff for large changes', () => {
      const newState = {
        ...baseState,
        currentTime: 10,
        zoom: 2,
        fps: 60,
        duration: 200,
        tracks: []
      };

      const diff = createStateDiff(baseState, newState, 'Major update');
      expect(diff.type).toBe('full');
    });
  });

  describe('applyStateDiff', () => {
    it('applies track additions', () => {
      const newTrack: Track = {
        id: 'track2',
        name: 'Audio Track',
        type: 'audio',
        clips: []
      };

      const diff = createStateDiff(baseState, {
        ...baseState,
        tracks: [...baseState.tracks, newTrack]
      }, 'Add track');

      const result = applyStateDiff(baseState, diff);
      expect(result.tracks).toHaveLength(2);
      expect(result.tracks[1].id).toBe('track2');
    });

    it('applies track removals', () => {
      const diff = createStateDiff(baseState, {
        ...baseState,
        tracks: []
      }, 'Remove track');

      const result = applyStateDiff(baseState, diff);
      expect(result.tracks).toHaveLength(0);
    });

    it('applies clip modifications', () => {
      const modifiedClip = {
        ...mockClip,
        startTime: 5,
        endTime: 15
      };

      const diff = createStateDiff(baseState, {
        ...baseState,
        tracks: [{
          ...mockTrack,
          clips: [modifiedClip]
        }]
      }, 'Modify clip');

      const result = applyStateDiff(baseState, diff);
      expect(result.tracks[0].clips[0].startTime).toBe(5);
      expect(result.tracks[0].clips[0].endTime).toBe(15);
    });

    it('applies scalar property changes', () => {
      const diff = createStateDiff(baseState, {
        ...baseState,
        currentTime: 10,
        zoom: 2
      }, 'Update properties');

      const result = applyStateDiff(baseState, diff);
      expect(result.currentTime).toBe(10);
      expect(result.zoom).toBe(2);
    });

    it('reverses changes correctly', () => {
      const modifiedState = {
        ...baseState,
        currentTime: 10,
        zoom: 2,
        tracks: [{
          ...mockTrack,
          clips: [{
            ...mockClip,
            startTime: 5,
            endTime: 15
          }]
        }]
      };

      const diff = createStateDiff(baseState, modifiedState, 'Multiple changes');
      const forward = applyStateDiff(baseState, diff);
      const reversed = applyStateDiff(forward, diff, true);

      expect(reversed.currentTime).toBe(baseState.currentTime);
      expect(reversed.zoom).toBe(baseState.zoom);
      expect(reversed.tracks[0].clips[0].startTime).toBe(baseState.tracks[0].clips[0].startTime);
      expect(reversed.tracks[0].clips[0].endTime).toBe(baseState.tracks[0].clips[0].endTime);
    });
  });
});
