import fs from 'fs';
import path from 'path';

// List of files affecting ripple editing
const files = [
  'cypress/integration/timeline/ripple-positions.spec.ts',
  'cypress/integration/timeline/ripple-extension.spec.ts',
  'cypress/integration/timeline/ripple-track-lock.spec.ts',
  'src/renderer/hooks/useRippleEdit.ts',
  'src/renderer/components/TimelineClip.tsx',
  'src/renderer/contexts/TimelineContext.tsx',
  'src/renderer/hooks/useTimeline.ts',
  'src/renderer/hooks/useTimelineCoordinates.ts',
  'src/renderer/utils/timelineScale.ts',
  'src/renderer/utils/timelineValidation.ts',
  'src/renderer/utils/timelineConstants.ts',
  'src/renderer/types/timeline.ts'
];

const outputFile = 'ripple-editing-files.txt';

// Clear or create output file
fs.writeFileSync(outputFile, '');

// Read and append each file
files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const separator = '='.repeat(80) + '\n';
    const header = `${separator}${file}\n${separator}\n`;
    fs.appendFileSync(outputFile, header + content + '\n\n');
    console.log(`Added ${file}`);
  } catch (err) {
    console.error(`Error processing ${file}:`, err.message);
    const errorNote = `File not found or could not be read: ${file}\n\n`;
    fs.appendFileSync(outputFile, errorNote);
  }
});

console.log(`All files have been combined into ${outputFile}`);
