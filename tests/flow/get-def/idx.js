// @flow

declare var idx: $Facebookism$Idx;

type Foo = {
  foo: ?{
    bar: string,
  }
};

function foo(x: ?Foo): ?string {
  return idx(x, _ => _.foo.bar);
}
