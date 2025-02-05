import { InterpolationType } from '../keyframes/types';

export type KeyframeInterpolation = {
  type: InterpolationType;
};

export type Keyframe<T = any> = {
  time: number;
  value: T;
  interpolation?: KeyframeInterpolation;
  id?: string;
};

export type KeyframeTrack<T = any> = {
  id?: string;
  paramId?: string;
  property: string;
  keyframes: Keyframe<T>[];
  defaultValue?: T;
  min?: number;
  max?: number;
  step?: number;
  getValue: (time: number) => T;
};

export type KeyframeUpdate = {
  time: number;
  value: any;
  interpolation?: KeyframeInterpolation;
};

export type KeyframeTrackUpdate = {
  property: string;
  keyframes: KeyframeUpdate[];
};

export type KeyframeTrackReference = {
  trackId: string;
  paramId: string;
};
