import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BezierCurveEditor } from '../BezierCurveEditor';
import { useKeyframes } from '../../hooks/useKeyframes';
import { InterpolationType } from '../../types/keyframe';

// Mock the useKeyframes hook
jest.mock('../../hooks/useKeyframes', () => ({
  useKeyframes: jest.fn(),
}));

describe('BezierCurveEditor', () => {
  const mockProps = {
    effectId: 'effect-1',
    paramId: 'param1',
  };

  const mockKeyframes = {
    keyframeState: {
      tracks: {
        'effect-1-param1': {
          keyframes: [
            { time: 0, value: 0, interpolation: InterpolationType.Linear },
          ],
        },
      },
    },
    updateKeyframe: jest.fn(),
  };

  const mockRect = {
    left: 0,
    top: 0,
    width: 400,
    height: 400,
    right: 400,
    bottom: 400,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useKeyframes as jest.Mock).mockReturnValue(mockKeyframes);

    // Mock canvas context
    const mockContext = {
      clearRect: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      stroke: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      canvas: document.createElement('canvas'),
      getContextAttributes: jest.fn(),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      strokeStyle: '#000',
      fillStyle: '#000',
      lineWidth: 1,
    } as unknown as CanvasRenderingContext2D;

    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
  });

  it('renders canvas and interpolation buttons', () => {
    render(<BezierCurveEditor {...mockProps} />);
    
    expect(screen.getByText('Linear')).toBeInTheDocument();
    expect(screen.getByText('Bezier')).toBeInTheDocument();
    expect(screen.getByText('Step')).toBeInTheDocument();
    expect(document.querySelector('canvas')).toBeInTheDocument();
  });

  it('updates interpolation type when buttons are clicked', () => {
    render(<BezierCurveEditor {...mockProps} />);
    
    fireEvent.click(screen.getByText('Linear'));
    expect(mockKeyframes.updateKeyframe).toHaveBeenCalledWith(
      'effect-1-param1',
      0,
      0,
      InterpolationType.Linear
    );

    fireEvent.click(screen.getByText('Bezier'));
    expect(mockKeyframes.updateKeyframe).toHaveBeenCalledWith(
      'effect-1-param1',
      0,
      0,
      InterpolationType.Bezier
    );

    fireEvent.click(screen.getByText('Step'));
    expect(mockKeyframes.updateKeyframe).toHaveBeenCalledWith(
      'effect-1-param1',
      0,
      0,
      InterpolationType.Step
    );
  });

  it('handles mouse interactions for control points', () => {
    const { container } = render(<BezierCurveEditor {...mockProps} />);
    const canvas = container.querySelector('canvas')!;

    // Mock canvas getBoundingClientRect
    canvas.getBoundingClientRect = jest.fn().mockReturnValue(mockRect as DOMRect);

    // Click near the 'in' control point (0.25, 0.25)
    fireEvent.mouseDown(canvas, {
      clientX: 100, // 0.25 * 400
      clientY: 300, // (1 - 0.25) * 400
    });

    // Move the point
    fireEvent.mouseMove(window, {
      clientX: 200,
      clientY: 200,
    });

    // Release
    fireEvent.mouseUp(window);

    // Should update keyframe with new control points
    expect(mockKeyframes.updateKeyframe).toHaveBeenCalledWith(
      'effect-1-param1',
      0,
      0,
      InterpolationType.Bezier
    );
  });

  it('clamps control point positions within canvas bounds', () => {
    const { container } = render(<BezierCurveEditor {...mockProps} />);
    const canvas = container.querySelector('canvas')!;

    canvas.getBoundingClientRect = jest.fn().mockReturnValue(mockRect as DOMRect);

    // Try to drag a point outside canvas bounds
    fireEvent.mouseDown(canvas, {
      clientX: 100,
      clientY: 300,
    });

    fireEvent.mouseMove(window, {
      clientX: -100, // Should clamp to 0
      clientY: 500,  // Should clamp to 400
    });

    fireEvent.mouseUp(window);

    expect(mockKeyframes.updateKeyframe).toHaveBeenCalledWith(
      'effect-1-param1',
      0,
      0,
      InterpolationType.Bezier
    );
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<BezierCurveEditor {...mockProps} />);
    
    expect(container.querySelector('.bezier-curve-editor')).toBeInTheDocument();
    expect(container.querySelector('.interpolation-controls')).toBeInTheDocument();
    expect(container.querySelector('.curve-canvas')).toBeInTheDocument();
    expect(container.querySelector('.interpolation-button.linear')).toBeInTheDocument();
    expect(container.querySelector('.interpolation-button.bezier')).toBeInTheDocument();
    expect(container.querySelector('.interpolation-button.step')).toBeInTheDocument();
  });

  it('removes event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = render(<BezierCurveEditor {...mockProps} />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mouseup', expect.any(Function));
  });
});
