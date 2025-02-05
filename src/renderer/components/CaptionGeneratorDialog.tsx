import React, { useState } from 'react';
import './styles/caption-generator-dialog.css';

interface CaptionGeneratorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (options: CaptionOptions) => Promise<void>;
}

interface CaptionOptions {
  enableDiarization: boolean;
  style: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    color: string;
    strokeWidth: number;
    strokeColor: string;
  };
}

const defaultStyle = {
  fontSize: 24,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#FFFFFF',
  strokeWidth: 1,
  strokeColor: '#000000'
};

export const CaptionGeneratorDialog: React.FC<CaptionGeneratorDialogProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<CaptionOptions>({
    enableDiarization: false,
    style: { ...defaultStyle }
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate(options);
      onClose();
    } catch (error) {
      console.error('Error generating captions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="caption-generator-dialog">
        <h2>Generate Captions</h2>
        
        <div className="dialog-content">
          <div className="option-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.enableDiarization}
                onChange={(e) => setOptions({
                  ...options,
                  enableDiarization: e.target.checked
                })}
              />
              Enable Speaker Detection
            </label>
            {options.enableDiarization && (
              <p className="help-text">
                Captions will be color-coded by speaker
              </p>
            )}
          </div>

          <div className="option-group">
            <h3>Caption Style</h3>
            <div className="style-inputs">
              <div className="input-row">
                <label>
                  Font Size:
                  <input
                    type="number"
                    value={options.style.fontSize}
                    onChange={(e) => setOptions({
                      ...options,
                      style: {
                        ...options.style,
                        fontSize: parseInt(e.target.value) || defaultStyle.fontSize
                      }
                    })}
                    min={12}
                    max={72}
                  />
                </label>
                <label>
                  Font Family:
                  <select
                    value={options.style.fontFamily}
                    onChange={(e) => setOptions({
                      ...options,
                      style: {
                        ...options.style,
                        fontFamily: e.target.value
                      }
                    })}
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Courier New">Courier New</option>
                  </select>
                </label>
              </div>

              <div className="input-row">
                <label>
                  Font Weight:
                  <select
                    value={options.style.fontWeight}
                    onChange={(e) => setOptions({
                      ...options,
                      style: {
                        ...options.style,
                        fontWeight: e.target.value
                      }
                    })}
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                  </select>
                </label>
                <label>
                  Text Color:
                  <input
                    type="color"
                    value={options.style.color}
                    onChange={(e) => setOptions({
                      ...options,
                      style: {
                        ...options.style,
                        color: e.target.value
                      }
                    })}
                  />
                </label>
              </div>

              <div className="input-row">
                <label>
                  Stroke Width:
                  <input
                    type="number"
                    value={options.style.strokeWidth}
                    onChange={(e) => setOptions({
                      ...options,
                      style: {
                        ...options.style,
                        strokeWidth: parseInt(e.target.value) || 0
                      }
                    })}
                    min={0}
                    max={5}
                  />
                </label>
                <label>
                  Stroke Color:
                  <input
                    type="color"
                    value={options.style.strokeColor}
                    onChange={(e) => setOptions({
                      ...options,
                      style: {
                        ...options.style,
                        strokeColor: e.target.value
                      }
                    })}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="caption-preview" style={{
            fontFamily: options.style.fontFamily,
            fontSize: options.style.fontSize,
            fontWeight: options.style.fontWeight,
            color: options.style.color,
            WebkitTextStroke: `${options.style.strokeWidth}px ${options.style.strokeColor}`
          }}>
            Preview Text
          </div>
        </div>

        <div className="dialog-actions">
          <button 
            onClick={onClose}
            disabled={isGenerating}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`generate-button ${isGenerating ? 'loading' : ''}`}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};
