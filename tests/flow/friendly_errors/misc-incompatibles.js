/**
 * @format
 * @flow
 */

const Y = 42;
// prettier-ignore
declare class X mixins Y {}

type A = number;
interface B extends A {}

declare var o: {};
o[true];
o[true] = 42;

[nope] += 1;
