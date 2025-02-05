import { RenderResult } from '@testing-library/react';
import { TimelineState } from '../renderer/types/timeline';
import { UserEvent } from '@testing-library/user-event';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisibleIn(container: HTMLElement): R;
      toBeHiddenIn(container: HTMLElement): R;
    }
  }
}

export interface TestRenderResult extends RenderResult {
  container: HTMLElement;
  user: UserEvent;
}

export interface TestTimelineState extends TimelineState {
  testId?: string;
}

export interface TestRenderOptions {
  initialState?: Partial<TestTimelineState>;
}

export interface TestTrack {
  id: string;
  name: string;
  type: string;
  height: number;
  isMuted: boolean;
  isSolo: boolean;
  isLocked: boolean;
  clips: any[];
}

export interface TestClip {
  id: string;
  trackId: string;
  trackStart: number;
  trackEnd: number;
  inPoint: number;
  outPoint: number;
  mediaId: string;
  type: string;
  linkedClipIds: string[];
  startTime: number;
  duration: number;
}

export interface TestMarker {
  id: string;
  time: number;
  label: string;
  color: string;
  type: string;
}

export interface TestHistoryItem {
  id: string;
  type: string;
  timestamp: number;
  description: string;
  payload?: any;
  undo: () => void;
  redo: () => void;
  tracks: any[];
  selectedClipIds: string[];
  markers: any[];
}

export interface TestKeyframe {
  id: string;
  time: number;
  value: number;
  easing: string;
}

export interface TestTransition {
  id: string;
  type: string;
  duration: number;
  clipFromId: string;
  clipToId: string;
  parameters: Record<string, any>;
}

export interface TestEffect {
  id: string;
  type: string;
  clipId: string;
  parameters: Record<string, any>;
  keyframes: any[];
}

export interface TestGroup {
  id: string;
  name: string;
  trackIds: string[];
  isCollapsed: boolean;
}

export interface TestComposition {
  id: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  fps: number;
  tracks: any[];
  markers: any[];
  groups: any[];
  effects: any[];
  transitions: any[];
}

export interface MockTimelineContext {
  state: TestTimelineState;
  dispatch: jest.Mock;
}
