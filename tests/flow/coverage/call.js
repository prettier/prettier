// @flow

function f(x: any) {
  x();
  const y = x();
}

function g(x: () => any) {
  x();
  const y = x();
}
