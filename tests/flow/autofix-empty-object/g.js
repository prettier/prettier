// @flow

declare function foo<X: { a: 1 }>(x: X): void;

const obj = {};
foo(obj);
module.exports = obj;
