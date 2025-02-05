import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineProvider } from '../../../contexts/TimelineContext';
import { MockApp } from '../test-utils';
import type { VideoClip, Track } from '../../../types/timeline';
import type { Transform } from '../../../types/components';
import path from 'path';
import { Logger } from '../../../../main/utils/logger';
import { mockState, mockDispatch } from '../../../hooks/__mocks__/timeline';
import { ActionTypes } from '../../../types/timeline';
import { mockElectron } from '../electron-mock';
import type { MockElectronAPI } from '../../../types/electron-mock';
import type { ElectronAPI } from '../../../types/electron';

declare global {
  interface Window {
    electron: ElectronAPI | MockElectronAPI;
  }
}

const logger = new Logger('CaptionWorkflowE2E');
const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0));
jest.mock('../../../hooks/useTimeline');

describe('Caption Workflow - End to End Breakdown', () => {
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
  });

  afterEach(() => {
    document.querySelectorAll('[role="alert"]').forEach(el => el.remove());
    delete (window as any).electron;
  });

  // Test 1: Initial UI State
  it('should render initial UI elements correctly', async () => {
    window.electron = mockElectron;
    
    const mockClip = createMockClip(true);
    mockState.selectedClipId = mockClip.id;

    render(
      <TimelineProvider>
        <MockApp 
          initialTracks={createMockTracks(true)}
          clip={mockClip}
        />
      </TimelineProvider>
    );

    // Verify timeline elements
    expect(document.querySelector('.timeline')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-clip')).toBeInTheDocument();
    
    // Verify generate captions button state
    const buttons = screen.getAllByTestId('generate-captions-button');
    const generateButton = buttons[0]; // Get the first button
    expect(generateButton).toBeInTheDocument();
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);
  });

  // Test 2: Clip Selection
  it('should handle clip selection correctly', async () => {
    window.electron = mockElectron;
    
    const mockClip = createMockClip(true);
    mockState.selectedClipId = mockClip.id;

    render(
      <TimelineProvider>
        <MockApp 
          initialTracks={createMockTracks(true)}
          clip={mockClip}
        />
      </TimelineProvider>
    );

    // Mock the dispatch to handle selection
    mockDispatch.mockImplementation((action) => {
      if (action.type === ActionTypes.SELECT_CLIP) {
        mockState.selectedClipId = action.payload;
      }
    });

    const clipElement = screen.getByTestId('timeline-clip');
    await act(async () => {
      fireEvent.click(clipElement);
      await flushPromises();
    });

    // Verify clip selection state
    expect(mockState.selectedClipId).toBe('clip-1');
  });

  // Test 3: Vosk API Call
  it('should make correct Vosk API call', async () => {
    window.electron = mockElectron;
    const mockTranscribeResult = {
      success: true,
      transcript: [
        { text: 'hello', start: 0, end: 0.5, conf: 0.95 }
      ]
    };

    // Clear mock call history but preserve implementation
    mockElectron.invoke.mockClear();
    
    // Set up specific mock for this test
    mockElectron.invoke.mockImplementation(async (channel, filePath) => {
      if (channel === 'vosk:transcribe' && filePath === testVideoPath) {
        return mockTranscribeResult;
      }
      throw new Error('Unexpected invoke call');
    });

    const mockClip = createMockClip(true);
    mockState.selectedClipId = mockClip.id;

    render(
      <TimelineProvider>
        <MockApp 
          initialTracks={createMockTracks(true)}
          clip={mockClip}
        />
      </TimelineProvider>
    );

    // Wait for initial render
    await flushPromises();

    // Find the button in the face tracking UI section
    const buttons = screen.getAllByTestId('generate-captions-button');
    const generateButton = buttons[buttons.length - 1]; // Get the last button which should be in the face tracking UI
    
    await act(async () => {
      fireEvent.click(generateButton);
      // Wait for all promises to resolve
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify Vosk API call with correct comma
    expect(mockElectron.invoke).toHaveBeenCalledWith('vosk:transcribe', testVideoPath);
  });

  // Test 4: Caption Clip Creation
  it('should create caption clip with correct data', async () => {
    window.electron = mockElectron;
    mockElectron.invoke.mockImplementation(async () => ({
      success: true,
      transcript: [
        { text: 'hello', start: 0, end: 0.5, conf: 0.95 }
      ]
    }));

    // Mock the dispatch to handle clip addition
    mockDispatch.mockImplementation((action) => {
      if (action.type === ActionTypes.ADD_CLIP) {
        const { trackId, clip } = action.payload;
        const track = mockState.tracks.find(t => t.id === trackId);
        if (track) {
          track.clips.push({
            ...clip,
            'data-testid': 'timeline-caption-clip'
          });
        }
      }
    });

    const mockClip = createMockClip(true);
    mockState.selectedClipId = mockClip.id;

    render(
      <TimelineProvider>
        <MockApp 
          initialTracks={createMockTracks(true)}
          clip={mockClip}
        />
      </TimelineProvider>
    );

    // Wait for initial render
    await flushPromises();

    // Select clip and generate captions
    await act(async () => {
      fireEvent.click(screen.getByTestId('timeline-clip'));
      await flushPromises();
      
      // Find the button in the face tracking UI section
      const buttons = screen.getAllByTestId('generate-captions-button');
      const generateButton = buttons[buttons.length - 1];
      fireEvent.click(generateButton);
      
      // Wait for all promises to resolve
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
    });

    // Wait for caption clip creation
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      await flushPromises();
    });

    const captionClip = screen.getByTestId('timeline-caption-clip');
    const clipData = JSON.parse(captionClip.getAttribute('data-clip') || '{}');
    
    expect(clipData.type).toBe('caption');
    expect(clipData.startTime).toBe(0);
    expect(clipData.duration).toBe(10);
    expect(clipData.captions).toEqual([
      { id: 'caption-0', text: 'hello', startTime: 0, endTime: 0.5 }
    ]);
  });

  // Test 5: Button State During Generation
  it('should show correct button states during generation', async () => {
    window.electron = mockElectron;
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockElectron.invoke.mockImplementation(async () => {
      await delayedPromise;
      return {
        success: true,
        transcript: [{ text: 'hello', start: 0, end: 0.5, conf: 0.95 }]
      };
    });

    const mockClip = createMockClip(true);
    mockState.selectedClipId = mockClip.id;

    render(
      <TimelineProvider>
        <MockApp 
          initialTracks={createMockTracks(true)}
          clip={mockClip}
        />
      </TimelineProvider>
    );

    // Wait for initial render
    await flushPromises();

    // Find the button in the face tracking UI section
    const buttons = screen.getAllByTestId('generate-captions-button');
    const generateButton = buttons[buttons.length - 1];
    
    // Initial state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();

    // Click button and wait for loading state
    await act(async () => {
      fireEvent.click(generateButton);
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
    });

    // Loading state
    expect(generateButton).toHaveClass('loading');
    expect(generateButton).toBeDisabled();
    expect(generateButton).toHaveTextContent('Generating...');

    // Complete generation
    await act(async () => {
      resolvePromise!(null);
      await flushPromises();
    });

    // Final state
    expect(generateButton).not.toHaveClass('loading');
    expect(generateButton).toBeEnabled();
    expect(generateButton).toHaveTextContent(/generate captions/i);
  });

  // Test 6: Error Handling
  it('should handle errors appropriately', async () => {
    window.electron = mockElectron;
    const mockError = new Error('Failed to generate captions');
    mockElectron.invoke.mockImplementation(async () => {
      throw mockError;
    });

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const mockClip = createMockClip(true);
    mockState.selectedClipId = mockClip.id;

    render(
      <TimelineProvider>
        <MockApp 
          initialTracks={createMockTracks(true)}
          clip={mockClip}
        />
      </TimelineProvider>
    );

    // Wait for initial render
    await flushPromises();

    // Find the button in the face tracking UI section
    const buttons = screen.getAllByTestId('generate-captions-button');
    const generateButton = buttons[buttons.length - 1];

    // Click button and wait for error
    await act(async () => {
      fireEvent.click(generateButton);
      await new Promise(resolve => setTimeout(resolve, 100));
      await flushPromises();
    });

    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Failed to generate captions');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error generating captions:', mockError);

    consoleErrorSpy.mockRestore();
  });
});
