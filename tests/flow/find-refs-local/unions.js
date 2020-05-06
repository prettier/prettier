// @flow

class SuperClass {
  bar: string;
}
class BarClass extends SuperClass {
  bar: string;
}

type Foo = {bar: string} | {bar: number} | any;

type Bar = Foo | {baz: number} | BarClass;

type Baz = Bar | {bar: string, baz: number} | Object;

function f(x: Baz) {
  if (x.bar) {
  };
}

new BarClass().bar;
