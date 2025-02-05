import { FaceTrackingSettings, FaceTrackingClipData } from '../../types/face-tracking';
import { KeyframeInterpolation } from './keyframe';

export type EditOperationType = 
  | 'transform'
  | 'caption'
  | 'face-tracking'
  | 'clip'
  | 'track'
  | 'effect'
  | 'composite';

export interface EditOperationData {
  before: any;
  after: any;
  clipId?: string;
  trackId?: string;
}

export interface AudioKeyframeOperationData extends EditOperationData {
  clipId: string;
  before: {
    volumeKeyframes: { time: number; value: number; interpolation: KeyframeInterpolation }[];
    panKeyframes: { time: number; value: number; interpolation: KeyframeInterpolation }[];
  };
  after: {
    volumeKeyframes: { time: number; value: number; interpolation: KeyframeInterpolation }[];
    panKeyframes: { time: number; value: number; interpolation: KeyframeInterpolation }[];
  };
}

export interface FaceTrackingOperationData extends EditOperationData {
  clipId: string;
  before: {
    faceTracking?: FaceTrackingClipData;
    settings: FaceTrackingSettings;
  };
  after: {
    faceTracking: FaceTrackingClipData;
    settings: FaceTrackingSettings;
  };
}

export interface EditOperation {
  type: EditOperationType;
  description: string;
  data: EditOperationData;
  timestamp: number;
}

export interface EditHistoryState {
  operations: EditOperation[];
  currentIndex: number;
  lastSavedIndex: number;
  lastOperation: EditOperation | null;
}

export type EditHistoryAction =
  | { type: 'ADD_OPERATION'; operation: EditOperation }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CLEAR' };

export const isUndoable = (state: EditHistoryState): boolean => {
  return state.currentIndex >= 0;
};

export const isRedoable = (state: EditHistoryState): boolean => {
  return state.currentIndex < state.operations.length - 1;
};

export const canMergeOperations = (op1: EditOperation, op2: EditOperation): boolean => {
  return (
    op1.type === op2.type &&
    op1.data.clipId === op2.data.clipId &&
    Date.now() - op2.timestamp < 1000
  );
};

export const mergeOperations = (op1: EditOperation, op2: EditOperation): EditOperation => {
  return {
    ...op2,
    data: {
      ...op2.data,
      before: op1.data.before
    }
  };
};

export const createEditOperation = (
  type: EditOperationType,
  action: 'add' | 'update' | 'delete',
  description: string,
  before: Record<string, any>,
  after: Record<string, any>,
  clipId?: string,
  trackId?: string
): EditOperation => {
  return {
    type,
    description,
    data: {
      before,
      after,
      clipId,
      trackId
    },
    timestamp: Date.now()
  };
};
