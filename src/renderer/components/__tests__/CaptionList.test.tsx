import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaptionList } from '../CaptionList';
import { useCaptionSync } from '../../hooks/useCaptionSync';

jest.mock('../../hooks/useCaptionSync');

const mockUseCaptionSync = useCaptionSync as jest.Mock;

const mockCaption = {
  id: 'caption-1',
  text: 'Test caption',
  start: 1.0,
  end: 2.0,
  conf: 0.95,
};

const mockCaptionClip = {
  id: 'clip-1',
  type: 'caption' as const,
  name: 'Test Clip',
  startTime: 0,
  duration: 10,
  path: '/test/path',
  transform: {
    position: { x: 0, y: 0 },
    scale: { x: 1, y: 1 },
    rotation: 0,
  },
  captions: [mockCaption],
};

describe('CaptionList', () => {
  const mockHandleCaptionSelect = jest.fn();

  beforeEach(() => {
    mockUseCaptionSync.mockReturnValue({
      inspectorRef: { current: null },
      handleCaptionSelect: mockHandleCaptionSelect,
      findActiveCaptionAtTime: jest.fn(),
      selectedCaptionId: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders captions with correct formatting', () => {
    render(<CaptionList clip={mockCaptionClip} />);

    // Check time format
    expect(screen.getByText('00:01.000 - 00:02.000')).toBeInTheDocument();

    // Check confidence display
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByTitle('Confidence: 95%')).toBeInTheDocument();

    // Check caption text
    expect(screen.getByText('Test caption')).toBeInTheDocument();
  });

  it('handles caption selection', () => {
    render(<CaptionList clip={mockCaptionClip} />);

    const captionElement = screen.getByText('Test caption');
    fireEvent.click(captionElement);

    expect(mockHandleCaptionSelect).toHaveBeenCalledWith(mockCaption);
  });

  it('applies selected class to active caption', () => {
    mockUseCaptionSync.mockReturnValue({
      inspectorRef: { current: null },
      handleCaptionSelect: mockHandleCaptionSelect,
      findActiveCaptionAtTime: jest.fn(),
      selectedCaptionId: 'caption-1',
    });

    render(<CaptionList clip={mockCaptionClip} />);

    const captionItem = screen.getByText('Test caption').closest('.caption-item');
    expect(captionItem).toHaveClass('selected');
  });

  it('formats time correctly for different durations', () => {
    const longCaption = {
      ...mockCaption,
      start: 65.123, // 1:05.123
      end: 125.456, // 2:05.456
    };

    const clipWithLongCaption = {
      ...mockCaptionClip,
      captions: [longCaption],
    };

    render(<CaptionList clip={clipWithLongCaption} />);

    expect(screen.getByText('01:05.123 - 02:05.456')).toBeInTheDocument();
  });

  it('calls onCaptionSelect when provided', () => {
    const onCaptionSelect = jest.fn();
    render(<CaptionList clip={mockCaptionClip} onCaptionSelect={onCaptionSelect} />);

    const captionElement = screen.getByText('Test caption');
    fireEvent.click(captionElement);

    expect(mockHandleCaptionSelect).toHaveBeenCalledWith(mockCaption);
  });
});
