// @flow

type Foo = {
  bar: Bar
}

type Bar = {
  baz: number
}

const foo: ?Foo = {
  bar: {
    baz: 42
  }
};

foo?.bar.baz;
