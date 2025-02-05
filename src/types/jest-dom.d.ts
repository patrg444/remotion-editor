import '@testing-library/jest-dom';

import '@testing-library/jest-dom/extend-expect';

declare global {
  namespace jest {
    interface Matchers<R, T = any> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeEnabled(): R;
      toBeDisabled(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveStyle(css: Record<string, any>): R;
      toBeDefined(): R;
      toHaveValue(value?: string | string[] | number): R;
      toBeVisible(): R;
      toBeChecked(): R;
      toHaveLength(length: number): R;
    }
  }
}

declare module '@testing-library/jest-dom' {
  export {};
}

declare global {
  interface Window {
    electron: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, listener: (...args: any[]) => void) => void;
      off: (channel: string, listener: (...args: any[]) => void) => void;
    };
  }
}
