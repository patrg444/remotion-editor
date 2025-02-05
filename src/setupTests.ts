import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';
import { expect as chaiExpect } from 'chai';

// Make Chai's expect available globally
(global as any).expect = chaiExpect;

// Store original console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Filter out specific React warnings
console.error = (...args: any[]) => {
  // Ignore specific React warnings
  if (args[0]?.includes?.('Warning:')) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args: any[]) => {
  // Ignore specific React warnings
  if (args[0]?.includes?.('Warning:')) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};

console.log = (...args: any[]) => {
  // Ignore specific logs
  if (args[0]?.includes?.('Cleanup -')) {
    return;
  }
  originalConsoleLog.call(console, ...args);
};

// Add canvas support
class ImageDataMock {
  public data: Uint8ClampedArray;
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.data = new Uint8ClampedArray(width * height * 4);
  }
}

// Add to global
(global as any).ImageData = ImageDataMock;

// Mock canvas context
const createCanvasContext = () => {
  const ctx = {
    canvas: null as any,
    clearRect: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    filter: 'none',
    putImageData: jest.fn(),
    getImageData: jest.fn(() => new ImageDataMock(1, 1)),
    createImageData: jest.fn((w: number, h: number) => new ImageDataMock(w, h)),
    // Add required properties from CanvasRenderingContext2D
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low' as ImageSmoothingQuality,
    strokeStyle: '#000',
    fillStyle: '#000',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    shadowBlur: 0,
    shadowColor: 'rgba(0,0,0,0)',
    lineWidth: 1,
    lineCap: 'butt' as CanvasLineCap,
    lineJoin: 'miter' as CanvasLineJoin,
    miterLimit: 10,
    lineDashOffset: 0,
    font: '10px sans-serif',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
    direction: 'ltr' as CanvasDirection,
    // Add required methods
    beginPath: jest.fn(),
    closePath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    bezierCurveTo: jest.fn(),
    quadraticCurveTo: jest.fn(),
    arc: jest.fn(),
    arcTo: jest.fn(),
    ellipse: jest.fn(),
    rect: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    clip: jest.fn(),
    isPointInPath: jest.fn(),
    isPointInStroke: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    setTransform: jest.fn(),
    resetTransform: jest.fn(),
    measureText: jest.fn(),
    createLinearGradient: jest.fn(),
    createRadialGradient: jest.fn(),
    createPattern: jest.fn(),
    getLineDash: jest.fn(() => []),
    setLineDash: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    getContextAttributes: jest.fn(() => ({
      alpha: true,
      desynchronized: false,
      colorSpace: 'srgb',
      willReadFrequently: false
    }))
  };
  ctx.canvas = { getContext: () => ctx };
  return ctx;
};

// Mock canvas context
(HTMLCanvasElement.prototype as any).getContext = function(contextId: string, options?: any) {
  if (contextId === '2d') {
    return createCanvasContext() as unknown as CanvasRenderingContext2D;
  }
  return null;
};

// Mock Image
class ImageMock {
  public width = 1920;
  public height = 1080;
  public onload: (() => void) | null = null;
  public onerror: ((error: Error) => void) | null = null;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // Simulate successful image load
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

(global as any).Image = ImageMock;
