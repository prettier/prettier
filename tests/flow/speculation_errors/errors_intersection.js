/**
 * @format
 * @flow
 */

declare var any: any;
declare opaque type A;
declare opaque type B;
declare opaque type C;
declare opaque type D;

// Error: Group should list three errors in the order: `b`, `a`, `c`
((any: {+b: boolean, +a: boolean, +c: boolean}): {+b: 2, +a: 1, +c: 3});

// Error: Group should list three errors in the order: `a`, `b`, `c`
((any: {
  +b: boolean & string,
  +a: boolean & string,
  +c: boolean & string,
}): {+b: 2, +a: 1, +c: 3});

// Error: Group should list three errors in the order: `a`, `b`, `c`
((any: {+b: boolean, +a: boolean & string, +c: boolean}): {
  +b: 2,
  +a: 1,
  +c: 3,
});

// Error: Group should list three errors in the order: `b`, `a`, `c`
((any: {+b: boolean & string, +a: boolean, +c: boolean}): {
  +b: 2,
  +a: 1,
  +c: 3,
});

// Error: Group should list three errors in the order: `c`, `b`, `a`
((any: {+b: boolean, +a: boolean, +c: boolean & string}): {
  +b: 2,
  +a: 1,
  +c: 3,
});

// Error: number ~> boolean
((any: {+a: {+b: boolean}}): {+a: {+b: 42}});

// Error: number ~> boolean. Because of union error scoring we should only see
// one error.
((any: {+a: boolean & {+b: boolean & {}}}): {+a: {+b: 42}});

((any: boolean): 42); // Error: number ~> boolean
((any: {} & {} & {} & boolean): 42); // Error: number ~> boolean
((any: {} & ({} & ({} & boolean))): 42); // Error: number ~> boolean

((any: number & string): true); // Error
((any: number & string & {}): true); // Error: should not show the {} branch
((any: {} & number & string): true); // Error: should not show the {} branch
((any: number & {} & string): true); // Error: should not show the {} branch

((any: {+a: number & string}): {+a: true}); // Error

((any: {
  +a: number & string,
  +b: {} & number & string,
  +c: number & {} & string,
  +d: number & string & {},
}): {
  +a: true, // Error: should be grouped
  +b: true, // Error: should be grouped, should not show the {} branch
  +c: true, // Error: should be grouped, should not show the {} branch
  +d: true, // Error: should be grouped, should not show the {} branch
});

// Demonstrates use_op ~> union speculation ~> use_op
((any: {
  +a: [number] & [string],
  +b: [{}] & [number] & [string],
  +c: [number] & [{}] & [string],
  +d: [number] & [string] & [{}],
}): {
  +a: [true], // Error: should be grouped
  +b: [true], // Error: should be grouped, should not show the [{}] branch
  +c: [true], // Error: should be grouped, should not show the [{}] branch
  +d: [true], // Error: should be grouped, should not show the [{}] branch
});

((any: number & (string & false)): true); // Error: should be flattened
((any: (string & false) & number): true); // Error: should be flattened
((any: {} & number & (string & false)): true); // Error: should be flattened
((any: number & (string & false) & {}): true); // Error: should be flattened
((any: number & (string & {} & false)): true); // Error: should be flattened

((any: number & number & number & string): true); // Error: should be flattened
((any: number & number & (number & string)): true); // Error: should be flattened
((any: number & (number & (number & string))): true); // Error: should be flattened
((any: (string & number) & number & number): true); // Error: should be flattened
((any: ((string & number) & number) & number): true); // Error: should be flattened

((any: number & {}): true); // Error
((any: {+a: number & {}, +b: number & {}}): {+a: true, +b: true}); // Error
((any: {+a: number & string & {}, +b: number & {}}): {+a: true, +b: true}); // Error

// Error: union inside union fun.
((any: [[null, A] & [null, B]] & [[null, C] & [null, D]]): [[null, number]]);

// Error: union inside union fun, but thanks to scoring we only show three.
((any: [[null, A] & {}] & [[null, C] & [null, D]]): [[null, number]]);

// Error: union inside union fun, but thanks to scoring we only show two.
((any: [[null, A] & {}] & [[null, C] & {}]): [[null, number]]);

// Error: union inside union fun, but thanks to scoring we only show one.
((any: {} & [[null, C] & {}]): [[null, number]]);

declare var f1: A | B;
f1(); // Error

declare var f2: A | (B | C);
f2(); // Error

declare var f3: A | (B | (C | D));
f3(); // Error
