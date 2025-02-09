// Wait for app to load
window.addEventListener('load', () => {
  // Skip if disabled or running undo/redo test
  if (window.__DISABLE_TEST_IMPORT__ || window.location.href.includes('timeline-undo-redo.spec')) {
    return;
  }

  // Set initial zoom level
  window.timelineState = window.timelineState || {};
  window.timelineState.zoom = 2; // Double the default zoom

  // Function to handle timeline ready event
  const handleTimelineReady = () => {
    // Wait for dispatch to be available
    if (!window.timelineDispatch) {
      setTimeout(handleTimelineReady, 100);
      return;
    }

    // Add media items to MediaBin first
    const mediaItems = [
      {
        id: '1',
        name: 'test.webm',
        type: 'video',
        path: '/test.webm',
        duration: 5
      }
    ];

    window.dispatchEvent(new CustomEvent('test:addMediaItems', {
      detail: mediaItems
    }));

    // Add a video track
    const videoTrack = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      clips: [],
      isVisible: true,
      isLocked: false,
      allowOverlap: false
    };

    window.timelineDispatch({
      type: 'ADD_TRACK',
      payload: { track: videoTrack }
    });

    // Add video clip to track
    const videoClip = {
      id: 'clip-1',
      type: 'video',
      name: 'test.webm',
      startTime: 0,
      endTime: 2,
      src: '/test.webm',
      mediaOffset: 0,
      mediaDuration: 5,
      originalDuration: 2,
      initialDuration: 2,
      maxDuration: 5,
      effects: [],
      layer: 0,
      transform: {
        scale: 1,
        rotation: 0,
        position: { x: 0, y: 0 },
        opacity: 1
      },
      handles: {
        startPosition: 0,
        endPosition: 2
      }
    };

    window.timelineDispatch({
      type: 'ADD_CLIP',
      payload: { trackId: 'track-1', clip: videoClip }
    });
  };

  // Listen for timeline ready event
  window.addEventListener('timeline:initialized', handleTimelineReady);
});
