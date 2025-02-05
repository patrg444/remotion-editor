import { useRef, useCallback, useState } from 'react';
import { Caption, CaptionClip } from '../types/timeline';

interface UseCaptionSyncProps {
  clip: CaptionClip;
  onCaptionSelect?: (caption: Caption) => void;
}

export const useCaptionSync = ({ clip, onCaptionSelect }: UseCaptionSyncProps) => {
  const inspectorRef = useRef<HTMLDivElement>(null);
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(null);

  const handleCaptionSelect = useCallback(
    (caption: Caption) => {
      setSelectedCaptionId(caption.id);
      onCaptionSelect?.(caption);

      // Find and scroll to the selected caption element
      if (inspectorRef.current) {
        const element = inspectorRef.current.querySelector(
          `[data-caption-id="${caption.id}"]`
        );
        if (element) {
          try {
            element.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
          } catch (error) {
            // Ignore scrollIntoView errors in test environment
            console.debug('ScrollIntoView not supported in test environment');
          }
        }
      }
    },
    [onCaptionSelect]
  );

  return {
    inspectorRef,
    handleCaptionSelect,
    selectedCaptionId,
  };
};
