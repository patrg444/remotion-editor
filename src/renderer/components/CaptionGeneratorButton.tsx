import React, { useState } from 'react';
import { CaptionGeneratorDialog } from './CaptionGeneratorDialog';
import './styles/caption-generator-button.css';

interface CaptionGeneratorButtonProps {
  isGenerating: boolean;
  onGenerate: (options: {
    enableDiarization: boolean;
    style: {
      fontSize: number;
      fontFamily: string;
      fontWeight: string;
      color: string;
      strokeWidth: number;
      strokeColor: string;
    };
  }) => Promise<void>;
}

export const CaptionGeneratorButton: React.FC<CaptionGeneratorButtonProps> = ({
  isGenerating,
  onGenerate
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="caption-generator-button"
        disabled={isGenerating}
        data-testid="generate-captions-button"
      >
        Generate Captions
      </button>

      <CaptionGeneratorDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onGenerate={onGenerate}
      />
    </>
  );
};
