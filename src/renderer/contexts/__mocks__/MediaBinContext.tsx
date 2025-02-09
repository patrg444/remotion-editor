import React from 'react';

export const MediaBinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useMediaBin = () => ({
  items: [],
  selectedItem: null,
  addItems: jest.fn(),
  removeItem: jest.fn(),
  selectItem: jest.fn()
});
