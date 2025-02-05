#!/usr/bin/env node
require('ts-node').register({
  project: require('path').join(__dirname, '../tsconfig.main.json')
});

const { runStressTests } = require('../src/main/video/run-stress-tests');

const config = {
  duration: 10, // 10 seconds
  frameRate: 30,
  resolution: {
    width: 1920,
    height: 1080
  },
  batchSize: 30,
  iterations: 3
};

console.log('Starting stress tests...');
runStressTests(config)
  .then(() => {
    console.log('Stress tests completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('Stress tests failed:', error);
    process.exit(1);
  });
