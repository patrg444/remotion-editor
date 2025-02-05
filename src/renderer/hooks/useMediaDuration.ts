import { useState, useEffect } from 'react';
import { Logger } from '../../main/utils/logger';

const logger = new Logger('useMediaDuration');

interface UseMediaDurationResult {
  duration: number;
  frameRate: number;
  isLoading: boolean;
  error: string | null;
}

export function useMediaDuration(videoPath: string | null): UseMediaDurationResult {
  const [duration, setDuration] = useState(0);
  const [frameRate, setFrameRate] = useState(30); // Default to 30fps
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoPath) {
      setDuration(0);
      setFrameRate(30);
      setError(null);
      return;
    }

    const loadMetadata = async () => {
      logger.info('loadMetadata enter', { videoPath });
      setIsLoading(true);
      setError(null);

      try {
        // Use FFmpeg through Electron to get accurate metadata
        const metadata = await window.electron.invoke('media:get-metadata', videoPath);
        
        if (!metadata) {
          throw new Error('Failed to get media metadata');
        }

        // Extract duration and frame rate from FFmpeg output
        const { duration, fps, streams } = metadata;

        // Set duration
        setDuration(duration);

        // Try to get frame rate from video stream
        if (fps) {
          setFrameRate(fps);
        } else if (streams?.length > 0) {
          // Look for video stream with frame rate info
          const videoStream = streams.find((stream: { codec_type: string; r_frame_rate?: string }) => stream.codec_type === 'video');
          if (videoStream?.r_frame_rate) {
            // Parse frame rate fraction (e.g. "30000/1001" for 29.97 fps)
            const [num, den] = videoStream.r_frame_rate.split('/').map(Number);
            if (num && den) {
              setFrameRate(num / den);
            }
          }
        }

        logger.info('loadMetadata exit', { duration, frameRate: fps });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        logger.error('Failed to load video metadata:', err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, [videoPath]);

  return {
    duration,
    frameRate,
    isLoading,
    error
  };
}
