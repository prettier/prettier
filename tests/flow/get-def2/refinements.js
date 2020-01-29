// @flow

type Foo = {
  kind: 'asdf',
} | {
  kind: 'jkl;',
}

function foo(x: Foo): void {
  if (x.kind === 'jkl;') {}
  if (x.kind) {}
}
