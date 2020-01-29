//@flow

//First inexact, second exact, then optional
declare var w: {...{a: number}, ...{| c: number |}, ...{| b?: number |}}; // Error
(w: null);

//First inexact, second exact, then optional
declare var x: {...{a: number}, c: number, ...{| b?: number |}}; // Error
(x: null);

// First exact, second inexact, then optional
declare var y: {...{| a: number |}, ...{a: number}, ...{| b?: number |}}; // Error
(y: null);

// 2 inexacts then optional
declare var z: {...{a: number}, ...{a: string}, ...{| b?: number |}}; // Error
(z: null);

// Let's put some slices in before the same patterns now:

//First inexact, second exact, then optional
declare var a: {...{a: number}, ...{| c: number |}, ...{| b?: number |}}; // Error
(a: null);

//First inexact, second exact, then optional
declare var b: {a: number, ...{a: number}, c: number, ...{| b?: number |}}; // Error
(b: null);

// First exact, second inexact, then optional
declare var c: {a: number, ...{| a: number |}, ...{a: number}, ...{| b?: number |}}; // Error
(c: null);

// 2 inexacts then optional
declare var d: {a: number, ...{a: number}, ...{a: string}, ...{| b?: number |}}; // Error
(d: null);

type A = {| b: number |}
type B = {d: number};

declare var x2: {a: number, ...A, c: number, ...B}; // Error
(x2: any);

type C = {a: number};
type D = {| b?: number |};

declare var y2: {...C, c: number, d: number, ...D}; // Error
(y2: any);


declare var x3: { // Error, but message could use improvement.
  ...{a: number},
  d: number,
  ...{b: number},
  e: number,
  ...{c: number},
  f: number,
};
(x3: any);

declare var x4: {...A, ...B, ...C, ...D}; // Error, representative of common case
(x4: any);

declare var x5: {foo: number, bar: number, ...B}; // Error, representative of common case
(x5: any);
