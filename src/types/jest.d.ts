/// <reference types="jest" />
/// <reference types="chai" />

declare global {
  export namespace Chai {
    interface Assertion {
      toBe(expected: any): Assertion;
      toBeGreaterThanOrEqual(expected: number): Assertion;
      toBeLessThanOrEqual(expected: number): Assertion;
      toContain(expected: any): Assertion;
      contain(expected: any): Assertion;
      toEqual(expected: any): Assertion;
      toBeDefined(): Assertion;
      toBeUndefined(): Assertion;
      toBeNull(): Assertion;
      toBeTruthy(): Assertion;
      toBeFalsy(): Assertion;
      toBeGreaterThan(expected: number): Assertion;
      toBeLessThan(expected: number): Assertion;
      toMatch(expected: string | RegExp): Assertion;
      toHaveLength(expected: number): Assertion;
      toHaveProperty(path: string, value?: any): Assertion;
      toThrow(expected?: string | Error | RegExp): Assertion;
      toThrowError(expected?: string | Error | RegExp): Assertion;
    }
  }

  namespace jest {
    interface Matchers<R, T = any> extends Chai.Assertion {}
  }
}

export {};
