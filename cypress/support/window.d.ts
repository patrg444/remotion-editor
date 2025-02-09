import { TimelineProvider } from '../../src/renderer/contexts/TimelineContext';
import { MediaBinProvider } from '../../src/renderer/contexts/MediaBinContext';
import { MediaBin } from '../../src/renderer/components/MediaBin';
import { TimelineState } from '../../src/renderer/types/timeline';
import { MediaItem } from '../../src/renderer/types/media-bin';

declare global {
  interface Window {
    React: typeof import('react');
    ReactDOM: typeof import('react-dom');
    require: (path: string) => any;
    logger: {
      debug: (...args: any[]) => void;
      error: (...args: any[]) => void;
    };
    timelineState: TimelineState;
    timelineDispatch: (action: any) => void;
    timelineReady: boolean;
    mediaBinContext: {
      items: MediaItem[];
      selectedItem: MediaItem | null;
      addItems: (items: MediaItem[]) => void;
      removeItem: (id: string) => void;
      selectItem: (item: MediaItem | null) => void;
    };
    useMediaBin: () => {
      items: MediaItem[];
      selectedItem: MediaItem | null;
      addItems: (items: MediaItem[]) => void;
      removeItem: (id: string) => void;
      selectItem: (item: MediaItem | null) => void;
    };
    useFileOperations: () => {
      validateFile: (file: File) => Promise<boolean>;
      processFile: (file: File) => Promise<any>;
    };
    TimelineProvider: typeof TimelineProvider;
    MediaBinProvider: typeof MediaBinProvider;
    MediaBin: typeof MediaBin;
  }
}
