// @flow

export class A<T> {
  x: T;
  m() { return this.x; }
}

declare var a: A<number>;
var x = a.m();
