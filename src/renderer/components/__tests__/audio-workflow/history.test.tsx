import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import { flushSync } from 'react-dom';
import '@testing-library/jest-dom';
import { Track, TimelineState, initialTimelineState } from '../../../types/timeline';
import { VolumeEnvelope } from '../../VolumeEnvelope';
import { Logger } from '../../../../main/utils/logger';
import { TimelineProvider } from '../../../contexts/TimelineContext';
import { EditHistoryProvider } from '../../../contexts/EditHistoryContext';
import { KeyframesProvider } from '../../../contexts/KeyframesContext';
import { KeyframeState, createInitialKeyframeState, createKeyframeTrack, InterpolationType } from '../../../keyframes/types';
import { useEditHistory } from '../../../hooks/useEditHistory';
import { EditOperation } from '../../../types/edit-history';
import { useKeyframes } from '../../../hooks/useKeyframes';
import { useTimelineContext } from '../../../hooks/useTimelineContext';

const logger = new Logger('history.test');

// Create a wrapper component that connects to real implementations
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const { undo, redo, addOperation } = useEditHistory();
  const { addKeyframe, removeKeyframe, keyframeState } = useKeyframes();
  const { state } = useTimelineContext();

  // Create operation for adding keyframe
  const addKeyframeOperation = (before: KeyframeState, after: KeyframeState) => {
    const operation: EditOperation = {
      type: 'effect',
      description: 'Add volume keyframe',
      data: {
        before,
        after,
        clipId: 'clip1'
      },
      timestamp: Date.now()
    };
    addOperation(operation);
  };

  // Handle undo/redo operations
  React.useEffect(() => {
    const handleUndo = () => {
      const operation = undo();
      if (operation?.type === 'effect' && operation.data) {
        const { before } = operation.data;
        flushSync(() => {
          // Use addKeyframe/removeKeyframe instead of dispatch
          const currentKeyframes = keyframeState.tracks['clip1-volume']?.keyframes || [];
          // Remove all current keyframes
          currentKeyframes.forEach(kf => {
            removeKeyframe('clip1-volume', kf.time);
          });
          // Add keyframes from before state
          const beforeKeyframes = before.tracks['clip1-volume']?.keyframes || [];
          beforeKeyframes.forEach(kf => {
            addKeyframe('clip1-volume', kf.time, kf.value, kf.interpolation.type);
          });
        });
      }
    };

    const handleRedo = () => {
      const operation = redo();
      logger.debug('Redo operation', { operation });
      if (operation?.type === 'effect' && operation.data) {
        const { after } = operation.data;
        logger.debug('Setting state after redo', { after });
        flushSync(() => {
          // Use addKeyframe/removeKeyframe instead of dispatch
          const currentKeyframes = keyframeState.tracks['clip1-volume']?.keyframes || [];
          // Remove all current keyframes
          currentKeyframes.forEach(kf => {
            removeKeyframe('clip1-volume', kf.time);
          });
          // Add keyframes from after state
          const afterKeyframes = after.tracks['clip1-volume']?.keyframes || [];
          afterKeyframes.forEach(kf => {
            addKeyframe('clip1-volume', kf.time, kf.value, kf.interpolation.type);
          });
        });
      }
    };

    // Expose functions for testing
    (window as any).testUndo = handleUndo;
    (window as any).testRedo = handleRedo;
    (window as any).testAddKeyframe = addKeyframe;
    (window as any).testRemoveKeyframe = removeKeyframe;
    (window as any).testAddOperation = addKeyframeOperation;

    return () => {
      delete (window as any).testUndo;
      delete (window as any).testRedo;
      delete (window as any).testAddKeyframe;
      delete (window as any).testRemoveKeyframe;
      delete (window as any).testAddOperation;
    };
  }, [undo, redo, addOperation, addKeyframeOperation, addKeyframe, removeKeyframe, keyframeState]);

  return <div data-testid="test-wrapper">{children}</div>;
};

