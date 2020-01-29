// @flow

const a = require('./cycleA');

export function foo(x: number) { return x; } // error when force-checking cycleA.js
