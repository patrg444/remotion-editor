import React, { createContext, useContext, useState } from 'react';
import { MediaItem } from '../../types/media-bin';

interface MediaBinContextValue {
  items: MediaItem[];
  selectedItem: MediaItem | null;
  addItems: (items: MediaItem[]) => void;
  removeItem: (id: string) => void;
  selectItem: (item: MediaItem | null) => void;
}

export const MediaBinContext = createContext<MediaBinContextValue | undefined>(undefined);

export const MediaBinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const value = {
    items,
    selectedItem,
    addItems: (newItems: MediaItem[]) => setItems(current => [...current, ...newItems]),
    removeItem: (id: string) => {
      setItems(current => current.filter(item => item.id !== id));
      setSelectedItem(current => current?.id === id ? null : current);
    },
    selectItem: (item: MediaItem | null) => setSelectedItem(item)
  };

  // Expose context for testing
  (window as any).mediaBinContext = value;

  return (
    <MediaBinContext.Provider value={value}>
      {children}
    </MediaBinContext.Provider>
  );
};

export const useMediaBin = () => {
  const context = useContext(MediaBinContext);
  if (!context) {
    throw new Error('useMediaBin must be used within a MediaBinProvider');
  }
  return context;
};
