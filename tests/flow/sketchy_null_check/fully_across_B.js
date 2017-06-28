var a = require("./fully_across_A");

function f(x) {
  if(x){ /* sketchy because of uses */ }
}
f(a);

function g(x) {
  if(x != null) { /* NOT sketchy */ }
}
g(a);
