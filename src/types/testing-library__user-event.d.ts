declare module '@testing-library/user-event' {
  interface UserEventApi {
    click: (element: Element | Window | null) => Promise<void>;
    type: (element: Element | null, text: string, options?: { delay?: number }) => Promise<void>;
    keyboard: (text: string, options?: { delay?: number }) => Promise<void>;
    clear: (element: Element | null) => Promise<void>;
    selectOptions: (element: Element | null, values: string | string[]) => Promise<void>;
    tab: (options?: { shift?: boolean }) => Promise<void>;
    setup: (options?: { delay?: number }) => UserEventApi;
  }

  interface UserEvent {
    (options?: { delay?: number }): UserEventApi;
    setup: (options?: { delay?: number }) => UserEventApi;
  }

  const userEvent: UserEvent;
  export default userEvent;
}
