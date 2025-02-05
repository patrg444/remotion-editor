import React from 'react';
import { useGPU } from '../hooks/useGPU';

interface GPUMonitorProps {
  className?: string;
}

export function GPUMonitor({ className }: GPUMonitorProps) {
  const stats = useGPU((newStats) => {
    // The callback is still needed for the real implementation
    // but we can use the hook's return value directly in tests
  });

  const memoryText = `GPU Memory: ${Math.round(stats.memoryUsed / 1024 / 1024)}MB / ${Math.round(stats.memoryTotal / 1024 / 1024)}MB`;
  const utilizationText = `GPU Utilization: ${Math.round(stats.utilization)}%`;
  const temperatureText = `GPU Temperature: ${Math.round(stats.temperature)}°C`;

  return (
    <div className={className}>
      <div>{memoryText}</div>
      <div>{utilizationText}</div>
      <div>{temperatureText}</div>
    </div>
  );
}
