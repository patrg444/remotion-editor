import React from 'react';
import { render } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { MediaBinProvider } from '../../contexts/MediaBinContext';

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <TimelineProvider>
      <MediaBinProvider>
        {ui}
      </MediaBinProvider>
    </TimelineProvider>
  );
};

export const createTestMediaItem = (overrides = {}) => ({
  id: `test-${Date.now()}`,
  name: 'test.mp4',
  type: 'video' as const,
  path: 'mock://test.mp4',
  duration: 10,
  originalDuration: 10,
  initialDuration: 10,
  maxDuration: 10,
  ...overrides
});

export const createTestState = (overrides = {}) => ({
  tracks: [],
  mediaItems: [],
  currentTime: 0,
  isPlaying: false,
  isDragging: false,
  selectedClipIds: [],
  selectedCaptionIds: [],
  markers: [],
  playheadTime: 0,
  duration: 0,
  fps: 30,
  zoom: 1,
  scrollX: 0,
  scrollY: 0,
  aspectRatio: '16:9',
  history: {
    entries: [],
    currentIndex: -1
  },
  error: null,
  ...overrides
});
