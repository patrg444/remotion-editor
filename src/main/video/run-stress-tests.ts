import { Logger } from '../utils/logger';
import { StressTest } from './stress-test';

const logger = new Logger('run-stress-tests');

interface TestConfig {
  duration: number;
  frameRate: number;
  resolution: {
    width: number;
    height: number;
  };
  batchSize: number;
  iterations: number;
}

const fullConfig: TestConfig = {
  duration: 10, // 10 seconds
  frameRate: 30,
  resolution: {
    width: 1920,
    height: 1080
  },
  batchSize: 30,
  iterations: 3
};

const lightConfig: TestConfig = {
  duration: 3, // 3 seconds is enough for local testing
  frameRate: 30,
  resolution: {
    width: 1280,
    height: 720 // 720p is sufficient for local tests
  },
  batchSize: 15, // Smaller batches use less memory
  iterations: 2 // Fewer iterations for quicker feedback
};

// Default to light config for local development
const defaultConfig = process.env.CI ? fullConfig : lightConfig;

export async function runStressTests(config: TestConfig = defaultConfig): Promise<void> {
  // Early warning for memory-intensive tests
  if (!process.env.CI && (
    config.resolution.width > lightConfig.resolution.width ||
    config.resolution.height > lightConfig.resolution.height ||
    config.duration > lightConfig.duration ||
    config.batchSize > lightConfig.batchSize
  )) {
    logger.warn('Running memory-intensive stress test configuration. Consider using lightConfig for local development.');
  }
  logger.info('Starting stress tests with config:', config);

  const results = [];
  for (let i = 0; i < config.iterations; i++) {
    logger.info(`Running iteration ${i + 1} of ${config.iterations}`);

    const test = new StressTest(config);
    try {
      const result = await test.run();
      results.push(result);
      logger.info(`Iteration ${i + 1} completed:`, result);
    } catch (error) {
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

if (require.main === module) {
  runStressTests().catch(error => {
    logger.error('Stress tests failed:', error);
    process.exit(1);
  });
}
