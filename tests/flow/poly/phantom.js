// @flow

type A = T<number>;
type B = T<string>;

declare var a: A;
(a: B); // Error

type T<Phantom> = any;

type C = T<number>;
type D = T<string>;

declare var c: C;
(c: D); // Error
