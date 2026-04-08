// Test implicit declare function (function without 'declare' keyword in ambient context)
declare namespace ImplicitFunctions {
  // Simple implicit declare functions
  function greet(name: string): string;
  function add(a: number, b: number): number;

  // Explicit declare function still works
  declare function explicitHelper(): void;
}

export {ImplicitFunctions};
