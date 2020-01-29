// @flow

class C { }
function foo(x: mixed) {
  if (x instanceof C) {
    (x: number);
  }
}

class A { }
class B extends A { }
function bar(x: mixed) {
  if (x instanceof B) {
    (x: A);
  }
}

class PA<+X> { }
class PB<X> extends PA<X> { }
function baz(x: mixed) {
  if (x instanceof PB) {
    (x: PA<any>);
  }
}

function qux_readonlyarray(x: mixed) {
  if (x instanceof Array) {
    (x: $ReadOnlyArray<any>);
  }
}

function qux_array(x: mixed) {
  if (x instanceof Array) {
    (x: Array<any>);
  }
}

function qux_object(x: mixed) {
  if (x instanceof Object) {
    x.p;
  }
}

function qux_function(x: mixed) {
  if (x instanceof Function) {
    x();
  }
}
