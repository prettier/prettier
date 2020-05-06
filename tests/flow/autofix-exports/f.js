// @flow

declare var cond : bool

const foo = 42;
let foo2 = foo;
function bar(x): number {
  return x + x
};
bar(foo2);
bar(foo);

module.exports = [{
  f1: () => (cond ? "0" : "1"),
  f2: () => (cond ? "A0" : "A1"),
  f3: () => (cond ? "Aa" : "Bb"),
  f4: () => (cond ? "A_" : "B_"),
},
 () => "string",
 bar,
 foo2,
 bar(foo2)]
