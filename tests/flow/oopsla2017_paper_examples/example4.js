// @flow

let nil = { kind: "nil" };
let cons = (head, tail) => {
  return { kind: "cons", head, tail };
}

function merge(x) {
  x = x || nil;
  return x.kind; // ok
}
merge(cons(7, nil));
merge(null);
