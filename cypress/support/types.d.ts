import { MediaItem } from '../../src/renderer/types/media-bin';

declare global {
  interface Window {
    mediaBinContext: {
      items: MediaItem[];
      selectedItem: MediaItem | null;
      addItems: (items: MediaItem[]) => void;
      removeItem: (id: string) => void;
      selectItem: (item: MediaItem | null) => void;
    };
  }
}

declare namespace Cypress {
  interface AUTWindow extends Window {
    mediaBinContext: Window['mediaBinContext'];
  }
}
