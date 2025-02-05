import React from 'react';
import { render, fireEvent, waitFor, act, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Track, TimelineState, initialTimelineState } from '../../../types/timeline';
import { VolumeEnvelope } from '../../VolumeEnvelope';
import { TimelineProvider } from '../../../contexts/TimelineContext';
import { EditHistoryProvider } from '../../../contexts/EditHistoryContext';
import { KeyframesProvider } from '../../../contexts/KeyframesContext';
import { KeyframeState, InterpolationType } from '../../../keyframes/types';
import { createKeyframeTrack, dBToVolume } from '../../../keyframes/utils';
import { createInitialKeyframeState } from '../../../keyframes/utils';
import { VOLUME, DRAG, GRID } from '../../../keyframes/constants';

describe('Audio Workflow - Keyframes', () => {
  let container: HTMLElement;
  let envelope: Element;
  const VIEWPORT_HEIGHT = 150; // Test viewport height
  const DB_VALUE = VOLUME.DB_VALUES.find(db => db === -6) ?? -6;
  const LINEAR_VALUE = dBToVolume(DB_VALUE);
  const Y_POSITION = (1 - LINEAR_VALUE) * VIEWPORT_HEIGHT;

  // Test setup
  const initialTracks: Track[] = [{
    id: 'track1',
    type: 'audio',
    clips: [{
      id: 'clip1',
      type: 'audio',
      src: 'test-assets/test.wav',
      startTime: 0,
      endTime: 10,
      duration: 10,
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

  const testState: TimelineState = {
    ...initialTimelineState,
    tracks: initialTracks,
    selectedClipId: 'clip1'
  };

  const track = {
    ...createKeyframeTrack('track1', 'volume', 1, 0, 2, GRID.SIZE),
    keyframes: [],
    getValue: (time: number) => 1
  };

  const initialKeyframeState: KeyframeState = {
    tracks: {
      'clip1-volume': track
    },
    groups: {},
    snapping: false
  };

  beforeEach(async () => {
    const rendered = render(
      <EditHistoryProvider>
        <TimelineProvider initialState={testState}>
          <KeyframesProvider initialState={initialKeyframeState}>
            <VolumeEnvelope
              clipId="clip1"
              duration={10}
              viewport={{
                width: 600,
                height: VIEWPORT_HEIGHT,
                pixelsPerSecond: 60
              }}
              isSelected={true}
            />
          </KeyframesProvider>
        </TimelineProvider>
      </EditHistoryProvider>
    );
    container = rendered.container;
    envelope = container.querySelector('svg.volume-envelope') as Element;
    if (!envelope) throw new Error('Failed to find volume envelope element');
  });

  describe('Keyframe Creation', () => {
    it('should add keyframe by clicking in envelope area', async () => {
      // Add keyframe at -6dB
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 300, // x=300 represents time=5 seconds
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope, { 
          clientX: 300,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
      });

      // Verify keyframe was added
      await waitFor(() => {
        const keyframe = container.querySelector('[data-testid="keyframe-5"]');
        expect(keyframe).toBeInTheDocument();
        expect(keyframe).toHaveAttribute('aria-label', expect.stringContaining('keyframe'));
      });
    });

    it('should handle snapping when adding keyframes', async () => {
      // Add keyframe with snapping enabled
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 295, // Just before 5 seconds
          clientY: Y_POSITION - GRID.SIZE, // Near -6dB
          button: 0,
          ctrlKey: true,
          shiftKey: true // Enable snapping
        });
        fireEvent.pointerUp(envelope, { 
          clientX: 295,
          clientY: Y_POSITION - GRID.SIZE,
          button: 0,
          ctrlKey: true,
          shiftKey: true
        });
      });

      // Verify keyframe was added at snapped position (5s, -6dB)
      await waitFor(() => {
        const keyframe = container.querySelector('[data-testid="keyframe-5"]');
        expect(keyframe).toBeInTheDocument();
        const value = keyframe?.getAttribute('data-volume');
        expect(parseFloat(value || '0')).toBeCloseTo(LINEAR_VALUE, 4);
      });
    });

    it('should handle error when adding keyframe outside valid range', async () => {
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: -10, // Invalid x position
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
      });

      // Verify error message is shown
      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/invalid/i);
      });
    });
  });

  describe('Keyframe Deletion', () => {
    it('should remove keyframe by right-clicking on it', async () => {
      // First add a keyframe
      await act(async () => {
        const clickX = 300; // x=300 represents time=5 seconds
        fireEvent.pointerDown(envelope, { 
          clientX: clickX,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope, { 
          clientX: clickX,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
      });

      // Wait for keyframe to be added
      let keyframe: Element | null = null;
      await waitFor(() => {
        keyframe = container.querySelector('[data-testid="keyframe-5"]');
        expect(keyframe).toBeInTheDocument();
      });

      if (!keyframe) throw new Error('Failed to find keyframe element');

      // Right-click on keyframe to remove it
      await act(async () => {
        fireEvent.pointerDown(keyframe, {
          clientX: 300,
          clientY: Y_POSITION,
          button: 2,
          bubbles: true,
          cancelable: true
        });
        fireEvent.pointerUp(keyframe, {
          clientX: 300,
          clientY: Y_POSITION,
          button: 2,
          bubbles: true,
          cancelable: true
        });
      });

      // Verify keyframe was removed
      await waitFor(() => {
        const keyframe = container.querySelector('[data-testid="keyframe-5"]');
        expect(keyframe).not.toBeInTheDocument();
      });
    });
  });

  describe('Keyframe Selection', () => {
    it('should handle multiple keyframe selection', async () => {
      // Add first keyframe
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 200,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);
      });

      // Add second keyframe
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 400,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);
      });

      // Draw selection box around both keyframes
      await act(async () => {
        fireEvent.pointerDown(envelope, {
          clientX: 150,
          clientY: Y_POSITION - DRAG.MIN_DISTANCE
        });
        fireEvent.pointerMove(envelope, {
          clientX: 450,
          clientY: Y_POSITION + DRAG.MIN_DISTANCE
        });
      });

      // Verify selection box is visible
      const selectionBox = container.querySelector('[data-testid="selection-box"]');
      expect(selectionBox).toBeInTheDocument();

      // End selection
      await act(async () => {
        fireEvent.pointerUp(envelope);
      });

      // Verify both keyframes are selected
      const selectedKeyframes = container.querySelectorAll('[data-testid*="selected-keyframe"]');
      expect(selectedKeyframes.length).toBe(2);
      selectedKeyframes.forEach(keyframe => {
        expect(keyframe).toHaveAttribute('aria-selected', 'true');
      });
    });
  });

  describe('Keyboard Interaction', () => {
    it('should handle keyboard navigation between keyframes', async () => {
      // Add two keyframes
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 200,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);

        fireEvent.pointerDown(envelope, { 
          clientX: 400,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);
      });

      // Focus first keyframe
      const firstKeyframe = container.querySelector('[data-testid="keyframe-3.33"]');
      if (!firstKeyframe) throw new Error('Failed to find first keyframe');
      firstKeyframe.setAttribute('tabindex', '0');
      firstKeyframe.focus();

      // Press Tab to move to next keyframe
      fireEvent.keyDown(firstKeyframe, { key: 'Tab' });

      // Verify second keyframe is focused
      const secondKeyframe = container.querySelector('[data-testid="keyframe-6.67"]');
      expect(document.activeElement).toBe(secondKeyframe);
    });

    it('should handle keyframe deletion with Delete key', async () => {
      // Add a keyframe
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 300,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);
      });

      // Focus and delete keyframe
      const keyframe = container.querySelector('[data-testid="keyframe-5"]');
      if (!keyframe) throw new Error('Failed to find keyframe');
      keyframe.setAttribute('tabindex', '0');
      keyframe.focus();
      fireEvent.keyDown(keyframe, { key: 'Delete' });

      // Verify keyframe was removed
      await waitFor(() => {
        expect(keyframe).not.toBeInTheDocument();
      });
    });
  });

  describe('Interpolation Types', () => {
    it('should change interpolation type with keyboard shortcuts', async () => {
      // Add a keyframe
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 300,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);
      });

      // Select keyframe
      const keyframe = container.querySelector('[data-testid="keyframe-5"]');
      if (!keyframe) throw new Error('Failed to find keyframe');
      fireEvent.click(keyframe);

      // Press 'L' for linear interpolation
      fireEvent.keyDown(document, { key: 'l' });

      // Verify interpolation type changed
      await waitFor(() => {
        expect(keyframe).toHaveAttribute('data-interpolation', InterpolationType.Linear);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      expect(envelope).toHaveAttribute('role', 'application');
      expect(envelope).toHaveAttribute('aria-label', expect.stringContaining('volume'));
    });

    it('should announce status messages', async () => {
      // Add a keyframe
      await act(async () => {
        fireEvent.pointerDown(envelope, { 
          clientX: 300,
          clientY: Y_POSITION,
          button: 0,
          ctrlKey: true
        });
        fireEvent.pointerUp(envelope);
      });

      // Verify status message is announced
      const statusRegion = screen.getByRole('status');
      expect(statusRegion).toHaveTextContent(/keyframe added/i);
    });
  });
});
