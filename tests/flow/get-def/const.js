// @flow

const foo = 123;

{
  const foo = 'abc';
  foo;
}

foo;
