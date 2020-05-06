// @flow

type MyObject = {
  foo: number,
  bar: boolean,
  baz: string,
};

function f(x: MyObject) {
  return x;
};

f({foo:1, bar:true, baz:"baz"});
