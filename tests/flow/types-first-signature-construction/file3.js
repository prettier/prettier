// @flow

// The exported signature should be:
// (number) => number & (boolean) => boolean
declare function foo(x: number): number;
function foo(x: string): string { return ""; }
declare function foo(x: boolean): boolean;

module.exports = foo;
