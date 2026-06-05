type O = {foo: number, bar?: string};

// -? removes optionality from optional props
type Required1 = {[K in keyof O]-?: O[K]};
declare const r1: Required1;
r1 as {foo: number, bar: string}; // OK
({foo: 1}) as Required1; // ERROR - bar is required

// -? on already-required props is a no-op
type AllRequired = {foo: number, bar: string};
type Same = {[K in keyof AllRequired]-?: AllRequired[K]};
declare const s: Same;
s as AllRequired; // OK

// Mimic Required<T> utility
type MyRequired<T> = {[K in keyof T]-?: T[K]};
type X = MyRequired<{a?: number, b?: string, c: boolean}>;
declare const x: X;
x as {a: number, b: string, c: boolean}; // OK
({a: 1, c: true}) as X; // ERROR - b is required

// Tuple input: -? clears per-element optional bit
type T = [a: string, b?: number, c?: boolean];
type U = {[K in keyof T]-?: T[K]};
declare const u: U;
u as [string, number, boolean]; // OK
(['']) as U; // ERROR - elements 1 and 2 are required

// Nested: -? then +? roundtrip
type RoundTrip<O> = {[K in keyof MyRequired<O>]+?: MyRequired<O>[K]};
type Y = RoundTrip<{a?: number}>;
declare const y: Y;
y as {a?: number}; // OK

// Required-prop with explicit `void` in the value type: -? does NOT strip void,
// since the source property was not optional. Matches TS.
type ReqWithVoid = {a: string | void};
type ReqWithVoidR = MyRequired<ReqWithVoid>;
declare const rwv: ReqWithVoidR;
rwv.a as string | void; // OK
rwv.a as string; // ERROR - void survives because source prop was not optional

// Required tuple element with `void` in the value type: -? does NOT strip void.
type ReqTupleWithVoid = [string | void];
type ReqTupleWithVoidR = {[K in keyof ReqTupleWithVoid]-?: ReqTupleWithVoid[K]};
declare const rtv: ReqTupleWithVoidR;
rtv[0] as string | void; // OK
rtv[0] as string; // ERROR - void survives

// Plain Array element with `void`: -? DOES strip void from the array element type.
// TS: R<Array<string | undefined>> = Array<string>.
type ArrWithVoid = Array<string | void>;
type ArrWithVoidR = {[K in keyof ArrWithVoid]-?: ArrWithVoid[K]};
declare const arr: ArrWithVoidR;
arr as Array<string>; // OK - undefined stripped from array element
declare const a1: Array<string | void>;
a1 as ArrWithVoidR; // ERROR - void no longer accepted

// Tuple-wide elem_t: under -? the tuple-wide element type should no longer contain
// `void` contributed by originally-optional elements. Verified via computed
// numeric access (which reads elem_t, not the per-index element list).
type TWide = [a: string, b?: number, c?: boolean];
type UWide = {[K in keyof TWide]-?: TWide[K]};
declare const uWide: UWide;
declare const idx: number;
uWide[idx] as string | number | boolean; // OK - void filtered from elem_t
uWide.forEach((x) => { x as string | number | boolean; }); // OK - callback param uses elem_t
