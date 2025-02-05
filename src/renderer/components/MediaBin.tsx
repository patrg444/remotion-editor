import React, { useState, useCallback, useEffect } from 'react';
import { MediaItem } from '../types/media-bin';
import { useFileOperations } from '../hooks/useFileOperations';
import { logger } from '../utils/logger';
import { useMediaBin } from '../contexts/MediaBinContext';

interface MediaItemProps {
  item: MediaItem;
  onDragStart: (item: MediaItem) => void;
  onDragEnd: () => void;
  onClick?: (item: MediaItem) => void;
}

interface MediaBinProps {
  className?: string;
}

interface ErrorMessage {
  text: string;
  timeout?: NodeJS.Timeout;
}

import '../styles/media-bin.css';

const MediaItemComponent: React.FC<MediaItemProps> = ({
  item,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.dataTransfer) {
      try {
        const data = {
          type: item.type,
          name: item.name,
          path: item.path,
          src: item.path,
          duration: item.duration,
          originalDuration: item.duration,
          initialDuration: item.duration,
          maxDuration: item.duration
        };

        logger.debug('Starting drag with data:', data);

        e.dataTransfer.setData('application/json', JSON.stringify(data));
        e.dataTransfer.effectAllowed = 'copy';
        e.currentTarget.classList.add('dragging');
        onDragStart(item);
      } catch (error) {
        console.error('Error setting drag data:', error);
      }
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('dragging');
    onDragEnd();
  };

  return (
    <div
      className="media-asset-item"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick?.(item)}
      data-testid="media-bin-item"
    >
      <div className="media-asset-thumbnail">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.name} />
        ) : (
          <div className="media-asset-placeholder">
            {item.type === 'video' ? '🎥' : item.type === 'audio' ? '🔊' : '🖼️'}
          </div>
        )}
      </div>
      <div className="media-asset-info">
        <div className="media-asset-name">{item.name}</div>
        <div className="media-asset-duration">
          {item.duration ? formatDuration(item.duration) : ''}
        </div>
      </div>
    </div>
  );
};

const MediaBin: React.FC<MediaBinProps> = ({
  className = '',
}) => {
  const { items, selectedItem, addItems: onImport, selectItem: onSelect } = useMediaBin();
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ErrorMessage | null>(null);
  const { validateFile, processFile } = useFileOperations();
  const objectUrls = React.useRef<string[]>([]);

  useEffect(() => {
    const urls = objectUrls.current;
    return () => {
      urls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error revoking object URL:', error);
        }
      });
    };
  }, []);

  const showError = useCallback((text: string) => {
    if (errorMessage?.timeout) {
      clearTimeout(errorMessage.timeout);
    }
    const timeout = setTimeout(() => setErrorMessage(null), 3000);
    setErrorMessage({ text, timeout });
  }, [errorMessage]);

  const validateAndProcessFile = useCallback(async (file: File) => {
    // Check for duplicates first
    if (items.some(item => item.name === file.name)) {
      showError(`${file.name} has already been imported`);
      return null;
    }

    // Then validate file
    try {
      await validateFile(file);
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error validating file');
      return null;
    }

    // Process file
    try {
      const processedFile = await processFile(file);
      const objectUrl = URL.createObjectURL(file);
      objectUrls.current.push(objectUrl);

      const type = processedFile.type.startsWith('video/') ? 'video' as const : 
                  processedFile.type.startsWith('audio/') ? 'audio' as const : 
                  'image' as const;

      logger.debug('Processed file:', {
        id: processedFile.id,
        name: processedFile.name,
        type,
        duration: processedFile.metadata.duration
      });

      const duration = processedFile.metadata.duration || 0;
      return {
        id: processedFile.id,
        name: processedFile.name,
        type,
        path: objectUrl,
        duration,
        originalDuration: duration,
        initialDuration: duration,
        maxDuration: duration
      } satisfies MediaItem;
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Error processing file');
      return null;
    }
  }, [items, validateFile, processFile, showError]);

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const newItems: MediaItem[] = [];

    for (const file of files) {
      const item = await validateAndProcessFile(file);
      if (item) {
        newItems.push(item);
      }
    }

    if (newItems.length > 0) {
      onImport(newItems);
    }
  }, [onImport, validateAndProcessFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX <= rect.left ||
      e.clientX >= rect.right ||
      e.clientY <= rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    await handleFiles(Array.from(e.dataTransfer.files));
  }, [handleFiles]);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      await handleFiles(Array.from(files));
      // Reset input value to allow selecting the same file again
      e.target.value = '';
    }
  }, [handleFiles]);

  return (
    <div 
      className={`media-bin ${className} ${isDragOver ? 'drag-over' : ''}`}
      data-testid="media-bin"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {errorMessage && (
        <div className="media-bin-error" role="alert" data-testid="error-message">
          {errorMessage.text}
        </div>
      )}
      <div className="media-bin-header">
        <h2>Media</h2>
        <button 
          className="media-bin-import-button"
          data-testid="media-bin-import-button"
          onClick={() => document.getElementById('media-import-input')?.click()}
        >
          Import Media
        </button>
      </div>
      <input
        type="file"
        id="media-import-input"
        data-testid="media-import-input"
        style={{ display: 'none' }}
        multiple
        accept="video/*,audio/*,image/*,.srt,.vtt"
        onChange={handleFileChange}
      />
      <div className="media-bin-content" data-testid="media-bin-content">
        {items.length > 0 ? (
          <div className="media-bin-items">
            {items.map((item) => (
              <MediaItemComponent
                key={item.id}
                item={item}
                onDragStart={(item) => {
                  logger.debug('Drag started:', item);
                }}
                onDragEnd={() => {
                  logger.debug('Drag ended');
                }}
                onClick={(item) => onSelect?.(item)}
              />
            ))}
          </div>
        ) : (
          <div className="media-bin-empty" data-testid="media-bin-empty">
            <p>No media assets</p>
            <p>Click Import Media to add files</p>
          </div>
        )}
      </div>
    </div>
  );
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default MediaBin;
