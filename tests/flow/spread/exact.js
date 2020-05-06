// @flow

type Foo = {|
  bar: string,
  baz: number,
|};

const foo = {bar: 'hello', baz: 123};
const other = {bar: 'wat'}

const spread: Foo = {...foo, ...other};

const foo_inexact: { baz: number } = { bar: 42, baz: 123 };
const spread_inexact_first: Foo = {...foo_inexact, ...other}; // not OK
const spread_inexact_second: Foo = {...other, ...foo_inexact}; // not OK
