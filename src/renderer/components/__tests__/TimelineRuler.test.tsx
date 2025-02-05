import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TimelineRuler } from '../TimelineRuler';

describe('TimelineRuler', () => {
  const defaultProps = {
    duration: 30,
    fps: 30,
    zoom: 1,
  };

  const renderRuler = (props = {}) => {
    return render(
      <TimelineRuler {...defaultProps} {...props} />
    );
  };

  describe('SVG Setup', () => {
    it('creates SVG with correct dimensions', () => {
      renderRuler();
      const svg = screen.getByTestId('timeline-ruler-svg');
      
      expect(svg).toHaveAttribute('width', '100%');
      expect(svg).toHaveAttribute('height', '24');
      expect(svg).toHaveClass('timeline-ruler-svg');
    });

    it('adjusts marker positions based on zoom', () => {
      const { container } = renderRuler({ zoom: 2, duration: 5 });
      const lines = container.querySelectorAll('line');
      const firstLine = lines[0];
      const secondLine = lines[1];

      // At zoom 2, markers should be twice as far apart
      const x1First = parseFloat(firstLine.getAttribute('x1') || '0');
      const x1Second = parseFloat(secondLine.getAttribute('x1') || '0');
      expect(x1Second - x1First).toBeCloseTo(100); // 0.5s * 2 zoom * 100 pixels/s
    });
  });

  describe('Time Markers', () => {
    it('draws major time markers', () => {
      const { container } = renderRuler({ duration: 10 });
      const texts = container.querySelectorAll('text');
      const labels = Array.from(texts).map(text => text.textContent);

      expect(labels).toContain('0');
      expect(labels).toContain('10');
    });

    it('adjusts marker spacing based on zoom', () => {
      const { container } = renderRuler({ zoom: 0.5, duration: 10 });
      const lines = container.querySelectorAll('line');
      
      // At zoom 0.5, markers should be half as far apart
      const firstLine = lines[0];
      const secondLine = lines[1];
      const x1First = parseFloat(firstLine.getAttribute('x1') || '0');
      const x1Second = parseFloat(secondLine.getAttribute('x1') || '0');
      expect(x1Second - x1First).toBeCloseTo(250); // 5s * 0.5 zoom * 100 pixels/s
    });

    it('formats time markers correctly', () => {
      const { container } = renderRuler({ duration: 120 }); // 2 minutes
      const texts = container.querySelectorAll('text');
      const labels = Array.from(texts).map(text => text.textContent);

      expect(labels).toContain('0');
      expect(labels).toContain('1:00');
      expect(labels).toContain('2:00');
    });
  });

  describe('Frame Markers', () => {
    it('shows frame markers at higher zoom levels', () => {
      const { container } = renderRuler({ zoom: 20, duration: 2, fps: 30 });
      const texts = container.querySelectorAll('text');
      const labels = Array.from(texts).map(text => text.textContent);

      // Should show frame numbers
      expect(labels).toContain('0'); // First frame
      expect(labels).toContain('8'); // Early frame
      expect(labels).toContain('16'); // Middle frame
      expect(labels).toContain('32'); // Frame in second second
    });

    it('adjusts marker density based on zoom', () => {
      const { container: container1 } = renderRuler({ zoom: 5, duration: 2 });
      const { container: container2 } = renderRuler({ zoom: 20, duration: 2 });

      const lines1 = container1.querySelectorAll('line');
      const lines2 = container2.querySelectorAll('line');

      // Should have more markers at higher zoom
      expect(lines2.length).toBeGreaterThan(lines1.length);
    });

    it('spaces frame markers according to fps', () => {
      const { container } = renderRuler({ zoom: 20, fps: 24, duration: 2 });
      const lines = container.querySelectorAll('line');
      
      // Check spacing between frame markers
      const firstLine = lines[0];
      const secondLine = lines[1];
      const x1First = parseFloat(firstLine.getAttribute('x1') || '0');
      const x1Second = parseFloat(secondLine.getAttribute('x1') || '0');
      const spacing = x1Second - x1First;

      // At 24fps, markers should be 1/24th of a second apart
      expect(spacing).toBeCloseTo((20 * 100) / 24, 0); // zoom * 100px/s / fps
    });
  });

  describe('Visual Style', () => {
    it('uses different heights for major and minor markers', () => {
      const { container } = renderRuler({ duration: 5 });
      const lines = container.querySelectorAll('line');
      
      const majorMarker = Array.from(lines).find(line => {
        const y1 = parseFloat(line.getAttribute('y1') || '0');
        return y1 === 24 - 12; // 24 - MAJOR_DIVISION_HEIGHT
      });
      const minorMarker = Array.from(lines).find(line => {
        const y1 = parseFloat(line.getAttribute('y1') || '0');
        return y1 === 24 - 8; // 24 - MINOR_DIVISION_HEIGHT
      });

      expect(majorMarker).toBeTruthy();
      expect(minorMarker).toBeTruthy();
    });

    it('uses consistent stroke width for markers', () => {
      const { container } = renderRuler({ duration: 5 });
      const lines = container.querySelectorAll('line');
      
      lines.forEach(line => {
        expect(line).toHaveAttribute('stroke-width', '1');
      });
    });
  });

  describe('Accessibility', () => {
    it('provides presentation role', () => {
      renderRuler();
      const svg = screen.getByTestId('timeline-ruler-svg');
      expect(svg).toHaveAttribute('role', 'presentation');
    });

    it('makes text content readable', () => {
      const { container } = renderRuler({ duration: 5 });
      const texts = container.querySelectorAll('text');
      
      texts.forEach(text => {
        expect(text).toHaveAttribute('fill');
        expect(text).toHaveAttribute('dominant-baseline', 'middle');
      });
    });
  });
});
