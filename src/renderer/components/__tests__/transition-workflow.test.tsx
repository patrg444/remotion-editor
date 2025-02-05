import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestApp } from './test-utils';
import { Track, VideoClip, ActionTypes } from '../../types/timeline';
import { TransitionType, Transition } from '../../types/transition';

// Mock video sources
const VIDEO_SOURCES = {
  clip1: '/path/to/clip1.mp4',
  clip2: '/path/to/clip2.mp4'
};

// Create test tracks with adjacent clips
const createTestTracks = () => [
  {
    id: '1',
    name: 'Video Track',
    type: 'video' as const,
    clips: [
      {
        id: 'clip1',
        type: 'video' as const,
        startTime: 0,
        endTime: 60,
        duration: 60,
        name: 'First Clip',
        src: VIDEO_SOURCES.clip1,
        effects: [],
        transition: {
          id: 'transition1',
          type: TransitionType.Wipe,
          duration: 15,
          params: {
            angle: 45,
            softness: 0.5
          }
        } as Transition
      },
      {
        id: 'clip2',
        type: 'video' as const,
        startTime: 60, // Adjacent to clip1
        endTime: 120,
        duration: 60,
        name: 'Second Clip',
        src: VIDEO_SOURCES.clip2,
        effects: []
      }
    ]
  }
];

