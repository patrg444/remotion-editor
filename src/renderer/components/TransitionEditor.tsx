import React, { useCallback, useEffect } from 'react';
import { TransitionPreview } from './TransitionPreview';
import { Transition, TransitionParams, TransitionPreviewData, TransitionRenderOptions, TransitionType } from '../types/transition';

interface TransitionEditorProps {
  transition: Transition;
  previewData: TransitionPreviewData;
  onParamsChange: (params: TransitionParams) => void;
  onUpdate?: (transition: Transition) => void;
  onPreviewGenerated?: (data: TransitionPreviewData) => void;
  renderOptions?: Partial<TransitionRenderOptions>;
}

const transitionTypeOptions: { value: TransitionType; label: string }[] = [
  { value: TransitionType.Dissolve, label: 'Dissolve' },
  { value: TransitionType.Fade, label: 'Fade' },
  { value: TransitionType.Wipe, label: 'Wipe' },
  { value: TransitionType.Slide, label: 'Slide' },
  { value: TransitionType.Crossfade, label: 'Crossfade' },
  { value: TransitionType.Zoom, label: 'Zoom' },
  { value: TransitionType.Push, label: 'Push' },
];

export function TransitionEditor({
  transition,
  previewData,
  onParamsChange,
  onUpdate,
  onPreviewGenerated,
  renderOptions,
}: TransitionEditorProps) {
  const handleParamChange = useCallback((paramName: keyof TransitionParams, value: any) => {
    onParamsChange({
      ...transition.params,
      [paramName]: value,
    });
  }, [transition.params, onParamsChange]);

  const handleFrameRendered = useCallback((frameData: ImageData) => {
    if (onPreviewGenerated) {
      onPreviewGenerated({
        ...previewData,
        fromFrame: {
          data: frameData.data,
          width: frameData.width,
          height: frameData.height,
          colorSpace: frameData.colorSpace,
        },
        toFrame: {
          data: frameData.data,
          width: frameData.width,
          height: frameData.height,
          colorSpace: frameData.colorSpace,
        },
        progress: transition.progress || 0,
        params: transition.params,
      });
    }
  }, [onPreviewGenerated, previewData, transition.progress, transition.params]);

  useEffect(() => {
    if (onUpdate) {
      onUpdate(transition);
    }
  }, [transition, onUpdate]);

  return (
    <div className="transition-editor">
      <TransitionPreview
        transition={transition}
        width={renderOptions?.width || 1920}
        height={renderOptions?.height || 1080}
        clipAUrl={transition.clipAId ? `clip://${transition.clipAId}` : undefined}
        clipBUrl={transition.clipBId ? `clip://${transition.clipBId}` : undefined}
        currentTime={transition.startTime}
        onFrameRendered={handleFrameRendered}
      />

      <div className="transition-controls" role="form" aria-label="Transition Settings">
        <fieldset className="param-group">
          <legend>Duration</legend>
          <label htmlFor="duration-input" className="sr-only">Duration in seconds</label>
          <input
            id="duration-input"
            type="number"
            value={transition.params?.duration || 0}
            onChange={e => handleParamChange('duration', parseFloat(e.target.value))}
            min={0}
            max={60}
            step={0.1}
            aria-valuemin={0}
            aria-valuemax={60}
            aria-valuenow={transition.params?.duration || 0}
          />
        </fieldset>

        <fieldset className="param-group">
          <legend>Type</legend>
          <label htmlFor="type-select" className="sr-only">Transition type</label>
          <select
            id="type-select"
            value={transition.type}
            onChange={e => handleParamChange('type', e.target.value as TransitionType)}
            aria-expanded="false"
          >
            {transitionTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </fieldset>

        {(transition.type === TransitionType.Wipe || 
          transition.type === TransitionType.Slide || 
          transition.type === TransitionType.Push) && (
          <fieldset className="param-group">
            <legend>Direction</legend>
            <label htmlFor="direction-select" className="sr-only">Transition direction</label>
            <select
              id="direction-select"
              value={transition.params?.direction || 'left'}
              onChange={e => handleParamChange('direction', e.target.value)}
              aria-expanded="false"
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="up">Up</option>
              <option value="down">Down</option>
            </select>
          </fieldset>
        )}

        <fieldset className="param-group">
          <legend>Easing</legend>
          <label htmlFor="easing-select" className="sr-only">Easing function</label>
          <select
            id="easing-select"
            value={transition.params?.easing || 'linear'}
            onChange={e => handleParamChange('easing', e.target.value)}
            aria-expanded="false"
          >
            <option value="linear">Linear</option>
            <option value="ease-in">Ease In</option>
            <option value="ease-out">Ease Out</option>
            <option value="ease-in-out">Ease In Out</option>
          </select>
        </fieldset>

        <fieldset className="param-group">
          <legend>GPU Settings</legend>
          <div className="checkbox-wrapper">
            <input
              id="gpu-preview"
              type="checkbox"
              checked={transition.gpuPreviewEnabled || false}
              onChange={() => onUpdate?.({
                ...transition,
                gpuPreviewEnabled: !transition.gpuPreviewEnabled,
              })}
              aria-describedby="gpu-preview-description"
            />
            <label htmlFor="gpu-preview">Enable GPU Preview</label>
            <div id="gpu-preview-description" className="sr-only">
              Toggle GPU acceleration for transition preview
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
