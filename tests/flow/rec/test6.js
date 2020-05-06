// @flow

interface FooOld {
  m1(): FooOld;
  m2(): FooOld;
  m3(): FooOld;
  m4(): FooOld;
}

interface Foo<K> {
  m1(): Foo<K>,
  m2(): Foo<K>,
  m3(): Foo<K>,
  m4(): Foo<K>,
}

function foo(x: Foo<any>): FooOld {
  return x;
}
