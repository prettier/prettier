// @flow

class A {
  static m() {}
}

class B extends A {
  static m() {
    (this: Class<A>);
    (this: Class<B>);
    super.m();
    return this;
  }
}

var bCtor = B.m();
var b = new bCtor;

class C {
  static +y: this;
}
