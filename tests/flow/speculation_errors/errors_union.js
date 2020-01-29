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
({b: 2, a: 1, c: 3}: {a: boolean, b: boolean, c: boolean});

// Error: Group should list three errors in the order: `b`, `a`, `c`
({b: 2, a: 1, c: 3}: {
  a: boolean | string,
  b: boolean | string,
  c: boolean | string,
});

// Error: Group should list three errors in the order: `b`, `a`, `c`
({b: 2, a: 1, c: 3}: {a: boolean | string, b: boolean, c: boolean});

// Error: Group should list three errors in the order: `b`, `a`, `c`
({b: 2, a: 1, c: 3}: {a: boolean, b: boolean | string, c: boolean});

// Error: Group should list three errors in the order: `b`, `a`, `c`
({b: 2, a: 1, c: 3}: {a: boolean, b: boolean, c: boolean | string});

// Error: number ~> boolean
({a: {b: 42}}: {a: {b: boolean}});

// Error: number ~> boolean. Because of union error scoring we should only see
// one error.
({a: {b: 42}}: {a: boolean | {b: boolean | {}}});

(42: boolean); // Error: number ~> boolean
(42: {} | {} | {} | boolean); // Error: number ~> boolean
(42: {} | ({} | ({} | boolean))); // Error: number ~> boolean

// Alias Example 1
({x: 123, y: 'abc'}: {x: number, y: number} | {x: string, y: string}); // Error

// Alias Example 2
type NumberPoint = {x: number, y: number};
type StringPoint = {x: string, y: string};
({x: 123, y: 'abc'}: number | NumberPoint | StringPoint); // Error

// Alias Example 3
type Point = NumberPoint | StringPoint;
({x: 123, y: 'abc'}: Point); // Error

(true: number | string); // Error
(true: number | string | {}); // Error: should not show the {} branch
(true: {} | number | string); // Error: should not show the {} branch
(true: number | {} | string); // Error: should not show the {} branch

({a: true}: {a: number | string}); // Error

({
  a: true, // Error: should be grouped
  b: true, // Error: should be grouped, should not show the {} branch
  c: true, // Error: should be grouped, should not show the {} branch
  d: true, // Error: should be grouped, should not show the {} branch
}: {
  a: number | string,
  b: {} | number | string,
  c: number | {} | string,
  d: number | string | {},
});

// Demonstrates use_op ~> union speculation ~> use_op
({
  a: [true], // Error: should be grouped
  b: [true], // Error: should be grouped, should not show the [{}] branch
  c: [true], // Error: should be grouped, should not show the [{}] branch
  d: [true], // Error: should be grouped, should not show the [{}] branch
}: {
  a: [number] | [string],
  b: [{}] | [number] | [string],
  c: [number] | [{}] | [string],
  d: [number] | [string] | [{}],
});

(true: number | (string | false)); // Error: should be flattened
(true: (string | false) | number); // Error: should be flattened
(true: {} | number | (string | false)); // Error: should be flattened
(true: number | (string | false) | {}); // Error: should be flattened
(true: number | (string | {} | false)); // Error: should be flattened

(true: number | number | number | string); // Error: should be flattened
(true: number | number | (number | string)); // Error: should be flattened
(true: number | (number | (number | string))); // Error: should be flattened
(true: (string | number) | number | number); // Error: should be flattened
(true: ((string | number) | number) | number); // Error: should be flattened

(true: number | {}); // Error
({a: true, b: true}: {a: number | {}, b: number | {}}); // Error
({a: true, b: true}: {a: number | string | {}, b: number | {}}); // Error

// Error: union inside union fun.
((any: [[null, number]]): [[null, A] | [null, B]] | [[null, C] | [null, D]]);

// Error: union inside union fun, but thanks to scoring we only show three.
((any: [[null, number]]): [[null, A] | {}] | [[null, C] | [null, D]]);

// Error: union inside union fun, but thanks to scoring we only show two.
((any: [[null, number]]): [[null, A] | {}] | [[null, C] | {}]);

// Error: union inside union fun, but thanks to scoring we only show one.
((any: [[null, number]]): {} | [[null, C] | {}]);
