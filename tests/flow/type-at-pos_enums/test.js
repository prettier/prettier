// @flow

enum E {A, B}
//   ^

const x = E.A;
//        ^

const y = E.A;
//          ^

type T = Class<E>;
//   ^
