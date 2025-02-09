#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to recursively get all files in a directory
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

// Get files from relevant directories
const rendererFiles = getFiles(path.join(__dirname, '../src/renderer'))
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
  .map(file => path.relative(path.join(__dirname, '..'), file));

const cypressTestFiles = getFiles(path.join(__dirname, '../cypress/integration/timeline'))
  .filter(file => file.endsWith('.ts') || file.endsWith('.tsx'))
  .map(file => path.relative(path.join(__dirname, '..'), file));

const cypressSupportFiles = getFiles(path.join(__dirname, '../cypress/support'))
  .filter(file => (file.endsWith('.ts') || file.endsWith('.tsx')) && 
    (file.includes('timeline') || file.includes('Timeline')))
  .map(file => path.relative(path.join(__dirname, '..'), file));

// Create the output content with sections
const output = `Timeline-Related Files
===================

Renderer Files:
${rendererFiles.map(file => `- ${file}`).join('\n')}

Cypress Timeline Tests:
${cypressTestFiles.map(file => `- ${file}`).join('\n')}

Cypress Timeline Support Files:
${cypressSupportFiles.map(file => `- ${file}`).join('\n')}
`;

// Write to file
fs.writeFileSync(path.join(__dirname, '../timeline-files.txt'), output);
console.log('Timeline files have been written to timeline-files.txt');
