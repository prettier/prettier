/* @flow */

class A {}
class B extends A {}
class C extends B {}

declare var a: A;
declare var b: B;
declare var c: C;

class Base {
  x: B;
  +pos: B;
  -neg: B;
  get get(): B { return this.x };
  set set(value: B): void { this.x = value };
  get getset(): B { return this.x };
  set getset(value: B): void { this.x = value };
}

export {A, B, C, Base}
