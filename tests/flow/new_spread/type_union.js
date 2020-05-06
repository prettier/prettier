declare class T {}
declare var x: T;

declare class U {}
declare var y: U;

type O1 = {...{p:T}|{q:U}};
declare var o1: O1;
(o1: {p?:T}|{q?:U}); // ok

type Union1 = {| [string]: number |} | {| foo: number |}
type Union2 = {| bar: number |} | {| [number]: string |};

declare var x1: {...Union1, ...Union2}; // Error, indexer on right
(x1: {});

declare var x5: {...Union1, ...{}} // Error, spreading {} overwrites indexer
(x5: {});

var y = {}; // unsealed

type UnsealedInUnion = Union1 | Union2 | typeof y;
declare var x2: {...UnsealedInUnion}; // Error, unsealed
(x2: {});

type Union3 = {| foo: number |} | {| bar: number |};
type Union4 = {| baz: number  |} | {| qux: number |};
declare var x3: {| ...Union3, ...Union4 |};
(x3: {| foo: number, baz: number|} // Should consider erroring instead of calculating combinatorial blowup
   | {| foo: number, qux: number|}
   | {| bar: number, baz: number|}
   | {| bar: number, qux: number|}
);

interface I1 {}
type Union5 = I1 | Union3 | Union4;
declare var x4: {...Union5};  // Error, cannot spread interface
(x4: {});
