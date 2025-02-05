/// <reference types="@testing-library/jest-dom" />
/// <reference types="chai" />

declare global {
  namespace Chai {
    interface Assertion {
      // DOM Testing Library matchers
      toBeInTheDocument(): Assertion;
      toBeVisible(): Assertion;
      toBeEmpty(): Assertion;
      toBeEmptyDOMElement(): Assertion;
      toBeInvalid(): Assertion;
      toBeRequired(): Assertion;
      toBeValid(): Assertion;
      toBeDisabled(): Assertion;
      toBeEnabled(): Assertion;
      toBePartiallyChecked(): Assertion;
      toBeChecked(): Assertion;
      toBeHidden(): Assertion;
      toHaveAccessibleDescription(description?: string | RegExp): Assertion;
      toHaveAccessibleName(name?: string | RegExp): Assertion;
      toHaveAttribute(attr: string, value?: any): Assertion;
      toHaveClass(...classNames: string[]): Assertion;
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): Assertion;
      toHaveFocus(): Assertion;
      toHaveFormValues(values: { [key: string]: any }): Assertion;
      toHaveStyle(css: Record<string, any>): Assertion;
      toHaveTextContent(text: string | RegExp, options?: { normalizeWhitespace: boolean }): Assertion;
      toHaveValue(value?: string | string[] | number): Assertion;
      toHaveErrorMessage(text?: string | RegExp): Assertion;
      toContainElement(element: HTMLElement | null): Assertion;
      toContainHTML(html: string): Assertion;
      toBeInTheDOM(): Assertion;
    }
  }
}

declare module '@testing-library/jest-dom' {
  export {};
}
