// @flow

function foo() {
  const x: {a?: {b: $ReadOnlyArray<{c: number}>}} = {};
  const y = x.a?.b;
  type T = $ElementType<typeof y, 0>;
}
