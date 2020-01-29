// @flow

class A {
  m() { return this; }
}

class B extends A { }

(new A).m;
(new B).m;

const a = (new A).m();
const b = (new B).m();
