// @flow

enum E { // Error: enums are off
  A,
  B,
}

declare var x: E; // Error: can't resolve name `E`
