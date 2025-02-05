import { Logger } from '../../utils/logger';

const logger = new Logger('EffectPlugin');

export interface GPUFrame {
  width: number;
  height: number;
  data: Uint8Array;
  timestamp: number;
}

export interface EffectOptions {
  intensity?: number;
  duration?: number;
  startTime?: number;
  endTime?: number;
  [key: string]: any;
}

export abstract class EffectPlugin {
  protected name: string;
  protected options: EffectOptions;

  constructor(name: string, options: EffectOptions = {}) {
    this.name = name;
    this.options = options;
  }

  abstract processFrame(frame: GPUFrame): Promise<GPUFrame>;

  getName(): string {
    return this.name;
  }

  getOptions(): EffectOptions {
    return this.options;
  }

  setOptions(options: Partial<EffectOptions>): void {
    this.options = { ...this.options, ...options };
    logger.info(`Updated options for effect ${this.name}:`, this.options);
  }

  async initialize(): Promise<void> {
    logger.info(`Initializing effect ${this.name}`);
  }

  async cleanup(): Promise<void> {
    logger.info(`Cleaning up effect ${this.name}`);
  }
}
