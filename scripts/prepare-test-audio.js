const fs = require('fs');
const path = require('path');

const AUDIO_DIR = path.join(__dirname, '..', 'test-assets');
const AUDIO_PATH = path.join(AUDIO_DIR, 'test.wav');
const SOURCE_AUDIO = path.join(__dirname, '..', 'public', 'test.wav');

// Create test-assets directory if it doesn't exist
if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// Copy the test audio file
fs.copyFileSync(SOURCE_AUDIO, AUDIO_PATH);
console.log(`Test audio file copied to: ${AUDIO_PATH}`);
