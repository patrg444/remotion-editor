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

const logger = new Logger('visibility.test');

describe('Audio Workflow - Keyframe Visibility', () => {
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

  it.only('should show/hide keyframes based on selection', async () => {
    logger.debug('Starting visibility test');
    
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
    const { container, rerender } = render(
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

    // Add a keyframe while selected
    const envelope = container.querySelector('svg');
    logger.debug('Found SVG element:', { found: !!envelope });
    if (!envelope) {
      throw new Error('Failed to find SVG element');
    }

    const time = 30;
    const db = -30;
    const clickX = (time / 60) * 600;
    const clickY = 50;

    logger.debug('Adding keyframe', { clickX, clickY, time });

    await act(async () => {
      fireEvent.mouseDown(envelope, { 
        clientX: clickX,
        clientY: clickY,
        button: 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: true
      });
      await Promise.resolve();
      fireEvent.mouseUp(envelope, { 
        clientX: clickX,
        clientY: clickY,
        button: 0,
        bubbles: true,
        cancelable: true,
        ctrlKey: true
      });
      await Promise.resolve();
    });

    // Verify keyframe is visible when selected
    await waitFor(() => {
      logger.debug('Checking if keyframe is visible when selected');
      const keyframe = container.querySelector('[data-testid="volume-keyframe"]');
      expect(keyframe).toBeInTheDocument();
    }, { timeout: 5000 });

    // Rerender with isSelected=false
    logger.debug('Rerendering with isSelected=false');
    rerender(
      <EditHistoryProvider>
        <TimelineProvider initialState={initialState}>
          <KeyframesProvider initialState={initialKeyframeState}>
            <VolumeEnvelope
              clipId="clip1"
              duration={60}
              zoom={1}
              isSelected={false}
            />
          </KeyframesProvider>
        </TimelineProvider>
      </EditHistoryProvider>
    );

    // Verify keyframe is hidden when not selected
    await waitFor(() => {
      logger.debug('Checking if keyframe is hidden when not selected');
      const keyframe = container.querySelector('[data-testid="volume-keyframe"]');
      expect(keyframe).not.toBeInTheDocument();
    }, { timeout: 5000 });

    // Rerender with isSelected=true again
    logger.debug('Rerendering with isSelected=true');
    rerender(
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

    // Verify keyframe is visible again
    await waitFor(() => {
      logger.debug('Checking if keyframe is visible again');
      const keyframe = container.querySelector('[data-testid="volume-keyframe"]');
      expect(keyframe).toBeInTheDocument();
    }, { timeout: 5000 });

    logger.debug('Visibility test completed');
  });
});
