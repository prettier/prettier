// @flow

function foo1(b: bool): {| x?: number |} {
  var o = {};
  if (b) { o.x = 0; }
  return o; // error, unsealed implies inexact
}

function foo2(b: bool): { x?: number } {
  var o = {};
  if (b) { o.x = 0; }
  return o; // OK
}

function bar() {
  const a = { x: 42 };
  const b1 = {
    ...a,
    ...foo1(true), // must be exact, but runs into restrictions upstream
  };
  const b2 = {
    ...foo2(true), // may be inexact, so workaround for above
    ...a,
  };
  (b2.x: string); // expected error: number ~/~> string
}
