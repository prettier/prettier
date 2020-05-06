//@flow
type A = {| foo: number |} | {| bar: number |};

// Just having two spreads is not enough due to how spread_ids
// are assigned. A union Flowing to an EvalT pushes the EvalT down
// into the members of the union instead to avoid issues with speculation.
// Because of that, each member of the union becomes its own "spread computation"
// with its own spread_id.
declare var a: {...A, ...A, ...{| baz: number |}} // Error
(a: null);

var x = {};
// Wrapping the last type in something that isn't an explicit union
// type is usually enough to trigger the error on just two spread
// operands.
declare var b: {...A, ...$ElementType<typeof x, 'a'>}; // Error

// Error, since the bounds come in separately instead of as a union, we end up
// computing one of the types before we realize the exponential blowup.
(b: null);

if (true) {
  x.a = null;
} else if (false) {
  x.a = {baz: 3}
} else {
  x.a = {qux: 3}
}

declare function Poly<T, U>(): {| ...T, ...U, ...{| baz: number|} |};

var c = Poly<A,A>();

// Distinct calls to a polymorphic function do not use the same
// spread_id . Using a different function here because
// if we continued to use Poly and this invariant broke then this
// test would still pass.
declare function Poly2<T, U>(): {| ...T, ...U, ...{| baz: number |} |};

var d = Poly2<{||}, {||}>();
var e = Poly2<{| foo: number |}, {| foo: number |}>();
var f = Poly2<{| bar: number |}, {| bar: number |}>();

declare var g: {...A, foo: number, bar: number, ...A, baz: number, ...A, qux: number}; // Error
(g: null);


declare var h: {...{| foo: number |} | {| bar: number |}, ...{| foo: number |} | {| bar: number |}, ...{| baz: number |}}; // Error
(h: null);

declare function poly<T>(x: T, y: T): {...T, ...T, ...T, ...T, ...T};

const i = poly({foo: 3}, {bar: 3}); // Error, T has multiple lower bounds


// Union error messages should point to the unions!
type U = {| foo: 3 |} | {| bar: 3 |};
declare var j: {...U, ...U, ...U};
(j: any);

declare var k: {...U, ...U, ...U, ...U, ...U, ...U, ...U};
(k: any);

declare function poly2<T, U>(x: T, y: U, z: T): {...T, ...U, ...U};
// Note the bad error message-- this is because ObjectWiden splits the union into its members
const l = poly2({foo: 3}, ({foo: 3}: U), {bar: 3}); // Error two unions

export type State = 
  | {|
    |}
  | {|
    |}
;

type M = {| ...$Exact<{||}>, ...$Exact<State> |}; // No error, one union
declare var m: M;
(m: any);

// Notice in this error message that we get an inferred union. That's because
// ExactT does not distribute through unions.
type N = {| ...$Exact<State>, ...$Exact<{||}>, ...$Exact<State> |}; // Error, two unions
declare var n: N;
(n: any);
