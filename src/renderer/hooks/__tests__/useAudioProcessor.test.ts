import { renderHook, act } from '@testing-library/react-hooks';
import { useAudioProcessor } from '../useAudioProcessor';
import { usePerformanceMonitor } from '../usePerformanceMonitor';
import { ProcessedAudio } from '../../types/audio';

// Mock usePerformanceMonitor
jest.mock('../usePerformanceMonitor');

describe('useAudioProcessor', () => {
  // Mock AudioContext and its methods
  let mockAudioContext: any;
  let mockAudioBuffer: any;
  let mockChannelData: Float32Array;

  beforeEach(() => {
    // Create sample audio data
    mockChannelData = new Float32Array([0.5, -0.5, 0.25, -0.25]); // Simple waveform

    // Mock AudioBuffer
    mockAudioBuffer = {
      length: mockChannelData.length,
      duration: 1.0, // 1 second
      sampleRate: 44100,
      numberOfChannels: 2,
      getChannelData: jest.fn().mockReturnValue(mockChannelData)
    };

    // Mock AudioContext
    mockAudioContext = {
      sampleRate: 44100,
      decodeAudioData: jest.fn().mockImplementation((arrayBuffer) => 
        Promise.resolve(mockAudioBuffer)
      )
    };

    // Mock AudioContext constructor
    (global as any).AudioContext = jest.fn().mockImplementation(() => mockAudioContext);

    // Mock performance monitor
    (usePerformanceMonitor as jest.Mock).mockReturnValue({
      beginRender: jest.fn().mockReturnValue(jest.fn()) // Returns endRender function
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Audio File Processing', () => {
    it('processes audio file successfully', async () => {
      const { result } = renderHook(() => useAudioProcessor());

      const mockFile = new File(['audio-data'], 'test.wav', { type: 'audio/wav' });
      const processedAudio = await result.current.processAudioFile(mockFile);

      expect(processedAudio).toBeDefined();
      expect(processedAudio.samples).toBeInstanceOf(Float32Array);
      expect(processedAudio.peaks).toBeInstanceOf(Float32Array);
      expect(processedAudio.duration).toBe(1.0);
      expect(processedAudio.sampleRate).toBe(44100);
      expect(processedAudio.channelCount).toBe(2);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('handles audio processing errors', async () => {
      const { result } = renderHook(() => useAudioProcessor());

      // Mock decodeAudioData to fail
      mockAudioContext.decodeAudioData.mockRejectedValue(new Error('Decoding failed'));

      const mockFile = new File(['invalid-audio'], 'test.wav', { type: 'audio/wav' });
      
      await expect(result.current.processAudioFile(mockFile)).rejects.toThrow('Decoding failed');
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it('handles custom sample rate', async () => {
      const { result } = renderHook(() => useAudioProcessor({ sampleRate: 48000 }));

      const mockFile = new File(['audio-data'], 'test.wav', { type: 'audio/wav' });
      await result.current.processAudioFile(mockFile);

      expect(AudioContext).toHaveBeenCalledWith(expect.objectContaining({
        sampleRate: 48000
      }));
    });
  });

  describe('Waveform Generation', () => {
    let processedAudio: ProcessedAudio;

    beforeEach(() => {
      processedAudio = {
        samples: new Float32Array([0.5, -0.5, 0.25, -0.25, 0.1, -0.1]),
        peaks: new Float32Array([0.5, 0.25, 0.1]),
        duration: 1.0,
        sampleRate: 44100,
        channelCount: 2
      };
    });

    it('generates waveform data at different zoom levels', () => {
      const { result } = renderHook(() => useAudioProcessor());

      // Test different zoom levels
      const width = 2;
      const zoomLevels = [1, 2];

      zoomLevels.forEach(zoom => {
        const waveform = result.current.generateWaveformData(processedAudio, width, zoom);
        expect(waveform).toBeInstanceOf(Float32Array);
        expect(waveform.length).toBe(Math.ceil(width * zoom));
      });
    });

    it('handles edge case of width smaller than sample count', () => {
      const { result } = renderHook(() => useAudioProcessor());

      const waveform = result.current.generateWaveformData(processedAudio, 1, 1);
      expect(waveform).toBeInstanceOf(Float32Array);
      expect(waveform.length).toBe(1);
      // Should contain the maximum absolute value
      expect(waveform[0]).toBe(0.5);
    });
  });

  describe('Audio Effects', () => {
    let processedAudio: ProcessedAudio;

    beforeEach(() => {
      processedAudio = {
        samples: new Float32Array([0.5, -0.5, 0.25, -0.25]),
        peaks: new Float32Array([0.5, 0.25]),
        duration: 1.0,
        sampleRate: 44100,
        channelCount: 2
      };
    });

    it('applies volume adjustment', () => {
      const { result } = renderHook(() => useAudioProcessor());

      const processed = result.current.applyAudioEffects(processedAudio, 0.5);
      
      // Check that all samples are halved
      expect(processed[0]).toBe(0.25); // 0.5 * 0.5
      expect(processed[1]).toBe(-0.25); // -0.5 * 0.5
    });

    it('applies fade-in effect', () => {
      const { result } = renderHook(() => useAudioProcessor());

      const fadeInDuration = 1.0; // Full duration fade
      const processed = result.current.applyAudioEffects(processedAudio, 1.0, fadeInDuration);

      // Check fade-in progression
      expect(processed[0]).toBeLessThan(processedAudio.samples[0]); // Start of fade
      expect(processed[processed.length - 1]).toBe(processedAudio.samples[processed.length - 1]); // End of fade
    });

    it('applies fade-out effect', () => {
      const { result } = renderHook(() => useAudioProcessor());

      const fadeOutDuration = 1.0; // Full duration fade
      const processed = result.current.applyAudioEffects(processedAudio, 1.0, 0, fadeOutDuration);

      // Check fade-out progression
      expect(processed[0]).toBe(processedAudio.samples[0]); // Before fade
      expect(processed[processed.length - 1]).toBeLessThan(processedAudio.samples[processed.length - 1]); // End of fade
    });

    it('combines multiple effects', () => {
      const { result } = renderHook(() => useAudioProcessor());

      const processed = result.current.applyAudioEffects(
        processedAudio,
        0.5, // Volume
        0.5, // Fade-in
        0.5  // Fade-out
      );

      // Check combined effects
      expect(processed[0]).toBeLessThan(processedAudio.samples[0] * 0.5); // Start (fade-in + volume)
      expect(processed[processed.length - 1]).toBeLessThan(processedAudio.samples[processed.length - 1] * 0.5); // End (fade-out + volume)
    });
  });

  describe('Edge Cases', () => {
    it('handles empty audio file', async () => {
      const { result } = renderHook(() => useAudioProcessor());

      // Mock empty audio buffer
      mockAudioBuffer = {
        length: 0,
        duration: 0,
        sampleRate: 44100,
        numberOfChannels: 2,
        getChannelData: jest.fn().mockReturnValue(new Float32Array())
      };

      const mockFile = new File([''], 'empty.wav', { type: 'audio/wav' });
      const processedAudio = await result.current.processAudioFile(mockFile);

      expect(processedAudio.samples.length).toBe(0);
      expect(processedAudio.peaks.length).toBe(0);
      expect(processedAudio.duration).toBe(0);
    });

    it('handles single-channel audio', async () => {
      const { result } = renderHook(() => useAudioProcessor());

      // Mock mono audio buffer
      mockAudioBuffer = {
        length: mockChannelData.length,
        duration: 1.0,
        sampleRate: 44100,
        numberOfChannels: 1,
        getChannelData: jest.fn().mockReturnValue(mockChannelData)
      };

      const mockFile = new File(['mono-audio'], 'mono.wav', { type: 'audio/wav' });
      const processedAudio = await result.current.processAudioFile(mockFile);

      expect(processedAudio.channelCount).toBe(1);
      expect(processedAudio.samples).toEqual(mockChannelData);
    });

    it('handles zero volume', () => {
      const { result } = renderHook(() => useAudioProcessor());

      const processedAudio = {
        samples: new Float32Array([0.5, -0.5]),
        peaks: new Float32Array([0.5]),
        duration: 1.0,
        sampleRate: 44100,
        channelCount: 2
      };

      const processed = result.current.applyAudioEffects(processedAudio, 0);
      expect(Array.from(processed)).toEqual([0, 0]);
    });
  });
});
