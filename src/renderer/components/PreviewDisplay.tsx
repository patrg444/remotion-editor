import React, { useRef, useEffect, useCallback } from 'react';
import { useTimelineContext } from '../hooks/useTimelineContext';
import { isVideoClip, isAudioClip, ClipWithLayer, ActionTypes, VideoClip, AudioClip } from '../types/timeline';
import { logger } from '../utils/logger';
import { PlaybackControls } from './PlaybackControls';
import { syncManager } from '../utils/SyncManager';
import { clipSyncManager } from '../utils/ClipSyncManager';

export const PreviewDisplay: React.FC = () => {
  const { state, dispatch } = useTimelineContext();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playbackStateRef = useRef({
    isPlaying: false,
    lastPlaybackTime: 0,
    lastTimeUpdate: 0,
    bufferingTimeout: null as NodeJS.Timeout | null,
  });

  // Initialize sync manager with current frame rate
  useEffect(() => {
    syncManager.setFrameRate(state.fps || 30);
  }, [state.fps]);

  useEffect(() => {
    // Only update media time when not playing
    if (!state.isPlaying) {
      const snappedTime = syncManager.snapToFrame(state.currentTime);
      if (videoRef.current && Math.abs(videoRef.current.currentTime - snappedTime) > 0.001) {
        videoRef.current.currentTime = snappedTime;
      }
      if (audioRef.current && Math.abs(audioRef.current.currentTime - snappedTime) > 0.001) {
        audioRef.current.currentTime = snappedTime;
      }
    }
  }, [state.currentTime, state.isPlaying]);

  const handlePlay = useCallback(async () => {
    logger.debug('Play button clicked');
    syncManager.setPlaying(true);
    try {
      // Reset time before playing to ensure sync
      const startTime = state.currentTime;
      let playbackReady = true;

      if (videoRef.current) {
        videoRef.current.currentTime = startTime;
        // Wait for video to be ready
        if (videoRef.current.readyState < 3) {
          playbackReady = false;
          await new Promise<void>((resolve) => {
            if (!videoRef.current) {
              resolve();
              return;
            }
            const onCanPlay = () => {
              if (videoRef.current) {
                videoRef.current.removeEventListener('canplay', onCanPlay);
              }
              resolve();
            };
            videoRef.current.addEventListener('canplay', onCanPlay);
          });
        }
      }

      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        // Wait for audio to be ready
        if (audioRef.current.readyState < 3) {
          playbackReady = false;
          await new Promise<void>((resolve) => {
            if (!audioRef.current) {
              resolve();
              return;
            }
            const onCanPlay = () => {
              if (audioRef.current) {
                audioRef.current.removeEventListener('canplay', onCanPlay);
              }
              resolve();
            };
            audioRef.current.addEventListener('canplay', onCanPlay);
          });
        }
      }

      if (!playbackReady) {
        logger.debug('Waiting for media to be ready...');
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Play both media elements
      const playPromises: Promise<void>[] = [];
      if (videoRef.current) {
        playPromises.push(videoRef.current.play());
      }
      if (audioRef.current) {
        playPromises.push(audioRef.current.play());
      }

      await Promise.all(playPromises);
      playbackStateRef.current.isPlaying = true;
      playbackStateRef.current.lastPlaybackTime = startTime;
      playbackStateRef.current.lastTimeUpdate = performance.now();
      dispatch({ type: ActionTypes.SET_PLAYING, payload: true });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Error playing media:', new Error(errorMessage));
      playbackStateRef.current.isPlaying = false;
      syncManager.setPlaying(false);
      dispatch({ type: ActionTypes.SET_PLAYING, payload: false });
    }
  }, [dispatch, state.currentTime]);

  const handlePause = useCallback(() => {
    logger.debug('Pause button clicked');
    if (videoRef.current) {
      videoRef.current.pause();
      // Store current time to maintain sync
      const currentTime = videoRef.current.currentTime;
      dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: { time: currentTime } });
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    playbackStateRef.current.isPlaying = false;
    if (playbackStateRef.current.bufferingTimeout) {
      clearTimeout(playbackStateRef.current.bufferingTimeout);
      playbackStateRef.current.bufferingTimeout = null;
    }
    dispatch({ type: ActionTypes.SET_PLAYING, payload: false });
  }, [dispatch]);

  // Update clip sync manager when tracks change
  useEffect(() => {
    clipSyncManager.updateTracks(state.tracks);
  }, [state.tracks]);

  // Get active clips from sync manager and ensure proper typing
  const activeVideoClip = clipSyncManager.getActiveVideoClip()?.clip as VideoClip | undefined;
  const activeAudioClip = clipSyncManager.getActiveAudioClip()?.clip as AudioClip | undefined;

  // Preload next clips when needed
  useEffect(() => {
    if (clipSyncManager.shouldPreloadNextClip('video')) {
      const nextVideo = clipSyncManager.getNextClip('video');
      if (nextVideo && isVideoClip(nextVideo)) {
        const preloadVideo = new Image();
        preloadVideo.src = nextVideo.src;
      }
    }
    if (clipSyncManager.shouldPreloadNextClip('audio')) {
      const nextAudio = clipSyncManager.getNextClip('audio');
      if (nextAudio && isAudioClip(nextAudio)) {
        const preloadAudio = new Audio();
        preloadAudio.src = nextAudio.src;
        preloadAudio.preload = 'auto';
      }
    }
  }, [state.currentTime]);

  logger.debug('Active clips:', { activeVideoClip, activeAudioClip });

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const error = e.currentTarget.error;
    if (error) {
      logger.error(`Video error: code=${error.code} message=${error.message}`);
    }
  }, []);

  const handleAudioError = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const error = e.currentTarget.error;
    if (error) {
      logger.error(`Audio error: code=${error.code} message=${error.message}`);
    }
  }, []);

  // Add duration check effect
  useEffect(() => {
    const updateDuration = () => {
      let maxDuration = 0;
      if (videoRef.current?.duration && !isNaN(videoRef.current.duration)) {
        maxDuration = Math.max(maxDuration, videoRef.current.duration);
      }
      if (audioRef.current?.duration && !isNaN(audioRef.current.duration)) {
        maxDuration = Math.max(maxDuration, audioRef.current.duration);
      }
      if (maxDuration > 0) {
        dispatch({ type: ActionTypes.SET_DURATION, payload: maxDuration });
      }
    };

    // Check duration when media is loaded and periodically during playback
    updateDuration();
    const interval = setInterval(updateDuration, 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Add media load effect
  useEffect(() => {
    const loadMedia = async () => {
      try {
        if (videoRef.current) {
          videoRef.current.load();
        }
        if (audioRef.current) {
          audioRef.current.load();
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error loading media:', new Error(errorMessage));
      }
    };
    loadMedia();
  }, [activeVideoClip?.src, activeAudioClip?.src]);

  const handleVideoLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const duration = e.currentTarget.duration;
    if (!isNaN(duration)) {
      dispatch({ type: ActionTypes.SET_DURATION, payload: duration });
    }
  }, [dispatch]);

  const handleAudioLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const duration = e.currentTarget.duration;
    if (!isNaN(duration) && (!videoRef.current || !videoRef.current.duration)) {
      dispatch({ type: ActionTypes.SET_DURATION, payload: duration });
    }
  }, [dispatch, videoRef]);

  const handleVideoLoadedData = useCallback(() => {
    logger.debug('Video loaded successfully', {
      duration: videoRef.current?.duration,
      readyState: videoRef.current?.readyState
    });
  }, [videoRef]);

  const handleAudioLoadedData = useCallback(() => {
    logger.debug('Audio loaded successfully', {
      duration: audioRef.current?.duration,
      readyState: audioRef.current?.readyState
    });
  }, [audioRef]);

  const handleVideoEnded = useCallback(() => {
    logger.debug('Video ended:', {
      currentTime: videoRef.current?.currentTime,
      duration: videoRef.current?.duration
    });
    // Only handle end if we've actually reached the end
    if (videoRef.current?.currentTime === videoRef.current?.duration) {
      playbackStateRef.current.isPlaying = false;
      dispatch({ type: ActionTypes.SET_PLAYING, payload: false });
    }
  }, [dispatch]);

  const handleAudioEnded = useCallback(() => {
    logger.debug('Audio ended:', {
      currentTime: audioRef.current?.currentTime,
      duration: audioRef.current?.duration
    });
    // Only handle end if we've actually reached the end
    if (audioRef.current?.currentTime === audioRef.current?.duration) {
      playbackStateRef.current.isPlaying = false;
      dispatch({ type: ActionTypes.SET_PLAYING, payload: false });
    }
  }, [dispatch]);

  // Enhanced playback monitor effect with frame-accurate sync
  useEffect(() => {
    if (!state.isPlaying) return;

    let animationFrameId: number;
    const checkPlayback = (timestamp: number) => {
      const video = videoRef.current;
      const audio = audioRef.current;

      // Check for end conditions
      const isVideoEnded = video && (video.ended || video.currentTime >= video.duration - 0.001);
      const isAudioEnded = audio && (audio.ended || audio.currentTime >= audio.duration - 0.001);

      if (isVideoEnded || isAudioEnded) {
        handlePause();
        return;
      }

      if (video && playbackStateRef.current.isPlaying) {
        const currentPlaybackTime = video.currentTime;
        
        // Update sync manager with current time
        syncManager.updateTime(currentPlaybackTime, timestamp);
        
        // Check for drift and apply compensation if needed
        if (syncManager.needsDriftCompensation()) {
          const compensation = syncManager.getDriftCompensation();
          const adjustedTime = currentPlaybackTime + compensation;
          video.currentTime = syncManager.snapToFrame(adjustedTime);
          if (audio) {
            audio.currentTime = video.currentTime;
          }
        }

        // Update timeline with frame-accurate time
        const snappedTime = syncManager.snapToFrame(currentPlaybackTime);
        dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: { time: snappedTime } });
      }

      // Ensure media is playing and in sync
      if (video && !video.ended && playbackStateRef.current.isPlaying) {
        if (video.paused) {
          video.play().catch(() => {});
        }
      }

      if (audio && !audio.ended && playbackStateRef.current.isPlaying) {
        if (audio.paused) {
          audio.play().catch(() => {});
        }
        // Sync audio to video with frame accuracy
        if (video && Math.abs(audio.currentTime - video.currentTime) > 0.001) {
          audio.currentTime = syncManager.snapToFrame(video.currentTime);
        }
      }

      // Continue monitoring
      if (playbackStateRef.current.isPlaying) {
        animationFrameId = requestAnimationFrame(checkPlayback);
      }
    };

    // Start monitoring
    animationFrameId = requestAnimationFrame(checkPlayback);

    // Cleanup
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [state.isPlaying, dispatch, handlePause]);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (playbackStateRef.current.isPlaying) {
      const time = e.currentTarget.currentTime;
      dispatch({ type: ActionTypes.SET_CURRENT_TIME, payload: { time } });
    }
  }, [dispatch]);

  return (
    <div data-testid="preview-display" className="preview-display" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div data-testid="preview-canvas" className="preview-canvas" style={{ flex: 1, backgroundColor: '#000', position: 'relative' }}>
        {activeVideoClip && (
          <video
            ref={videoRef}
            src={activeVideoClip.src}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            crossOrigin="anonymous"
            onError={handleVideoError}
            onLoadedMetadata={handleVideoLoadedMetadata}
            onLoadedData={handleVideoLoadedData}
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            playsInline
            muted={false}
            preload="auto"
          />
        )}
        {activeAudioClip && (
          <audio
            ref={audioRef}
            src={activeAudioClip.src}
            crossOrigin="anonymous"
            onError={handleAudioError}
            onLoadedMetadata={handleAudioLoadedMetadata}
            onLoadedData={handleAudioLoadedData}
            onEnded={handleAudioEnded}
            preload="auto"
          />
        )}
      </div>
      <div data-testid="preview-controls" className="preview-controls-container" style={{ padding: '10px', backgroundColor: '#1e1e1e', borderTop: '1px solid #333' }}>
        <PlaybackControls
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={state.duration}
          onPlayPause={() => state.isPlaying ? handlePause() : handlePlay()}
        />
      </div>
    </div>
  );
};
