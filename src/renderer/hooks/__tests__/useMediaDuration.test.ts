import { renderHook, act } from '@testing-library/react-hooks';
import { useMediaDuration } from '../useMediaDuration';

describe('useMediaDuration', () => {
  // Mock video element and its methods
  let mockVideo: any;
  let loadedMetadataCallback: Function;
  let errorCallback: Function;

  beforeEach(() => {
    // Reset callbacks
    loadedMetadataCallback = () => {};
    errorCallback = () => {};

    // Create mock video element
    mockVideo = {
      src: '',
      duration: 0,
      addEventListener: jest.fn((event, callback) => {
        if (event === 'loadedmetadata') loadedMetadataCallback = callback;
        if (event === 'error') errorCallback = callback;
      }),
      getVideoPlaybackQuality: jest.fn(() => ({
        totalVideoFrames: 300 // 10 seconds at 30fps
      }))
    };

    // Mock document.createElement
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'video') return mockVideo;
      return document.createElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useMediaDuration(null));

    expect(result.current).toEqual({
      duration: 0,
      frameRate: 30,
      isLoading: false,
      error: null
    });
  });

  it('handles null video path', () => {
    const { result } = renderHook(() => useMediaDuration(null));

    expect(result.current.duration).toBe(0);
    expect(result.current.frameRate).toBe(30);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('loads video metadata successfully', async () => {
    const { result } = renderHook(() => useMediaDuration('test-video.mp4'));

    // Should start loading
    expect(result.current.isLoading).toBe(true);
    expect(mockVideo.src).toBe('test-video.mp4');

    // Simulate metadata loaded
    await act(async () => {
      mockVideo.duration = 10; // 10 seconds
      loadedMetadataCallback();
    });

    // Should have updated duration and frame rate
    expect(result.current.duration).toBe(10);
    expect(result.current.frameRate).toBe(30); // 300 frames / 10 seconds
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('handles video load error', async () => {
    const { result } = renderHook(() => useMediaDuration('invalid-video.mp4'));

    // Should start loading
    expect(result.current.isLoading).toBe(true);

    // Simulate error
    await act(async () => {
      errorCallback();
    });

    // Should have error state
    expect(result.current.error).toBe('Failed to load video metadata');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.duration).toBe(0);
    expect(result.current.frameRate).toBe(30);
  });

  it('handles missing getVideoPlaybackQuality', async () => {
    // Remove getVideoPlaybackQuality method
    mockVideo.getVideoPlaybackQuality = undefined;

    const { result } = renderHook(() => useMediaDuration('test-video.mp4'));

    // Simulate metadata loaded
    await act(async () => {
      mockVideo.duration = 10;
      loadedMetadataCallback();
    });

    // Should fall back to default frame rate
    expect(result.current.frameRate).toBe(30);
    expect(result.current.duration).toBe(10);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('updates when video path changes', async () => {
    const { result, rerender } = renderHook(
      (props) => useMediaDuration(props),
      { initialProps: 'video1.mp4' }
    );

    // Load first video
    await act(async () => {
      mockVideo.duration = 10;
      loadedMetadataCallback();
    });

    expect(result.current.duration).toBe(10);

    // Change to second video
    rerender('video2.mp4');

    expect(result.current.isLoading).toBe(true);

    // Load second video
    await act(async () => {
      mockVideo.duration = 20;
      loadedMetadataCallback();
    });

    expect(result.current.duration).toBe(20);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
