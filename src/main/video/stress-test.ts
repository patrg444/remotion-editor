import { Logger } from '../utils/logger';
import { VideoProcessor } from './VideoProcessor';
import { GPUFrame } from './effects/EffectPlugin';

const logger = new Logger('stress-test');

interface StressTestConfig {
  duration: number;
  frameRate: number;
  resolution: {
    width: number;
    height: number;
  };
  batchSize: number;
}

interface StressTestResults {
  totalFrames: number;
  processedFrames: number;
  averageProcessingTime: number;
  peakMemoryUsage: number;
  gpuStats: {
    averageUtilization: number;
    peakTemperature: number;
    averageEncoderUsage: number;
    averageDecoderUsage: number;
  };
}

export class StressTest {
  private processor: VideoProcessor;
  private config: StressTestConfig;
  private results: StressTestResults;
  private isRunning: boolean = false;

  constructor(config: StressTestConfig) {
    this.processor = new VideoProcessor();
    this.config = config;
    this.results = {
      totalFrames: 0,
      processedFrames: 0,
      averageProcessingTime: 0,
      peakMemoryUsage: 0,
      gpuStats: {
        averageUtilization: 0,
        peakTemperature: 0,
        averageEncoderUsage: 0,
        averageDecoderUsage: 0
      }
    };
  }

  private async monitorGPU(): Promise<void> {
    const stats = await this.processor.getGPUPerformanceStats();
    const memInfo = await this.processor.getGPUMemoryInfo();

    this.results.gpuStats.averageUtilization = stats.utilization;
    this.results.gpuStats.peakTemperature = Math.max(this.results.gpuStats.peakTemperature, stats.temperature);
    this.results.gpuStats.averageEncoderUsage = stats.encoderUsage;
    this.results.gpuStats.averageDecoderUsage = stats.decoderUsage;
    this.results.peakMemoryUsage = Math.max(this.results.peakMemoryUsage, memInfo.used);
  }

  // Reuse frame buffers to reduce memory allocation
  private frameBuffers: Uint8Array[] = [];

  private getFrameBuffer(index: number): Uint8Array {
    const size = this.config.resolution.width * this.config.resolution.height * 4;
    if (!this.frameBuffers[index]) {
      this.frameBuffers[index] = new Uint8Array(size);
    }
    return this.frameBuffers[index];
  }

  private createMockFrame(bufferIndex: number): GPUFrame {
    const { width, height } = this.config.resolution;
    return {
      width,
      height,
      data: this.getFrameBuffer(bufferIndex),
      timestamp: Date.now()
    };
  }

  private createMockBatch(): GPUFrame[] {
    return Array(this.config.batchSize)
      .fill(null)
      .map((_, index) => this.createMockFrame(index));
  }

  private async cleanupBatch(): Promise<void> {
    if (!process.env.CI) {
      // More aggressive cleanup in local development
      await this.processor.clearGPUCache();
      global.gc?.(); // Optional GC if available
    }
  }

  async run(): Promise<StressTestResults> {
    if (this.isRunning) {
      throw new Error('Stress test is already running');
    }

    this.isRunning = true;
    logger.info('Starting stress test with config:', this.config);

    try {
      await this.processor.initialize();
      const capabilities = await this.processor.getGPUCapabilities();
      logger.info('GPU capabilities:', capabilities);

      const totalFrames = this.config.duration * this.config.frameRate;
      const batches = Math.ceil(totalFrames / this.config.batchSize);
      let totalProcessingTime = 0;

      // Pre-allocate batch for reuse
      const batch = this.createMockBatch();

      for (let i = 0; i < batches && this.isRunning; i++) {
        const startTime = Date.now();

        await this.processor.processBatchOnGPU(batch);
        await this.processor.encodeSegmentOnGPU(batch);

        const endTime = Date.now();
        totalProcessingTime += endTime - startTime;

        this.results.processedFrames += batch.length;
        await this.monitorGPU();

        // Cleanup after each batch in local development
        if ((i + 1) % 5 === 0 || !process.env.CI) {
          await this.cleanupBatch();
        }

        // Progress update
        const progress = (i + 1) / batches * 100;
        logger.info(`Progress: ${progress.toFixed(1)}%`);
      }

      // Clear frame buffers
      this.frameBuffers = [];

      this.results.totalFrames = totalFrames;
      this.results.averageProcessingTime = totalProcessingTime / batches;

      await this.processor.clearGPUCache();
      await this.processor.cleanupGPUResources();

      logger.info('Stress test completed');
      logger.info('Results:', this.results);

      return this.results;
    } catch (error) {
      logger.error('Stress test failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
      await this.processor.cleanup();
    }
  }

  stop(): void {
    if (this.isRunning) {
      logger.info('Stopping stress test');
      this.isRunning = false;
    }
  }
}
