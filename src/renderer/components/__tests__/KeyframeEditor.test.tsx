import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeyframeEditor } from '../KeyframeEditor';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { InterpolationType, Keyframe } from '../../types/keyframe';
import { useKeyframes } from '../../hooks/useKeyframes';

// Mock useKeyframes hook
jest.mock('../../hooks/useKeyframes', () => ({
  useKeyframes: jest.fn()
}));

// Mock keyframe data
const mockKeyframes: Keyframe<number>[] = [
  {
    time: 0,
    value: 0,
    interpolation: { type: InterpolationType.Linear }
  },
  {
    time: 50,
    value: 1,
    interpolation: { type: InterpolationType.Linear }
  },
  {
    time: 100,
    value: 0.5,
    interpolation: { type: InterpolationType.Linear }
  }
];

describe('KeyframeEditor', () => {
  const mockTrack = {
    id: 'effect1-param1',
    paramId: 'param1',
    keyframes: mockKeyframes,
    defaultValue: 0,
    min: 0,
    max: 1,
    step: 0.01,
    getValue: jest.fn(),
    getKeyframes: () => mockKeyframes
  };

  const mockKeyframesHook = {
    keyframeState: {
      tracks: {
        'effect1-param1': mockTrack
      }
    },
    createTrack: jest.fn(),
    removeTrack: jest.fn(),
    addKeyframe: jest.fn(),
    removeKeyframe: jest.fn(),
    updateKeyframe: jest.fn(),
    getTrack: jest.fn().mockReturnValue(mockTrack)
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useKeyframes as jest.Mock).mockReturnValue(mockKeyframesHook);
    
    // Mock getBoundingClientRect for value calculations
    const mockRect = { left: 0, top: 0, width: 1000, height: 200 };
    Element.prototype.getBoundingClientRect = jest.fn().mockReturnValue(mockRect);
  });

  const renderEditor = (props = {}) => {
    const defaultProps = {
      effectId: 'effect1',
      paramId: 'param1',
      min: 0,
      max: 1,
      step: 0.01,
      ...props
    };

    return render(
      <TimelineProvider>
        <KeyframeEditor {...defaultProps} />
      </TimelineProvider>
    );
  };

  describe('Track Setup', () => {
    it('loads keyframes from track', () => {
      const { container } = renderEditor();
      const markers = container.querySelectorAll('.keyframe-marker');
      
      expect(markers).toHaveLength(3);
      expect(mockKeyframesHook.getTrack).toHaveBeenCalledWith('effect1-param1');
    });

    it('creates track if it doesnt exist', () => {
      mockKeyframesHook.getTrack.mockReturnValueOnce(undefined);
      renderEditor();
      
      expect(mockKeyframesHook.createTrack).toHaveBeenCalledWith(
        'effect1',
        'param1',
        0, // defaultValue
        0, // min
        1, // max
        0.01 // step
      );
    });
  });

  describe('Timeline Interaction', () => {
    it('adds keyframe on timeline click', () => {
      const { container } = renderEditor();
      const timeline = container.querySelector('.keyframe-timeline');
      
      fireEvent.click(timeline!, {
        clientX: 300, // 30% of timeline width
        clientY: 100 // 50% of timeline height
      });

      expect(mockKeyframesHook.addKeyframe).toHaveBeenCalledWith(
        'effect1-param1',
        30,
        0.5,
        InterpolationType.Linear
      );
    });

    it('updates keyframe on drag', () => {
      const { container } = renderEditor();
      const markers = container.querySelectorAll('.keyframe-marker');
      
      // Start drag
      fireEvent.mouseDown(markers[1], {
        clientX: 500, // 50% position
        clientY: 0
      });

      // Move to new position
      fireEvent.mouseMove(window, {
        clientX: 700, // 70% position
        clientY: 100, // 50% value
        buttons: 1
      });

      expect(mockKeyframesHook.updateKeyframe).toHaveBeenCalledWith(
        'effect1-param1',
        50, // original time
        0.5, // new value
        InterpolationType.Linear
      );
    });

    it('clamps values to min/max range', () => {
      const { container } = renderEditor();
      const markers = container.querySelectorAll('.keyframe-marker');
      
      // Try to drag beyond max value
      fireEvent.mouseDown(markers[1], { clientX: 500 });
      fireEvent.mouseMove(window, {
        clientX: 700,
        clientY: -100, // Beyond max
        buttons: 1
      });

      expect(mockKeyframesHook.updateKeyframe).toHaveBeenCalledWith(
        'effect1-param1',
        50,
        1, // Clamped to max
        InterpolationType.Linear
      );
    });
  });

  describe('Value Editor', () => {
    it('shows value editor when marker is selected', () => {
      const { container } = renderEditor();
      const markers = container.querySelectorAll('.keyframe-marker');
      
      fireEvent.mouseDown(markers[1]);

      const valueEditor = container.querySelector('.keyframe-value-editor');
      expect(valueEditor).toBeInTheDocument();
      expect(valueEditor?.querySelector('input[type="number"]')).toHaveValue(1);
    });

    it('updates value through number input', () => {
      const { container } = renderEditor();
      const markers = container.querySelectorAll('.keyframe-marker');
      
      // Select marker
      fireEvent.mouseDown(markers[1]);

      // Change value
      const input = container.querySelector('input[type="number"]')!;
      fireEvent.change(input, { target: { value: '0.5' } });

      expect(mockKeyframesHook.updateKeyframe).toHaveBeenCalledWith(
        'effect1-param1',
        50,
        0.5,
        InterpolationType.Linear
      );
    });

    it('respects step size in value input', () => {
      const { container } = renderEditor({ step: 0.1 });
      const markers = container.querySelectorAll('.keyframe-marker');
      
      fireEvent.mouseDown(markers[1]);
      const input = container.querySelector('input[type="number"]')!;
      
      expect(input).toHaveAttribute('step', '0.1');
    });
  });

  describe('Keyframe Deletion', () => {
    it('removes keyframe when delete button is clicked', () => {
      const { container } = renderEditor();
      const markers = container.querySelectorAll('.keyframe-marker');
      
      // Select marker
      fireEvent.mouseDown(markers[1]);

      // Click delete button
      const deleteButton = screen.getByText('Delete Keyframe');
      fireEvent.click(deleteButton);

      expect(mockKeyframesHook.removeKeyframe).toHaveBeenCalledWith(
        'effect1-param1',
        50
      );
    });

    it('disables delete button when no keyframe is selected', () => {
      renderEditor();
      const deleteButton = screen.getByText('Delete Keyframe');
      expect(deleteButton).toBeDisabled();
    });
  });
});
