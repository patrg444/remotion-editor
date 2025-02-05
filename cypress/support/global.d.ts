// Global type declarations
interface Window {
  validateFile: () => Promise<void>;
  processFile: (file: File) => Promise<{
    id: string;
    name: string;
    type: string;
    path: string;
    duration: number;
    metadata: {
      duration: number;
    };
    originalDuration: number;
    initialDuration: number;
    maxDuration: number;
  }>;
  timelineState: any;
  timelineDispatch: any;
  timelineReady: boolean;
}

interface File {
  path?: string;
}

interface Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}
