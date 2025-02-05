import { MockElectronAPI } from '../../types/electron-mock';
import { jest } from '@jest/globals';

type EventCallback = (...args: any[]) => void;
type EventMap = { [key: string]: EventCallback[] };

class ElectronMock implements MockElectronAPI {
  private events: EventMap = {};

  // @ts-ignore - Test mock
  invoke = jest.fn().mockImplementation((channel: string, ...args: any[]) => {
    if (channel === 'vosk:transcribe') {
      return Promise.resolve({
        success: true,
        transcript: [
          { text: 'hello', start: 0, end: 0.5, conf: 0.95 },
          { text: 'world', start: 0.6, end: 1.0, conf: 0.92 }
        ]
      });
    }
    return Promise.resolve();
  });
  send = jest.fn();
  on = jest.fn((...args: any[]) => {
    const [channel, callback] = args as [string, EventCallback];
    if (!this.events[channel]) {
      this.events[channel] = [];
    }
    this.events[channel].push(callback);
  });

  off = jest.fn((...args: any[]) => {
    const [channel, callback] = args as [string, EventCallback];
    if (!this.events[channel]) return;
    this.events[channel] = this.events[channel].filter(cb => cb !== callback);
  });

  // Helper method to trigger events in tests
  emit(channel: string, ...args: any[]) {
    if (!this.events[channel]) return;
    this.events[channel].forEach(callback => callback(...args));
  }

  // Clear all event listeners
  clearListeners() {
    this.events = {};
    this.on.mockClear();
    this.off.mockClear();
    this.invoke.mockClear();
    this.send.mockClear();
  }
}

export const mockElectron = new ElectronMock();

// Reset mock before each test
beforeEach(() => {
  mockElectron.clearListeners();
});
