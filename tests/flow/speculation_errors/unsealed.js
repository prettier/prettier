// @flow

const o1 = {};
o1.q = 1;
(o1: {p: string} | {q: number});
(o1.p: number); // error

const o2 = {};
o2.q = 1;
(o2.p: number);

const o3 = {};
o3.q = 1;
(o3: {q: number} | {p: string});
(o3.p: number); // cannot decide case

const foo = {};
(foo.x: number);
(foo:
  | {|a: number, b: string, c: boolean, x: string|}
  | {a: string, b: number, c: void, x: number});
(foo.a: string);
(foo.a: number); // error
(foo.b: string); // error
(foo.b: number);
(foo.c: boolean); // error
(foo.c: void);
(foo.x : number);
(foo.x : string); // error

let x = {};
(x: {a: string, a: number} | number);
(x.a: string); // error
(x.a: number);
