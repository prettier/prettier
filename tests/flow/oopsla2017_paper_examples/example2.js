// @flow

function pipe(x, f) {
  if (f != null) { f(x); }
}
let hello = (s) => console.log("hello", s);
pipe("world", hello);
pipe("hello", null); // ok
