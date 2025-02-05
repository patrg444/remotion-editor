import React from 'react';
import { render, screen } from '@testing-library/react';
import { FrameCounter } from '../FrameCounter';

describe('FrameCounter', () => {
  it('renders frame counts with proper padding', () => {
    render(<FrameCounter currentFrame={5} totalFrames={100} fps={30} />);
    
    expect(screen.getByLabelText('current frame')).toHaveTextContent('005');
    expect(screen.getByLabelText('total frames')).toHaveTextContent('100');
  });

  it('handles larger frame numbers with correct padding', () => {
    render(<FrameCounter currentFrame={50} totalFrames={1000} fps={30} />);
    
    expect(screen.getByLabelText('current frame')).toHaveTextContent('050');
    expect(screen.getByLabelText('total frames')).toHaveTextContent('1000');
  });

  it('converts frames to time format correctly', () => {
    // 150 frames at 30fps = 5 seconds
    render(<FrameCounter currentFrame={150} totalFrames={300} fps={30} />);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:05:00');
    expect(screen.getByLabelText('total time')).toHaveTextContent('00:10:00');
  });

  it('handles partial seconds in time conversion', () => {
    // 95 frames at 30fps = 3.167 seconds (3 seconds + 5 frames)
    render(<FrameCounter currentFrame={95} totalFrames={150} fps={30} />);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:03:05');
  });

  it('handles minutes in time conversion', () => {
    // 1800 frames at 30fps = 60 seconds = 1 minute
    render(<FrameCounter currentFrame={1800} totalFrames={3600} fps={30} />);
    
    expect(screen.getByLabelText('current time')).toHaveTextContent('01:00:00');
    expect(screen.getByLabelText('total time')).toHaveTextContent('02:00:00');
  });

  it('handles negative frame numbers by using 0', () => {
    render(<FrameCounter currentFrame={-5} totalFrames={100} fps={30} />);
    
    expect(screen.getByLabelText('current frame')).toHaveTextContent('000');
    expect(screen.getByLabelText('current time')).toHaveTextContent('00:00:00');
  });

  it('enforces minimum fps of 1', () => {
    render(<FrameCounter currentFrame={30} totalFrames={60} fps={0} />);
    
    expect(screen.getByLabelText('frame rate')).toHaveTextContent('1 fps');
  });

  it('displays fps correctly', () => {
    render(<FrameCounter currentFrame={30} totalFrames={60} fps={24} />);
    
    expect(screen.getByLabelText('frame rate')).toHaveTextContent('24 fps');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <FrameCounter currentFrame={1} totalFrames={10} fps={30} />
    );
    
    expect(container.firstChild).toHaveClass('frame-counter');
    expect(container.querySelector('.frame-count')).toBeInTheDocument();
    expect(container.querySelector('.time-display')).toBeInTheDocument();
    expect(container.querySelector('.fps-display')).toBeInTheDocument();
  });

  it('includes proper ARIA labels', () => {
    render(<FrameCounter currentFrame={1} totalFrames={10} fps={30} />);
    
    expect(screen.getByLabelText('current frame')).toBeInTheDocument();
    expect(screen.getByLabelText('total frames')).toBeInTheDocument();
    expect(screen.getByLabelText('current time')).toBeInTheDocument();
    expect(screen.getByLabelText('total time')).toBeInTheDocument();
    expect(screen.getByLabelText('frame rate')).toBeInTheDocument();
  });

  it('marks separators as aria-hidden', () => {
    const { container } = render(
      <FrameCounter currentFrame={1} totalFrames={10} fps={30} />
    );
    
    const separators = container.querySelectorAll('.separator');
    separators.forEach(separator => {
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
