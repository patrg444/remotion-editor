import React, { useEffect, useRef } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import '../styles/performance-monitor.css';

interface PerformanceMonitorProps {
  enabled?: boolean;
  showGraph?: boolean;
  onWarning?: (warnings: string[]) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  showGraph = true,
  onWarning,
}) => {
  const {
    metrics,
    getWarnings,
    getHistory,
  } = usePerformanceMonitor(enabled);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw performance graph
  useEffect(() => {
    if (!showGraph || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const history = getHistory();
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Draw FPS graph
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 2;

    history.forEach((entry, i) => {
      const x = (i / history.length) * width;
      const y = height - (entry.metrics.fps / 60) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw frame time graph
    ctx.beginPath();
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 1;

    history.forEach((entry, i) => {
      const x = (i / history.length) * width;
      const y = height - (Math.min(entry.metrics.frameTime, 33) / 33) * height;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();
  }, [showGraph, getHistory, metrics]);

  // Check for warnings
  useEffect(() => {
    if (!enabled || !onWarning) return;

    const warnings = getWarnings();
    if (warnings.length > 0) {
      onWarning(warnings);
    }
  }, [enabled, getWarnings, onWarning, metrics]);

  if (!enabled) return null;

  const getMemoryClass = (memory: { used: number; total: number }): string => {
    const usedGB = memory.used / 1024;
    const totalGB = memory.total / 1024;
    const usagePercent = (memory.used / memory.total) * 100;

    if (usedGB > 1.5 || usagePercent > 90) return 'warning';
    if (usedGB > 1.0 || usagePercent > 75) return 'caution';
    return '';
  };

  const formatMemory = (memory: { used: number; total: number }): string => {
    const used = Math.round(memory.used);
    const total = Math.round(memory.total);
    return `${used}/${total}MB`;
  };

  return (
    <div className="performance-monitor">
      <div className="metrics-panel">
        <div className="metric">
          <span className="metric-label">FPS</span>
          <span className={`metric-value ${metrics.fps < 30 ? 'warning' : ''}`}>
            {Math.round(metrics.fps)}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Frame Time</span>
          <span className={`metric-value ${metrics.frameTime > 33 ? 'warning' : ''}`}>
            {metrics.frameTime.toFixed(1)}ms
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Memory</span>
          <span className={`metric-value ${getMemoryClass(metrics.memoryUsage)}`}>
            {formatMemory(metrics.memoryUsage)}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Textures</span>
          <span className={`metric-value ${metrics.textureCount > 100 ? 'warning' : ''}`}>
            {metrics.textureCount}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Active Clips</span>
          <span className="metric-value">
            {metrics.activeClips}
          </span>
        </div>
        <div className="metric">
          <span className="metric-label">Render Time</span>
          <span className={`metric-value ${metrics.renderTime > 16 ? 'warning' : ''}`}>
            {metrics.renderTime.toFixed(1)}ms
          </span>
        </div>
      </div>
      {showGraph && (
        <canvas
          ref={canvasRef}
          className="performance-graph"
          width={300}
          height={100}
          role="img"
          aria-label="Performance graph showing FPS and frame time"
        />
      )}
    </div>
  );
};

export default PerformanceMonitor;
