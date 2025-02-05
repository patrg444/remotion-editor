// Track memory usage across all textures
let totalMemoryUsage = 0;
const DEFAULT_IMAGE_SIZE = 100;

export function setupImageMock() {
  const originalImage = (global as any).Image;
  const mockImage = class {
    onload: () => void = () => {};
    onerror: () => void = () => {};
    src: string = '';
    width: number = 0;
    height: number = 0;

    constructor() {
      // Use Promise.resolve().then() instead of setTimeout
      Promise.resolve().then(() => {
        if (this.src.includes && this.src.includes('invalid-url')) {
          this.onerror();
          return;
        }

        // Handle dimensions
        if (typeof this.src === 'string') {
          // Extract dimensions from data URL if present
          const match = this.src.match(/size=(\d+)x(\d+)/);
          if (match) {
            this.width = parseInt(match[1], 10);
            this.height = parseInt(match[2], 10);
          } else {
            this.width = DEFAULT_IMAGE_SIZE;
            this.height = DEFAULT_IMAGE_SIZE;
          }
        } else {
          // For ImageData case, use its dimensions
          this.width = 2;  // Fixed size for test ImageData
          this.height = 2;
          // Convert ImageData to data URL
          this.src = 'data:image/png;base64,test';
        }
        
        // Simulate memory allocation (4 bytes per pixel for RGBA)
        const memoryUsage = this.width * this.height * 4;
        totalMemoryUsage += memoryUsage;
        
        this.onload();
      });
    }

    dispose() {
      // Simulate memory deallocation
      const memoryUsage = this.width * this.height * 4;
      totalMemoryUsage -= memoryUsage;
    }
  };

  (global as any).Image = mockImage;
  totalMemoryUsage = 0; // Reset memory usage

  return () => {
    (global as any).Image = originalImage;
    totalMemoryUsage = 0;
  };
}

export function createTestImageData(width: number, height: number): ImageData {
  // Create a canvas to generate valid ImageData
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  // Fill with red pixels
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

export function createTestDataUrl(): string {
  return 'data:image/png;base64,test';
}

interface MockCanvasContext {
  putImageData: jest.Mock<void, [ImageData, ...number[]]>;
  getImageData: jest.Mock<ImageData, [number, number, number, number]>;
  canvas: {
    width: number;
    height: number;
    toDataURL: jest.Mock<string, [string?, number?]>;
  };
  fillStyle: string;
  fillRect: jest.Mock<void, [number, number, number, number]>;
  drawImage: jest.Mock;
  _imageData: ImageData | null;
}

export function createMockCanvasContext(): MockCanvasContext {
  const mockContext: MockCanvasContext = {
    putImageData: jest.fn((imageData: ImageData) => {
      // Simulate memory usage for canvas operations
      const memoryUsage = imageData.width * imageData.height * 4;
      totalMemoryUsage += memoryUsage;
      mockContext.canvas.width = imageData.width;
      mockContext.canvas.height = imageData.height;
      mockContext._imageData = imageData;
    }),
    getImageData: jest.fn((x: number, y: number, width: number, height: number) => {
      if (mockContext._imageData) {
        return mockContext._imageData;
      }
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;     // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // A
      }
      const imageData = new ImageData(data, width, height);
      mockContext._imageData = imageData;
      return imageData;
    }),
    canvas: {
      width: 0,
      height: 0,
      toDataURL: jest.fn((type?: string, quality?: number) => {
        return `data:image/png;base64,test;size=${mockContext.canvas.width}x${mockContext.canvas.height}`;
      }),
    },
    fillStyle: 'black',
    fillRect: jest.fn((x: number, y: number, width: number, height: number) => {
      mockContext.canvas.width = width;
      mockContext.canvas.height = height;
      // Fill with red pixels
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255;     // R
        data[i + 1] = 0;   // G
        data[i + 2] = 0;   // B
        data[i + 3] = 255; // A
      }
      mockContext._imageData = new ImageData(data, width, height);
    }),
    drawImage: jest.fn(),
    _imageData: null as ImageData | null,
  };

  return mockContext;
}

// Helper function to get current memory usage
export function getCurrentMemoryUsage(): number {
  return totalMemoryUsage;
}

// Helper function to simulate memory pressure
export function simulateMemoryPressure(pressure: 'low' | 'medium' | 'high'): void {
  const baseMemory = TEST_TEXTURE_SIZE * TEST_TEXTURE_SIZE * 4; // Base memory for one texture
  switch (pressure) {
    case 'low':
      totalMemoryUsage = baseMemory * 0.3; // 30% usage
      break;
    case 'medium':
      totalMemoryUsage = baseMemory * 0.6; // 60% usage
      break;
    case 'high':
      totalMemoryUsage = baseMemory * 0.9; // 90% usage
      break;
  }
}

// Constants for testing
export const TEST_TEXTURE_SIZE = 128; // Smaller texture size for testing

export async function flushPromises() {
  return Promise.resolve();
}