describe('Transition Inspector Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Transition Parameter Adjustments', () => {
    it('should update transition duration via Inspector', async () => {
      const { container } = render(<TestApp initialTracks={createTestTracks()} />);

      // Select transition
      const transitionHandle = screen.getByTestId('transition-handle');
      await act(async () => {
        fireEvent.click(transitionHandle);
      });

      // Find duration input in Inspector
      const durationInput = await screen.findByLabelText('Duration');
      expect(durationInput).toHaveValue(15);

      // Move playhead to middle of original transition
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '52.5'); // Middle of 15-frame transition (45 + 15/2)
      });

      // Change duration from 15 to 20 frames while moving playhead
      await act(async () => {
        fireEvent.change(durationInput, { target: { value: '20' } });
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '55'); // Move playhead during duration change
      });

      // Verify timeline handle and preview update
      // With 20-frame duration:
      // - start point moves to 40 (end - duration = 60 - 20)
      // - at playhead 55:
      //   - relativeTime = 55 - 40 = 15
      //   - progress = 15 / 20 = 0.75 (75% through the transition)
      await waitFor(() => {
        const updatedHandle = screen.getByTestId('transition-handle');
        expect(updatedHandle).toHaveAttribute('data-duration', '20');
        
        const preview = screen.getByTestId('transition-preview');
        expect(preview).toHaveAttribute('data-progress', '0.75');
      });

      // Cleanup
      container.remove();
    });

    it('should update transition angle and softness', async () => {
      const { container } = render(<TestApp initialTracks={createTestTracks()} />);

      // Select transition
      const transitionHandle = screen.getByTestId('transition-handle');
      await act(async () => {
        fireEvent.click(transitionHandle);
      });

      // Find angle and softness inputs
      const angleInput = await screen.findByLabelText('Angle');
      const softnessInput = await screen.findByLabelText('Softness');
      expect(angleInput).toHaveValue(45);
      expect(softnessInput).toHaveValue(0.5);

      // Change parameters
      await act(async () => {
        fireEvent.change(angleInput, { target: { value: '90' } });
        fireEvent.change(softnessInput, { target: { value: '0.8' } });
      });

      // Verify preview updates
      const preview = screen.getByTestId('transition-preview');
      expect(preview).toHaveStyle({
        transform: 'rotate(90deg)',
        filter: 'blur(0.8px)'
      });

      // Cleanup
      container.remove();
    });

    it('should handle transition type switching', async () => {
      const { container } = render(<TestApp initialTracks={createTestTracks()} />);

      // Select transition
      const transitionHandle = screen.getByTestId('transition-handle');
      await act(async () => {
        fireEvent.click(transitionHandle);
      });

      // Find type selector
      const typeSelect = await screen.findByLabelText('Transition Type');
      expect(typeSelect).toHaveValue(TransitionType.Wipe);

      // Change type
      await act(async () => {
        fireEvent.change(typeSelect, { target: { value: TransitionType.Dissolve } });
      });

      // Verify preview updates
      await waitFor(() => {
        const preview = screen.getByTestId('transition-preview');
        expect(preview).toHaveAttribute('data-type', TransitionType.Dissolve);
      });

      // Cleanup
      container.remove();
    });

    it('should handle transition removal gracefully', async () => {
      const { container } = render(<TestApp initialTracks={createTestTracks()} />);

      // Select transition
      const transitionHandle = screen.getByTestId('transition-handle');
      await act(async () => {
        fireEvent.click(transitionHandle);
      });

      // Find and click remove button
      const removeButton = await screen.findByLabelText('Remove Transition');
      await act(async () => {
        fireEvent.click(removeButton);
      });

      // Verify transition is removed
      await waitFor(() => {
        expect(screen.queryByTestId('transition-handle')).not.toBeInTheDocument();
      });

      // Verify Inspector updates
      expect(screen.queryByLabelText('Duration')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Angle')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Softness')).not.toBeInTheDocument();

      // Cleanup
      container.remove();
    });
  });

  describe('Transition Preview Updates', () => {
    it('should update preview when scrubbing timeline', async () => {
      const { container } = render(<TestApp initialTracks={createTestTracks()} />);

      // Select transition
      const transitionHandle = screen.getByTestId('transition-handle');
      await act(async () => {
        fireEvent.click(transitionHandle);
      });

      // Move playhead before transition
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '40'); // Before transition
      });

      // Verify preview shows no progress before transition
      const preview = screen.getByTestId('transition-preview');
      expect(preview).toHaveAttribute('data-progress', '0');

      // Move playhead to transition start
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '45'); // Start of transition
      });

      // Verify preview shows start of transition
      expect(preview).toHaveAttribute('data-progress', '0');

      // Move playhead to transition middle
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '52.5'); // Middle of transition (45 + 15/2)
      });

      // Verify preview shows transition at middle
      expect(preview).toHaveAttribute('data-progress', '0.5');

      // Move playhead to transition end
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '60'); // End of transition
      });

      // Verify preview shows end of transition
      expect(preview).toHaveAttribute('data-progress', '1');

      // Move playhead after transition
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '65'); // After transition
      });

      // Verify preview stays at full progress after transition
      expect(preview).toHaveAttribute('data-progress', '1');

      // Cleanup
      container.remove();
    });

    it('should handle transitions at end of timeline', async () => {
      const tracks = [
        {
          id: '1',
          name: 'Video Track',
          type: 'video' as const,
          clips: [
            {
              id: 'clip1',
              type: 'video' as const,
              startTime: 240, // Near end of timeline
              endTime: 270,
              duration: 30,
              name: 'First Clip',
              src: VIDEO_SOURCES.clip1,
              effects: [],
              transition: {
                id: 'transition1',
                type: TransitionType.Wipe,
                duration: 15,
                params: {
                  angle: 45,
                  softness: 0.5
                }
              } as Transition
            },
            {
              id: 'clip2',
              type: 'video' as const,
              startTime: 270, // Last clip
              endTime: 300,
              duration: 30,
              name: 'Second Clip',
              src: VIDEO_SOURCES.clip2,
              effects: []
            }
          ]
        }
      ];

      const { container } = render(<TestApp initialTracks={tracks} />);

      // Select transition
      const transitionHandle = screen.getByTestId('transition-handle');
      await act(async () => {
        fireEvent.click(transitionHandle);
      });

      // Move playhead to middle of transition at end of timeline
      await act(async () => {
        const appRoot = container.querySelector('[data-testid="app-root"]');
        if (!appRoot) throw new Error('App root not found');
        appRoot.setAttribute('data-current-time', '262.5'); // Middle of transition (255 + 15/2)
      });

      // Verify preview shows correct progress
      const preview = screen.getByTestId('transition-preview');
      expect(preview).toHaveAttribute('data-progress', '0.5');

      // Cleanup
      container.remove();
    });
  });
});
