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
  // Initialize from window.timelineState if available
  const [items, setItems] = useState<MediaItem[]>(() => {
    const win = window as any;
    logger.debug('Initializing MediaBinContext with state:', win.timelineState);
    const initialItems = win.timelineState?.mediaBin?.items || [];
    logger.debug('Initial items:', initialItems);
    return initialItems;
  });
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  // Listen for timeline state changes
  React.useEffect(() => {
    const win = window as any;
    const handleStateChange = (event: CustomEvent) => {
      const state = event.detail;
      logger.debug('State change event:', state);
      if (state?.mediaBin?.items) {
        logger.debug('Updating media bin items from state change:', state.mediaBin.items);
        setItems(state.mediaBin.items);
      }
    };

    // Initial state
    if (win.timelineState?.mediaBin?.items) {
      logger.debug('Setting initial media bin items:', win.timelineState.mediaBin.items);
      setItems(win.timelineState.mediaBin.items);
    }

    // Listen for state changes
    win.addEventListener('timelineStateChange', handleStateChange as EventListener);
    logger.debug('Added timelineStateChange listener');

    return () => {
      win.removeEventListener('timelineStateChange', handleStateChange as EventListener);
      logger.debug('Removed timelineStateChange listener');
    };
  }, []);

  // Log whenever items change
  React.useEffect(() => {
    logger.debug('MediaBin items updated:', items);
  }, [items]);

  const addItems = useCallback((newItems: MediaItem[]) => {
    logger.debug('Adding media items:', newItems);
    setItems(current => {
      const updatedItems = [...current, ...newItems];
      // Sync with timeline state
      if ((window as any).timelineDispatch) {
        (window as any).timelineDispatch({
          type: 'SET_STATE',
          payload: {
            ...(window as any).timelineState,
            mediaBin: {
              ...((window as any).timelineState?.mediaBin || {}),
              items: updatedItems
            }
          }
        });
      }
      return updatedItems;
    });
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

  // Always expose context for testing
  React.useEffect(() => {
    (window as any).mediaBinContext = value;
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
