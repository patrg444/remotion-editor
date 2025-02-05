import { useRef, useCallback, useEffect, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: {
    total: number;
    free: number;
    used: number;
    processUsed: number;
  };
  gpu: {
    memoryTotal: number;
    memoryUsed: number;
    utilization: number;
    temperature: number;
  };
  textureCount: number;
  activeClips: number;
  renderTime: number;
}

interface PerformanceHistory {
  timestamp: number;
  metrics: PerformanceMetrics;
}

const HISTORY_LENGTH = 60; // Keep 1 minute of history at 1 sample per second

export function usePerformanceMonitor(enabled: boolean = true) {
  const metricsRef = useRef<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    memoryUsage: {
      total: 0,
      free: 0,
      used: 0,
      processUsed: 0
    },
    gpu: {
      memoryTotal: 0,
      memoryUsed: 0,
      utilization: 0,
      temperature: 0
    },
    textureCount: 0,
    activeClips: 0,
    renderTime: 0,
  });

  const historyRef = useRef<PerformanceHistory[]>([]);
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());
  const [metrics, setMetrics] = useState<PerformanceMetrics>(metricsRef.current);

  // Track frame timing and system metrics
  const measureFrame = useCallback(() => {
    if (!enabled) return;

    const now = performance.now();
    const frameTime = now - lastFrameTimeRef.current;
    frameCountRef.current++;

    // Update metrics every second
    if (now - lastFrameTimeRef.current >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / (now - lastFrameTimeRef.current));
      
      // Get system metrics through Electron
      Promise.all([
        window.electron.invoke('performance:memory'),
        window.electron.invoke('performance:gpu')
      ]).then(([memory, gpu]) => {
        metricsRef.current = {
          ...metricsRef.current,
          fps,
          frameTime: frameTime,
          memoryUsage: memory,
          gpu
        };

        // Update state for UI
        setMetrics(metricsRef.current);

        // Add to history
        historyRef.current.push({
          timestamp: now,
          metrics: { ...metricsRef.current },
        });

        // Trim history
        if (historyRef.current.length > HISTORY_LENGTH) {
          historyRef.current = historyRef.current.slice(-HISTORY_LENGTH);
        }
      }).catch(error => {
        console.error('Failed to get performance metrics:', error);
      });

      // Reset frame counter
      frameCountRef.current = 0;
      lastFrameTimeRef.current = now;
    }

    requestAnimationFrame(measureFrame);
  }, [enabled]);

  // Start/stop monitoring
  useEffect(() => {
    if (enabled) {
      requestAnimationFrame(measureFrame);
    }
  }, [enabled, measureFrame]);

  // Update texture and clip metrics
  const updateMetrics = useCallback((updates: Partial<PerformanceMetrics>) => {
    if (!enabled) return;

    metricsRef.current = {
      ...metricsRef.current,
      ...updates,
    };
  }, [enabled]);

  // Start render timing
  const beginRender = useCallback(() => {
    if (!enabled) return () => {};

    const startTime = performance.now();
    return () => {
      const renderTime = performance.now() - startTime;
      updateMetrics({ renderTime });
    };
  }, [enabled, updateMetrics]);

  // Get performance warnings
  const getWarnings = useCallback(() => {
    const warnings: string[] = [];
    const { fps, frameTime, memoryUsage, gpu, textureCount, renderTime } = metricsRef.current;

    if (fps < 30) {
      warnings.push('Low framerate detected');
    }
    if (frameTime > 33) {
      warnings.push('High frame time');
    }
    if (memoryUsage.processUsed > 1024 * 1024 * 1024) { // 1GB
      warnings.push('High process memory usage');
    }
    if (memoryUsage.used / memoryUsage.total > 0.9) { // 90%
      warnings.push('High system memory usage');
    }
    if (gpu.memoryUsed / gpu.memoryTotal > 0.9) { // 90%
      warnings.push('High GPU memory usage');
    }
    if (gpu.temperature > 80) { // 80°C
      warnings.push('High GPU temperature');
    }
    if (gpu.utilization > 90) { // 90%
      warnings.push('High GPU utilization');
    }
    if (textureCount > 100) {
      warnings.push('Large texture cache');
    }
    if (renderTime > 16) {
      warnings.push('Slow render time');
    }

    return warnings;
  }, []);

  // Get performance history
  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  // Reset metrics
  const reset = useCallback(() => {
    metricsRef.current = {
      fps: 0,
      frameTime: 0,
      memoryUsage: {
        total: 0,
        free: 0,
        used: 0,
        processUsed: 0
      },
      gpu: {
        memoryTotal: 0,
        memoryUsed: 0,
        utilization: 0,
        temperature: 0
      },
      textureCount: 0,
      activeClips: 0,
      renderTime: 0,
    };
    historyRef.current = [];
    frameCountRef.current = 0;
    lastFrameTimeRef.current = performance.now();
    setMetrics(metricsRef.current);
  }, []);

  return {
    metrics,
    updateMetrics,
    beginRender,
    getWarnings,
    getHistory,
    reset,
  };
}
