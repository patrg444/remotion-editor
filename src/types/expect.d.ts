/// <reference types="chai" />

declare global {
  const expect: Chai.ExpectStatic;
  namespace Chai {
    interface Assertion {
      equal(expected: any): Assertion;
      equals(expected: any): Assertion;
      eq(expected: any): Assertion;
      include(expected: any): Assertion;
      includes(expected: any): Assertion;
      contain(expected: any): Assertion;
      contains(expected: any): Assertion;
      be: Assertion;
      been: Assertion;
      is: Assertion;
      that: Assertion;
      which: Assertion;
      and: Assertion;
      has: Assertion;
      have: Assertion;
      with: Assertion;
      at: Assertion;
      of: Assertion;
      same: Assertion;
      to: Assertion;
      not: Assertion;
      deep: Assertion;
      any: Assertion;
      all: Assertion;
      a: Assertion;
      an: Assertion;
      least(expected: number): Assertion;
      most(expected: number): Assertion;
      above(expected: number): Assertion;
      below(expected: number): Assertion;
      within(start: number, finish: number): Assertion;
      instanceof(constructor: any): Assertion;
      property(name: string, value?: any): Assertion;
      ownProperty(name: string): Assertion;
      haveOwnProperty(name: string): Assertion;
      length(expected: number): Assertion;
      lengthOf(expected: number): Assertion;
      match(expected: RegExp | string): Assertion;
      matches(expected: RegExp | string): Assertion;
      string(expected: string): Assertion;
      keys(expected: string[] | { [key: string]: any }): Assertion;
      key(expected: string): Assertion;
      throw(expected?: any): Assertion;
      throws(expected?: any): Assertion;
      Throw(expected?: any): Assertion;
      respondTo(method: string): Assertion;
      itself: Assertion;
      satisfy(matcher: (value: any) => boolean): Assertion;
      satisfies(matcher: (value: any) => boolean): Assertion;
      closeTo(expected: number, delta: number): Assertion;
      approximately(expected: number, delta: number): Assertion;
      members(expected: any[]): Assertion;
      oneOf(expected: any[]): Assertion;
      change(object: any, property?: string): Assertion;
      changes(object: any, property?: string): Assertion;
      increase(object: any, property?: string): Assertion;
      increases(object: any, property?: string): Assertion;
      decrease(object: any, property?: string): Assertion;
      decreases(object: any, property?: string): Assertion;
      by(delta: number): Assertion;
    }
  }
}

export {};
