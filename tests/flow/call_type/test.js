// @flow

type Fn0 = () => number;
type Fn1 = <T>(T) => T;
type Fn2 = <A, B>(A, B) => A | B;

type A = $Call; // Error: one or more arguments are required.
type B = $Call<>; // Error: one or more arguments are required.

type C = $Call<Fn0>;
declare var c: C;
(42: C); // OK
((null: mixed): C); // Error: mixed ~> number
(c: number); // OK
(c: empty); // Error: number ~> empty

type D = $Call<Fn1>;
declare var d: D;
(42: D); // Error: number ~> undefined

type E = $Call<Fn1, number>;
declare var e: E;
(42: E); // OK
((null: mixed): E); // Error: mixed ~> number
(e: number); // OK
(e: empty); // Error: number ~> empty

type F = $Call<Fn1, number, string>;
declare var f: F;
(42: F); // OK
((null: mixed): F); // Error: mixed ~> number
(f: number); // OK
(f: empty); // Error: number ~> empty

type G = $Call<Fn2, number, string>;
declare var g: G;
(42: G); // OK
((null: mixed): G); // Error: mixed ~> number | string
(g: number); // Error: number | string ~> number
(g: number | string); // OK
(g: empty); // Error: number | string ~> empty
