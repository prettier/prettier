// @flow

class Base { }

class A<X: Base> {
  x: X;
  m() {}
}

class B<X: Base> extends A<X> {
  constructor() {
    super(); // TODO
  }

  m() {
    this.x;
    super.m();
  }
}
