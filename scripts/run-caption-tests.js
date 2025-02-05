#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// List of caption workflow test files in order
const testFiles = [
  'src/renderer/components/__tests__/caption-workflow.test.tsx',
  'src/renderer/components/__tests__/caption-workflow/end-to-end.test.tsx',
  'src/renderer/components/__tests__/caption-workflow/caption-sync.test.tsx'
];

// Get the test file from command line args, or run all in sequence
const targetTest = process.argv[2];

function runTest(testFile) {
  console.log('\n===========================================');
  console.log(`Running test: ${testFile}`);
  console.log('===========================================\n');

  try {
    // Run Jest with the specific test file and --verbose flag
    execSync(
      `npx jest ${testFile} --verbose --testNamePattern="^((?!skip).)*$"`,
      { stdio: 'inherit' }
    );
    console.log(`\n✓ ${testFile} completed successfully\n`);
  } catch (error) {
    console.error(`\n✗ ${testFile} failed\n`);
    process.exit(1);
  }
}

if (targetTest) {
  // Run specific test file if provided
  const testFile = testFiles.find(f => f.includes(targetTest));
  if (!testFile) {
    console.error(`Test file not found: ${targetTest}`);
    process.exit(1);
  }
  runTest(testFile);
} else {
  // Run all test files in sequence
  console.log('Running all caption workflow tests in sequence...\n');
  testFiles.forEach(runTest);
}
