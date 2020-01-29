// @flow

function pipe(x, f) { f(x); }
let hello = (s) => console.log("hello", s);
pipe("world", hello);
pipe("hello", null); // error
