import { Effect } from '../types/timeline';

// Apply blur effect to canvas context
export const applyBlur = (ctx: CanvasRenderingContext2D, value: number) => {
  if (value === 0) return;
  ctx.filter = `blur(${value}px)`;
};

// Apply brightness effect (-100 to 100)
export const applyBrightness = (ctx: CanvasRenderingContext2D, value: number) => {
  if (value === 0) return;
  // Convert -100 to 100 range to 0 to 2 range
  const brightness = 1 + (value / 100);
  ctx.filter = `brightness(${brightness})`;
};

// Apply contrast effect (-100 to 100)
export const applyContrast = (ctx: CanvasRenderingContext2D, value: number) => {
  if (value === 0) return;
  // Convert -100 to 100 range to 0 to 2 range
  const contrast = 1 + (value / 100);
  ctx.filter = `contrast(${contrast})`;
};

// Apply saturation effect (-100 to 100)
export const applySaturation = (ctx: CanvasRenderingContext2D, value: number) => {
  if (value === 0) return;
  // Convert -100 to 100 range to 0 to 2 range
  const saturation = 1 + (value / 100);
  ctx.filter = `saturate(${saturation})`;
};

// Apply hue rotation effect (-180 to 180 degrees)
export const applyHue = (ctx: CanvasRenderingContext2D, value: number) => {
  if (value === 0) return;
  ctx.filter = `hue-rotate(${value}deg)`;
};

// Get interpolated effect value based on keyframes and current time
export const getEffectValue = (effect: Effect, currentTime: number): number => {
  if (!effect.parameters.keyframes?.length) {
    return effect.parameters.value;
  }

  const keyframes = effect.parameters.keyframes;
  
  // If before first keyframe or after last keyframe, use those values
  if (currentTime <= keyframes[0].time) return keyframes[0].value;
  if (currentTime >= keyframes[keyframes.length - 1].time) return keyframes[keyframes.length - 1].value;

  // Find surrounding keyframes
  let startFrame = keyframes[0];
  let endFrame = keyframes[1];
  
  for (let i = 1; i < keyframes.length; i++) {
    if (keyframes[i].time > currentTime) {
      startFrame = keyframes[i - 1];
      endFrame = keyframes[i];
      break;
    }
  }

  // Interpolate between keyframes
  const progress = (currentTime - startFrame.time) / (endFrame.time - startFrame.time);
  return startFrame.value + (endFrame.value - startFrame.value) * progress;
};

// Apply all effects to canvas context
export const applyEffects = (ctx: CanvasRenderingContext2D, effects: Effect[], currentTime: number) => {
  if (!effects?.length) return;

  // Reset filters
  ctx.filter = 'none';

  // Build combined filter string
  const filters: string[] = [];

  effects.forEach(effect => {
    if (!effect.enabled) return;

    const value = getEffectValue(effect, currentTime);

    switch (effect.type) {
      case 'Blur':
        if (value !== 0) filters.push(`blur(${value}px)`);
        break;
      case 'Brightness':
        if (value !== 0) filters.push(`brightness(${1 + (value / 100)})`);
        break;
      case 'Contrast':
        if (value !== 0) filters.push(`contrast(${1 + (value / 100)})`);
        break;
      case 'Saturation':
        if (value !== 0) filters.push(`saturate(${1 + (value / 100)})`);
        break;
      case 'Hue':
        if (value !== 0) filters.push(`hue-rotate(${value}deg)`);
        break;
    }
  });

  // Apply combined filters
  if (filters.length > 0) {
    ctx.filter = filters.join(' ');
  }
};
