// @flow

class Bounds<N: number, F: () => N> {
  foo: F;
  bar() {
    this.foo().
  }
}
