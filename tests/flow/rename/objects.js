// @flow

export type Foo = {bar: string};

function makeFoo(): Foo {
  const bar = '';
  return {bar};
}

function takeFoo(x: Foo): string {
  const {bar} = x;
  return bar;
}
