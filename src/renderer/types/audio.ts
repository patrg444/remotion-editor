export interface ProcessedAudio {
  samples: Float32Array;
  peaks: Float32Array;
  duration: number;
  sampleRate: number;
  channelCount: number;
}

export interface AudioProcessorOptions {
  sampleRate?: number;
  channelCount?: number;
  maxBlockSize?: number;
}
