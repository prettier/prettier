// @flow

// Destructuring self-referential annotations should terminate.

type T = T;
function f({p}: T) {
  p = 0;
}


// Including tricky cases

type A = B;
type B = A;
function g({p}: A) {
  p = 0;
}
function h({p}: B) {
  p = 0;
}
