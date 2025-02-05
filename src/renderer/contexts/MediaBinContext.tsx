import React, { createContext, useContext, useCallback, useState } from 'react';
import { MediaItem } from '../types/media-bin';
import { logger } from '../utils/logger';

interface MediaBinContextValue {
  items: MediaItem[];
  selectedItem: MediaItem | null;
  addItems: (items: MediaItem[]) => void;
  removeItem: (id: string) => void;
  selectItem: (item: MediaItem | null) => void;
}

const MediaBinContext = createContext<MediaBinContextValue | undefined>(undefined);

export const MediaBinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const addItems = useCallback((newItems: MediaItem[]) => {
    logger.debug('Adding media items:', newItems);
    setItems(current => [...current, ...newItems]);
  }, []);

  const removeItem = useCallback((id: string) => {
    logger.debug('Removing media item:', id);
    setItems(current => current.filter(item => item.id !== id));
    setSelectedItem(current => current?.id === id ? null : current);
  }, []);

  const selectItem = useCallback((item: MediaItem | null) => {
    logger.debug('Selecting media item:', item);
    setSelectedItem(item);
  }, []);

  const value = {
    items,
    selectedItem,
    addItems,
    removeItem,
    selectItem
  };

  // Expose context for testing
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      (window as any).mediaBinContext = value;
    }
  }, [value]);

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
