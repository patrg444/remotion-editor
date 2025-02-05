declare module '@testing-library/react-hooks' {
  import { ReactElement } from 'react';

  export interface RenderHookResult<TProps, TResult> {
    result: {
      current: TResult;
      error?: Error;
    };
    rerender: (props?: TProps) => void;
    unmount: () => void;
    waitForNextUpdate: (options?: { timeout?: number }) => Promise<void>;
    waitForValueToChange: (selector: () => any, options?: { timeout?: number }) => Promise<void>;
  }

  export interface RenderHookOptions<TProps> {
    initialProps?: TProps;
    wrapper?: React.ComponentType<any>;
  }

  export function renderHook<TProps, TResult>(
    callback: (props: TProps) => TResult,
    options?: RenderHookOptions<TProps>
  ): RenderHookResult<TProps, TResult>;

  export function act(callback: () => void | Promise<void>): Promise<void>;
}
