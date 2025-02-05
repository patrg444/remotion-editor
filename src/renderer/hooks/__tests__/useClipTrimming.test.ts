import { renderHook, act } from '@testing-library/react-hooks';
import { useClipTrimming } from '../useClipTrimming';
import { useTimeline } from '../useTimeline';
import { ProductionClip, Track } from '../../types/timeline';

// Mock useTimeline hook
jest.mock('../useTimeline', () => ({
  useTimeline: jest.fn(),
}));

describe('useClipTrimming', () => {
  const mockTimeline = {
    state: {
      duration: 20,
    },
    trimClip: jest.fn(),
    splitClip: jest.fn(),
    moveClip: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTimeline as jest.Mock).mockReturnValue(mockTimeline);
  });

  const mockClip: ProductionClip = {
    id: 'test-clip',
    type: 'video',
    name: 'Test Video',
    startTime: 0,
    duration: 10,
    source: '/path/to/video.mp4',
  };

  const mockTrack: Track = {
    id: 'track-1',
    name: 'Video Track',
    type: 'video',
    clips: [mockClip],
  };

  it('should handle trim start', () => {
    const { result } = renderHook(() => useClipTrimming());

    act(() => {
      result.current.handleTrimStart(mockClip, mockTrack);
    });

    expect(mockTimeline.trimClip).toHaveBeenCalledWith(mockClip.id, 'in', 0);
  });

  it('should handle trim end', () => {
    const { result } = renderHook(() => useClipTrimming());

    act(() => {
      result.current.handleTrimEnd(mockClip, mockTrack);
    });

    expect(mockTimeline.trimClip).toHaveBeenCalledWith(mockClip.id, 'out', 10);
  });

  it('should handle split clip', () => {
    const { result } = renderHook(() => useClipTrimming());

    act(() => {
      result.current.handleSplitClip(mockClip, 5);
    });

    expect(mockTimeline.splitClip).toHaveBeenCalledWith(mockClip.id, 5);
  });

  it('should handle clip drag', () => {
    const { result } = renderHook(() => useClipTrimming());

    act(() => {
      result.current.handleClipDrag(mockClip, mockTrack, 2, 'target-track');
    });

    expect(mockTimeline.moveClip).toHaveBeenCalledWith(mockClip.id, 'target-track', 2);
  });

  it('should constrain clip drag within timeline bounds', () => {
    const { result } = renderHook(() => useClipTrimming());

    // Try to drag beyond timeline start
    act(() => {
      result.current.handleClipDrag(mockClip, mockTrack, -5, 'target-track');
    });

    expect(mockTimeline.moveClip).toHaveBeenCalledWith(mockClip.id, 'target-track', 0);

    // Try to drag beyond timeline end
    act(() => {
      result.current.handleClipDrag(mockClip, mockTrack, 15, 'target-track');
    });

    expect(mockTimeline.moveClip).toHaveBeenCalledWith(mockClip.id, 'target-track', 10);
  });

  it('should not split clip at invalid times', () => {
    const { result } = renderHook(() => useClipTrimming());

    // Try to split before clip start
    act(() => {
      result.current.handleSplitClip(mockClip, -1);
    });

    expect(mockTimeline.splitClip).not.toHaveBeenCalled();

    // Try to split after clip end
    act(() => {
      result.current.handleSplitClip(mockClip, 11);
    });

    expect(mockTimeline.splitClip).not.toHaveBeenCalled();
  });
});
