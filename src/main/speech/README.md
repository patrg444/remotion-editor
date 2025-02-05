# Speech-to-Text Functionality

This directory contains the implementation of automatic caption generation using the Vosk speech recognition engine.

## Overview

The speech-to-text functionality is implemented using:
- Vosk for speech recognition (MIT licensed)
- Python for the transcription service
- Electron IPC for communication between main and renderer processes

## Architecture

1. **VoskSpeechService (Main Process)**
   - Manages the Vosk model and Python transcription script
   - Handles model downloads and storage
   - Processes audio files through Vosk
   - Communicates with renderer via IPC

2. **CaptionGeneratorButton (Renderer)**
   - UI component for triggering caption generation
   - Handles loading states and errors
   - Integrates with the Inspector panel

3. **Inspector Integration**
   - Shows caption generation button for audio/video clips
   - Manages caption data in clip state
   - Provides visual feedback during generation

## Setup

1. Install Python dependencies:
```bash
pip install vosk wave
```

2. The model will be downloaded automatically when first generating captions. Default model: `vosk-model-small-en-us-0.15`
   - Models are stored in: `~/.remotion-editor/models/vosk/`
   - Different models can be used by modifying the URL in `CaptionGeneratorButton.tsx`

## Usage

1. Select a video or audio clip in the timeline
2. Open the Inspector panel
3. Click "Generate Captions" in the Captions section
4. Wait for the model to download (first time only) and processing to complete
5. Captions will appear as a subtitle track in the timeline

## Implementation Details

### Main Process (VoskSpeechService.ts)
- Creates and manages Python transcription script
- Handles model downloads and extraction
- Processes audio through Vosk in a Python subprocess
- Returns timestamped words with confidence scores

### Renderer Process
- `CaptionGeneratorButton`: UI component for triggering caption generation
- Communicates with main process via IPC
- Handles loading states and errors
- Updates clip state with generated captions

### Data Flow
1. User clicks "Generate Captions"
2. Button triggers model download if needed
3. Audio is processed through Vosk
4. Timestamped transcript is returned
5. Captions are added to clip state
6. Timeline updates to show captions

## Testing

Tests are implemented in:
- `src/renderer/components/__tests__/caption-workflow.test.tsx`
- Tests cover:
  - UI rendering
  - Caption generation workflow
  - Error handling
  - Integration with Inspector

## Error Handling

The system handles various error cases:
- Model download failures
- Audio processing errors
- Invalid audio formats
- Missing audio tracks
- IPC communication errors

## Future Improvements

Potential enhancements:
1. Support for multiple languages
2. Custom model selection
3. Caption editing interface
4. Batch processing
5. Progress feedback during processing
6. Confidence threshold filtering
7. Export to various subtitle formats

## License

The Vosk speech recognition engine is MIT licensed. See [Vosk License](https://github.com/alphacep/vosk-api/blob/master/COPYING) for details.
