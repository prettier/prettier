// @flow

import * as Lib from './lib';

class C {}
C = 1; // error in types-first, cannot reassign exported class

function foo() {}
foo = 1; // error in types-first, cannot reassign exported function

let x: number | string = "";
x = 1; // okay in both modes

function bar() {}
bar = 1; // okay, bar is not exported

Lib.baz = 1; // error in both modes, baz is not writable

declare function bak(): void;
bak = 1; // error in both modes

function d() {}
if (0 < 1) {
  function d() {} // additional entry in the exported locals map
}
d = 1; // error in types-first

function e() {}
const eObj = { e };
e = 1; // error in types-first, exported via eObj

function f() {}
export type F = $Call<<V>(() => V) => V, typeof f>;
f = 1; // error in types-first, exported via type F

function g() {}
type G = $Call<<V>(() => V) => V, typeof g>;
g = 1; // okay, G is not exported

module.exports = { C, foo, x, d, eObj };
