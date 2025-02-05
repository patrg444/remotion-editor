import React from 'react';
import { render, act } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { useTimeline } from '../useTimeline';
import { Track, VideoClip, AudioClip, CaptionClip } from '../../types/timeline';

describe('useTimeline', () => {
  const createMockVideoClip = (id: string, startTime: number, duration: number): VideoClip => ({
    id,
    type: 'video',
    name: `Video ${id}`,
    startTime,
    endTime: startTime + duration,
    src: 'test.mp4',
    originalDuration: duration,
    effects: []
  });

  const createMockAudioClip = (id: string, startTime: number, duration: number): AudioClip => ({
    id,
    type: 'audio',
    name: `Audio ${id}`,
    startTime,
    endTime: startTime + duration,
    src: 'test.mp3',
    originalDuration: duration,
    effects: []
  });

  const createMockTrack = (id: string, type: Track['type'] = 'video'): Track => ({
    id,
    name: `Track ${id}`,
    type,
    clips: []
  });

  const TimelineTestComponent: React.FC = () => {
    const {
      tracks,
      currentTime,
      duration,
      zoom,
      fps,
      isPlaying,
      isDragging,
      selectedTrackId,
      selectedClipIds,
      addTrack,
      updateTrack,
      removeTrack,
      moveTrack,
      addClip,
      updateClip,
      removeClip,
      moveClip,
      splitClip,
      trimClip
    } = useTimeline();

    return (
      <div>
        <div data-testid="tracks">{JSON.stringify(tracks)}</div>
        <div data-testid="current-time">{currentTime}</div>
        <div data-testid="duration">{duration}</div>
        <div data-testid="selected-track">{selectedTrackId}</div>
        <div data-testid="selected-clips">{JSON.stringify(selectedClipIds)}</div>
        <button
          data-testid="add-track"
          onClick={() => addTrack(createMockTrack('track-1'))}
        >
          Add Track
        </button>
        <button
          data-testid="update-track"
          onClick={() => updateTrack('track-1', { name: 'Updated Track' })}
        >
          Update Track
        </button>
        <button
          data-testid="remove-track"
          onClick={() => removeTrack('track-1')}
        >
          Remove Track
        </button>
        <button
          data-testid="add-clip"
          onClick={() => addClip('track-1', createMockVideoClip('clip-1', 0, 5))}
        >
          Add Clip
        </button>
        <button
          data-testid="update-clip"
          onClick={() => updateClip('track-1', 'clip-1', { name: 'Updated Clip' })}
        >
          Update Clip
        </button>
        <button
          data-testid="remove-clip"
          onClick={() => removeClip('track-1', 'clip-1')}
        >
          Remove Clip
        </button>
        <button
          data-testid="move-clip"
          onClick={() => moveClip('clip-1', 'track-1', 'track-2', 10)}
        >
          Move Clip
        </button>
        <button
          data-testid="split-clip"
          onClick={() => splitClip('track-1', 'clip-1', 2.5)}
        >
          Split Clip
        </button>
        <button
          data-testid="trim-clip"
          onClick={() => trimClip('clip-1-1', 1, 4)}
        >
          Trim Clip
        </button>
      </div>
    );
  };

  it('manages tracks', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TimelineTestComponent />
      </TimelineProvider>
    );

    // Add track
    act(() => {
      getByTestId('add-track').click();
    });

    let tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks).toHaveLength(1);
    expect(tracks[0].id).toBe('track-1');

    // Update track
    act(() => {
      getByTestId('update-track').click();
    });

    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks[0].name).toBe('Updated Track');

    // Remove track
    act(() => {
      getByTestId('remove-track').click();
    });

    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks).toHaveLength(0);
  });

  it('manages clips', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TimelineTestComponent />
      </TimelineProvider>
    );

    // Add track and clip
    act(() => {
      getByTestId('add-track').click();
      getByTestId('add-clip').click();
    });

    let tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks[0].clips).toHaveLength(1);
    expect(tracks[0].clips[0].id).toBe('clip-1');

    // Update clip
    act(() => {
      getByTestId('update-clip').click();
    });

    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks[0].clips[0].name).toBe('Updated Clip');

    // Remove clip
    act(() => {
      getByTestId('remove-clip').click();
    });

    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks[0].clips).toHaveLength(0);
  });

  it('handles clip operations', () => {
    const { getByTestId } = render(
      <TimelineProvider>
        <TimelineTestComponent />
      </TimelineProvider>
    );

    // Setup tracks and clip
    act(() => {
      getByTestId('add-track').click();
      getByTestId('add-clip').click();
    });

    // Split clip
    act(() => {
      getByTestId('split-clip').click();
    });

    let tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    expect(tracks[0].clips).toHaveLength(2);

    // Trim clip
    act(() => {
      getByTestId('trim-clip').click();
    });

    tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
    const clip = tracks[0].clips[0];
    expect(clip.startTime).toBe(1);
    expect(clip.endTime).toBe(4);
  });

  describe('mixed track types', () => {
    const MixedTracksComponent: React.FC = () => {
      const { addTrack, addClip, tracks } = useTimeline();

      const addMixedTracks = () => {
        const videoTrack = createMockTrack('video-track', 'video');
        const audioTrack = createMockTrack('audio-track', 'audio');
        addTrack(videoTrack);
        addTrack(audioTrack);
        addClip('video-track', createMockVideoClip('video-clip', 0, 5));
        addClip('audio-track', createMockAudioClip('audio-clip', 0, 5));
      };

      return (
        <div>
          <div data-testid="tracks">{JSON.stringify(tracks)}</div>
          <button data-testid="add-mixed" onClick={addMixedTracks}>Add Mixed</button>
        </div>
      );
    };

    it('handles different track and clip types', () => {
      const { getByTestId } = render(
        <TimelineProvider>
          <MixedTracksComponent />
        </TimelineProvider>
      );

      act(() => {
        getByTestId('add-mixed').click();
      });

      const tracks = JSON.parse(getByTestId('tracks').textContent || '[]');
      expect(tracks).toHaveLength(2);
      expect(tracks[0].type).toBe('video');
      expect(tracks[1].type).toBe('audio');
      expect(tracks[0].clips[0].type).toBe('video');
      expect(tracks[1].clips[0].type).toBe('audio');
    });
  });
});
