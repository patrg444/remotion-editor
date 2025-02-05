# Audio Workflow Tests

This directory contains tests for the audio workflow functionality, split into separate test suites for better organization and isolation.

## Test Files

- `visibility.test.tsx`: Tests for volume envelope visibility when selecting/deselecting clips
- `keyframes.test.tsx`: Tests for basic keyframe operations (adding, updating)
- `multiple-keyframes.test.tsx`: Tests for interpolation between keyframes and performance with multiple keyframes
- `history.test.tsx`: Tests for undo/redo operations on keyframe changes

## Running Tests

To run a specific test suite:
```bash
npm test src/renderer/components/__tests__/audio-workflow/visibility.test.tsx
npm test src/renderer/components/__tests__/audio-workflow/keyframes.test.tsx
npm test src/renderer/components/__tests__/audio-workflow/multiple-keyframes.test.tsx
npm test src/renderer/components/__tests__/audio-workflow/history.test.tsx
```

To run all audio workflow tests:
```bash
npm test src/renderer/components/__tests__/audio-workflow
```

## Test Design

- Each test suite focuses on a specific aspect of the audio workflow
- Tests are isolated to prevent interference
- Timeouts are set to 100ms to catch performance issues early
- Error handling is added to provide clear failure messages
- Each test verifies a single piece of functionality
