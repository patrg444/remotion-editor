"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommercialVideoEngine = void 0;
const logger_1 = require("../../utils/logger");
const VideoProcessor_1 = require("../VideoProcessor");
const logger = new logger_1.Logger('CommercialVideoEngine');
class CommercialVideoEngine {
    constructor(config) {
        this.activeJobs = new Set();
        this.processor = new VideoProcessor_1.VideoProcessor();
        this.config = config;
    }
    async initialize() {
        logger.info('Initializing commercial video engine');
        await this.processor.initialize();
        const capabilities = await this.processor.getGPUCapabilities();
        if (!capabilities.supportedCodecs.includes(this.config.preferredCodec)) {
            logger.warn(`Preferred codec ${this.config.preferredCodec} not supported. Using fallback.`);
        }
    }
    async processVideo(inputPath, outputPath) {
        const jobId = `${inputPath}-${Date.now()}`;
        if (this.activeJobs.size >= this.config.maxConcurrentProcessing) {
            throw new Error('Maximum concurrent processing limit reached');
        }
        this.activeJobs.add(jobId);
        try {
            await this.processor.loadVideo(inputPath);
            const metadata = await this.processor.getMetadata(inputPath);
            logger.info('Processing video with metadata:', metadata);
            // Mock processing
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Return mock metadata for the processed video
            const outputMetadata = {
                duration: metadata.duration,
                width: metadata.width,
                height: metadata.height,
                frameRate: metadata.frameRate,
                codec: this.config.preferredCodec,
                bitrate: metadata.bitrate
            };
            logger.info('Video processing completed:', outputMetadata);
        }
        finally {
            this.activeJobs.delete(jobId);
        }
    }
    async processFrame(frame) {
        return this.processor.processFrame(frame);
    }
    async processHighQualityExport(inputPath, outputPath) {
        const jobId = `export-${Date.now()}`;
        this.activeJobs.add(jobId);
        try {
            await this.processor.loadVideo(inputPath);
            const metadata = await this.processor.getMetadata(inputPath);
            logger.info('Processing high quality export with metadata:', metadata);
            // Mock high quality export
            await new Promise(resolve => setTimeout(resolve, 2000));
            // Return mock metadata for the exported video
            const outputMetadata = {
                duration: metadata.duration,
                width: metadata.width,
                height: metadata.height,
                frameRate: metadata.frameRate,
                codec: 'h264',
                bitrate: 10000000 // 10 Mbps for high quality
            };
            logger.info('High quality export completed:', outputMetadata);
        }
        finally {
            this.activeJobs.delete(jobId);
        }
    }
    async cleanup() {
        logger.info('Cleaning up commercial video engine');
        await this.processor.cleanup();
    }
}
exports.CommercialVideoEngine = CommercialVideoEngine;
