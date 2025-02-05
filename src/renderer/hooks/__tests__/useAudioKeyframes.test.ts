import { renderHook, act } from '@testing-library/react-hooks';
import { useAudioKeyframes } from '../useAudioKeyframes';
import { useKeyframes } from '../useKeyframes';
import { InterpolationType } from '../../types/keyframe';
import { ProcessedAudio } from '../../types/audio';

// Mock useKeyframes hook
jest.mock('../useKeyframes');

describe('useAudioKeyframes', () => {
  const mockTrack = {
    addKeyframe: jest.fn(),
    removeKeyframe: jest.fn(),
    updateKeyframe: jest.fn(),
    getValue: jest.fn(),
    getKeyframes: jest.fn().mockReturnValue([])
  };

  const mockKeyframesManager = {
    createTrack: jest.fn().mockReturnValue(mockTrack)
  };

  // Mock audio data
  const mockAudio: ProcessedAudio = {
    samples: new Float32Array([0.5, -0.5, 0.25, -0.25]),
    peaks: new Float32Array([0.5, 0.25]),
    duration: 1.0,
    sampleRate: 44100,
    channelCount: 2
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useKeyframes as jest.Mock).mockReturnValue(mockKeyframesManager);
  });

  describe('Track Creation', () => {
    it('creates volume and pan tracks with default options', () => {
      renderHook(() => useAudioKeyframes('clip1', 10));

      expect(mockKeyframesManager.createTrack).toHaveBeenCalledTimes(2);
      expect(mockKeyframesManager.createTrack).toHaveBeenCalledWith(
        'audio',
        'volume',
        1, // defaultVolume
        0, // minVolume
        2  // maxVolume
      );
      expect(mockKeyframesManager.createTrack).toHaveBeenCalledWith(
        'audio',
        'pan',
        0,  // defaultPan
        -1, // minPan
        1   // maxPan
      );
    });

    it('creates tracks with custom options', () => {
      const options = {
        defaultVolume: 0.5,
        defaultPan: 0.2,
        minVolume: 0.1,
        maxVolume: 1.5,
        minPan: -0.8,
        maxPan: 0.8
      };

      renderHook(() => useAudioKeyframes('clip1', 10, options));

      expect(mockKeyframesManager.createTrack).toHaveBeenCalledWith(
        'audio',
        'volume',
        options.defaultVolume,
        options.minVolume,
        options.maxVolume
      );
      expect(mockKeyframesManager.createTrack).toHaveBeenCalledWith(
        'audio',
        'pan',
        options.defaultPan,
        options.minPan,
        options.maxPan
      );
    });
  });

  describe('Keyframe Management', () => {
    it('adds volume keyframe with value clamping', () => {
      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      act(() => {
        result.current.addVolumeKeyframe(5, 2.5); // Above max
        result.current.addVolumeKeyframe(6, -0.5); // Below min
      });

      expect(mockTrack.addKeyframe).toHaveBeenCalledWith(5, 2, InterpolationType.Linear);
      expect(mockTrack.addKeyframe).toHaveBeenCalledWith(6, 0, InterpolationType.Linear);
    });

    it('adds pan keyframe with value clamping', () => {
      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      act(() => {
        result.current.addPanKeyframe(5, 1.5); // Above max
        result.current.addPanKeyframe(6, -1.5); // Below min
      });

      expect(mockTrack.addKeyframe).toHaveBeenCalledWith(5, 1, InterpolationType.Linear);
      expect(mockTrack.addKeyframe).toHaveBeenCalledWith(6, -1, InterpolationType.Linear);
    });

    it('supports custom interpolation types', () => {
      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      act(() => {
        result.current.addVolumeKeyframe(5, 1, InterpolationType.Step);
        result.current.addPanKeyframe(6, 0, InterpolationType.Bezier);
      });

      expect(mockTrack.addKeyframe).toHaveBeenCalledWith(5, 1, InterpolationType.Step);
      expect(mockTrack.addKeyframe).toHaveBeenCalledWith(6, 0, InterpolationType.Bezier);
    });
  });

  describe('Effect Application', () => {
    beforeEach(() => {
      mockTrack.getValue.mockImplementation((time) => {
        // Mock volume ramping from 0 to 1
        return time;
      });
    });

    it('applies volume automation to audio samples', () => {
      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      const processed = result.current.applyKeyframedEffects(mockAudio, 0);

      expect(processed).toBeInstanceOf(Float32Array);
      expect(processed.length).toBe(mockAudio.samples.length);
      // Check that volume automation was applied
      expect(processed[0]).not.toBe(mockAudio.samples[0]);
    });

    it('handles stereo panning', () => {
      mockTrack.getValue
        .mockReturnValueOnce(1) // volume
        .mockReturnValueOnce(0.5); // pan

      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      const processed = result.current.applyKeyframedEffects(mockAudio, 0);

      // Check that panning was applied differently to left and right channels
      expect(processed[0]).not.toBe(processed[1]);
    });
  });

  describe('Automation Curves', () => {
    it('generates volume and pan curves at specified resolution', () => {
      mockTrack.getValue.mockImplementation((time) => time * 0.1);

      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      const resolution = 5;
      const { volumeCurve, panCurve } = result.current.getAutomationCurves(resolution);

      expect(volumeCurve).toHaveLength(resolution + 1);
      expect(panCurve).toHaveLength(resolution + 1);
      // Check curve values are evenly spaced
      expect(volumeCurve[1] - volumeCurve[0]).toBeCloseTo(panCurve[1] - panCurve[0]);
    });
  });

  describe('Edge Cases', () => {
    it('handles zero duration', () => {
      const { result } = renderHook(() => useAudioKeyframes('clip1', 0));

      const { volumeCurve, panCurve } = result.current.getAutomationCurves(10);
      expect(volumeCurve).toHaveLength(11); // resolution + 1
      expect(panCurve).toHaveLength(11);
    });

    it('handles missing tracks gracefully', () => {
      mockKeyframesManager.createTrack.mockReturnValue(null);
      const { result } = renderHook(() => useAudioKeyframes('clip1', 10));

      // Should not throw when tracks are null
      act(() => {
        result.current.addVolumeKeyframe(5, 1);
        result.current.addPanKeyframe(5, 0);
      });

      const processed = result.current.applyKeyframedEffects(mockAudio, 0);
      expect(processed).toEqual(mockAudio.samples);
    });
  });
});
