// @flow

type T = 3 | 4;
type U = "A" | "B";

function foo (o1 : T, o2 : U) {
  if (o1 == o2) {

  }
}

type A = "A" | 1 | 2;
type B = "B" | 3 | "C";

function foo (o1 : A, o2 : B) {
  if (o1 == o2) {

  }
}

declare var cond : boolean;
const i = cond ? 1 : -1;
if (i >= 0) {}
