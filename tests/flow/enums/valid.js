// @flow

enum E {
  A,
  B,
}

const a: E = E.A;

// Use an enum name as a type before its declaration
declare var x: E2;
enum E2 {}
