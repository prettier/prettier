// @flow

class A {
  m() {
    return this;
  }
}

function foo(x) {}
foo(new A().m);
