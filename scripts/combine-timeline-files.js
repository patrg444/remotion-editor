const fs = require('fs');
const path = require('path');

// List of files to combine
const files = [
  'cypress/integration/timeline/timeline-undo-redo.spec.ts',
  'cypress/support/utils/timeline.ts',
  'src/renderer/components/Timeline.tsx',
  'src/renderer/components/TimelineContainer.tsx',
  'src/renderer/components/TimelineTracks.tsx',
  'src/renderer/components/TimelineTrack.tsx',
  'src/renderer/components/TimelineClip.tsx',
  'src/renderer/components/clips/VideoClipContent.tsx',
  'src/renderer/contexts/TimelineContext.tsx',
  'src/renderer/hooks/useTimeline.ts',
  'src/renderer/hooks/useLayerManagement.ts'
];

// Output file
const outputFile = 'timeline-implementation.txt';

// Function to create a separator
const createSeparator = (filename) => {
  const line = '='.repeat(100);
  return `\n${line}\n${filename}\n${line}\n\n`;
};

// Read all files and combine them
try {
  let combinedContent = '';
  
  files.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedContent += createSeparator(file);
      combinedContent += content;
    } catch (err) {
      console.error(`Error reading file ${file}:`, err);
    }
  });

  // Write the combined content to the output file
  const outputPath = path.join(__dirname, '..', outputFile);
  fs.writeFileSync(outputPath, combinedContent);
  console.log(`Successfully combined ${files.length} files into ${outputFile}`);

} catch (err) {
  console.error('Error combining files:', err);
}
