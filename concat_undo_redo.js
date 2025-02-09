const fs = require('fs');
const path = require('path');

// Files to concatenate
const files = [
  'src/renderer/contexts/TimelineContext.tsx',
  'src/renderer/types/timeline.ts',
  'src/renderer/utils/timelineConstants.ts',
  'src/renderer/utils/timelineValidation.ts',
  'src/renderer/hooks/useTimeline.ts',
  'src/renderer/utils/historyDiff.ts',
  'cypress/integration/timeline/timeline-undo-redo.spec.ts'
];

// Output file
const outputFile = 'undo_redo_functionality.txt';

// Read and concatenate files
let output = '';
files.forEach(filePath => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    output += `\n${'='.repeat(80)}\n`;
    output += `File: ${filePath}\n`;
    output += `${'='.repeat(80)}\n\n`;
    output += content;
    output += '\n\n';
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }
});

// Write output
try {
  fs.writeFileSync(outputFile, output);
  console.log(`Successfully wrote ${outputFile}`);
} catch (err) {
  console.error('Error writing output file:', err);
}
