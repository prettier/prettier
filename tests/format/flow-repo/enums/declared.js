// @flow

declare enum E {
  A,
  B,
}

(E.A: E); // OK
(E.A: empty); // ERROR

declare export enum F {
  N,
  M,
}

(F.N: F); // OK
(F.N: empty); // ERROR
