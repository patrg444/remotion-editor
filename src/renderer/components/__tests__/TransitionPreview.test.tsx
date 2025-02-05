import React from 'react';
import { render, screen } from '@testing-library/react';
import { TransitionPreview } from '../TransitionPreview';
import { useTransition } from '../../hooks/useTransition';
import { Transition, TransitionType } from '../../types/transition';

// Mock the useTransition hook
jest.mock('../../hooks/useTransition', () => ({
  useTransition: jest.fn(),
}));

describe('TransitionPreview', () => {
  const mockTransition: Transition = {
    id: 'transition-1',
    type: TransitionType.Fade,
    duration: 1000,
    clipAId: 'clip-1',
    clipBId: 'clip-2',
    progress: 0.5,
  };

  const mockPreviewData = {
    fromFrame: {
      data: new Uint8ClampedArray(100 * 100 * 4),
      width: 100,
      height: 100,
      colorSpace: 'srgb',
    },
    toFrame: {
      data: new Uint8ClampedArray(100 * 100 * 4),
      width: 100,
      height: 100,
      colorSpace: 'srgb',
    },
    progress: 0.5,
  };

  const mockUseTransition = {
    previewData: mockPreviewData,
    isRendering: false,
    renderProgress: 0,
    error: null,
    generatePreview: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useTransition as jest.Mock).mockReturnValue(mockUseTransition);

    // Mock canvas context
    const mockContext = {
      putImageData: jest.fn(),
      canvas: document.createElement('canvas'),
      getContextAttributes: jest.fn(),
    } as unknown as CanvasRenderingContext2D;

    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
  });

  it('renders canvas with correct dimensions', () => {
    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
      />
    );

    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveAttribute('width', '200');
    expect(canvas).toHaveAttribute('height', '150');
  });

  it('shows error message when there is an error', () => {
    const errorMessage = 'Failed to render transition';
    (useTransition as jest.Mock).mockReturnValue({
      ...mockUseTransition,
      error: new Error(errorMessage),
    });

    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('shows progress indicator when rendering', () => {
    (useTransition as jest.Mock).mockReturnValue({
      ...mockUseTransition,
      isRendering: true,
      renderProgress: 0.75,
    });

    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('calls onFrameRendered when frames are rendered', () => {
    const onFrameRendered = jest.fn();

    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
        onFrameRendered={onFrameRendered}
      />
    );

    // Should be called twice - once for fromFrame and once for toFrame
    expect(onFrameRendered).toHaveBeenCalledTimes(2);
    expect(onFrameRendered).toHaveBeenCalledWith(expect.any(ImageData));
  });

  it('calls onProgress with current progress', () => {
    const onProgress = jest.fn();

    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
        onProgress={onProgress}
      />
    );

    expect(onProgress).toHaveBeenCalledWith(0.5);
  });

  it('generates preview when progress changes', () => {
    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
      />
    );

    expect(mockUseTransition.generatePreview).toHaveBeenCalledWith(0.5);
  });

  it('applies rendering class when isRendering is true', () => {
    (useTransition as jest.Mock).mockReturnValue({
      ...mockUseTransition,
      isRendering: true,
    });

    render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
      />
    );

    const canvas = document.querySelector('canvas');
    expect(canvas).toHaveClass('rendering');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <TransitionPreview
        transition={mockTransition}
        width={200}
        height={150}
      />
    );

    expect(container.querySelector('.transition-preview')).toBeInTheDocument();
  });
});
