import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { VolumeEnvelope } from '../../VolumeEnvelope';
import { ViewportDimensions, TimelineCoordinates } from '../../../keyframes';
import { act } from 'react-dom/test-utils';
import { KeyframesProvider } from '../../../contexts/KeyframesContext';
import { InterpolationType, createKeyframeTrack } from '../../../keyframes/types';

// Mock requestAnimationFrame for auto-scroll tests
const mockRaf = jest.fn();
global.requestAnimationFrame = mockRaf;
global.cancelAnimationFrame = jest.fn();

// Test wrapper component with required context providers
const TestWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const track = {
    ...createKeyframeTrack(1, 0, 2, 0.01),
    keyframes: [
      { time: 1, value: 0.5, interpolation: { type: InterpolationType.Linear } },
      { time: 2, value: 0.75, interpolation: { type: InterpolationType.Linear } },
      { time: 3, value: 0.25, interpolation: { type: InterpolationType.Linear } }
    ],
    getValue: (time: number) => 1
  };

  return (
    <KeyframesProvider initialState={{
      tracks: {
        'test-clip-volume': track
      },
      groups: {},
      snapping: false
    }}>
      {children}
    </KeyframesProvider>
  );
};

describe('Keyframe Dragging', () => {
  const defaultProps = {
    clipId: 'test-clip',
    duration: 10,
    zoom: 1,
    isSelected: true,
    onKeyframesChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window as any).testAddOperation = jest.fn();
  });

  it('should update keyframe position when dragging', () => {
    render(
      <TestWrapper>
        <VolumeEnvelope {...defaultProps} />
      </TestWrapper>
    );

    // Find keyframe at time=1
    const keyframe = screen.getByTestId('keyframe-1');

    // Start drag
    fireEvent.pointerDown(keyframe, {
      clientX: 100, // 1 second = 100px
      clientY: 100  // Middle of viewport
    });

    // Drag to new position
    fireEvent.pointerMove(keyframe, {
      clientX: 150, // 1.5 seconds
      clientY: 75   // Higher volume
    });

    // End drag
    fireEvent.pointerUp(keyframe);

    // Verify keyframe update through context
    const keyframes = screen.getByTestId('volume-envelope').getAttribute('data-keyframes');
    const parsedKeyframes = JSON.parse(keyframes || '[]');
    const updatedKeyframe = parsedKeyframes.find((k: any) => k.time === 1.5);
    expect(updatedKeyframe).toBeTruthy();
  });

  it('should snap to grid when snapping is enabled', () => {
    render(
      <TestWrapper>
        <VolumeEnvelope
          {...defaultProps}
          emptyKeyframeState={{ tracks: {}, groups: {}, snapping: true }}
        />
      </TestWrapper>
    );

    const keyframe = screen.getByTestId('keyframe-1');

    // Start drag
    fireEvent.pointerDown(keyframe, {
      clientX: 100,
      clientY: 100
    });

    // Drag to position between grid lines
    fireEvent.pointerMove(keyframe, {
      clientX: 185, // Should snap to 1.9 seconds
      clientY: 100
    });

    // End drag
    fireEvent.pointerUp(keyframe);

    // Verify snapped position through context
    const keyframes = screen.getByTestId('volume-envelope').getAttribute('data-keyframes');
    const parsedKeyframes = JSON.parse(keyframes || '[]');
    const snappedKeyframe = parsedKeyframes.find((k: any) => k.time === 1.9);
    expect(snappedKeyframe).toBeTruthy();
  });

  it('should handle dB value snapping', () => {
    render(
      <TestWrapper>
        <VolumeEnvelope
          {...defaultProps}
          emptyKeyframeState={{ tracks: {}, groups: {}, snapping: true }}
        />
      </TestWrapper>
    );

    const keyframe = screen.getByTestId('keyframe-1');

    // Start drag with shift key
    fireEvent.pointerDown(keyframe, {
      clientX: 100,
      clientY: 100,
      shiftKey: true
    });

    // Drag to position that would be near -12dB
    fireEvent.pointerMove(keyframe, {
      clientX: 100,
      clientY: 150, // Position that maps to near -12dB
      shiftKey: true
    });

    // End drag
    fireEvent.pointerUp(keyframe);

    // Verify snapped to exact -12dB value through context
    const keyframes = screen.getByTestId('volume-envelope').getAttribute('data-keyframes');
    const parsedKeyframes = JSON.parse(keyframes || '[]');
    const snappedKeyframe = parsedKeyframes.find((k: any) => k.time === 1);
    expect(snappedKeyframe.value).toBeCloseTo(0.2512, 4); // -12dB
  });

  it('should add new keyframe on ctrl+click', () => {
    render(
      <TestWrapper>
        <VolumeEnvelope {...defaultProps} />
      </TestWrapper>
    );

    const svg = screen.getByRole('presentation');

    // Ctrl+click to add new keyframe
    fireEvent.pointerDown(svg, {
      clientX: 150, // 1.5 seconds
      clientY: 75,  // Some volume level
      ctrlKey: true
    });

    // Verify keyframe addition through context
    const keyframes = screen.getByTestId('volume-envelope').getAttribute('data-keyframes');
    const parsedKeyframes = JSON.parse(keyframes || '[]');
    const newKeyframe = parsedKeyframes.find((k: any) => k.time === 1.5);
    expect(newKeyframe).toBeTruthy();
  });

  it('should remove keyframe on right-click', () => {
    render(
      <TestWrapper>
        <VolumeEnvelope {...defaultProps} />
      </TestWrapper>
    );

    const keyframe = screen.getByTestId('keyframe-1');

    // Right-click on keyframe
    fireEvent.pointerDown(keyframe, {
      clientX: 100,
      clientY: 100,
      button: 2 // Right click
    });

    // Verify keyframe removal through context
    const keyframes = screen.getByTestId('volume-envelope').getAttribute('data-keyframes');
    const parsedKeyframes = JSON.parse(keyframes || '[]');
    const removedKeyframe = parsedKeyframes.find((k: any) => k.time === 1);
    expect(removedKeyframe).toBeFalsy();
  });

  it('should handle selection box creation', () => {
    const onKeyframesChange = jest.fn();

    render(
      <TestWrapper>
        <VolumeEnvelope
          {...defaultProps}
          onKeyframesChange={onKeyframesChange}
        />
      </TestWrapper>
    );

    const svg = screen.getByRole('presentation');

    // Start selection box
    fireEvent.pointerDown(svg, {
      clientX: 50,
      clientY: 50
    });

    // Drag to create selection box
    fireEvent.pointerMove(svg, {
      clientX: 250,
      clientY: 150
    });

    // Verify selection box is visible
    const selectionBox = screen.getByTestId('selection-box');
    expect(selectionBox).toBeInTheDocument();

    // End selection
    fireEvent.pointerUp(svg);

    // Verify selected keyframes are highlighted
    const selectedKeyframes = screen.getAllByTestId((id) => id.includes('selected-keyframe'));
    expect(selectedKeyframes.length).toBeGreaterThan(0);
  });
});
