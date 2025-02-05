import { useCallback, useRef, useState } from 'react';
import { usePerformanceMonitor } from './usePerformanceMonitor';
import { ProcessedAudio, AudioProcessorOptions } from '../types/audio';

const DEFAULT_OPTIONS: Required<AudioProcessorOptions> = {
  sampleRate: 44100,
  channelCount: 2,
  maxBlockSize: 1024,
};

export function useAudioProcessor(options: AudioProcessorOptions = {}) {
  const {
    sampleRate = DEFAULT_OPTIONS.sampleRate,
    channelCount = DEFAULT_OPTIONS.channelCount,
    maxBlockSize = DEFAULT_OPTIONS.maxBlockSize,
  } = options;

  const audioContextRef = useRef<AudioContext>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { beginRender } = usePerformanceMonitor();

  // Initialize or get AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext({
        sampleRate,
        latencyHint: 'playback',
      });
    }
    return audioContextRef.current;
  }, [sampleRate]);

  // Process audio file
  const processAudioFile = useCallback(async (file: File): Promise<ProcessedAudio> => {
    setIsProcessing(true);
    setError(null);
    const endRender = beginRender();

    try {
      const audioContext = getAudioContext();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Prepare a single merged Float32Array containing all channels (mixed down)
      const samples = new Float32Array(audioBuffer.length);
      for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const channelData = audioBuffer.getChannelData(c);
        for (let i = 0; i < audioBuffer.length; i++) {
          // Mix down by summing channels and dividing by channelCount
          samples[i] += channelData[i] / audioBuffer.numberOfChannels;
        }
      }

      // Calculate peaks for visualization
      const peaks = new Float32Array(Math.ceil(audioBuffer.length / maxBlockSize));
      for (let i = 0; i < peaks.length; i++) {
        const start = i * maxBlockSize;
        const end = Math.min(start + maxBlockSize, samples.length);
        let max = 0;
        for (let j = start; j < end; j++) {
          const value = Math.abs(samples[j]);
          if (value > max) {
            max = value;
          }
        }
        peaks[i] = max;
      }

      const result: ProcessedAudio = {
        samples,
        peaks,
        duration: audioBuffer.duration,
        sampleRate: audioBuffer.sampleRate,
        channelCount: audioBuffer.numberOfChannels,
      };

      setIsProcessing(false);
      endRender();
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to process audio file');
      setError(error);
      setIsProcessing(false);
      endRender();
      throw error;
    }
  }, [getAudioContext, maxBlockSize, beginRender]);

  // Generate waveform data for a specific zoom level
  const generateWaveformData = useCallback((
    audio: ProcessedAudio,
    width: number,
    zoom: number,
  ): Float32Array => {
    const samplesPerPixel = Math.max(1, Math.floor(audio.samples.length / (width * zoom)));
    const waveformData = new Float32Array(Math.ceil(width * zoom));

    for (let i = 0; i < waveformData.length; i++) {
      const start = i * samplesPerPixel;
      const end = Math.min(start + samplesPerPixel, audio.samples.length);
      let max = 0;

      for (let j = start; j < end; j++) {
        const abs = Math.abs(audio.samples[j]);
        if (abs > max) {
          max = abs;
        }
      }
      waveformData[i] = max;
    }

    return waveformData;
  }, []);

  // Apply volume, fade-in, and fade-out to the audio data
  const applyAudioEffects = useCallback((
    audio: ProcessedAudio,
    volume: number = 1,
    fadeIn: number = 0,
    fadeOut: number = 0,
  ): Float32Array => {
    const { samples, sampleRate } = audio;
    const processed = new Float32Array(samples.length);

    // Number of samples for the fades
    const fadeInSamples = Math.floor(fadeIn * sampleRate);
    const fadeOutSamples = Math.floor(fadeOut * sampleRate);
    const startOfFadeOut = samples.length - fadeOutSamples;

    for (let i = 0; i < samples.length; i++) {
      let gain = volume;

      // Fade in: linearly from 0 → volume over fadeInSamples
      if (fadeInSamples > 1 && i < fadeInSamples) {
        // t=0 at i=0; t=1 at i=fadeInSamples-1
        const t = i / (fadeInSamples - 1);
        gain *= t; 
      }

      // Fade out: linearly from volume → 0 over fadeOutSamples
      if (fadeOutSamples > 1 && i >= startOfFadeOut) {
        // t=0 at i=startOfFadeOut; t=1 at i=(startOfFadeOut + fadeOutSamples - 1)
        const t = (i - startOfFadeOut) / (fadeOutSamples - 1);
        // fade from 1 → 0
        gain *= (1 - t);
      }

      processed[i] = samples[i] * gain;
    }

    return processed;
  }, []);

  return {
    processAudioFile,
    generateWaveformData,
    applyAudioEffects,
    isProcessing,
    error,
  };
}
