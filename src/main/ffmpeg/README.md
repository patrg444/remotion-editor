# FFmpeg Integration

This project uses FFmpeg for audio extraction from video files. Our implementation is designed to be fully compliant with the LGPL 2.1 license.

## License Compliance

We use FFmpeg under the LGPL 2.1 license with the following compliance measures:

1. **LGPL-Only Build**
   - We use a dynamically linked, LGPL-compliant build of FFmpeg
   - No GPL-only components are used
   - Our audio extraction functionality uses only LGPL-compatible features

2. **Dynamic Linking**
   - FFmpeg is dynamically linked to maintain LGPL compliance
   - This allows us to use FFmpeg functionality while keeping our code proprietary

3. **Limited Functionality**
   - We only use FFmpeg for basic audio extraction
   - Our implementation uses the following LGPL-safe features:
     - Audio stream demuxing
     - PCM audio conversion
     - Basic format conversion
   - We explicitly avoid GPL-only features and codecs

4. **License Notice**
   - The FFmpeg LGPL 2.1 license and copyright notices are included in our THIRD_PARTY_LICENSES.txt
   - Source code availability is referenced at http://ffmpeg.org/
   - Any modifications to FFmpeg would be documented here (currently using standard build)

## Implementation Details

Our FFmpeg usage is limited to the following operations:

1. **Audio Extraction Command**
```bash
ffmpeg -i [input] -vn -acodec pcm_s16le -ar 16000 -ac 1 -y [output]
```

This command:
- `-vn`: Disables video processing (audio extraction only)
- `-acodec pcm_s16le`: Converts to 16-bit PCM (LGPL-safe)
- `-ar 16000`: Sets sample rate to 16kHz (required for Vosk)
- `-ac 1`: Converts to mono audio
- `-y`: Allows overwriting output file

2. **Error Handling**
- All FFmpeg operations are wrapped in try-catch blocks
- Temporary files are properly cleaned up
- Error messages are captured and logged

## Dependencies

To maintain LGPL compliance:

1. **FFmpeg Installation**
   - Use system's package manager to install FFmpeg
   - Ensure LGPL build is used (no GPL components)
   - Example for macOS: `brew install ffmpeg --with-lgpl`
   - Example for Ubuntu: `apt-get install ffmpeg`

2. **Version Requirements**
   - Minimum FFmpeg version: 4.0
   - Recommended: Latest stable LGPL build

## Testing

The FFmpeg integration is tested in:
- `src/renderer/components/__tests__/caption-workflow/end-to-end.test.tsx`
- Verifies audio extraction from both video and audio files
- Tests error handling and cleanup

## Troubleshooting

Common issues and solutions:

1. **FFmpeg Not Found**
   - Ensure FFmpeg is installed and in system PATH
   - Check installation with `ffmpeg -version`

2. **Unsupported Format**
   - Verify input file is a supported format
   - Check FFmpeg build includes necessary LGPL decoders

3. **Permission Issues**
   - Ensure write permissions for temporary files
   - Check system temp directory access

## License Compliance Checklist

- [x] Using LGPL-compliant FFmpeg build
- [x] Dynamic linking implemented
- [x] License and copyright notices included
- [x] Source code availability referenced
- [x] No GPL-only features used
- [x] Clean error handling and resource cleanup
- [x] Documentation of usage and compliance
