import { Mock } from 'jest-mock';

export interface MockElectronAPI {
  invoke: Mock & { mockImplementation: (fn: any) => any };
  send: Mock & { mockImplementation: (fn: any) => any };
  on: Mock & { mockImplementation: (fn: any) => any };
  off: Mock & { mockImplementation: (fn: any) => any };
  emit?: (channel: string, ...args: any[]) => void;
}
