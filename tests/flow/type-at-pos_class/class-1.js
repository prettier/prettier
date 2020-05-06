// @flow

class A {
  m() { }
}

class B extends A {
  m() { return 1; }
  constructor() {
    super();
  }
}
