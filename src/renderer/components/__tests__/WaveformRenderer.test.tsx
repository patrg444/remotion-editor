import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { WaveformRenderer } from '../WaveformRenderer';
import { TimelineProvider } from '../../contexts/TimelineContext';
import { usePerformanceMonitor } from '../../hooks/usePerformanceMonitor';

// Mock usePerformanceMonitor hook
jest.mock('../../hooks/usePerformanceMonitor', () => ({
  usePerformanceMonitor: jest.fn(() => ({
    beginRender: jest.fn(() => jest.fn()) // Returns endRender function
  }))
}));

// Mock canvas context
interface MockContext {
  clearRect: jest.Mock;
  beginPath: jest.Mock;
  moveTo: jest.Mock;
  lineTo: jest.Mock;
  stroke: jest.Mock;
  fillRect: jest.Mock;
  arc: jest.Mock;
  fill: jest.Mock;
  lineWidth: number;
  _fillStyle: string;
  _strokeStyle: string;
  fillStyle: string;
  strokeStyle: string;
}

const createMockContext = () => {
  const ctx = {
    clearRect: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    fillRect: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    lineWidth: 1,
    _fillStyle: '',
    _strokeStyle: '',
    get fillStyle() {
      return this._fillStyle;
    },
    set fillStyle(value: string) {
      this._fillStyle = value;
    },
    get strokeStyle() {
      return this._strokeStyle;
    },
    set strokeStyle(value: string) {
      this._strokeStyle = value;
    }
  };

  return ctx as MockContext;
};

let mockContext: MockContext;

// Create sample audio data
const createAudioData = (length: number) => {
  const data = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    data[i] = Math.sin(i * 0.1) * 0.5; // Simple sine wave
  }
  return data;
};

