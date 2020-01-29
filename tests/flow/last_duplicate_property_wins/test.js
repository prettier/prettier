// @flow

// Classes

class C {
  foo(): number { return 0; }
  foo(): string { return "hello" } // last wins
  x: number;
  x: string; // last wins
  bar(): number { return 0; }
  bar: string; // error: can't shadow proto with incompatible own
  qux: number; // error: can't shadow proto with incompatible own
  qux(): string { return "hello" }
}

// check

((new C).foo(): boolean); // last wins
((new C).x: boolean); // last wins
((new C).bar: empty); // error: string ~> empty (own prop wins)
((new C).qux: empty); // error: number ~> empty (own prop wins)

// Objects

const o = {
  foo(): number { return 0; },
  foo(): string { return "hello" }, // last wins
  x: 42,
  x: "hello", // last wins
  bar(): number { return 0; },
  bar: "hello", // last wins
  qux: 42,
  qux(): string { return "hello" }, // last wins
};

// check

(o.foo(): boolean); // last wins
(o.x: boolean); // last wins
(o.bar: boolean); // last wins
(o.qux(): boolean); // last wins
