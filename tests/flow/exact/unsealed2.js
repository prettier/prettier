/* An unsealed object can not be property tested permissively, becase the type
   may be wider due to properties added later. */

let x;
if (false) {
  x = { p: "something", q: 0 };
} else {
  x = {}; // type is exact but also unsealed
  g(x);
}
f(x);

function f(_): number {
  if (x.p) {
    return x.q;
  } else {
    return 0;
  }
}

function g(x) {
  x.p = "something";
  x.q = "not a number";
}
