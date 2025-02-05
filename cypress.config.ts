import { defineConfig } from 'cypress';
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8083',
    specPattern: 'cypress/integration/**/*.spec.ts',
    supportFile: 'cypress/support/e2e.ts',
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 30000,
    pageLoadTimeout: 30000,
    requestTimeout: 30000,
    responseTimeout: 30000,
    viewportWidth: 1000,
    viewportHeight: 660,
    retries: {
      runMode: 0,
      openMode: 0
    },
    env: {
      coverage: false,
      testVideo: path.join(__dirname, 'public', 'test.mp4'),
      testAudio: path.join(__dirname, 'test-assets', 'test.wav')
    },
    setupNodeEvents(on, config) {
      // Configure task events
      on('task', {
        // Mock file operations
        validateFile() {
          return true;
        },
        processFile(file: File) {
          return {
            id: '1',
            name: file.name,
            type: file.type,
            path: file.type.startsWith('video/') ? config.env.testVideo : config.env.testAudio,
            duration: 1,
            metadata: {
              duration: 1,
              width: 320,
              height: 240,
              fps: 30,
              frames: 30
            },
            originalDuration: 1,
            initialDuration: 1,
            maxDuration: 1
          };
        },
        // Initialize state
        initializeState() {
          console.log('[Test] Initializing test state...');
          const state = {
            timelineState: {
              tracks: [],
              currentTime: 0,
              isPlaying: false,
              isDragging: false,
              selectedClipIds: [],
              selectedCaptionIds: [],
              markers: [],
              playheadTime: 0,
              duration: 0,
              fps: 30,
              zoom: 1,
              scrollX: 0,
              scrollY: 0,
              scrollLeft: 0,
              aspectRatio: '16:9',
              history: {
                entries: [],
                currentIndex: -1
              },
              error: null,
              dragStartX: null,
              dragStartY: null,
              dispatch: null
            },
            mediaBinContext: {
              items: [],
              selectedItem: null,
              addItems: null,
              removeItem: null,
              selectItem: null
            }
          };
          console.log('[Test] State initialized');
          return state;
        }
      });

      // Configure browser behavior
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome' && browser.isHeadless) {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          // Reduce logging
          launchOptions.args.push('--silent');
          launchOptions.args.push('--log-level=3');
          // Optimize for testing
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--disable-extensions');
          launchOptions.args.push('--disable-component-extensions-with-background-pages');
        }
        return launchOptions;
      });

      // Filter console logs
      on('before:run', () => {
        // Clear console before each run
        console.clear();
        console.log('[Test] Starting test run...');
      });

      on('task', {
        log(message) {
          // Log important state changes and errors
          if (message.level === 'error') {
            console.error(`[Error] ${message.text}`);
          } else if (message.level === 'warn') {
            console.warn(`[Warning] ${message.text}`);
          } else if (message.level === 'info' && message.category === 'state') {
            console.log(`[State] ${message.text}`);
          } else if (message.level === 'info' && message.category === 'mount') {
            console.log(`[Mount] ${message.text}`);
          }
          return null;
        }
      });

      return {
        ...config,
        // Configure reporter for cleaner output
        reporter: 'spec',
        reporterOptions: {
          toConsole: true,
          preserveSpecsDir: true
        },
        chromeWebSecurity: false,
        watchForFileChanges: false
      };
    }
  }
});
