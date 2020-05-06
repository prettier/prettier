// @flow

declare class A {
  m(): this;
}

declare class B extends A { }

(new A).m;
(new B).m;
