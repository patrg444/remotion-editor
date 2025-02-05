import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { TestApp } from './test-utils';
import type { VideoClip, Track } from '../../types/timeline';
import type { Transform } from '../../types/components';
import { Logger } from '../../../main/utils/logger';

const logger = new Logger('CaptionWorkflowTest');

// Helper function to flush promises
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 100));

// Using real timeline implementation

describe.only('Caption Generation Workflow', () => {
  const defaultTransform: Transform = {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0
  };

  const mockVideoClip: VideoClip = {
    id: 'video-1',
    type: 'video',
    name: 'Test Video',
    startTime: 0,
    endTime: 10,
    duration: 10,
    src: '/path/to/test.mp4',
    path: '/path/to/test.mp4',
    transform: defaultTransform,
    effects: []
  };

  const mockCaptionTrack: Track = {
    id: 'track-2',
    name: 'Caption Track',
    type: 'caption',
    clips: []
  };

  const mockVideoTrack: Track = {
    id: 'track-1',
    name: 'Video Track',
    type: 'video',
    clips: [mockVideoClip]
  };

  const initialTracks = [mockVideoTrack, mockCaptionTrack];

  beforeEach(() => {
    jest.clearAllMocks();
    logger.info('Setting up test environment');
    
    // Set up real electron IPC
    (window as any).electron = {
      invoke: async (channel: string, ...args: any[]) => {
        logger.debug(`Electron IPC invoke: ${channel}`, args);
        switch (channel) {
          case 'speech:transcribe':
            // Use real VoskSpeechService
            const { VoskSpeechService } = require('../../../main/VoskSpeechService');
            const vosk = new VoskSpeechService();
            return vosk.transcribe(args[0]);
          case 'speech:diarize':
            // Use real SpeakerDiarizationService
            const { SpeakerDiarizationService } = require('../../../main/speech/SpeakerDiarizationService');
            const diarizer = new SpeakerDiarizationService();
            return diarizer.diarize(args[0]);
          case 'speech:combine':
            // Use real CaptionCombiner
            const { CaptionCombiner } = require('../../../main/speech/CaptionCombiner');
            const combiner = new CaptionCombiner();
            return combiner.combine(args[0], args[1]);
          default:
            throw new Error(`Unknown channel: ${channel}`);
        }
      }
    };
  });

  afterEach(() => {
    // Clean up any error alerts that might have been added to the body
    document.querySelectorAll('[role="alert"]').forEach(el => el.remove());
    delete (window as any).electron;
  });

  it.only('should show caption generator for video clips', async () => {
    logger.info('Starting test: should show caption generator for video clips');
    render(
      <TimelineProvider>
        <TestApp initialTracks={initialTracks} />
      </TimelineProvider>
    );

    // Select the video clip
    logger.debug('Attempting to select video clip');
    const clipElement = screen.getByTestId('timeline-clip');
    await act(async () => {
      logger.debug('Clicking video clip');
      fireEvent.click(clipElement);
      await flushPromises();
    });
    logger.debug('Video clip selected');

    // Verify caption generator button appears
    const generateButton = screen.getByTestId('generate-captions-button');
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
  });

  it('should handle caption generation workflow', async () => {
    logger.info('Starting test: should handle caption generation workflow');
    render(
      <TimelineProvider>
        <TestApp initialTracks={initialTracks} />
      </TimelineProvider>
    );

    // Select the video clip
    logger.debug('Attempting to select video clip');
    const clipElement = screen.getByTestId('timeline-clip');
    await act(async () => {
      logger.debug('Clicking video clip');
      fireEvent.click(clipElement);
      await flushPromises();
    });
    logger.debug('Video clip selected');

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
    });
    logger.debug('Caption generation initiated');

    // Verify that captions were added to the timeline
    const tracks = screen.getAllByTestId('timeline-track');
    const captionTrack = tracks.find(track => 
      track.querySelector('.timeline-track-header')?.getAttribute('data-track-name')?.toLowerCase().includes('caption')
    );
    expect(captionTrack).toBeInTheDocument();
    if (!captionTrack) {
      throw new Error('Caption track not found');
    }
    expect(captionTrack.querySelector('.timeline-track-header')).toHaveAttribute('data-track-name', 'Caption Track');

    // Verify caption properties
    const captionClips = screen.getAllByTestId('timeline-clip');
    const captionClip = captionClips.find(clip => {
      const data = JSON.parse(clip.dataset.clip || '{}');
      return data.type === 'caption';
    });
    expect(captionClip).toBeInTheDocument();
    if (!captionClip) {
      throw new Error('Caption clip not found');
    }
    const clipData = JSON.parse(captionClip.dataset.clip || '{}');
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

    // Verify button returns to normal state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);
  });

  it('should handle caption generation errors', async () => {
    logger.info('Starting test: should handle caption generation errors');
    // Mock an error response
    logger.debug('Setting up error mock');
    const mockError = new Error('Failed to generate captions');
    (window as any).electron.invoke = jest.fn().mockImplementation(async (channel, ...args) => {
      logger.debug(`Electron IPC invoke (error case): ${channel}`, args);
      throw mockError;
    });
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logger.debug('Error mock setup complete');

    render(
      <TimelineProvider>
        <TestApp initialTracks={initialTracks} />
      </TimelineProvider>
    );

    // Select the video clip
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
    const captionClips = screen.queryAllByTestId('timeline-clip');
    expect(captionClips.length).toBe(1); // Only the video clip should be present

    // Verify button returns to normal state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);

    consoleErrorSpy.mockRestore();
  });
});
