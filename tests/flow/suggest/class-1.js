// @flow

class A {
  f = 1;
  m() { return "a"; }
}

var a = new A;
function foo(x) { return x; }
foo(A);
