// @flow

declare class A {}

type AOrString = A | string;

declare var C: Class<string>;
class B extends C {}

function invariant(x) {}

function foo(value: AOrString) {
  invariant(value instanceof B);
}
