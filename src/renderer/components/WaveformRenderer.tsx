import React, { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import '../styles/waveform-renderer.css';

interface WaveformRendererProps {
  audioData: Float32Array;
  width: number;
  height: number;
  zoom: number;
  color?: string;
  backgroundColor?: string;
  volume?: number;
  fadeIn?: number;
  fadeOut?: number;
  selected?: boolean;
  onVolumeChange?: (volume: number) => void;
  onFadeChange?: (type: 'in' | 'out', duration: number) => void;
}

export const WaveformRenderer: React.FC<WaveformRendererProps> = ({
  audioData,
  width,
  height,
  zoom,
  color = '#4CAF50',
  backgroundColor = 'rgba(0, 0, 0, 0.1)',
  volume = 1,
  fadeIn = 0,
  fadeOut = 0,
  selected = false,
  onVolumeChange,
  onFadeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const renderTimeoutRef = useRef<number>();
  const { beginRender } = usePerformanceMonitor();
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'volume' | 'fadeIn' | 'fadeOut' | null>(null);

  // Memoize sample calculations for performance
  const samples = useMemo(() => {
    // Calculate total points based on zoom level
    const pointsPerPixel = Math.max(1, Math.ceil(zoom));
    const totalPoints = Math.min(audioData.length, width * pointsPerPixel);
    
    // Calculate samples per point
    const samplesPerPoint = Math.max(1, Math.floor(audioData.length / totalPoints));
    
    const points: { min: number; max: number }[] = [];

    for (let i = 0; i < totalPoints; i++) {
      const start = i * samplesPerPoint;
      const end = Math.min(start + samplesPerPoint, audioData.length);
      let min = 1;
      let max = -1;

      for (let j = Math.floor(start); j < end; j++) {
        const value = audioData[j];
        min = Math.min(min, value);
        max = Math.max(max, value);
      }

      points.push({ min, max });
    }

    return points;
  }, [audioData, width, zoom]);

  // Render waveform
  const renderWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const endRender = beginRender();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Set up scaling
    const centerY = height / 2;
    const scaleY = Math.floor(height / 4096);

    // Draw waveform
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;

    // Draw each point
    const pointsPerPixel = Math.max(1, Math.ceil(zoom));
    samples.forEach(({ min, max }, i) => {
      // Calculate x position
      const x = Math.floor(i / pointsPerPixel);
      
      // Only draw if within canvas bounds
      if (x >= 0 && x < width) {
        // Apply volume and fades
        const fadeInMultiplier = i < fadeIn * width ? i / (fadeIn * width) : 1;
        const fadeOutMultiplier = i > (1 - fadeOut) * width ? (width - i) / (fadeOut * width) : 1;
        const volumeMultiplier = volume * fadeInMultiplier * fadeOutMultiplier;

        const scaledMin = Math.floor(centerY + min * scaleY * volumeMultiplier);
        const scaledMax = Math.floor(centerY + max * scaleY * volumeMultiplier);

        if (i === 0) {
          ctx.moveTo(x, scaledMin);
        } else {
          ctx.lineTo(x, scaledMin);
        }
        ctx.lineTo(x, scaledMax);
      }
    });

    ctx.stroke();

    // Draw fade handles if selected
    if (selected) {
      // Fade in handle
      const fadeInX = fadeIn * width;
      ctx.beginPath();
      ctx.arc(fadeInX, height / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Fade out handle
      const fadeOutX = (1 - fadeOut) * width;
      ctx.beginPath();
      ctx.arc(fadeOutX, height / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }

    endRender();
  }, [samples, width, height, zoom, color, backgroundColor, volume, fadeIn, fadeOut, selected, beginRender]);

  // Schedule render with debouncing
  useEffect(() => {
    if (renderTimeoutRef.current) {
      window.clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = window.setTimeout(renderWaveform, 16);

    return () => {
      if (renderTimeoutRef.current) {
        window.clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [renderWaveform]);

  // Handle volume control with drag support
  const handleVolumeChange = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!volumeRef.current || !onVolumeChange) return;

    const rect = volumeRef.current.getBoundingClientRect();
    const newVolume = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    onVolumeChange(newVolume);
  }, [onVolumeChange]);

  // Handle fade adjustments with drag support
  const handleFadeChange = useCallback((type: 'in' | 'out', e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current || !onFadeChange) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const duration = type === 'in' ? x / width : (width - x) / width;
    onFadeChange(type, Math.max(0, Math.min(1, duration)));
  }, [width, onFadeChange]);

  // Handle drag events
  useEffect(() => {
    if (!isDragging || !dragType) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (dragType === 'volume') {
        handleVolumeChange(e);
      } else if (dragType === 'fadeIn') {
        handleFadeChange('in', e);
      } else if (dragType === 'fadeOut') {
        handleFadeChange('out', e);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragType(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragType, handleVolumeChange, handleFadeChange]);

  return (
    <div className="waveform-renderer" role="region" aria-label="Audio Waveform">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`waveform-canvas ${selected ? 'selected' : ''}`}
        role="img"
        aria-label="Audio waveform visualization"
      />
      {selected && (
        <div
          ref={volumeRef}
          className="volume-slider"
          role="slider"
          aria-label="Volume control"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={volume * 100}
          aria-valuetext={`Volume ${Math.round(volume * 100)}%`}
          tabIndex={0}
          onMouseDown={(e) => {
            setIsDragging(true);
            setDragType('volume');
            handleVolumeChange(e);
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowUp') {
              onVolumeChange?.(Math.min(1, volume + 0.1));
            } else if (e.key === 'ArrowDown') {
              onVolumeChange?.(Math.max(0, volume - 0.1));
            }
          }}
          style={{ height: height }}
        >
          <div
            className="volume-level"
            style={{ height: `${volume * 100}%` }}
          />
        </div>
      )}
      {selected && (
        <>
          <div
            className="fade-handle fade-in"
            role="slider"
            aria-label="Fade in duration"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={fadeIn * 100}
            aria-valuetext={`Fade in ${Math.round(fadeIn * 100)}%`}
            tabIndex={0}
            style={{ left: fadeIn * width }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragType('fadeIn');
              handleFadeChange('in', e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                onFadeChange?.('in', Math.min(1, fadeIn + 0.1));
              } else if (e.key === 'ArrowLeft') {
                onFadeChange?.('in', Math.max(0, fadeIn - 0.1));
              }
            }}
          />
          <div
            className="fade-handle fade-out"
            role="slider"
            aria-label="Fade out duration"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={fadeOut * 100}
            aria-valuetext={`Fade out ${Math.round(fadeOut * 100)}%`}
            tabIndex={0}
            style={{ right: fadeOut * width }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragType('fadeOut');
              handleFadeChange('out', e);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') {
                onFadeChange?.('out', Math.min(1, fadeOut + 0.1));
              } else if (e.key === 'ArrowLeft') {
                onFadeChange?.('out', Math.max(0, fadeOut - 0.1));
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default WaveformRenderer;
