// @flow

function f(x:number) {
  if (x == 0) return "foo"
  else return {x:f(x-1)}
};
