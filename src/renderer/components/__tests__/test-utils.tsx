import React from 'react';
import { render } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { MediaBinProvider } from '../../contexts/MediaBinContext';
import { TimelineState } from '../../types/timeline';

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

export const createTestState = (overrides = {}): TimelineState => ({
  tracks: [],
  currentTime: 0,
  duration: 0,
  isPlaying: false,
  isDragging: false,
  zoom: 1,
  scrollLeft: 0,
  scrollX: 0,
  scrollY: 0,
  aspectRatio: '16:9',
  selectedClipIds: [],
  selectedCaptionIds: [],
  markers: [],
  fps: 30,
  history: {
    entries: [],
    currentIndex: -1
  },
  error: undefined,
  showEffects: true,
  renderQuality: 'preview' as const,
  isSnappingEnabled: true,
  rippleState: {},
  ...overrides
});
