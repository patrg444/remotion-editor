"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StressTest = void 0;
const logger_1 = require("../utils/logger");
const VideoProcessor_1 = require("./VideoProcessor");
const logger = new logger_1.Logger('stress-test');
class StressTest {
    constructor(config) {
        this.isRunning = false;
        // Reuse frame buffers to reduce memory allocation
        this.frameBuffers = [];
        this.processor = new VideoProcessor_1.VideoProcessor();
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
    async monitorGPU() {
        const stats = await this.processor.getGPUPerformanceStats();
        const memInfo = await this.processor.getGPUMemoryInfo();
        this.results.gpuStats.averageUtilization = stats.utilization;
        this.results.gpuStats.peakTemperature = Math.max(this.results.gpuStats.peakTemperature, stats.temperature);
        this.results.gpuStats.averageEncoderUsage = stats.encoderUsage;
        this.results.gpuStats.averageDecoderUsage = stats.decoderUsage;
        this.results.peakMemoryUsage = Math.max(this.results.peakMemoryUsage, memInfo.used);
    }
    getFrameBuffer(index) {
        const size = this.config.resolution.width * this.config.resolution.height * 4;
        if (!this.frameBuffers[index]) {
            this.frameBuffers[index] = new Uint8Array(size);
        }
        return this.frameBuffers[index];
    }
    createMockFrame(bufferIndex) {
        const { width, height } = this.config.resolution;
        return {
            width,
            height,
            data: this.getFrameBuffer(bufferIndex),
            timestamp: Date.now()
        };
    }
    createMockBatch() {
        return Array(this.config.batchSize)
            .fill(null)
            .map((_, index) => this.createMockFrame(index));
    }
    async cleanupBatch() {
        if (!process.env.CI) {
            // More aggressive cleanup in local development
            await this.processor.clearGPUCache();
            global.gc?.(); // Optional GC if available
        }
    }
    async run() {
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
        }
        catch (error) {
            logger.error('Stress test failed:', error);
            throw error;
        }
        finally {
            this.isRunning = false;
            await this.processor.cleanup();
        }
    }
    stop() {
        if (this.isRunning) {
            logger.info('Stopping stress test');
            this.isRunning = false;
        }
    }
}
exports.StressTest = StressTest;
