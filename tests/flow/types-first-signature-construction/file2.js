// @flow

// The exported signature should be: (number) => number
declare function foo(x: number): number;
function foo(x: string): string { return ""; }

module.exports = foo;
