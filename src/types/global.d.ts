declare global {
  interface Window {
    timelineState: {
      mediaBin: {
        items: any[];
        selectedIds: string[];
      };
      tracks: Array<{
        id: string;
        name: string;
        type: string;
        clips: any[];
        transitions: any[];
        allowTransitions: boolean;
        transitionsEnabled: boolean;
        showTransitions: boolean;
      }>;
      currentTime: number;
      duration: number;
      zoom: number;
      fps: number;
      isPlaying: boolean;
      isDragging: boolean;
    };
    timelineDispatch: (action: { type: string; payload: any }) => void;
    timelineReady: boolean;
    logger: {
      debug: (...args: any[]) => void;
      error: (...args: any[]) => void;
    };
  }
}

export {};
