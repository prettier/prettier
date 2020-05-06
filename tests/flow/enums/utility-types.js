// @flow

enum E {
  A,
  B,
}

const trigger = null;

// $PropertyType
(E.A: $PropertyType<typeof E, 'A'>); // OK
(trigger: $PropertyType<typeof E, 'X'>); // Error: `X` is not a member of enum `E`

// $ElementType
(trigger: $ElementType<typeof E, string>); // Error: computed access is not allowed on enums

// $Diff
(trigger: $Diff<typeof E, {A: E}>); // Error: enum  `E` is not an object

// $ReadOnly
(trigger: $ReadOnly<typeof E>); // Error: enum `E` is not an object

// $Keys
("A": $Keys<typeof E>); // Error: TODO: improve error

// $Values
(trigger: $Values<typeof E>); // Error: enum `E` is not an object

// $Exact
(E: $Exact<typeof E>); // Error: TODO: improve error

// $Rest
(trigger: $Rest<typeof E, {A: E}>); // Error: enum  `E` is not an object

// $ObjMap
(trigger: $ObjMap<typeof E, <T>(T) => [T]>); // Error: enum `E` is not a valid arg to $ObjMap

// $ObjMapi
(trigger: $ObjMapi<typeof E, <K, V>(K, V) => [K, V]>); // Error: enum `E` is not a valid arg to $ObjMapi
