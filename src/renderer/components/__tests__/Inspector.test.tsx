import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Inspector from '../Inspector';
import { ProductionClip, Track, ClipEffect } from '../../types/timeline';
import { useKeyframes } from '../../hooks/useKeyframes';

// Mock the KeyframeEditor and BezierCurveEditor components
jest.mock('../KeyframeEditor', () => ({
  __esModule: true,
  KeyframeEditor: () => <div data-testid="keyframe-editor" />
}));

jest.mock('../BezierCurveEditor', () => ({
  __esModule: true,
  BezierCurveEditor: () => <div data-testid="bezier-editor" />
}));

// Mock the useKeyframes hook
jest.mock('../../hooks/useKeyframes');

const mockKeyframesHook = {
  createTrack: jest.fn(),
  removeTrack: jest.fn(),
  addKeyframeGroup: jest.fn(),
  updateKeyframe: jest.fn(),
  removeKeyframe: jest.fn(),
  getKeyframes: jest.fn(() => []),
  getCurveType: jest.fn(() => 'linear'),
  setCurveType: jest.fn(),
  getControlPoints: jest.fn(() => ({ p1: { x: 0.5, y: 0.5 }, p2: { x: 0.5, y: 0.5 } })),
  setControlPoints: jest.fn(),
};

(useKeyframes as jest.Mock).mockReturnValue(mockKeyframesHook);

const mockClip: ProductionClip = {
  id: '1',
  type: 'video',
  name: 'test-clip',
  startTime: 0,
  duration: 60,
  opacity: 100,
  isLocked: false,
  isMuted: false,
  effects: [
    {
      id: 'effect1',
      type: 'blur',
      startTime: 0,
      duration: 60,
      parameters: {
        radius: 10,
        enabled: true
      }
    }
  ]
};

const mockTrack: Track = {
  id: '1',
  name: 'Video Track 1',
  type: 'video',
  clips: [],
  duration: 300,
  isLocked: false,
  isMuted: false,
  isSolo: false,
  height: 100
};

