import { Logger } from '../../main/utils/logger';

const logger = new Logger('SyncManager');

export interface SyncState {
  currentTime: number;
  isPlaying: boolean;
  frameRate: number;
  droppedFrames: number;
  lastFrameTimestamp: number;
}

export class SyncManager {
  private state: SyncState;
  private subscribers: Set<(state: SyncState) => void>;
  private frameInterval: number;
  private expectedFrameTime: number;
  private lastPerformanceUpdate: number;
  private frameCounter: number;

  constructor(frameRate: number = 30) {
    this.state = {
      currentTime: 0,
      isPlaying: false,
      frameRate,
      droppedFrames: 0,
      lastFrameTimestamp: 0
    };
    this.subscribers = new Set();
    this.frameInterval = 1000 / frameRate;
    this.expectedFrameTime = 0;
    this.lastPerformanceUpdate = 0;
    this.frameCounter = 0;
  }

  // Snap a time value to the nearest frame boundary
  snapToFrame(time: number): number {
    const frameTime = 1 / this.state.frameRate;
    return Math.round(time / frameTime) * frameTime;
  }

  // Update time and check for dropped frames
  updateTime(newTime: number, timestamp: number) {
    const snappedTime = this.snapToFrame(newTime);
    
    // Calculate frame timing
    if (this.state.isPlaying) {
      const timeSinceLastFrame = timestamp - this.state.lastFrameTimestamp;
      const expectedFrames = Math.floor(timeSinceLastFrame / this.frameInterval);
      const actualFrames = Math.abs(snappedTime - this.state.currentTime) * this.state.frameRate;
      
      // Update dropped frames counter
      if (expectedFrames > actualFrames) {
        this.state.droppedFrames += expectedFrames - actualFrames;
        logger.debug('Dropped frames detected:', {
          expected: expectedFrames,
          actual: actualFrames,
          total: this.state.droppedFrames
        });
      }

      // Performance monitoring
      this.frameCounter++;
      if (timestamp - this.lastPerformanceUpdate > 1000) {
        const fps = Math.round((this.frameCounter * 1000) / (timestamp - this.lastPerformanceUpdate));
        logger.debug('Playback performance:', {
          fps,
          droppedFrames: this.state.droppedFrames
        });
        this.frameCounter = 0;
        this.lastPerformanceUpdate = timestamp;
      }
    }

    this.state = {
      ...this.state,
      currentTime: snappedTime,
      lastFrameTimestamp: timestamp
    };

    this.notifySubscribers();
  }

  setPlaying(isPlaying: boolean) {
    if (isPlaying !== this.state.isPlaying) {
      this.state = {
        ...this.state,
        isPlaying,
        droppedFrames: 0, // Reset counter when playback state changes
        lastFrameTimestamp: performance.now()
      };
      this.notifySubscribers();
    }
  }

  setFrameRate(frameRate: number) {
    this.state = {
      ...this.state,
      frameRate
    };
    this.frameInterval = 1000 / frameRate;
    this.notifySubscribers();
  }

  subscribe(callback: (state: SyncState) => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(this.state));
  }

  // Get current sync state
  getState(): SyncState {
    return { ...this.state };
  }

  // Check if we need to compensate for drift
  needsDriftCompensation(): boolean {
    const currentTime = performance.now();
    const actualInterval = currentTime - this.state.lastFrameTimestamp;
    return Math.abs(actualInterval - this.frameInterval) > 2; // 2ms threshold
  }

  // Calculate time adjustment to compensate for drift
  getDriftCompensation(): number {
    if (!this.needsDriftCompensation()) return 0;
    
    const currentTime = performance.now();
    const actualInterval = currentTime - this.state.lastFrameTimestamp;
    const drift = actualInterval - this.frameInterval;
    
    // Limit adjustment to prevent jarring changes
    return Math.min(Math.max(drift / 1000, -0.016), 0.016);
  }
}

// Create a singleton instance
export const syncManager = new SyncManager();
