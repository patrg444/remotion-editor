import { Patch } from 'immer';

export type StateDiff = {
  type: 'partial' | 'full';
  timestamp: number;
  snapshot?: any;
  patches: Patch[];
  inversePatches: Patch[];
  description: string;
};

// Re-export the Patch type from immer for use in other files
export type { Patch };

export type HistoryEntry = StateDiff;

export type HistoryState = {
  entries: HistoryEntry[];
  currentIndex: number;
};
