/* @flow */

type C$flags = $CharSet<"ab">

declare class C {
    constructor(flags?: C$flags): C;
}

function f() {
  ("a": $CharSet<"ab">); // ok
  ("b": $CharSet<"ab">); // ok
  ("ab": $CharSet<"ab">); // ok
  ("ba": $CharSet<"ab">); // ok
  ("aaaa": $CharSet<"ab">); // error
  ("c": $CharSet<"ab">); // error
  ("ac": $CharSet<"ab">); // error
}

function g(x) {
  new C(x);
}
g("abcd");

function h(x: $CharSet<"ab">) {
  (x: "foo");
}
