// @flow

function foo1(x: {||}): {p?: number} { return x; } // error, p must be read-only
function foo2(x: {||}): {+p?: number} { return x; } // OK
function foo3(x: {|__proto__: { p: string}|}): {+p?: number} { return x; } // error, type incompatibility
function foo4(x: {|__proto__: { p: number}|}): {+p?: number} { return x; } // OK
function foo5(x: {|__proto__: { p?: number}|}): {+p?: number} { return x; } // OK
