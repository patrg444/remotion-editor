export interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  path: string;
  duration?: number;
  originalDuration?: number;
  initialDuration?: number;
  maxDuration?: number;
  thumbnail?: string;
}
