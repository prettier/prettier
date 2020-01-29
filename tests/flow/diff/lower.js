// @flow

type Person = {
  name: string,
  age: number,
  height: {
    feet: number,
    inches: number,
  },
};

type Aged = {
  age: number,
};

type PersonWithoutAgeActual = $Diff<Person, Aged>;

declare var y: PersonWithoutAgeActual;

// ERRORS:
(y.age: number); // Error -- could be void
(y.name: number); // Error -- should be string
y.bla; // Error -- key not found.
