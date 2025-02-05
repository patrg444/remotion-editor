import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Track, TimelineState, initialTimelineState } from '../../../types/timeline';
import { VolumeEnvelope } from '../../VolumeEnvelope';
import { Logger } from '../../../../main/utils/logger';
import { TimelineProvider } from '../../../contexts/TimelineContext';
import { EditHistoryProvider } from '../../../contexts/EditHistoryContext';
import { KeyframesProvider } from '../../../contexts/KeyframesContext';
import { KeyframeState, createInitialKeyframeState, createKeyframeTrack } from '../../../keyframes/types';

const logger = new Logger('multiple-keyframes.test');

// Convert between linear and dB values
const linearToDb = (linear: number) => 20 * Math.log10(linear);
const dbToLinear = (db: number) => Math.pow(10, db / 20);

describe('Audio Workflow - Multiple Keyframe Operations', () => {
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

  // Create initial keyframe state with volume track
  const track = {
    ...createKeyframeTrack(1, 0, 2, 0.01),
    id: 'volume1-volume',
    paramId: 'volume',
    keyframes: []
  };

  const initialKeyframeState: KeyframeState = {
    tracks: {
      'volume1-volume': track
    },
    groups: {},
    snapping: false
  };

  it.only('should handle multiple keyframes', async () => {
    logger.debug('Starting multiple keyframes test');
    
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
          <KeyframesProvider initialState={initialKeyframeState}>
            <VolumeEnvelope
              clipId="clip1"
              duration={60}
              zoom={1}
              isSelected={true}
            />
          </KeyframesProvider>
        </TimelineProvider>
      </EditHistoryProvider>
    );

    // Wait for initial render
    await act(async () => {
      logger.debug('Waiting for initial render');
      await Promise.resolve();
    });

    const envelope = container.querySelector('svg');
    logger.debug('Found SVG element:', { found: !!envelope });
    if (!envelope) {
      throw new Error('Failed to find SVG element');
    }

    // Add first keyframe
    const time1 = 15;
    const db1 = -30; // -30 dB
    const volume1 = dbToLinear(db1);
    const clickX1 = (time1 / 60) * 600;
    const clickY1 = 50;

    logger.debug('Adding first keyframe', { clickX1, clickY1, time1, volume1 });

    await act(async () => {
      fireEvent.mouseDown(envelope, { 
        clientX: clickX1,
        clientY: clickY1,
        button: 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: true
      });
      await Promise.resolve();
      fireEvent.mouseUp(envelope, { 
        clientX: clickX1,
        clientY: clickY1,
        button: 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: true
      });
      await Promise.resolve();
    });

    // Add second keyframe
    const time2 = 45;
    const db2 = -45; // -45 dB
    const volume2 = dbToLinear(db2);
    const clickX2 = (time2 / 60) * 600;
    const clickY2 = 75;

    logger.debug('Adding second keyframe', { clickX2, clickY2, time2, volume2 });

    await act(async () => {
      fireEvent.mouseDown(envelope, { 
        clientX: clickX2,
        clientY: clickY2,
        button: 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: true
      });
      await Promise.resolve();
      fireEvent.mouseUp(envelope, { 
        clientX: clickX2,
        clientY: clickY2,
        button: 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: true
      });
      await Promise.resolve();
    });

    // Wait for keyframes to be added
    await waitFor(() => {
      logger.debug('Checking if keyframes were added to DOM');
      const keyframes = container.querySelectorAll('[data-testid="volume-keyframe"]');
      expect(keyframes).toHaveLength(2);

      const keyframe1 = keyframes[0];
      expect(keyframe1).toHaveAttribute('data-time', time1.toString());
      expect(Number(keyframe1?.getAttribute('data-volume'))).toBeCloseTo(volume1);

      const keyframe2 = keyframes[1];
      expect(keyframe2).toHaveAttribute('data-time', time2.toString());
      expect(Number(keyframe2?.getAttribute('data-volume'))).toBeCloseTo(volume2);
    }, { timeout: 5000 });

    logger.debug('Multiple keyframes test completed');
  });
});
