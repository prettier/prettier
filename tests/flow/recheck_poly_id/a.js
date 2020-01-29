// @flow

export type T<X> = any;
function foo(x: T<string>): T<number> { return x; }
module.exports = 0;
