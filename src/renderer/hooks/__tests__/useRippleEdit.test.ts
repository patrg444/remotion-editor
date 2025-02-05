import { renderHook } from '@testing-library/react-hooks';
import { useRippleEdit } from '../useRippleEdit';
import { Track, ProductionClip } from '../../types/timeline';

const mockMoveClip = jest.fn();
const mockRemoveClip = jest.fn();
const mockAddClip = jest.fn();
const mockTrimClip = jest.fn();

jest.mock('../useTimeline', () => ({
  useTimeline: () => ({
    removeClip: mockRemoveClip,
    moveClip: mockMoveClip,
    addClip: mockAddClip,
    trimClip: mockTrimClip,
  }),
}));

describe('useRippleEdit', () => {
  const mockTrack: Track = {
    id: 'track-1',
    name: 'Track 1',
    type: 'video',
    clips: [
      {
        id: 'clip-1',
        type: 'video',
        startTime: 0,
        duration: 10,
        trackStart: 0,
        trackEnd: 10,
      },
      {
        id: 'clip-2',
        type: 'video',
        startTime: 10,
        duration: 10,
        trackStart: 10,
        trackEnd: 20,
      },
      {
        id: 'clip-3',
        type: 'video',
        startTime: 20,
        duration: 10,
        trackStart: 20,
        trackEnd: 30,
      }
    ],
    duration: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rippleDelete', () => {
    it('should handle ripple delete of first clip', () => {
      const { result } = renderHook(() => useRippleEdit());
      const clip = mockTrack.clips[0] as ProductionClip;
  
      result.current.rippleDelete(clip, mockTrack);
  
      expect(mockRemoveClip).toHaveBeenCalledWith(mockTrack, clip.id);
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[1].id,
        mockTrack.id,
        0 // New start time after ripple
      );
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[2].id,
        mockTrack.id,
        10 // New start time after ripple
      );
    });

    it('should handle ripple delete of middle clip', () => {
      const { result } = renderHook(() => useRippleEdit());
      const clip = mockTrack.clips[1] as ProductionClip;
  
      result.current.rippleDelete(clip, mockTrack);
  
      expect(mockRemoveClip).toHaveBeenCalledWith(mockTrack, clip.id);
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[2].id,
        mockTrack.id,
        10 // New start time after ripple
      );
    });

    it('should handle ripple delete of last clip', () => {
      const { result } = renderHook(() => useRippleEdit());
      const clip = mockTrack.clips[2] as ProductionClip;
  
      result.current.rippleDelete(clip, mockTrack);
  
      expect(mockRemoveClip).toHaveBeenCalledWith(mockTrack, clip.id);
      expect(mockMoveClip).not.toHaveBeenCalled(); // No clips to move after last clip
    });
  });

  describe('rippleInsert', () => {
    it('should handle ripple insert at start', () => {
      const { result } = renderHook(() => useRippleEdit());
      const newClip: ProductionClip = {
        id: 'new-clip',
        type: 'video',
        startTime: 0,
        duration: 5,
      };
  
      result.current.rippleInsert(newClip, mockTrack, 0);
  
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[0].id,
        mockTrack.id,
        5 // Original start time + new clip duration
      );
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[1].id,
        mockTrack.id,
        15 // Original start time + new clip duration
      );
      expect(mockAddClip).toHaveBeenCalledWith(mockTrack, {
        ...newClip,
        startTime: 0,
      });
    });

    it('should handle ripple insert between clips', () => {
      const { result } = renderHook(() => useRippleEdit());
      const newClip: ProductionClip = {
        id: 'new-clip',
        type: 'video',
        startTime: 5,
        duration: 5,
      };
  
      result.current.rippleInsert(newClip, mockTrack, 10);
  
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[1].id,
        mockTrack.id,
        15 // Original start time + new clip duration
      );
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[2].id,
        mockTrack.id,
        25 // Original start time + new clip duration
      );
      expect(mockAddClip).toHaveBeenCalledWith(mockTrack, {
        ...newClip,
        startTime: 10,
      });
    });

    it('should handle ripple insert at end', () => {
      const { result } = renderHook(() => useRippleEdit());
      const newClip: ProductionClip = {
        id: 'new-clip',
        type: 'video',
        startTime: 30,
        duration: 5,
      };
  
      result.current.rippleInsert(newClip, mockTrack, 30);
  
      expect(mockMoveClip).not.toHaveBeenCalled(); // No clips to move after end
      expect(mockAddClip).toHaveBeenCalledWith(mockTrack, {
        ...newClip,
        startTime: 30,
      });
    });
  });

  describe('rippleTrim', () => {
    it('should handle in trim with ripple', () => {
      const { result } = renderHook(() => useRippleEdit());
      const clip = mockTrack.clips[0] as ProductionClip;
  
      result.current.rippleTrim(clip, mockTrack, 'in', 2);
  
      expect(mockTrimClip).toHaveBeenCalledWith(clip.id, 'in', 2);
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[1].id,
        mockTrack.id,
        12 // Original start time + trim offset
      );
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[2].id,
        mockTrack.id,
        22 // Original start time + trim offset
      );
    });

    it('should handle out trim with ripple', () => {
      const { result } = renderHook(() => useRippleEdit());
      const clip = mockTrack.clips[0] as ProductionClip;
  
      result.current.rippleTrim(clip, mockTrack, 'out', 8);
  
      expect(mockTrimClip).toHaveBeenCalledWith(clip.id, 'out', 8);
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[1].id,
        mockTrack.id,
        8 // New trim point
      );
      expect(mockMoveClip).toHaveBeenCalledWith(
        mockTrack.clips[2].id,
        mockTrack.id,
        18 // Original start time - trim difference
      );
    });

    it('should handle trim of last clip', () => {
      const { result } = renderHook(() => useRippleEdit());
      const clip = mockTrack.clips[2] as ProductionClip;
  
      result.current.rippleTrim(clip, mockTrack, 'out', 25);
  
      expect(mockTrimClip).toHaveBeenCalledWith(clip.id, 'out', 25);
      expect(mockMoveClip).not.toHaveBeenCalled(); // No clips to move after last clip
    });
  });
});