describe('Inspector', () => {
  const mockHandlers = {
    onClipUpdate: jest.fn(),
    onTrackUpdate: jest.fn(),
    onEffectUpdate: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no clip or track is selected', () => {
    render(<Inspector {...mockHandlers} />);

    expect(screen.getByText('No clip or track selected')).toBeInTheDocument();
    expect(screen.getByText('Select an item to view its properties')).toBeInTheDocument();
  });

  describe('Clip Inspector', () => {
    it('renders clip properties when a clip is selected', () => {
      render(
        <Inspector
          selectedClip={mockClip}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Clip Properties')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Time')).toHaveValue(0);
      expect(screen.getByLabelText('Duration')).toHaveValue(60);
      expect(screen.getByLabelText('Opacity')).toHaveValue(100);
    });

    it('updates clip properties when values change', () => {
      render(
        <Inspector
          selectedClip={mockClip}
          {...mockHandlers}
        />
      );

      fireEvent.change(screen.getByLabelText('Start Time'), { target: { value: '10' } });
      expect(mockHandlers.onClipUpdate).toHaveBeenCalledWith('1', { startTime: 10 });

      fireEvent.change(screen.getByLabelText('Duration'), { target: { value: '30' } });
      expect(mockHandlers.onClipUpdate).toHaveBeenCalledWith('1', { duration: 30 });
    });

    it('toggles clip boolean properties', () => {
      render(
        <Inspector
          selectedClip={mockClip}
          {...mockHandlers}
        />
      );

      fireEvent.click(screen.getByLabelText('Locked'));
      expect(mockHandlers.onClipUpdate).toHaveBeenCalledWith('1', { isLocked: true });

      fireEvent.click(screen.getByLabelText('Muted'));
      expect(mockHandlers.onClipUpdate).toHaveBeenCalledWith('1', { isMuted: true });
    });

    describe('Effect Parameters', () => {
      it('updates effect parameters', () => {
        render(
          <Inspector
            selectedClip={mockClip}
            {...mockHandlers}
          />
        );

        expect(screen.getByText('blur')).toBeInTheDocument();
        
        fireEvent.change(screen.getByLabelText('Radius'), { target: { value: '20' } });
        expect(mockHandlers.onEffectUpdate).toHaveBeenCalledWith(
          '1',
          'effect1',
          { parameters: { radius: 20, enabled: true } }
        );

        fireEvent.click(screen.getByLabelText('Enabled'));
        expect(mockHandlers.onEffectUpdate).toHaveBeenCalledWith(
          '1',
          'effect1',
          { parameters: { radius: 10, enabled: false } }
        );
      });

      it('adds keyframe track for effect parameter', () => {
        render(
          <Inspector
            selectedClip={mockClip}
            {...mockHandlers}
          />
        );

        const radiusHeader = screen.getByText('Radius', { selector: '.parameter-header span' });
        const addKeyframesButton = radiusHeader.parentElement?.querySelector('.add-keyframes-button') as HTMLElement;
        fireEvent.click(addKeyframesButton);

        expect(mockKeyframesHook.createTrack).toHaveBeenCalledWith(
          'effect1',
          'radius',
          10,
          0,
          expect.any(Number),
          0.1
        );

        expect(mockKeyframesHook.addKeyframeGroup).toHaveBeenCalledWith(
          'effect1',
          'test-clip',
          [{ trackId: 'effect1-radius', paramId: 'radius', effectId: 'effect1' }]
        );
      });

      it('removes keyframe track for effect parameter', () => {
        render(
          <Inspector
            selectedClip={mockClip}
            {...mockHandlers}
          />
        );

        const removeKeyframesButton = screen.getByText('Remove Keyframes');
        fireEvent.click(removeKeyframesButton);

        expect(mockKeyframesHook.removeTrack).toHaveBeenCalledWith('effect1-radius');
      });

      it('renders keyframe editor components when parameter has keyframes', () => {
        render(
          <Inspector
            selectedClip={mockClip}
            {...mockHandlers}
          />
        );

        expect(screen.getByTestId('keyframe-editor')).toBeInTheDocument();
        expect(screen.getByTestId('bezier-editor')).toBeInTheDocument();
      });
    });
  });

  describe('Track Inspector', () => {
    it('renders track properties when a track is selected', () => {
      render(
        <Inspector
          selectedTrack={mockTrack}
          {...mockHandlers}
        />
      );

      expect(screen.getByText('Track Properties')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toHaveValue('Video Track 1');
      expect(screen.getByLabelText('Height')).toHaveValue(100);
    });

    it('updates track properties when values change', () => {
      render(
        <Inspector
          selectedTrack={mockTrack}
          {...mockHandlers}
        />
      );

      fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'New Track Name' } });
      expect(mockHandlers.onTrackUpdate).toHaveBeenCalledWith('1', { name: 'New Track Name' });

      fireEvent.change(screen.getByLabelText('Height'), { target: { value: '150' } });
      expect(mockHandlers.onTrackUpdate).toHaveBeenCalledWith('1', { height: 150 });
    });

    it('toggles track boolean properties', () => {
      render(
        <Inspector
          selectedTrack={mockTrack}
          {...mockHandlers}
        />
      );

      fireEvent.click(screen.getByLabelText('Locked'));
      expect(mockHandlers.onTrackUpdate).toHaveBeenCalledWith('1', { isLocked: true });

      fireEvent.click(screen.getByLabelText('Muted'));
      expect(mockHandlers.onTrackUpdate).toHaveBeenCalledWith('1', { isMuted: true });

      fireEvent.click(screen.getByLabelText('Solo'));
      expect(mockHandlers.onTrackUpdate).toHaveBeenCalledWith('1', { isSolo: true });
    });
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <Inspector
        selectedClip={mockClip}
        {...mockHandlers}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
