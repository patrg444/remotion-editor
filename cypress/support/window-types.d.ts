import { MediaItem } from '../../src/renderer/types/media-bin';
import { TimelineState } from '../../src/renderer/types/timeline';

declare global {
  interface Window {
    timelineState: TimelineState;
    timelineDispatch: (action: any) => void;
    mediaBinContext: {
      items: MediaItem[];
      selectedItem: MediaItem | null;
      addItems: (...args: any[]) => void;
      removeItem: (...args: any[]) => void;
      selectItem: (item: MediaItem | null) => void;
    };
    useMediaBin: () => typeof mediaBinContext;
    useFileOperations: () => {
      validateFile: (...args: any[]) => Promise<boolean>;
      processFile: (...args: any[]) => Promise<MediaItem>;
    };
    logger: {
      debug: (...args: any[]) => void;
      error: (...args: any[]) => void;
    };
    require: any;
    timelineReady?: boolean;
  }
}
