import React, { useEffect, useRef } from 'react';
import { CompositeRendererProps } from '../types/components';
import { useTextureCache } from '../hooks/useTextureCache';
import { isVideoClip, isAudioClip } from '../types/timeline';

export const CompositeRenderer: React.FC<CompositeRendererProps> = ({
  tracks,
  track,
  zoom,
  currentTime,
  isPlaying,
  onRenderComplete,
  onRenderError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getTexture } = useTextureCache();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onRenderError?.(new Error('Failed to get canvas context'));
      return;
    }

    const render = async () => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render tracks if provided
        if (tracks) {
          // Load all textures in parallel
          const renderPromises = tracks.flatMap(track =>
            track.clips
              .filter(clip => {
                const x = (clip.startTime - currentTime) * zoom;
                const duration = clip.endTime - clip.startTime;
                const width = duration * zoom;
                return x + width > 0 && x < canvas.width;
              })
              .map(async clip => {
                const x = (clip.startTime - currentTime) * zoom;
                const duration = clip.endTime - clip.startTime;
                const width = duration * zoom;

                if (isVideoClip(clip)) {
                  try {
                    const image = await getTexture(clip.src);
                    // Calculate aspect ratio
                    const aspectRatio = image.width / image.height;
                    const targetHeight = canvas.height;
                    const targetWidth = targetHeight * aspectRatio;
                    return () => ctx.drawImage(image, x, 0, targetWidth, targetHeight);
                  } catch (error) {
                    return () => {
                      ctx.fillStyle = '#666';
                      ctx.fillRect(x, 0, width, canvas.height);
                    };
                  }
                } else {
                  return () => {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(x, 0, width, canvas.height);
                  };
                }
              })
          );

          // Execute all render operations in order
          const renderOps = await Promise.all(renderPromises);
          renderOps.forEach(op => op());
        }

        // Render single track if provided
        if (track) {
          // Load all textures in parallel for single track
          const renderPromises = track.clips
            .filter(clip => {
              const x = (clip.startTime - currentTime) * zoom;
              const duration = clip.endTime - clip.startTime;
              const width = duration * zoom;
              return x + width > 0 && x < canvas.width;
            })
            .map(async clip => {
              const x = (clip.startTime - currentTime) * zoom;
              const duration = clip.endTime - clip.startTime;
              const width = duration * zoom;

              if (isVideoClip(clip)) {
                try {
                  const image = await getTexture(clip.src);
                  // Calculate aspect ratio
                  const aspectRatio = image.width / image.height;
                  const targetHeight = canvas.height;
                  const targetWidth = targetHeight * aspectRatio;
                  return () => ctx.drawImage(image, x, 0, targetWidth, targetHeight);
                } catch (error) {
                  return () => {
                    ctx.fillStyle = '#666';
                    ctx.fillRect(x, 0, width, canvas.height);
                  };
                }
              } else {
                return () => {
                  ctx.fillStyle = '#666';
                  ctx.fillRect(x, 0, width, canvas.height);
                };
              }
            });

          // Execute all render operations in order
          const renderOps = await Promise.all(renderPromises);
          renderOps.forEach(op => op());
        }

        onRenderComplete?.();
      } catch (error) {
        onRenderError?.(error instanceof Error ? error : new Error('Render error'));
      }
    };

    render();

    if (isPlaying) {
      const animationFrame = requestAnimationFrame(render);
      return () => cancelAnimationFrame(animationFrame);
    }
  }, [tracks, track, zoom, currentTime, isPlaying, onRenderComplete, onRenderError, getTexture]);

  return (
    <canvas
      ref={canvasRef}
      className="clip-renderer"
      data-testid="clip-renderer"
      width={1920}
      height={1080}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
