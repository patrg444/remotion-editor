// Wait for app to load
window.addEventListener('load', () => {
  // Give React a moment to initialize
  setTimeout(() => {
    // Add media items to MediaBin first
    const mediaItems = [
      {
        id: '1',
        name: 'test.webm',
        type: 'video',
        path: 'http://localhost:3001/test-assets/test.webm',
        duration: 10
      },
      {
        id: '2',
        name: 'test.wav',
        type: 'audio',
        path: 'http://localhost:3001/test-assets/test.wav',
        duration: 10
      }
    ];

    window.dispatchEvent(new CustomEvent('test:addMediaItems', {
      detail: mediaItems
    }));

    // Wait a moment for media items to be added
    setTimeout(() => {
      if (!window.timelineDispatch) {
        console.error('Timeline dispatch not available');
        return;
      }

      // Add a video track first
      const videoTrack = {
        id: 'track-1',
        name: 'Video Track',
        type: 'video',
        clips: [],
        isVisible: true,
        isLocked: false
      };

      window.timelineDispatch({
        type: 'ADD_TRACK',
        payload: { track: videoTrack }
      });

      // Wait for track to be added
      setTimeout(() => {
        // Add video clip to track
        const videoClip = {
          id: 'clip-1',
          type: 'video',
          name: 'test.webm',
          startTime: 0,
          endTime: 10,
          originalDuration: 10,
          src: 'http://localhost:3001/test-assets/test.webm',
          effects: [],
          layer: 0,
          transform: {
            scale: 1,
            rotation: 0,
            position: { x: 0, y: 0 },
            opacity: 1
          }
        };

        window.timelineDispatch({
          type: 'ADD_CLIP',
          payload: { trackId: 'track-1', clip: videoClip }
        });

        // Add an audio track
        const audioTrack = {
          id: 'track-2',
          name: 'Audio Track',
          type: 'audio',
          clips: [],
          isVisible: true,
          isLocked: false
        };

        window.timelineDispatch({
          type: 'ADD_TRACK',
          payload: { track: audioTrack }
        });

        // Wait for audio track to be added
        setTimeout(() => {
          // Add audio clip to track
          const audioClip = {
            id: 'clip-2',
            type: 'audio',
            name: 'test.wav',
            startTime: 0,
            endTime: 10,
            originalDuration: 10,
            src: 'http://localhost:3001/test-assets/test.wav',
            effects: [],
            layer: 0
          };

          window.timelineDispatch({
            type: 'ADD_CLIP',
            payload: { trackId: 'track-2', clip: audioClip }
          });
        }, 100); // Wait for audio track to be added
      }, 100); // Wait for video track to be added
    }, 500); // Wait for media items to be added
  }, 1000); // Wait 1 second for React to initialize
});
