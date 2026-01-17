// Test ambient declarations in declare namespace blocks
declare namespace MyNamespace {
  // Implicit ambient variables (without 'declare' keyword)
  const value: number;
  let mutableValue: string;

  // Implicit ambient functions (without 'declare' keyword)
  function helper(x: string): number;

  // Explicit 'declare' keyword still works
  declare function explicitHelper(x: string): number;
  declare class Helper {
    method(): void;
  }

  // Type declarations still work
  type MyType = string;
  interface MyInterface {
    prop: number;
  }
}

export {MyNamespace}
