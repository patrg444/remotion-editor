import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TransitionEditor } from '../TransitionEditor';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { Transition, TransitionType, TransitionPreviewData } from '../../types/transition';

// Mock TransitionPreview component
jest.mock('../TransitionPreview', () => ({
  TransitionPreview: jest.fn(() => <div data-testid="transition-preview" />)
}));

// Mock transition data
const mockTransition: Transition = {
  id: 'transition1',
  type: TransitionType.Fade,
  duration: 1.0,
  params: {
    direction: 'left',
    easing: 'linear',
    duration: 1.0
  }
};

// Mock preview data
const mockPreviewData: TransitionPreviewData = {
  clipA: {
    data: new Uint8ClampedArray(),
    width: 1920,
    height: 1080,
    colorSpace: 'srgb'
  },
  clipB: {
    data: new Uint8ClampedArray(),
    width: 1920,
    height: 1080,
    colorSpace: 'srgb'
  },
  progress: 0
};

describe('TransitionEditor', () => {
  const mockOnParamsChange = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnPreviewGenerated = jest.fn();

  const renderEditor = (props = {}) => {
    const defaultProps = {
      transition: mockTransition,
      previewData: mockPreviewData,
      onParamsChange: mockOnParamsChange,
      onUpdate: mockOnUpdate,
      onPreviewGenerated: mockOnPreviewGenerated,
      ...props
    };

    return render(
      <TimelineProvider>
        <TransitionEditor {...defaultProps} />
      </TimelineProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Transition Type Selection', () => {
    it('shows current transition type', () => {
      renderEditor();
      const typeSelect = screen.getByRole('combobox', { name: /transition type/i });
      expect(typeSelect).toHaveValue(TransitionType.Fade);
    });

    it('updates transition type', () => {
      renderEditor();
      const typeSelect = screen.getByRole('combobox', { name: /transition type/i });
      
      fireEvent.change(typeSelect, { target: { value: TransitionType.Wipe } });

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        ...mockTransition.params,
        type: TransitionType.Wipe
      });
    });

    it('shows all available transition types', () => {
      renderEditor();
      const typeSelect = screen.getByRole('combobox', { name: /transition type/i });
      const options = Array.from(typeSelect.getElementsByTagName('option'));
      
      expect(options.map(opt => opt.value)).toEqual([
        TransitionType.Dissolve,
        TransitionType.Fade,
        TransitionType.Wipe,
        TransitionType.Slide,
        TransitionType.Crossfade,
        TransitionType.Zoom,
        TransitionType.Push
      ]);
    });
  });

  describe('Duration Control', () => {
    it('shows current duration', () => {
      renderEditor();
      const durationInput = screen.getByRole('spinbutton', { name: /duration in seconds/i });
      expect(durationInput).toHaveValue(1.0);
    });

    it('updates duration', () => {
      renderEditor();
      const durationInput = screen.getByRole('spinbutton', { name: /duration in seconds/i });
      
      fireEvent.change(durationInput, { target: { value: '2.5' } });

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        ...mockTransition.params,
        duration: 2.5
      });
    });
  });

  describe('Direction Control', () => {
    it('shows direction control for supported transitions', () => {
      renderEditor({
        transition: {
          ...mockTransition,
          type: TransitionType.Wipe
        }
      });
      
      expect(screen.getByRole('combobox', { name: /transition direction/i })).toBeInTheDocument();
    });

    it('updates direction', () => {
      renderEditor({
        transition: {
          ...mockTransition,
          type: TransitionType.Wipe
        }
      });
      
      const directionSelect = screen.getByRole('combobox', { name: /transition direction/i });
      fireEvent.change(directionSelect, { target: { value: 'right' } });

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        ...mockTransition.params,
        direction: 'right'
      });
    });

    it('hides direction control for unsupported transitions', () => {
      renderEditor({
        transition: {
          ...mockTransition,
          type: TransitionType.Dissolve
        }
      });
      
      expect(screen.queryByLabelText('Direction')).not.toBeInTheDocument();
    });
  });

  describe('Easing Control', () => {
    it('shows easing options', () => {
      renderEditor();
      const easingSelect = screen.getByRole('combobox', { name: /easing function/i });
      const options = Array.from(easingSelect.getElementsByTagName('option'));
      
      expect(options.map(opt => opt.value)).toEqual([
        'linear',
        'ease-in',
        'ease-out',
        'ease-in-out'
      ]);
    });

    it('updates easing', () => {
      renderEditor();
      const easingSelect = screen.getByRole('combobox', { name: /easing function/i });
      
      fireEvent.change(easingSelect, { target: { value: 'ease-in' } });

      expect(mockOnParamsChange).toHaveBeenCalledWith({
        ...mockTransition.params,
        easing: 'ease-in'
      });
    });
  });

  describe('GPU Preview Toggle', () => {
    it('shows GPU preview toggle', () => {
      renderEditor();
      expect(screen.getByRole('checkbox', { name: /enable gpu preview/i })).toBeInTheDocument();
    });

    it('toggles GPU preview', () => {
      renderEditor();
      const toggle = screen.getByRole('checkbox', { name: /enable gpu preview/i });
      
      fireEvent.click(toggle);

      expect(mockOnUpdate).toHaveBeenCalledWith({
        ...mockTransition,
        gpuPreviewEnabled: true
      });
    });
  });

  describe('Preview Generation', () => {
    it('renders preview component with correct props', () => {
      renderEditor();
      const preview = screen.getByTestId('transition-preview');
      
      expect(preview).toBeInTheDocument();
    });

    it('handles frame rendering callback', () => {
      renderEditor();
      
      // Create a mock frame data
      const frameData = new ImageData(1, 1);
      const preview = screen.getByTestId('transition-preview');
      
      // Get the props passed to TransitionPreview mock
      const { TransitionPreview } = require('../TransitionPreview');
      const mockProps = TransitionPreview.mock.calls[0][0];
      
      // Call the onFrameRendered prop directly
      mockProps.onFrameRendered(frameData);

      expect(mockOnPreviewGenerated).toHaveBeenCalledWith(expect.objectContaining({
        fromFrame: expect.any(Object),
        toFrame: expect.any(Object),
        progress: 0,
        params: mockTransition.params
      }));
    });
  });
});
