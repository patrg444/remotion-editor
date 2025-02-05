import { renderHook, act } from '@testing-library/react-hooks';
import { useCaptionSync } from '../useCaptionSync';
import { useTimelineContext } from '../../contexts/TimelineContext';

jest.mock('../../contexts/TimelineContext');

const mockDispatch = jest.fn();
const mockUseTimelineContext = useTimelineContext as jest.Mock;

const mockCaptionClip = {
  id: 'caption-1',
  type: 'caption' as const,
  name: 'Test Captions',
  startTime: 0,
  duration: 10,
  path: '/test/captions.vtt',
  transform: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
  },
  captions: [
    {
      id: 'caption-1-1',
      text: 'Hello world',
      start: 1.0,
      end: 2.0,
      conf: 0.95,
    },
    {
      id: 'caption-1-2',
      text: 'This is a test',
      start: 3.0,
      end: 4.0,
      conf: 0.92,
    },
  ],
};

describe('useCaptionSync', () => {
  beforeEach(() => {
    mockUseTimelineContext.mockReturnValue({
      state: {
        currentTime: 0,
        isPlaying: false,
        selectedCaptionId: null,
      },
      dispatch: mockDispatch,
    });

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('finds active caption at given time', () => {
    const { result } = renderHook(() =>
      useCaptionSync({
        clip: mockCaptionClip,
      })
    );

    const activeCaption = result.current.findActiveCaptionAtTime(1.5);
    expect(activeCaption).toBe(mockCaptionClip.captions[0]);

    const activeCaption2 = result.current.findActiveCaptionAtTime(3.5);
    expect(activeCaption2).toBe(mockCaptionClip.captions[1]);

    const noCaption = result.current.findActiveCaptionAtTime(5.0);
    expect(noCaption).toBeUndefined();
  });

  it('handles caption selection', () => {
    const onCaptionSelect = jest.fn();
    const { result } = renderHook(() =>
      useCaptionSync({
        clip: mockCaptionClip,
        onCaptionSelect,
      })
    );

    act(() => {
      result.current.handleCaptionSelect(mockCaptionClip.captions[0]);
    });

    expect(onCaptionSelect).toHaveBeenCalledWith(mockCaptionClip.captions[0]);
  });

  it('syncs with playback time', () => {
    const onCaptionSelect = jest.fn();
    const { rerender } = renderHook(() =>
      useCaptionSync({
        clip: mockCaptionClip,
        onCaptionSelect,
      })
    );

    // Update time to match first caption
    mockUseTimelineContext.mockReturnValue({
      state: {
        currentTime: 1.5,
        isPlaying: true,
        selectedCaptionId: null,
      },
      dispatch: mockDispatch,
    });
    rerender();

    expect(onCaptionSelect).toHaveBeenCalledWith(mockCaptionClip.captions[0]);

    // Update time to match second caption
    mockUseTimelineContext.mockReturnValue({
      state: {
        currentTime: 3.5,
        isPlaying: true,
        selectedCaptionId: mockCaptionClip.captions[0].id,
      },
      dispatch: mockDispatch,
    });
    rerender();

    expect(onCaptionSelect).toHaveBeenCalledWith(mockCaptionClip.captions[1]);
  });

  it('scrolls selected caption into view', () => {
    const mockElement = document.createElement('div');
    const mockScrollIntoView = jest.fn();
    mockElement.scrollIntoView = mockScrollIntoView;

    const mockQuerySelector = jest.fn().mockReturnValue(mockElement);
    const mockRef = {
      current: {
        querySelector: mockQuerySelector,
      },
    };

    const { result } = renderHook(() =>
      useCaptionSync({
        clip: mockCaptionClip,
      })
    );

    // @ts-ignore - Manually set ref for testing
    result.current.inspectorRef = mockRef;

    act(() => {
      result.current.handleCaptionSelect(mockCaptionClip.captions[0]);
    });

    expect(mockQuerySelector).toHaveBeenCalledWith(
      '[data-caption-id="caption-1-1"]'
    );
    expect(mockScrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'nearest',
    });
  });
});
