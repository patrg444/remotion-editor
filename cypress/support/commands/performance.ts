declare global {
  namespace Cypress {
    interface Chainable {
      measurePerformance(callback: () => void): Chainable<PerformanceMetrics>;
      monitorGPU(): Chainable<void>;
      checkMemoryUsage(): Chainable<MemoryMetrics>;
    }
  }
}

interface PerformanceMetrics {
  duration: number;
  frameDrops: number;
  gpuMemory?: number;
}

interface MemoryMetrics {
  jsHeapSize: number;
  totalHeapSize: number;
}

// Measure performance of an operation
Cypress.Commands.add('measurePerformance', (callback: () => void) => {
  return cy.window().then(win => {
    const startTime = performance.now();
    const startFrames = win.requestAnimationFrame(() => {});
    
    callback();
    
    return new Promise<PerformanceMetrics>(resolve => {
      // Wait for animations to settle
      setTimeout(() => {
        const endTime = performance.now();
        const endFrames = win.requestAnimationFrame(() => {});
        const frameDrops = Math.max(0, (endTime - startTime) / (1000 / 60) - (endFrames - startFrames));
        
        // Get GPU metrics if available
        let gpuMemory;
        if (win.performance && win.performance.memory) {
          gpuMemory = (win.performance as any).memory.totalJSHeapSize;
        }
        
        resolve({
          duration: endTime - startTime,
          frameDrops,
          gpuMemory
        });
      }, 1000); // Wait 1s for animations to complete
    });
  });
});

// Monitor GPU usage
Cypress.Commands.add('monitorGPU', () => {
  cy.window().then(win => {
    // Check if GPU monitoring is available
    if (!win.performance || !(win.performance as any).memory) {
      console.log('GPU monitoring not available');
      return;
    }

    // Start monitoring
    const startMemory = (win.performance as any).memory.totalJSHeapSize;
    console.log(`Initial GPU memory usage: ${startMemory / 1024 / 1024} MB`);

    // Monitor every second
    const interval = setInterval(() => {
      const currentMemory = (win.performance as any).memory.totalJSHeapSize;
      console.log(`Current GPU memory usage: ${currentMemory / 1024 / 1024} MB`);
    }, 1000);

    // Clean up after 10s
    setTimeout(() => {
      clearInterval(interval);
    }, 10000);
  });
});

// Check memory usage
Cypress.Commands.add('checkMemoryUsage', () => {
  return cy.window().then(win => {
    if (!win.performance || !(win.performance as any).memory) {
      return {
        jsHeapSize: 0,
        totalHeapSize: 0
      };
    }

    const memory = (win.performance as any).memory;
    return {
      jsHeapSize: memory.usedJSHeapSize,
      totalHeapSize: memory.totalJSHeapSize
    };
  });
});

export {};
