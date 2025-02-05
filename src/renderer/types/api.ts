export interface GPUStats {
  memoryUsed: number;
  memoryTotal: number;
  utilization: number;
  temperature: number;
}

export interface GPUAPI {
  onStatsUpdate: (callback: (stats: GPUStats) => void) => void;
  offStatsUpdate: (callback: (stats: GPUStats) => void) => void;
}
