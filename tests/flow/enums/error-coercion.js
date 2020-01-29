// @flow

enum E {
  A,
  B,
}

// Error: cannot implicitly coerce enum to its representation type
const a: string = E.A;

// Error: cannot implicitly coerce into enum type
const b: E = 'B';
