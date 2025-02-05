import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineProvider } from '../../../contexts/TimelineContext';
import { MockApp } from '../test-utils';
import type { VideoClip, Track } from '../../../types/timeline';
import type { Transform } from '../../../types/components';
import path from 'path';
import { Logger } from '../../../../main/utils/logger';
import { mockState } from '../../../hooks/__mocks__/timeline';
import { Mock } from 'jest-mock';
import { mockElectron } from '../electron-mock';
import type { MockElectronAPI } from '../../../types/electron-mock';
import type { ElectronAPI } from '../../../types/electron';

declare global {
  interface Window {
    electron: ElectronAPI | MockElectronAPI;
  }
}

const logger = new Logger('CaptionWorkflowE2E');

// Helper function to flush promises
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));

jest.mock('../../../hooks/useTimeline');

describe.only('Caption Workflow - End to End', () => {
  const defaultTransform: Transform = {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0
  };

  const testAudioPath = path.join(process.cwd(), 'test-assets', 'test.wav');
  const testVideoPath = path.join(process.cwd(), 'test-assets', 'test.mp4');

  const createMockClip = (isVideo: boolean): VideoClip => ({
    id: 'clip-1',
    type: 'video',
    name: isVideo ? 'Test Video' : 'Test Audio',
    startTime: 0,
    duration: 10,
    path: isVideo ? testVideoPath : testAudioPath,
    transform: defaultTransform,
    effects: [],
    opacity: 1,
    blendMode: 'normal'
  });

  const createMockTracks = (isVideo: boolean) => {
    const mockVideoTrack: Track = {
      id: 'track-1',
      name: 'Video Track',
      type: 'video',
      clips: [createMockClip(isVideo)],
      duration: 10,
      isMuted: false,
      isSolo: false,
      isLocked: false,
      isVisible: true
    };

    const mockCaptionTrack: Track = {
      id: 'track-2',
      name: 'Caption Track',
      type: 'caption',
      clips: [],
      duration: 10,
      isMuted: false,
      isSolo: false,
      isLocked: false,
      isVisible: true
    };

    return [mockVideoTrack, mockCaptionTrack];
  };

  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Setting up end-to-end test environment');
  });

  afterEach(() => {
    // Clean up any error alerts that might have been added to the body
    document.querySelectorAll('[role="alert"]').forEach(el => el.remove());
    delete (window as any).electron;
  });

  const testCaptionGeneration = async (isVideo: boolean) => {
    logger.info(`Starting caption generation test for ${isVideo ? 'video' : 'audio'} file`);
    // Mock the Vosk transcription response
    logger.debug('Setting up Vosk transcription mock');
    mockElectron.invoke.mockImplementation(async (channel, filePath) => {
      logger.debug(`Electron IPC invoke: ${channel}`, { filePath });
      expect(channel).toBe('vosk:transcribe');
      expect(filePath).toBe(isVideo ? testVideoPath : testAudioPath);
      
      const response = {
        success: true,
        transcript: [
          { text: 'hello', start: 0, end: 0.5, conf: 0.95 },
          { text: 'world', start: 0.6, end: 1.0, conf: 0.92 }
        ]
      };
      logger.debug('Mock Vosk response:', response);
      return response;
    });
    window.electron = mockElectron;

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    render(
      <TimelineProvider>
        <MockApp initialTracks={createMockTracks(isVideo)} />
      </TimelineProvider>
    );

    // Select the clip
    logger.debug('Attempting to select media clip');
    const clipElement = screen.getByTestId('timeline-clip');
    await act(async () => {
      logger.debug('Clicking media clip');
      fireEvent.click(clipElement);
      await flushPromises();
    });
    logger.debug('Media clip selected');

    // Find and click the "Generate Captions" button
    const generateButton = screen.getByTestId('generate-captions-button');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();

    // Click and wait for state updates
    await act(async () => {
      logger.debug('Clicking generate captions button');
      fireEvent.click(generateButton);
      await flushPromises();
      // Wait for multiple state updates to complete
      logger.debug('Waiting for state updates');
      await flushPromises();
      await flushPromises();
    });
    logger.debug('Caption generation initiated');

    // Wait for state updates and caption clip to be added
    await act(async () => {
      logger.debug('Waiting for state updates');
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Increase timeout
    });

    // Force another state update cycle
    await act(async () => {
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Add another wait
    });

    // Log current state
    logger.debug('Current mockState:', JSON.stringify(mockState, null, 2));

    // Find all clips in the timeline
    logger.debug('Searching for caption clips');
    const timelineElement = document.querySelector('.timeline');
    if (!timelineElement) {
      throw new Error('Timeline element not found');
    }
    const tracks = timelineElement.querySelectorAll('.timeline-track');
    logger.debug(`Found ${tracks.length} tracks`);

    // Wait for additional state updates
    await act(async () => {
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    // Log track contents
    Array.from(tracks).forEach((track, index) => {
      logger.debug(`Track ${index} contents:`, track.innerHTML);
    });

    // Find caption clip
    logger.debug('Looking for caption clip');
    const captionClip = screen.queryByTestId('timeline-caption-clip');
    logger.debug('Caption clip found:', captionClip ? 'yes' : 'no');

    // Wait for final state updates
    await act(async () => {
      await flushPromises();
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    if (!captionClip) {
      logger.debug('No caption clip found among timeline clips');
    } else {
      logger.debug('Found caption clip');
    }

    expect(captionClip).toBeDefined();
    expect(captionClip).toBeInTheDocument();

    const clipData = JSON.parse(captionClip?.getAttribute('data-clip') || '{}');
    expect(clipData.type).toBe('caption');
    expect(clipData.startTime).toBe(0);
    expect(clipData.duration).toBe(10);
    expect(Array.isArray(clipData.captions)).toBe(true);
    expect(clipData.captions.length).toBe(2);
    expect(clipData.captions[0]).toEqual({
      text: 'hello',
      start: 0,
      end: 0.5,
      conf: 0.95
    });
    expect(clipData.captions[1]).toEqual({
      text: 'world',
      start: 0.6,
      end: 1.0,
      conf: 0.92
    });

    // Verify that Vosk was called with the correct file path
    logger.debug('Verifying Vosk transcription call');
    expect(window.electron.invoke).toHaveBeenCalledWith('vosk:transcribe', isVideo ? testVideoPath : testAudioPath);
    logger.debug('Vosk transcription call verified');

    // Verify button returns to normal state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);

    consoleLogSpy.mockRestore();
  };

  it.only('should generate captions from video file using Vosk', async () => {
    logger.info('Starting test: should generate captions from video file using Vosk');
    await testCaptionGeneration(true);
  });

  it('should generate captions from audio file using Vosk', async () => {
    await testCaptionGeneration(false);
  });

  it('should handle errors during caption generation', async () => {
    logger.info('Starting test: should handle errors during caption generation');
    // Mock an error response
    logger.debug('Setting up error mock');
    const mockError = new Error('Failed to generate captions');
    mockElectron.invoke.mockImplementation(async (channel, ...args) => {
      logger.debug(`Electron IPC invoke (error case): ${channel}`, args);
      throw mockError;
    });
    window.electron = mockElectron;
    logger.debug('Error mock setup complete');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TimelineProvider>
        <MockApp initialTracks={createMockTracks(true)} />
      </TimelineProvider>
    );

    // Select the clip
    const clipElement = screen.getByTestId('timeline-clip');
    await act(async () => {
      fireEvent.click(clipElement);
      await flushPromises();
    });

    // Find and click the "Generate Captions" button
    const generateButton = screen.getByTestId('generate-captions-button');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();

    // Click and wait for state updates
    await act(async () => {
      fireEvent.click(generateButton);
      await flushPromises();
    });

    // Verify error handling
    const errorAlert = document.querySelector('[role="alert"]');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Failed to generate captions');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating captions:', mockError);

    // Verify that no caption clip was added
    const timeline = screen.getByTestId('timeline');
    const clips = timeline.querySelectorAll('[data-testid="timeline-clip"]');
    expect(clips.length).toBe(1); // Only the video clip should be present

    // Verify that Vosk was called with the correct file path
    expect(window.electron.invoke).toHaveBeenCalledWith('vosk:transcribe', testVideoPath);

    // Verify button returns to normal state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);

    consoleErrorSpy.mockRestore();
  });

  it('should show loading state during caption generation', async () => {
    logger.info('Starting test: should show loading state during caption generation');
    // Mock a delayed response
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockElectron.invoke.mockImplementation(async () => {
      await delayedPromise;
      return {
        success: true,
        transcript: [
          { text: 'hello', start: 0, end: 0.5, conf: 0.95 },
          { text: 'world', start: 0.6, end: 1.0, conf: 0.92 }
        ]
      };
    });
    window.electron = mockElectron;

    render(
      <TimelineProvider>
        <MockApp initialTracks={createMockTracks(true)} />
      </TimelineProvider>
    );

    // Select the clip
    const clipElement = screen.getByTestId('timeline-clip');
    await act(async () => {
      fireEvent.click(clipElement);
      await flushPromises();
    });

    // Find and click the "Generate Captions" button
    const generateButton = screen.getByTestId('generate-captions-button');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();

    // Click and verify loading state
    await act(async () => {
      fireEvent.click(generateButton);
      await flushPromises();
    });

    // Verify loading state
    expect(generateButton).toHaveClass('loading');
    expect(generateButton).toBeDisabled();
    expect(generateButton).toHaveTextContent('Generating...');

    // Complete the operation
    await act(async () => {
      resolvePromise!(null);
      await flushPromises();
    });

    // Verify button returns to normal state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);
  });
});
