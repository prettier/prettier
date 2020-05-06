// @flow

enum E {
  A,
  B,
}

// Error: accessing non-existent member
const x = E.C;
// As it is the result of an error, `x` is `any`
(x: boolean);

// Error: computed access
E["A"];

enum F {
  Cart,
  Bart,
  Foobar,
}

F.Car; // Error: suggest `Cart`
F.Foobr; // Error: suggest `Foobar`
F.Bar; // Error: suggest `Bart`
F.X; // Error: no suggestion
