# Face Tracking Integration with OpenSeeFace

This module integrates OpenSeeFace for face tracking and landmark detection. OpenSeeFace is used under the MIT License, making it suitable for commercial use.

## License Compliance

OpenSeeFace is licensed under the MIT License, which allows:
- Commercial use
- Modification
- Distribution
- Private use

The only requirements are:
- License and copyright notice must be included
- No liability or warranty is provided

## Implementation Details

Our integration:
1. Uses OpenSeeFace for face detection and landmark tracking
2. Samples video frames at configurable intervals (default 1-2 fps)
3. Stores tracking data in the timeline for smooth playback
4. Provides auto-framing based on face positions

## Features

1. **Face Detection & Tracking**
   - Detects multiple faces in video frames
   - Tracks faces across frames with unique IDs
   - Provides confidence scores for detections

2. **Landmark Detection**
   - 68 facial landmarks per face
   - Includes eyes, nose, mouth, jawline
   - Confidence scores for each landmark

3. **Auto-Framing**
   - Centers frame on detected faces
   - Supports single or multiple face tracking
   - Smooth transitions between frames

4. **Performance**
   - Efficient frame sampling (1-2 fps)
   - GPU acceleration when available
   - Minimal impact on timeline playback

## Usage

1. **Initialization**
```typescript
const tracker = new FaceTrackingService({
  modelPath: '/path/to/model',
  samplingRate: 1,  // frames per second
  minConfidence: 0.8,
  useGPU: true
});
```

2. **Processing Video**
```typescript
const result = await tracker.processVideo('/path/to/video.mp4');
```

3. **Auto-Framing**
```typescript
const transform = calculateTransform(trackingData, selectedFaces);
```

## Error Handling

The service includes robust error handling for:
- Missing or corrupt model files
- Video processing errors
- GPU-related issues
- Memory constraints

## Dependencies

- OpenSeeFace (MIT License)
- FFmpeg for frame extraction (LGPL)
- OpenCV for image processing (BSD License)

## Performance Considerations

1. **Frame Sampling**
   - Default 1-2 fps is optimal for most cases
   - Can be adjusted based on needs
   - Higher rates impact performance

2. **GPU Usage**
   - Automatically uses GPU when available
   - Falls back to CPU if needed
   - Configurable via settings

3. **Memory Management**
   - Efficient frame buffer handling
   - Automatic cleanup of temporary files
   - Stream processing for large files

## Testing

Tests cover:
1. Face detection accuracy
2. Tracking consistency
3. Performance benchmarks
4. Error handling
5. Memory usage

Run tests with:
```bash
npm test src/renderer/components/__tests__/face-tracking-workflow
