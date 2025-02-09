const fs = require('fs').promises;
const path = require('path');

async function dumpFiles() {
  try {
    // List of files to dump with relative paths from project root
    const files = [
      {
        header: '==== TimelineContext.tsx (SPLIT_CLIP Action) ====',
        filepath: path.join(__dirname, '..', 'src/renderer/contexts/TimelineContext.tsx'),
        filter: content => {
          // Extract the SPLIT_CLIP case and surrounding context
          const splitClipMatch = content.match(/case ActionTypes\.SPLIT_CLIP:[\s\S]+?break;/);
          return splitClipMatch ? splitClipMatch[0] : '';
        }
      },
      {
        header: '==== ripple-extension.spec.ts (Split Clip Test) ====',
        filepath: path.join(__dirname, '..', 'cypress/integration/timeline/ripple-extension.spec.ts'),
        filter: content => {
          // Extract the split clip test and its setup
          const testMatch = content.match(/it\('should maintain proper extension boundaries after splitting a clip'[\s\S]+?\}\);/);
          return testMatch ? testMatch[0] : '';
        }
      },
      {
        header: '==== timelineScale.ts ====',
        filepath: path.join(__dirname, '..', 'src/renderer/utils/timelineScale.ts')
      }
    ];

    let combinedContent = '';
    for (const file of files) {
      const content = await fs.readFile(file.filepath, 'utf8');
      // Format the content to ensure proper spacing and commas
      const formattedContent = content
        .replace(/\{ *\n\s+/g, '{\n  ') // Fix object spacing
        .replace(/import\s*{([^}]+)}/g, (match, imports) => {
          // Format TypeScript imports by adding commas between items
          const formattedImports = imports
            .split(/\s+/)
            .filter(Boolean)
            .join(', ');
          return `import { ${formattedImports} }`;
        })
        .replace(/(\[[^\]]+\]|\([^)]+\))/g, match => {
          // Add commas between items in arrays and parameter lists
          return match.replace(/([a-zA-Z0-9_\.]+)(\s+)(?=[a-zA-Z0-9_\.])/g, '$1,$2');
        })
        .replace(/new Set<[^>]+>\(\[([\s\S]+?)\]\)/g, match => {
          // Format Set initialization
          return match.replace(/([a-zA-Z0-9_\.]+)(\s*\n\s+)(?=[a-zA-Z0-9_\.])/g, '$1,$2');
        })
        .trim();
      
      // Add timestamp, file path, and formatted content
      combinedContent += [
        file.header,
        `File: ${file.filepath}`,
        `Dumped at: ${new Date().toISOString()}`,
        '',
        formattedContent,
        '',
        '='.repeat(80),
        '',
        ''
      ].join('\n');
    }
    
    // Write the combined content into a single text file in the project root
    const outputPath = path.join(__dirname, '..', 'failing_test_files.txt');
    await fs.writeFile(outputPath, combinedContent, 'utf8');
    console.log('File dump created at:', outputPath);
  } catch (error) {
    console.error('Error dumping files:', error);
  }
}

dumpFiles();
