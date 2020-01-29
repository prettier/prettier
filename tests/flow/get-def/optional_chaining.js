// @flow

type Foo = {
  bar: {
    baz: number
  }
}

const foo: ?Foo = {
  bar: {
    baz: 42
  }
}

const foo2: ?Foo = null;

foo?.bar.baz;
foo2?.bar.baz;
