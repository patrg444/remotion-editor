import React from 'react';
import { render, screen } from '@testing-library/react';
import { FrameRateIndicator } from '../FrameRateIndicator';

describe('FrameRateIndicator', () => {
  it('displays fps and frame rate values correctly', () => {
    render(<FrameRateIndicator fps={30} targetFps={60} frameRate={1} />);
    
    expect(screen.getByLabelText('current fps')).toHaveTextContent('30');
    expect(screen.getByLabelText('target fps')).toHaveTextContent('60');
    expect(screen.getByLabelText('playback speed')).toHaveTextContent('1x');
  });

  it('rounds fps to nearest integer', () => {
    render(<FrameRateIndicator fps={29.7} targetFps={60} frameRate={1} />);
    
    expect(screen.getByLabelText('current fps')).toHaveTextContent('30');
  });

  it('handles negative fps by using 0', () => {
    render(<FrameRateIndicator fps={-5} targetFps={60} frameRate={1} />);
    
    expect(screen.getByLabelText('current fps')).toHaveTextContent('0');
  });

  describe('status classes', () => {
    it('applies status-good when fps meets target', () => {
      const { container } = render(
        <FrameRateIndicator fps={60} targetFps={60} frameRate={1} />
      );
      
      expect(container.firstChild).toHaveClass('status-good');
    });

    it('applies status-good when fps exceeds target', () => {
      const { container } = render(
        <FrameRateIndicator fps={65} targetFps={60} frameRate={1} />
      );
      
      expect(container.firstChild).toHaveClass('status-good');
    });

    it('applies status-warning when fps is between 80% and 100% of target', () => {
      const { container } = render(
        <FrameRateIndicator fps={50} targetFps={60} frameRate={1} />
      );
      
      expect(container.firstChild).toHaveClass('status-warning');
    });

    it('applies status-error when fps is below 80% of target', () => {
      const { container } = render(
        <FrameRateIndicator fps={40} targetFps={60} frameRate={1} />
      );
      
      expect(container.firstChild).toHaveClass('status-error');
    });

    it('applies status-error when target fps is 0 or negative', () => {
      const { container } = render(
        <FrameRateIndicator fps={60} targetFps={0} frameRate={1} />
      );
      
      expect(container.firstChild).toHaveClass('status-error');
    });
  });

  describe('accessibility', () => {
    it('includes proper ARIA labels', () => {
      render(<FrameRateIndicator fps={30} targetFps={60} frameRate={1} />);
      
      expect(screen.getByLabelText('frame rate indicator')).toBeInTheDocument();
      expect(screen.getByLabelText('current fps')).toBeInTheDocument();
      expect(screen.getByLabelText('target fps')).toBeInTheDocument();
      expect(screen.getByLabelText('playback speed')).toBeInTheDocument();
    });

    it('marks decorative elements as aria-hidden', () => {
      const { container } = render(
        <FrameRateIndicator fps={30} targetFps={60} frameRate={1} />
      );
      
      expect(container.querySelector('.separator')).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelector('.fps-label')).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <FrameRateIndicator fps={30} targetFps={60} frameRate={1} />
    );
    
    expect(container.firstChild).toHaveClass('frame-rate-indicator');
    expect(container.querySelector('.fps-display')).toBeInTheDocument();
    expect(container.querySelector('.frame-rate')).toBeInTheDocument();
  });

  it('displays fractional frame rates correctly', () => {
    render(<FrameRateIndicator fps={30} targetFps={60} frameRate={0.5} />);
    
    expect(screen.getByLabelText('playback speed')).toHaveTextContent('0.5x');
  });
});
