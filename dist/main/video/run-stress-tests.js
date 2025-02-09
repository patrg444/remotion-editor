"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runStressTests = void 0;
const logger_1 = require("../utils/logger");
const stress_test_1 = require("./stress-test");
const logger = new logger_1.Logger('run-stress-tests');
const fullConfig = {
    duration: 10,
    frameRate: 30,
    resolution: {
        width: 1920,
        height: 1080
    },
    batchSize: 30,
    iterations: 3
};
const lightConfig = {
    duration: 3,
    frameRate: 30,
    resolution: {
        width: 1280,
        height: 720 // 720p is sufficient for local tests
    },
    batchSize: 15,
    iterations: 2 // Fewer iterations for quicker feedback
};
// Default to light config for local development
const defaultConfig = process.env.CI ? fullConfig : lightConfig;
async function runStressTests(config = defaultConfig) {
    // Early warning for memory-intensive tests
    if (!process.env.CI && (config.resolution.width > lightConfig.resolution.width ||
        config.resolution.height > lightConfig.resolution.height ||
        config.duration > lightConfig.duration ||
        config.batchSize > lightConfig.batchSize)) {
        logger.warn('Running memory-intensive stress test configuration. Consider using lightConfig for local development.');
    }
    logger.info('Starting stress tests with config:', config);
    const results = [];
    for (let i = 0; i < config.iterations; i++) {
        logger.info(`Running iteration ${i + 1} of ${config.iterations}`);
        const test = new stress_test_1.StressTest(config);
        try {
            const result = await test.run();
            results.push(result);
            logger.info(`Iteration ${i + 1} completed:`, result);
        }
        catch (error) {
            logger.error(`Iteration ${i + 1} failed:`, error);
            throw error;
        }
    }
    // Calculate averages
    const averages = {
        averageProcessingTime: results.reduce((sum, r) => sum + r.averageProcessingTime, 0) / results.length,
        averageGPUUtilization: results.reduce((sum, r) => sum + r.gpuStats.averageUtilization, 0) / results.length,
        peakTemperature: Math.max(...results.map(r => r.gpuStats.peakTemperature)),
        peakMemoryUsage: Math.max(...results.map(r => r.peakMemoryUsage))
    };
    logger.info('All stress tests completed. Summary:', averages);
}
exports.runStressTests = runStressTests;
if (require.main === module) {
    runStressTests().catch(error => {
        logger.error('Stress tests failed:', error);
        process.exit(1);
    });
}
