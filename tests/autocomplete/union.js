/* @flow */

function foo(a: boolean, x: { bar: string }, y: Object) {
  var z;
  if (a) {
    z = x;
  } else {
    z = y;
  }
  z.
}
