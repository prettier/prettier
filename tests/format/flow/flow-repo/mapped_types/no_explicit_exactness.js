// Homomorphic mapped types cannot be explicitly exact or inexact. They take on
// the exactness of their input type


type O = {foo: number};

type MappedExact = {| // ERROR
  [key in keyof O]: number
|}

type MappedInexact = { // ERROR
  [key in keyof O]: number,
  ...
}
