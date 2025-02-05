import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Logger } from '../../../../main/utils/logger';
import { VolumeEnvelope } from '../../../components/VolumeEnvelope';
import { KeyframesProvider } from '../../../contexts/KeyframesContext';
import { InterpolationType, BezierControlPoints } from '../../../keyframes/types';
import { 
  BezierPresets, 
  GRID, 
  DRAG, 
  KEYBOARD,
  VOLUME,
  INTERPOLATION_SHORTCUTS,
  type InterpolationShortcutKey 
} from '../../../keyframes/constants';

const logger = new Logger('bezier-interpolation.test');

describe('Bezier Interpolation', () => {
  const defaultProps = {
    clipId: 'test-clip',
    duration: 10,
    viewport: {
      width: 500,
      height: 100,
      pixelsPerSecond: 50
    },
    isSelected: true
  };

  describe('Keyframe Creation and Editing', () => {
    it('should create keyframe with Bezier interpolation', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add keyframes
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');

      // Add keyframe at 2s
      fireEvent.click(svg, {
        clientX: 100, // 2s * 50px/s = 100px
        clientY: 50   // middle of height
      });

      // Add second keyframe at 4s
      fireEvent.click(svg, {
        clientX: 200, // 4s * 50px/s = 200px
        clientY: 25   // 75% up
      });

      // Verify keyframes were added
      await waitFor(() => {
        const keyframes = container.querySelectorAll('[data-testid^="keyframe-"]');
        expect(keyframes).toHaveLength(2);
        keyframes.forEach(keyframe => {
          expect(keyframe).toHaveAttribute('role', 'button');
          expect(keyframe).toHaveAttribute('aria-label', expect.stringContaining('keyframe'));
        });
      });

      // Find first keyframe
      const firstKeyframe = container.querySelector('[data-testid="keyframe-2"]');
      if (!firstKeyframe) throw new Error('First keyframe element not found');

      // Click to select keyframe
      fireEvent.mouseDown(firstKeyframe);

      // Open Bezier editor
      const bezierButton = container.querySelector('.interpolation-button.bezier');
      if (!bezierButton) throw new Error('Bezier button element not found');
      fireEvent.click(bezierButton);

      // Verify Bezier editor is shown
      const editor = container.querySelector('.bezier-curve-editor');
      expect(editor).toBeInTheDocument();
      expect(editor).toHaveAttribute('role', 'region');
      expect(editor).toHaveAttribute('aria-label', expect.stringContaining('Bezier'));
    });

    it('should handle error when creating invalid keyframe', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');

      // Try to add keyframe outside valid range
      fireEvent.click(svg, {
        clientX: -50, // Invalid position
        clientY: 50
      });

      // Verify error message
      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent(/invalid/i);
    });
  });

  describe('Bezier Control Points', () => {
    it('should handle Bezier control point dragging', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add and select keyframe
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 });

      const keyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!keyframe) throw new Error('Keyframe element not found');
      fireEvent.mouseDown(keyframe);

      // Open Bezier editor
      const bezierButton = container.querySelector('.interpolation-button.bezier');
      if (!bezierButton) throw new Error('Bezier button element not found');
      fireEvent.click(bezierButton);

      // Find control point
      const controlPoint = container.querySelector('.keyframe-point');
      if (!controlPoint) throw new Error('Control point element not found');

      // Drag control point
      fireEvent.mouseDown(controlPoint, { clientX: 100, clientY: 50 });
      fireEvent.mouseMove(controlPoint, { clientX: 150, clientY: 75 });
      fireEvent.mouseUp(controlPoint);

      // Verify control point moved
      await waitFor(() => {
        const point = container.querySelector('.keyframe-point');
        expect(point).toHaveAttribute('transform', expect.stringContaining('translate'));
      });
    });

    it('should handle Bezier presets', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add and select keyframe
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 });

      const keyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!keyframe) throw new Error('Keyframe element not found');
      fireEvent.mouseDown(keyframe);

      // Open Bezier editor
      const bezierButton = container.querySelector('.interpolation-button.bezier');
      if (!bezierButton) throw new Error('Bezier button element not found');
      fireEvent.click(bezierButton);

      // Test each preset
      for (const [presetName, preset] of Object.entries(BezierPresets)) {
        const presetButton = screen.getByText(presetName.toLowerCase().replace('_', ' '));
        fireEvent.click(presetButton);

        // Verify preset applied
        await waitFor(() => {
          const keyframesData = svg.getAttribute('data-keyframes');
          const parsedData = JSON.parse(keyframesData || '[]');
          expect(parsedData[0].interpolation.controlPoints).toEqual(preset);
        });
      }
    });
  });

  describe('Keyboard Interaction', () => {
    it('should handle keyboard shortcuts for interpolation types', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add and select keyframe
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 });

      const keyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!keyframe) throw new Error('Keyframe element not found');
      fireEvent.mouseDown(keyframe);

      // Test each shortcut
      for (const [key, type] of Object.entries(INTERPOLATION_SHORTCUTS)) {
        fireEvent.keyDown(window, { key });

        await waitFor(() => {
          const keyframesData = svg.getAttribute('data-keyframes');
          const parsedData = JSON.parse(keyframesData || '[]');
          expect(parsedData[0].interpolation.type).toBe(type);
        });

        // Verify announcement
        const statusMessage = screen.getByRole('status');
        expect(statusMessage).toHaveTextContent(new RegExp(type, 'i'));
      }
    });

    it('should handle keyboard navigation between keyframes', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add two keyframes
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 }); // First keyframe
      fireEvent.click(svg, { clientX: 200, clientY: 50 }); // Second keyframe

      // Find first keyframe
      const firstKeyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!firstKeyframe) throw new Error('First keyframe element not found');

      // Focus first keyframe
      (firstKeyframe as HTMLElement).focus();
      expect(document.activeElement).toBe(firstKeyframe);

      // Test arrow key navigation
      fireEvent.keyDown(firstKeyframe, { key: 'ArrowRight' });
      await waitFor(() => {
        const keyframes = container.querySelectorAll('[data-testid^="keyframe-"]');
        expect(keyframes[1]).toBe(document.activeElement);
      });

      // Test reverse navigation
      const secondKeyframe = document.activeElement;
      fireEvent.keyDown(secondKeyframe!, { key: 'ArrowLeft' });
      await waitFor(() => {
        expect(firstKeyframe).toBe(document.activeElement);
      });
    });

    it('should handle fine control with modifier keys', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add keyframe and open Bezier editor
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 });

      const keyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!keyframe) throw new Error('Keyframe element not found');
      fireEvent.mouseDown(keyframe);

      const bezierButton = container.querySelector('.interpolation-button.bezier');
      if (!bezierButton) throw new Error('Bezier button element not found');
      fireEvent.click(bezierButton);

      // Find control point
      const controlPoint = container.querySelector('.keyframe-point');
      if (!controlPoint) throw new Error('Control point element not found');
      (controlPoint as HTMLElement).focus();

      // Test fine control with Alt key
      fireEvent.keyDown(controlPoint, { key: 'ArrowRight', altKey: true });
      await waitFor(() => {
        expect(controlPoint).toHaveAttribute('transform', expect.stringContaining(KEYBOARD.FINE_CONTROL_STEP.toString()));
      });

      // Test larger steps with Shift key
      fireEvent.keyDown(controlPoint, { key: 'ArrowRight', shiftKey: true });
      await waitFor(() => {
        expect(controlPoint).toHaveAttribute('transform', expect.stringContaining((KEYBOARD.STEP * KEYBOARD.SHIFT_MULTIPLIER).toString()));
      });
    });
  });

  describe('Accessibility', () => {
    it('should show correct visual indicators for each interpolation type', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add keyframe
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 });

      const keyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!keyframe) throw new Error('Keyframe element not found');
      fireEvent.mouseDown(keyframe);

      // Test each interpolation type
      for (const type of Object.values(InterpolationType)) {
        const button = container.querySelector(`.interpolation-button.${type.toLowerCase()}`);
        if (!button) throw new Error(`Button for ${type} not found`);
        fireEvent.click(button);

        await waitFor(() => {
          const indicator = container.querySelector(`.interpolation-indicator.${type.toLowerCase()}`);
          expect(indicator).toBeInTheDocument();
          expect(indicator).toHaveAttribute('d'); // Should have a path
          expect(indicator).toHaveAttribute('role', 'presentation');
        });

        // Verify announcement
        const statusMessage = screen.getByRole('status');
        expect(statusMessage).toHaveTextContent(new RegExp(type, 'i'));
      }
    });

    it('should handle keyboard focus management', async () => {
      const { container } = render(
        <KeyframesProvider>
          <VolumeEnvelope {...defaultProps} />
        </KeyframesProvider>
      );

      // Add keyframe
      const svg = container.querySelector('[data-testid="volume-envelope"]');
      if (!svg) throw new Error('Volume envelope SVG element not found');
      fireEvent.click(svg, { clientX: 100, clientY: 50 });

      // Find keyframe
      const keyframe = container.querySelector('[data-testid^="keyframe-"]');
      if (!keyframe) throw new Error('Keyframe element not found');

      // Test keyboard focus
      (keyframe as HTMLElement).focus();
      expect(document.activeElement).toBe(keyframe);

      // Test Enter key activation
      fireEvent.keyDown(keyframe, { key: 'Enter' });
      expect(keyframe).toHaveAttribute('aria-pressed', 'true');

      // Test Space key activation
      fireEvent.keyDown(keyframe, { key: ' ' });
      expect(keyframe).toHaveAttribute('aria-pressed', 'true');

      // Open Bezier editor
      const bezierButton = container.querySelector('.interpolation-button.bezier');
      if (!bezierButton) throw new Error('Bezier button element not found');
      fireEvent.click(bezierButton);

      // Test Escape key to close Bezier editor
      fireEvent.keyDown(window, { key: 'Escape' });
      const editor = container.querySelector('.bezier-curve-editor');
      expect(editor).not.toBeInTheDocument();

      // Verify focus returns to keyframe
      expect(document.activeElement).toBe(keyframe);
    });
  });
});
