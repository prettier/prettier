// @flow

declare var rand: number;

// Infered literal types
const s = "A";
const n = 1;
const f = 1.01;
const b = true;
const u = [s, n, f, b][rand];

// Literal type annotations
type S = "A";
type N = 1;
type F = 1.01;
type B = true;
type U = "A" | 1 | 1.01 | true;

const f1 = (x: "A" | "B") => x;

const o1 = { f: "f" };
const o2 = { f: ("f": "f") };

const f2 = x => x;
f2("A");
f2("B");

const numLitArray = [1, 2, 3, 4, 5];

class A<X> {}
const a_n = new A<number>();
const a_1 = new A<1>();
