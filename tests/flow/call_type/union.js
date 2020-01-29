// @flow

type A = $Call<(() => number) | (() => string)>;
declare var a: A;
(42: A); // OK
((null: mixed): A); // Error: mixed ~> number | string
(a: number); // Error: number | string ~> number
(a: number | string); // OK
(a: empty); // Error: number | string ~> empty

type B = $Call<(<T>(T) => T) | (<T>(any, T) => T), number, string>;
declare var b: B;
(42: B); // OK
((null: mixed): B); // Error: mixed ~> number | string
(b: number); // Error: number | string ~> number
(b: number | string); // OK
(b: empty); // Error: number | string ~> empty

type C = $Call<<T>(T) => T, number | string>;
declare var c: C;
(42: C); // OK
((null: mixed): C); // Error: mixed ~> number | string
(c: number); // Error: number | string ~> number
(c: number | string); // OK
(c: empty); // Error: number | string ~> empty
