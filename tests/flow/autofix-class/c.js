// @flow

class A {
  f = (x: string) => x;
}

module.exports = {
  a: A,
  b: (x: string) => x,
};
