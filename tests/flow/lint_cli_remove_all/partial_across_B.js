var a = require("./partial_across_A");

function f(x) {
  if(x){ /* sketchy because of uses */ }
}

f(a);
f("");

function g(x) {
  if(x){ /* NOT sketchy because of uses */ }
}

g(a);
g(7);
