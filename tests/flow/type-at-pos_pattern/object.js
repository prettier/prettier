// @flow

declare opaque type O;
declare var o: O;

declare var c2: O;
declare var d2: O;
declare var e: string;

var {
  a,
  b: b1,
  c = c2,
  d: d1 = d2,
  [e]: { e1 }
} = {
  a: o,
  b: o,
  c: o,
  d: o,
  "e": { a: o },
};
