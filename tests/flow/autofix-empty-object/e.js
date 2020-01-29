// @flow

const obj = {};
declare function foo(x: { a: number }): void;
foo(obj);
module.exports = obj;
