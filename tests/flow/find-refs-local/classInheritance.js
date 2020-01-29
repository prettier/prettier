// @flow

class A {
  static bar = 1;
  bar(): void { }
}

class B extends A { }

class C1 extends B {
  bar(): void { }
}

class C2 extends B {
  bar(): void {
    super.bar();
  }
}

new A().bar();
new B().bar();
new C1().bar();
new C2().bar();

class Foo<T> {
  bar(): void { }
}
new Foo().bar();

// Even though this is a `C1` instance at runtime, and so it calls `C1`'s `bar` implementation, it
// is typed as an `A` instance so other uses of `C1`'s `bar` are not returned.
(new C1(): A).bar();

class HasNoBar { }
// $FlowFixMe
new HasNoBar().bar();

A.bar;
B.bar;
