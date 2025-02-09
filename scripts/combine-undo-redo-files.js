#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to combine
const files = [
  'cypress/integration/timeline/timeline-undo-redo.spec.ts',
  'src/renderer/contexts/TimelineContext.tsx',
  'src/renderer/utils/historyDiff.ts',
  'src/renderer/types/timeline.ts'
];

// Output file
const outputFile = 'timeline-undo-redo-implementation.txt';

// Separator line
const separator = '='.repeat(80);

// Read and combine files
let output = '';
files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    output += `${separator}\n`;
    output += `File: ${file}\n`;
    output += `${separator}\n\n`;
    output += content;
    output += '\n\n';
  } catch (err) {
    console.error(`Error reading file ${file}:`, err);
    process.exit(1);
  }
});

// Write combined content to output file
try {
  fs.writeFileSync(outputFile, output);
  console.log(`Successfully created ${outputFile}`);
} catch (err) {
  console.error('Error writing output file:', err);
  process.exit(1);
}
