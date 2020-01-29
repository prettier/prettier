// @flow

class A<T> {
  static m() {}
}

class B<T> extends A<T> {
  static m(): Class<B<T>> {
    (this: Class<A<T>>);
    (this: Class<B<T>>);
    super.m();
    return this;
  }
}

var bCtor = B.m();
var b = new bCtor;