describe('WaveformRenderer', () => {
  beforeEach(() => {
    // Enable fake timers
    jest.useFakeTimers();
    
    // Reset mock context
    mockContext = createMockContext();
    
    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = jest.fn().mockReturnValue(mockContext);
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderWaveform = (props = {}) => {
    const defaultProps = {
      audioData: createAudioData(44100), // 1 second at 44.1kHz
      width: 1000,
      height: 200,
      zoom: 1,
      color: '#4CAF50',
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      volume: 1,
      fadeIn: 0,
      fadeOut: 0,
      selected: false,
      onVolumeChange: jest.fn(),
      onFadeChange: jest.fn(),
      ...props
    };

    const result = render(
      <TimelineProvider>
        <WaveformRenderer {...defaultProps} />
      </TimelineProvider>
    );

    // Run all pending timers to trigger initial render
    act(() => {
      jest.runAllTimers();
    });

    return result;
  };

  describe('Canvas Setup', () => {
    it('creates canvas with correct dimensions', () => {
      const { container } = renderWaveform();
      const canvas = container.querySelector('canvas');
      
      expect(canvas).toHaveAttribute('width', '1000');
      expect(canvas).toHaveAttribute('height', '200');
    });

    it('sets correct canvas styles', () => {
      renderWaveform();
      
      expect(mockContext.fillStyle).toBe('rgba(0, 0, 0, 0.1)');
      expect(mockContext.strokeStyle).toBe('#4CAF50');
    });
  });

  describe('Waveform Rendering', () => {
    it('renders waveform path', () => {
      renderWaveform();
      
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.moveTo).toHaveBeenCalled();
      expect(mockContext.lineTo).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('scales waveform based on zoom', () => {
      // First render with zoom=1
      renderWaveform({ zoom: 1 });
      const lowZoomPoints = mockContext.lineTo.mock.calls.length;
      
      // Reset mocks and render with zoom=2
      jest.clearAllMocks();
      renderWaveform({ zoom: 2 });
      const highZoomPoints = mockContext.lineTo.mock.calls.length;
      
      // Should have more points at higher zoom
      expect(highZoomPoints).toBeGreaterThan(lowZoomPoints);
    });

    it('applies volume scaling', () => {
      renderWaveform({ volume: 0.5 });
      
      // Check that y-coordinates are scaled by volume
      const lineToPoints = mockContext.lineTo.mock.calls.map(call => call[1]);
      const maxAmplitude = Math.max(...lineToPoints.map(Math.abs));
      expect(maxAmplitude).toBeLessThanOrEqual(100); // Half of canvas height
    });
  });

  describe('Volume Control', () => {
    it('shows volume control when selected', () => {
      const { container } = renderWaveform({ selected: true });
      expect(container.querySelector('.volume-slider')).toBeInTheDocument();
    });

    it('updates volume on drag', () => {
      const onVolumeChange = jest.fn();
      const { container } = renderWaveform({
        selected: true,
        onVolumeChange
      });
      
      const slider = container.querySelector('.volume-slider')!;
      const rect = { top: 0, height: 200 };
      jest.spyOn(slider, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
      
      fireEvent.mouseDown(slider, {
        clientY: 100 // Middle of slider = 0.5 volume
      });

      expect(onVolumeChange).toHaveBeenCalledWith(0.5);
    });

    it('clamps volume to valid range', () => {
      const onVolumeChange = jest.fn();
      const { container } = renderWaveform({
        selected: true,
        onVolumeChange
      });
      
      const slider = container.querySelector('.volume-slider')!;
      const rect = { top: 0, height: 200 };
      jest.spyOn(slider, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
      
      // Try to set volume > 1
      fireEvent.mouseDown(slider, { clientY: -50 });
      expect(onVolumeChange).toHaveBeenCalledWith(1);

      // Try to set volume < 0
      fireEvent.mouseDown(slider, { clientY: 250 });
      expect(onVolumeChange).toHaveBeenCalledWith(0);
    });
  });

  describe('Fade Controls', () => {
    it('shows fade handles when selected', () => {
      const { container } = renderWaveform({ selected: true });
      expect(container.querySelector('.fade-handle.fade-in')).toBeInTheDocument();
      expect(container.querySelector('.fade-handle.fade-out')).toBeInTheDocument();
    });

    it('positions fade handles correctly', () => {
      const { container } = renderWaveform({
        selected: true,
        fadeIn: 0.2,
        fadeOut: 0.3
      });
      
      const fadeInHandle = container.querySelector('.fade-handle.fade-in');
      const fadeOutHandle = container.querySelector('.fade-handle.fade-out');
      
      expect(fadeInHandle).toHaveStyle({ left: '200px' }); // 20% of width
      expect(fadeOutHandle).toHaveStyle({ right: '300px' }); // 30% of width
    });

    it('updates fades on handle drag', () => {
      const onFadeChange = jest.fn();
      const { container } = renderWaveform({
        selected: true,
        onFadeChange
      });
      
      const canvas = container.querySelector('canvas')!;
      const rect = { left: 0, width: 1000 };
      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
      
      // Drag fade-in handle
      const fadeInHandle = container.querySelector('.fade-handle.fade-in')!;
      fireEvent.mouseDown(fadeInHandle, { clientX: 200 });
      expect(onFadeChange).toHaveBeenCalledWith('in', 0.2);

      // Drag fade-out handle
      const fadeOutHandle = container.querySelector('.fade-handle.fade-out')!;
      fireEvent.mouseDown(fadeOutHandle, { clientX: 800 });
      expect(onFadeChange).toHaveBeenCalledWith('out', 0.2);
    });
  });

  describe('Performance', () => {
    it('uses performance monitor', () => {
      renderWaveform();
      expect(usePerformanceMonitor).toHaveBeenCalled();
    });

    it('debounces rendering on rapid updates', () => {
      const { rerender } = renderWaveform();
      
      // Clear mocks before test
      jest.clearAllMocks();
      
      // Update props multiple times
      for (let i = 1; i <= 5; i++) {
        act(() => {
          rerender(
            <TimelineProvider>
              <WaveformRenderer
                audioData={createAudioData(44100)}
                width={1000}
                height={200}
                zoom={i}
                volume={1}
                fadeIn={0}
                fadeOut={0}
                selected={false}
                onVolumeChange={jest.fn()}
                onFadeChange={jest.fn()}
              />
            </TimelineProvider>
          );
        });
      }

      // Run all pending timers
      act(() => {
        jest.runAllTimers();
      });

      // Should only render once
      expect(mockContext.clearRect).toHaveBeenCalledTimes(1);
    });
  });
});