describe('Audio Workflow - Keyframe History', () => {
  // Initial tracks setup with volume effect
  const initialTracks: Track[] = [{
    id: 'track1',
    type: 'audio',
    clips: [{
      id: 'clip1',
      type: 'audio',
      src: 'test-assets/test.wav',
      startTime: 0,
      endTime: 60,
      duration: 60,
      effects: [{
        id: 'volume1',
        type: 'volume',
        enabled: true,
        parameters: {
          value: 1,
          keyframes: []
        }
      }]
    }]
  }];

  const volumeTrackId = 'clip1-volume';

  // Create empty keyframe state with volume track
  const track = {
    ...createKeyframeTrack(1, 0, 2, 0.01),
    keyframes: [],
    getValue: (time: number) => 1
  };

  const emptyKeyframeState: KeyframeState = {
    tracks: {
      [volumeTrackId]: track
    },
    groups: {},
    snapping: false
  };

  beforeEach(() => {
    // Reset any global state
    jest.clearAllMocks();
  });

  it('should handle undo/redo of keyframe operations', async () => {
    logger.debug('Starting history test');
    
    // Create initial state with proper history
    const testState: TimelineState = {
      ...initialTimelineState,
      tracks: initialTracks,
      selectedClipId: initialTracks[0]?.clips[0]?.id,
    };

    // Create initial state with proper history structure
    const initialState: TimelineState = {
      ...testState,
      history: {
        operations: [],
        currentIndex: -1,
        lastSavedIndex: -1,
        past: [],
        present: testState,
        future: [],
        undoStack: []
      }
    };
    
    logger.debug('Rendering component');
    const { container } = render(
      <EditHistoryProvider>
        <TimelineProvider initialState={initialState}>
          <KeyframesProvider initialState={emptyKeyframeState}>
            <TestWrapper>
              <VolumeEnvelope
                clipId="clip1"
                duration={60}
                zoom={1}
                isSelected={true}
              />
            </TestWrapper>
          </KeyframesProvider>
        </TimelineProvider>
      </EditHistoryProvider>
    );

    // Wait for initial render
    await act(async () => {
      logger.debug('Waiting for initial render');
      await Promise.resolve();
    });

    const envelope = container.querySelector('svg.volume-envelope');
    logger.debug('Found SVG element:', { found: !!envelope });
    if (!envelope) {
      throw new Error('Failed to find SVG element');
    }

    // Wait for initial state
    await waitFor(() => {
      const keyframesData = container.querySelector('[data-testid="volume-envelope"]')?.getAttribute('data-keyframes');
      expect(keyframesData).toBe('[]');
    });

    // Initialize track first
    await act(async () => {
      const addKeyframe = (window as any).testAddKeyframe;
      if (!addKeyframe) {
        throw new Error('Add keyframe function not registered');
      }

      // Add keyframe
      addKeyframe(volumeTrackId, 30, 0.03162277660168379, InterpolationType.Linear);
      await Promise.resolve();

      logger.debug('Set initial state');

      // Add history operation
      const addOperation = (window as any).testAddOperation;
      if (!addOperation) {
        throw new Error('Add operation function not registered');
      }
      addOperation(emptyKeyframeState, {
        tracks: {
          [volumeTrackId]: {
            ...track,
            keyframes: [{
              time: 30,
              value: 0.03162277660168379, // -30dB in linear scale
              interpolation: { type: InterpolationType.Linear }
            }]
          }
        },
        groups: {},
        snapping: false
      });
      await Promise.resolve();

      // Wait for state update
      await waitFor(() => {
        const keyframesData = container.querySelector('[data-testid="volume-envelope"]')?.getAttribute('data-keyframes');
        const parsedData = JSON.parse(keyframesData || '[]');
        logger.debug('Initial state update', { keyframesData, parsedData });
        expect(parsedData).toHaveLength(1);
      }, { timeout: 5000 });
    });

    // Wait for keyframe to be added
    await waitFor(() => {
      const keyframe = container.querySelector('[data-testid="keyframe-30"]');
      expect(keyframe).toBeInTheDocument();
    }, { timeout: 5000 });

    // Verify keyframe was added
    await waitFor(() => {
      logger.debug('Checking if keyframe was added');
      const keyframe = container.querySelector('[data-testid="keyframe-30"]');
      expect(keyframe).toBeInTheDocument();
    }, { timeout: 5000 });

    // Undo keyframe addition
    logger.debug('Undoing keyframe addition');
    await act(async () => {
      const undoFn = (window as any).testUndo;
      if (!undoFn) {
        throw new Error('Undo function not registered');
      }
      undoFn();
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for undo to complete
    });

    // Wait for undo to complete and verify state
    await waitFor(() => {
      const keyframesData = container.querySelector('[data-testid="volume-envelope"]')?.getAttribute('data-keyframes');
      logger.debug('After undo state', { keyframesData });
      expect(keyframesData).toBe('[]');
    }, { timeout: 5000 });

    // Verify keyframe was removed
    await waitFor(() => {
      logger.debug('Checking if keyframe was removed');
      const keyframe = container.querySelector('[data-testid="keyframe-30"]');
      expect(keyframe).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Redo keyframe addition
    logger.debug('Redoing keyframe addition');
    await act(async () => {
      // Call redo function directly
      const redoFn = (window as any).testRedo;
      if (!redoFn) {
        throw new Error('Redo function not registered');
      }
      redoFn();
      await Promise.resolve();

      // Wait for state update
      await waitFor(() => {
        const keyframesData = container.querySelector('[data-testid="volume-envelope"]')?.getAttribute('data-keyframes');
        logger.debug('After redo state', { keyframesData });
        const parsedData = JSON.parse(keyframesData || '[]');
        logger.debug('Parsed keyframes data', { parsedData });
        expect(parsedData).toHaveLength(1);
      }, { timeout: 5000 });
    });

    // Verify keyframe was restored
    await waitFor(() => {
      logger.debug('Checking if keyframe was restored');
      const keyframe = container.querySelector('[data-testid="keyframe-30"]');
      expect(keyframe).toBeInTheDocument();
    }, { timeout: 5000 });

    logger.debug('History test completed');
  });
});
