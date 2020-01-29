// @flow

enum E {
  A,
  B,
}

///////////
// Valid //
///////////
const a: void | E = E.cast('A');
const b: Iterable<E> = E.members();
const c: boolean = E.isValid('A');

const cast: (string) => void | E = E.cast;
const members: () => Iterable<E> = E.members;
const isValid: (string) => boolean = E.isValid;

////////////
// Errors //
////////////
// Cannot get non-existent method
E.nonExistent; // Error

// Cannot call non-existent method
E.nonExistent(); // Error

// Computed access not allowed
E['members'](); // Error

// Attempt calling an enum member
E.A(); // Error

// Object.prototype is not in the prototype chain
E.toString(); // Error
